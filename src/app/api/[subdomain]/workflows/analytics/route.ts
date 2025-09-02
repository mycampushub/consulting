import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'

const analyticsSchema = z.object({
  workflowIds: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  includeDetails: z.boolean().optional().default(false),
  metrics: z.array(z.enum([
    'execution_count',
    'success_rate',
    'average_execution_time',
    'error_rate',
    'performance_metrics',
    'usage_patterns',
    'top_performers',
    'bottlenecks'
  ])).optional().default(['execution_count', 'success_rate', 'average_execution_time'])
})

interface WorkflowAnalytics {
  summary: {
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    overallSuccessRate: number
    averageExecutionTime: number
    totalErrors: number
    dateRange: {
      start: string
      end: string
    }
  }
  executionMetrics: {
    byDate: Array<{
      date: string
      executions: number
      successes: number
      failures: number
      successRate: number
      averageExecutionTime: number
    }>
    byWorkflow: Array<{
      workflowId: string
      workflowName: string
      executions: number
      successes: number
      failures: number
      successRate: number
      averageExecutionTime: number
      lastExecuted: string
    }>
    byCategory: Array<{
      category: string
      executions: number
      successes: number
      failures: number
      successRate: number
      averageExecutionTime: number
    }>
  }
  performanceMetrics: {
    topPerformers: Array<{
      workflowId: string
      workflowName: string
      successRate: number
      averageExecutionTime: number
      executionCount: number
      rating: number
    }>
    bottlenecks: Array<{
      workflowId: string
      workflowName: string
      nodeId: string
      nodeName: string
      averageExecutionTime: number
      errorRate: number
      failureCount: number
    }>
    slowestNodes: Array<{
      workflowId: string
      workflowName: string
      nodeId: string
      nodeName: string
      averageExecutionTime: number
      lastExecution: string
    }>
  }
  usagePatterns: {
    peakHours: Array<{
      hour: number
      executions: number
    }>
    peakDays: Array<{
      day: string
      executions: number
    }>
    triggerDistribution: Array<{
      triggerType: string
      count: number
      percentage: number
    }>
    userActivity: Array<{
      userId: string
      userName: string
      executions: number
      lastActivity: string
    }>
  }
  detailedReports?: {
    executionHistory: Array<{
      id: string
      workflowId: string
      workflowName: string
      status: string
      executionTime: number
      nodesExecuted: number
      errors: string[]
      warnings: string[]
      executedAt: string
      performance: any
    }>
    errorAnalysis: Array<{
      errorType: string
      count: number
      percentage: number
      commonWorkflows: string[]
      recentOccurrences: Array<{
        executionId: string
        workflowName: string
        timestamp: string
        error: string
      }>
    }>
    conditionalPaths: Array<{
      workflowId: string
      workflowName: string
      totalPaths: number
      takenPaths: number
      skippedPaths: number
      mostUsedPath: string
      leastUsedPath: string
    }>
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const body = await request.json()
    const { workflowIds, dateRange, groupBy, includeDetails, metrics } = analyticsSchema.parse(body)

    // Build date filter
    const dateFilter: any = {}
    if (dateRange?.start || dateRange?.end) {
      dateFilter.createdAt = {}
      if (dateRange.start) dateFilter.createdAt.gte = new Date(dateRange.start)
      if (dateRange.end) dateFilter.createdAt.lte = new Date(dateRange.end)
    }

    // Build workflow filter
    const workflowFilter: any = { agencyId: agency.id }
    if (workflowIds && workflowIds.length > 0) {
      workflowFilter.id = { in: workflowIds }
    }

    // Get workflows
    const workflows = await db.workflow.findMany({
      where: workflowFilter,
      include: {
        executions: {
          where: dateFilter,
          orderBy: { startedAt: 'desc' }
        },
        _count: {
          select: { executions: true }
        }
      }
    })

    // Get all executions for analytics
    const executions = await db.workflowExecution.findMany({
      where: {
        agencyId: agency.id,
        ...(workflowIds && workflowIds.length > 0 && { workflowId: { in: workflowIds } }),
        ...dateFilter
      },
      orderBy: { startedAt: 'desc' }
    })

    // Calculate summary metrics
    const summary = calculateSummary(workflows, executions, dateRange)

    // Calculate execution metrics
    const executionMetrics = await calculateExecutionMetrics(workflows, executions, groupBy)

    // Calculate performance metrics
    const performanceMetrics = await calculatePerformanceMetrics(workflows, executions)

    // Calculate usage patterns
    const usagePatterns = await calculateUsagePatterns(executions)

    const analytics: WorkflowAnalytics = {
      summary,
      executionMetrics,
      performanceMetrics,
      usagePatterns
    }

    // Add detailed reports if requested
    if (includeDetails) {
      analytics.detailedReports = await generateDetailedReports(workflows, executions)
    }

    // Log analytics request
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        action: 'WORKFLOW_ANALYTICS_ACCESSED',
        entityType: 'Workflow',
        changes: JSON.stringify({
          workflowIds,
          dateRange,
          metrics,
          includeDetails
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(analytics)

  } catch (error) {
    console.error("Error generating workflow analytics:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function calculateSummary(workflows: any[], executions: any[], dateRange?: any) {
  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter(w => w.status === 'ACTIVE').length
  const totalExecutions = executions.length
  const successfulExecutions = executions.filter(e => e.status === 'COMPLETED').length
  const overallSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
  const totalExecutionTime = executions.reduce((sum, e) => sum + (e.executionTime || 0), 0)
  const averageExecutionTime = totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0
  const totalErrors = executions.reduce((sum, e) => sum + (e.errors?.length || 0), 0)

  // Default date range (last 30 days)
  const defaultEnd = new Date()
  const defaultStart = new Date()
  defaultStart.setDate(defaultStart.getDate() - 30)

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
    averageExecutionTime: Math.round(averageExecutionTime),
    totalErrors,
    dateRange: {
      start: dateRange?.start || defaultStart.toISOString(),
      end: dateRange?.end || defaultEnd.toISOString()
    }
  }
}

async function calculateExecutionMetrics(workflows: any[], executions: any[], groupBy: string) {
  // Group executions by date
  const byDate = groupExecutionsByDate(executions, groupBy)
  
  // Group executions by workflow
  const byWorkflow = workflows.map(workflow => {
    const workflowExecutions = executions.filter(e => e.workflowId === workflow.id)
    const successes = workflowExecutions.filter(e => e.status === 'COMPLETED').length
    const failures = workflowExecutions.filter(e => e.status === 'FAILED').length
    const totalExecutionTime = workflowExecutions.reduce((sum, e) => sum + (e.executionTime || 0), 0)
    
    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      executions: workflowExecutions.length,
      successes,
      failures,
      successRate: workflowExecutions.length > 0 ? 
        Math.round((successes / workflowExecutions.length) * 10000) / 100 : 0,
      averageExecutionTime: workflowExecutions.length > 0 ? 
        Math.round(totalExecutionTime / workflowExecutions.length) : 0,
      lastExecuted: workflowExecutions[0]?.startedAt || null
    }
  })

  // Group executions by category
  const categoryMap = new Map<string, any>()
  workflows.forEach(workflow => {
    const workflowExecutions = executions.filter(e => e.workflowId === workflow.id)
    const category = workflow.category
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        executions: 0,
        successes: 0,
        failures: 0,
        totalExecutionTime: 0
      })
    }
    
    const catData = categoryMap.get(category)!
    catData.executions += workflowExecutions.length
    catData.successes += workflowExecutions.filter(e => e.status === 'COMPLETED').length
    catData.failures += workflowExecutions.filter(e => e.status === 'FAILED').length
    catData.totalExecutionTime += workflowExecutions.reduce((sum, e) => sum + (e.executionTime || 0), 0)
  })

  const byCategory = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    successRate: cat.executions > 0 ? 
      Math.round((cat.successes / cat.executions) * 10000) / 100 : 0,
    averageExecutionTime: cat.executions > 0 ? 
      Math.round(cat.totalExecutionTime / cat.executions) : 0
  }))

  return {
    byDate,
    byWorkflow,
    byCategory
  }
}

function groupExecutionsByDate(executions: any[], groupBy: string) {
  const grouped = new Map<string, any>()
  
  executions.forEach(execution => {
    const date = new Date(execution.startedAt)
    let key: string
    
    switch (groupBy) {
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default: // day
        key = date.toISOString().split('T')[0]
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        date: key,
        executions: 0,
        successes: 0,
        failures: 0,
        totalExecutionTime: 0
      })
    }
    
    const data = grouped.get(key)!
    data.executions++
    if (execution.status === 'COMPLETED') data.successes++
    if (execution.status === 'FAILED') data.failures++
    data.totalExecutionTime += execution.executionTime || 0
  })
  
  return Array.from(grouped.values()).map(data => ({
    ...data,
    successRate: data.executions > 0 ? 
      Math.round((data.successes / data.executions) * 10000) / 100 : 0,
    averageExecutionTime: data.executions > 0 ? 
      Math.round(data.totalExecutionTime / data.executions) : 0
  })).sort((a, b) => a.date.localeCompare(b.date))
}

async function calculatePerformanceMetrics(workflows: any[], executions: any[]) {
  // Calculate top performers
  const topPerformers = workflows
    .filter(w => w.executionCount > 0)
    .map(workflow => {
      const workflowExecutions = executions.filter(e => e.workflowId === workflow.id)
      const successes = workflowExecutions.filter(e => e.status === 'COMPLETED').length
      const successRate = workflowExecutions.length > 0 ? 
        (successes / workflowExecutions.length) * 100 : 0
      
      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime: workflow.averageExecutionTime || 0,
        executionCount: workflow.executionCount,
        rating: workflow.successRate || 0
      }
    })
    .sort((a, b) => (b.successRate * 0.6 + b.rating * 0.4) - (a.successRate * 0.6 + a.rating * 0.4))
    .slice(0, 10)

  // Calculate bottlenecks (nodes with high error rates or slow execution times)
  const bottlenecks: any[] = []
  
  executions.forEach(execution => {
    if (execution.metadata?.performance && execution.errors?.length > 0) {
      const workflow = workflows.find(w => w.id === execution.workflowId)
      if (workflow) {
        bottlenecks.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          nodeId: 'unknown',
          nodeName: 'General Execution',
          averageExecutionTime: execution.executionTime || 0,
          errorRate: (execution.errors.length / Math.max(execution.nodesExecuted, 1)) * 100,
          failureCount: execution.errors.length
        })
      }
    }
  })

  // Calculate slowest nodes
  const slowestNodes: any[] = []
  
  executions.forEach(execution => {
    if (execution.metadata?.performance?.slowestNode) {
      const workflow = workflows.find(w => w.id === execution.workflowId)
      if (workflow) {
        slowestNodes.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          nodeId: execution.metadata.performance.slowestNode,
          nodeName: execution.metadata.performance.slowestNode,
          averageExecutionTime: execution.executionTime || 0,
          lastExecution: execution.startedAt
        })
      }
    }
  })

  return {
    topPerformers,
    bottlenecks: bottlenecks.slice(0, 10),
    slowestNodes: slowestNodes
      .sort((a, b) => b.averageExecutionTime - a.averageExecutionTime)
      .slice(0, 10)
  }
}

async function calculateUsagePatterns(executions: any[]) {
  // Peak hours analysis
  const peakHours = new Array(24).fill(0).map((_, hour) => ({ hour, executions: 0 }))
  
  executions.forEach(execution => {
    const hour = new Date(execution.startedAt).getHours()
    peakHours[hour].executions++
  })

  // Peak days analysis
  const peakDays = new Map<string, number>()
  
  executions.forEach(execution => {
    const day = new Date(execution.startedAt).toISOString().split('T')[0]
    peakDays.set(day, (peakDays.get(day) || 0) + 1)
  })

  const peakDaysArray = Array.from(peakDays.entries())
    .map(([day, executions]) => ({ day, executions }))
    .sort((a, b) => b.executions - a.executions)
    .slice(0, 7)

  // Trigger distribution
  const triggerMap = new Map<string, number>()
  
  executions.forEach(execution => {
    const triggerType = execution.triggerData?.type || 'manual'
    triggerMap.set(triggerType, (triggerMap.get(triggerType) || 0) + 1)
  })

  const totalExecutions = executions.length
  const triggerDistribution = Array.from(triggerMap.entries())
    .map(([triggerType, count]) => ({
      triggerType,
      count,
      percentage: Math.round((count / totalExecutions) * 10000) / 100
    }))

  // User activity (simplified - would need user data in real implementation)
  const userActivity = [
    {
      userId: 'system',
      userName: 'System',
      executions: executions.filter(e => e.triggerData?.type === 'automatic').length,
      lastActivity: executions.length > 0 ? executions[0].startedAt : null
    },
    {
      userId: 'manual',
      userName: 'Manual',
      executions: executions.filter(e => e.triggerData?.type === 'manual').length,
      lastActivity: executions.length > 0 ? executions[0].startedAt : null
    }
  ]

  return {
    peakHours,
    peakDays: peakDaysArray,
    triggerDistribution,
    userActivity
  }
}

async function generateDetailedReports(workflows: any[], executions: any[]) {
  // Execution history
  const executionHistory = executions.slice(0, 100).map(execution => {
    const workflow = workflows.find(w => w.id === execution.workflowId)
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: workflow?.name || 'Unknown',
      status: execution.status,
      executionTime: execution.executionTime || 0,
      nodesExecuted: execution.nodesExecuted || 0,
      errors: execution.errors || [],
      warnings: execution.warnings || [],
      executedAt: execution.startedAt,
      performance: execution.metadata?.performance || {}
    }
  })

  // Error analysis
  const errorMap = new Map<string, any>()
  
  executions.forEach(execution => {
    execution.errors?.forEach((error: string) => {
      const errorType = error.split(':')[0] // Extract error type
      
      if (!errorMap.has(errorType)) {
        errorMap.set(errorType, {
          errorType,
          count: 0,
          commonWorkflows: [] as string[],
          recentOccurrences: [] as any[]
        })
      }
      
      const errorData = errorMap.get(errorType)!
      errorData.count++
      
      const workflow = workflows.find(w => w.id === execution.workflowId)
      if (workflow && !errorData.commonWorkflows.includes(workflow.name)) {
        if (errorData.commonWorkflows.length < 3) {
          errorData.commonWorkflows.push(workflow.name)
        }
      }
      
      if (errorData.recentOccurrences.length < 5) {
        errorData.recentOccurrences.push({
          executionId: execution.id,
          workflowName: workflow?.name || 'Unknown',
          timestamp: execution.startedAt,
          error
        })
      }
    })
  })

  const totalErrors = Array.from(errorMap.values()).reduce((sum, e) => sum + e.count, 0)
  const errorAnalysis = Array.from(errorMap.values())
    .map(error => ({
      ...error,
      percentage: Math.round((error.count / totalErrors) * 10000) / 100
    }))
    .sort((a, b) => b.count - a.count)

  // Conditional paths analysis
  const conditionalPaths = executions
    .filter(e => e.metadata?.conditionalPaths)
    .map(execution => {
      const workflow = workflows.find(w => w.id === execution.workflowId)
      const paths = execution.metadata.conditionalPaths
      
      return {
        workflowId: execution.workflowId,
        workflowName: workflow?.name || 'Unknown',
        totalPaths: (paths.evaluated || []).length,
        takenPaths: (paths.taken || []).length,
        skippedPaths: (paths.skipped || []).length,
        mostUsedPath: paths.taken?.[0] || 'N/A',
        leastUsedPath: paths.skipped?.[0] || 'N/A'
      }
    })

  return {
    executionHistory,
    errorAnalysis,
    conditionalPaths
  }
}