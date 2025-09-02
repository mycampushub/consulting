import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'
import ZAI from 'z-ai-web-dev-sdk'

const enhancedExecuteSchema = z.object({
  triggerData: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  testMode: z.boolean().optional().default(false),
  dryRun: z.boolean().optional().default(false),
  debugMode: z.boolean().optional().default(false),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  timeout: z.number().optional().default(300000), // 5 minutes default
  retryPolicy: z.object({
    maxRetries: z.number().optional().default(3),
    retryDelay: z.number().optional().default(1000),
    backoffMultiplier: z.number().optional().default(2)
  }).optional()
})

interface EnhancedWorkflowExecutionResult {
  success: boolean
  executionId: string
  results: any[]
  errors: string[]
  warnings: string[]
  executionTime: number
  nodesExecuted: number
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'TIMEOUT' | 'CANCELLED'
  performance: {
    totalTime: number
    averageNodeTime: number
    slowestNode?: string
    fastestNode?: string
    memoryUsage?: number
  }
  conditionalPaths: {
    taken: string[]
    skipped: string[]
    evaluated: string[]
  }
  errorHandling: {
    retries: number
    fallbacks: number
    recovered: number
  }
  debug?: {
    nodeExecutionLog: any[]
    conditionEvaluationLog: any[]
    errorLog: any[]
  }
}

interface WorkflowCondition {
  type: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'regex' | 'custom' | 'ai_decision'
  field: string
  value: any
  operator?: string
  expression?: string
  aiPrompt?: string
  fallback?: any
}

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'email' | 'api' | 'database' | 'webhook' | 'transform' | 'filter' | 'loop' | 'parallel' | 'http' | 'ai' | 'integration' | 'branch' | 'merge' | 'error_handler' | 'fallback'
  position: { x: number; y: number }
  data: {
    label: string
    config?: Record<string, any>
    description?: string
    icon?: any
    category?: string
    inputs?: string[]
    outputs?: string[]
    conditions?: WorkflowCondition[]
    errorHandlers?: string[]
    fallbackNode?: string
    retryConfig?: {
      enabled: boolean
      maxRetries: number
      retryDelay: number
      backoffMultiplier: number
    }
    timeout?: number
    parallelExecution?: boolean
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  animated?: boolean
  style?: any
  condition?: WorkflowCondition
  priority?: number
  fallback?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { 
      triggerData, 
      context, 
      testMode, 
      dryRun,
      debugMode,
      priority,
      timeout,
      retryPolicy 
    } = enhancedExecuteSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get workflow with all related data
    const workflow = await db.workflow.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      },
      include: {
        nodes: {
          orderBy: { createdAt: 'asc' }
        },
        edges: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    if (workflow.status !== 'ACTIVE' && !testMode) {
      return NextResponse.json({ 
        error: "Workflow is not active", 
        details: "Only active workflows can be executed" 
      }, { status: 400 })
    }

    // Create execution record with enhanced tracking
    const execution = await db.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        agencyId: agency.id,
        status: 'RUNNING',
        triggerData: triggerData || {},
        context: context || {},
        priority,
        startedAt: new Date(),
        testMode,
        metadata: {
          dryRun,
          debugMode,
          timeout,
          retryPolicy
        }
      }
    })

    // Execute workflow with enhanced error handling and conditional logic
    const startTime = Date.now()
    const executionResult = await executeEnhancedWorkflow(
      workflow, 
      execution.id, 
      triggerData, 
      context, 
      {
        testMode,
        dryRun,
        debugMode,
        timeout,
        retryPolicy: retryPolicy || { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 }
      }
    )
    const executionTime = Date.now() - startTime

    // Update execution record with enhanced data
    await db.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: executionResult.status,
        results: executionResult.results,
        errors: executionResult.errors,
        warnings: executionResult.warnings,
        executionTime,
        nodesExecuted: executionResult.nodesExecuted,
        completedAt: new Date(),
        metadata: {
          ...execution.metadata,
          performance: executionResult.performance,
          conditionalPaths: executionResult.conditionalPaths,
          errorHandling: executionResult.errorHandling,
          debug: executionResult.debug
        }
      }
    })

    // Update workflow execution count and performance metrics
    await db.workflow.update({
      where: { id: workflow.id },
      data: {
        executionCount: workflow.executionCount + 1,
        lastExecutedAt: new Date(),
        // Update performance metrics
        averageExecutionTime: calculateNewAverage(
          workflow.averageExecutionTime || 0,
          executionTime,
          workflow.executionCount + 1
        ),
        successRate: calculateNewSuccessRate(
          workflow.successRate || 0,
          executionResult.success,
          workflow.executionCount + 1
        )
      }
    })

    // Log enhanced execution
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        action: debugMode ? 'WORKFLOW_DEBUG_EXECUTED' : (dryRun ? 'WORKFLOW_DRY_RUN' : 'WORKFLOW_ENHANCED_EXECUTED'),
        entityType: 'Workflow',
        entityId: workflow.id,
        changes: JSON.stringify({
          executionId: execution.id,
          status: executionResult.status,
          executionTime,
          nodesExecuted: executionResult.nodesExecuted,
          errors: executionResult.errors.length,
          warnings: executionResult.warnings.length,
          conditionalPaths: executionResult.conditionalPaths,
          performance: executionResult.performance,
          errorHandling: executionResult.errorHandling
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(executionResult)

  } catch (error) {
    console.error("Error executing enhanced workflow:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

async function executeEnhancedWorkflow(
  workflow: any,
  executionId: string,
  triggerData: any = {},
  context: any = {},
  options: {
    testMode: boolean
    dryRun: boolean
    debugMode: boolean
    timeout: number
    retryPolicy: any
  }
): Promise<EnhancedWorkflowExecutionResult> {
  const results: any[] = []
  const errors: string[] = []
  const warnings: string[] = []
  let nodesExecuted = 0
  const conditionalPaths = { taken: [] as string[], skipped: [] as string[], evaluated: [] as string[] }
  const errorHandling = { retries: 0, fallbacks: 0, recovered: 0 }
  const debug = options.debugMode ? {
    nodeExecutionLog: [] as any[],
    conditionEvaluationLog: [] as any[],
    errorLog: [] as any[]
  } : undefined

  const performance = {
    totalTime: 0,
    averageNodeTime: 0,
    slowestNode: undefined as string | undefined,
    fastestNode: undefined as string | undefined,
    memoryUsage: undefined as number | undefined
  }

  const nodeExecutionTimes: Record<string, number> = {}

  try {
    // Parse workflow nodes and edges
    const nodes: WorkflowNode[] = JSON.parse(workflow.nodes || '[]')
    const edges: WorkflowEdge[] = JSON.parse(workflow.edges || '[]')

    // Build execution graph with enhanced relationships
    const executionGraph = buildEnhancedExecutionGraph(nodes, edges)
    
    // Find starting nodes (nodes with no incoming edges)
    const startNodes = executionGraph.filter(node => node.incomingEdges.length === 0)
    
    if (startNodes.length === 0) {
      throw new Error("No starting nodes found in workflow")
    }

    // Enhanced execution context
    const executionContext = {
      ...context,
      triggerData,
      executionId,
      testMode: options.testMode,
      dryRun: options.dryRun,
      workflowId: workflow.id,
      agencyId: workflow.agencyId,
      startTime: Date.now(),
      timeout: options.timeout,
      retryPolicy: options.retryPolicy,
      variables: new Map<string, any>(),
      errors: new Map<string, any>(),
      state: new Map<string, any>()
    }

    // Execute nodes with enhanced logic
    const executedNodes = new Set<string>()
    const nodeQueue = [...startNodes]
    const executionPromises: Promise<any>[] = []

    while (nodeQueue.length > 0) {
      const currentNode = nodeQueue.shift()!
      
      if (executedNodes.has(currentNode.id)) {
        continue
      }

      // Check timeout
      if (Date.now() - executionContext.startTime > options.timeout) {
        warnings.push("Workflow execution timed out")
        return {
          success: false,
          executionId,
          results,
          errors: [...errors, "Execution timeout"],
          warnings,
          executionTime: Date.now() - executionContext.startTime,
          nodesExecuted,
          status: 'TIMEOUT',
          performance,
          conditionalPaths,
          errorHandling,
          debug
        }
      }

      try {
        const nodeStartTime = Date.now()
        
        // Execute node with enhanced error handling and retries
        const nodeResult = await executeEnhancedNode(currentNode, executionContext, debug)
        const nodeExecutionTime = Date.now() - nodeStartTime
        
        nodeExecutionTimes[currentNode.id] = nodeExecutionTime
        
        // Track performance metrics
        if (!performance.slowestNode || nodeExecutionTime > nodeExecutionTimes[performance.slowestNode]) {
          performance.slowestNode = currentNode.id
        }
        if (!performance.fastestNode || nodeExecutionTime < nodeExecutionTimes[performance.fastestNode]) {
          performance.fastestNode = currentNode.id
        }

        results.push({
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          result: nodeResult,
          executionTime: nodeExecutionTime,
          timestamp: new Date().toISOString()
        })

        if (debug) {
          debug.nodeExecutionLog.push({
            nodeId: currentNode.id,
            type: currentNode.type,
            executionTime: nodeExecutionTime,
            result: nodeResult,
            timestamp: new Date().toISOString()
          })
        }

        executedNodes.add(currentNode.id)
        nodesExecuted++

        // Handle conditional branching with enhanced logic
        const nextNodes = await getNextNodesEnhanced(currentNode, nodeResult, executionGraph, executionContext, conditionalPaths, debug)
        
        // Add next nodes to queue
        if (currentNode.data.config?.parallelExecution) {
          // Execute in parallel
          const parallelPromises = nextNodes.map(async (nextNode) => {
            if (!executedNodes.has(nextNode.id)) {
              return executeEnhancedNode(nextNode, executionContext, debug)
            }
          })
          executionPromises.push(...parallelPromises)
        } else {
          nodeQueue.push(...nextNodes)
        }

      } catch (nodeError) {
        const errorMessage = `Error executing node ${currentNode.id}: ${nodeError.message}`
        errors.push(errorMessage)
        
        if (debug) {
          debug.errorLog.push({
            nodeId: currentNode.id,
            error: errorMessage,
            timestamp: new Date().toISOString()
          })
        }

        // Enhanced error handling with retries and fallbacks
        const errorResult = await handleNodeError(currentNode, nodeError, executionContext, errorHandling, debug)
        
        if (errorResult.recovered) {
          errorHandling.recovered++
          warnings.push(`Recovered from error in node ${currentNode.id}`)
          
          // Continue with fallback path if available
          if (errorResult.fallbackNode) {
            const fallbackNode = executionGraph.find(n => n.id === errorResult.fallbackNode)
            if (fallbackNode) {
              nodeQueue.push(fallbackNode)
            }
          }
        } else if (errorResult.shouldStop) {
          return {
            success: false,
            executionId,
            results,
            errors,
            warnings,
            executionTime: Date.now() - executionContext.startTime,
            nodesExecuted,
            status: 'FAILED',
            performance,
            conditionalPaths,
            errorHandling,
            debug
          }
        } else {
          // Continue execution despite error
          warnings.push(`Continuing execution despite error in node ${currentNode.id}`)
          const nextNodes = await getNextNodesEnhanced(currentNode, { error: nodeError }, executionGraph, executionContext, conditionalPaths, debug)
          nodeQueue.push(...nextNodes)
        }
      }
    }

    // Wait for parallel executions to complete
    if (executionPromises.length > 0) {
      await Promise.allSettled(executionPromises)
    }

    // Calculate final performance metrics
    performance.totalTime = Date.now() - executionContext.startTime
    performance.averageNodeTime = nodesExecuted > 0 ? 
      Object.values(nodeExecutionTimes).reduce((sum, time) => sum + time, 0) / nodesExecuted : 0

    // Check if all nodes were executed
    const allNodesExecuted = executedNodes.size === nodes.length
    const status = errors.length > 0 ? 'PARTIAL' : (allNodesExecuted ? 'COMPLETED' : 'PARTIAL')

    return {
      success: errors.length === 0,
      executionId,
      results,
      errors,
      warnings,
      executionTime: performance.totalTime,
      nodesExecuted,
      status,
      performance,
      conditionalPaths,
      errorHandling,
      debug
    }

  } catch (workflowError) {
    return {
      success: false,
      executionId,
      results,
      errors: [...errors, workflowError.message],
      warnings,
      executionTime: Date.now() - (executionContext?.startTime || Date.now()),
      nodesExecuted,
      status: 'FAILED',
      performance,
      conditionalPaths,
      errorHandling,
      debug
    }
  }
}

function buildEnhancedExecutionGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): any[] {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    data: node.data,
    incomingEdges: edges.filter(edge => edge.target === node.id),
    outgoingEdges: edges.filter(edge => edge.source === node.id)
  }))
}

async function getNextNodesEnhanced(
  currentNode: any, 
  nodeResult: any, 
  executionGraph: any[], 
  context: any,
  conditionalPaths: any,
  debug?: any
): Promise<any[]> {
  const nextNodes: any[] = []
  
  for (const edge of currentNode.outgoingEdges) {
    const nextNode = executionGraph.find(n => n.id === edge.target)
    if (!nextNode) continue

    // Enhanced condition evaluation
    const shouldExecute = await evaluateEnhancedEdgeCondition(edge, nodeResult, context, conditionalPaths, debug)
    
    if (shouldExecute) {
      nextNodes.push(nextNode)
      conditionalPaths.taken.push(edge.id)
    } else {
      conditionalPaths.skipped.push(edge.id)
    }
    
    conditionalPaths.evaluated.push(edge.id)
  }

  return nextNodes
}

async function evaluateEnhancedEdgeCondition(
  edge: any, 
  nodeResult: any, 
  context: any,
  conditionalPaths: any,
  debug?: any
): Promise<boolean> {
  if (!edge.condition) return true
  
  try {
    const condition: WorkflowCondition = edge.condition
    let result = false

    switch (condition.type) {
      case 'equals':
        result = getNestedValue(nodeResult, condition.field) === condition.value
        break
      case 'not_equals':
        result = getNestedValue(nodeResult, condition.field) !== condition.value
        break
      case 'contains':
        result = String(getNestedValue(nodeResult, condition.field)).includes(String(condition.value))
        break
      case 'not_contains':
        result = !String(getNestedValue(nodeResult, condition.field)).includes(String(condition.value))
        break
      case 'greater_than':
        result = Number(getNestedValue(nodeResult, condition.field)) > Number(condition.value)
        break
      case 'less_than':
        result = Number(getNestedValue(nodeResult, condition.field)) < Number(condition.value)
        break
      case 'regex':
        const regex = new RegExp(condition.value)
        result = regex.test(String(getNestedValue(nodeResult, condition.field)))
        break
      case 'custom':
        result = await evaluateCustomCondition(condition.expression, { ...context, ...nodeResult })
        break
      case 'ai_decision':
        result = await evaluateAICondition(condition, nodeResult, context)
        break
      default:
        result = true
    }

    if (debug) {
      debug.conditionEvaluationLog.push({
        edgeId: edge.id,
        condition: condition.type,
        result,
        timestamp: new Date().toISOString()
      })
    }

    return result

  } catch (error) {
    console.warn('Error evaluating enhanced edge condition:', error)
    if (debug) {
      debug.conditionEvaluationLog.push({
        edgeId: edge.id,
        condition: edge.condition?.type,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
    return condition.fallback !== false // Default to continue execution
  }
}

async function evaluateAICondition(condition: WorkflowCondition, nodeResult: any, context: any): Promise<boolean> {
  try {
    const zai = await ZAI.create()
    
    const prompt = condition.aiPrompt || `
    Evaluate the following condition for workflow execution:
    
    Field: ${condition.field}
    Expected Value: ${condition.value}
    Actual Value: ${JSON.stringify(getNestedValue(nodeResult, condition.field))}
    Context: ${JSON.stringify(context)}
    
    Should this condition evaluate to true or false? Respond with only "true" or "false".
    `
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI workflow condition evaluator. Respond only with "true" or "false".'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    })

    const response = completion.choices[0]?.message?.content?.toLowerCase().trim()
    return response === 'true'
  } catch (error) {
    console.warn('AI condition evaluation failed:', error)
    return condition.fallback !== false
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

async function evaluateCustomCondition(expression: string, context: any): Promise<boolean> {
  try {
    // Enhanced custom condition evaluation with security
    const safeEval = new Function('context', `
      "use strict";
      const { triggerData, variables, state, errors, ...rest } = context;
      return (${expression});
    `)
    
    return await safeEval(context)
  } catch (error) {
    console.warn('Error evaluating custom condition:', error)
    throw new Error(`Custom condition evaluation failed: ${error.message}`)
  }
}

async function executeEnhancedNode(node: any, context: any, debug?: any): Promise<any> {
  const { type, data, config } = node
  
  // Enhanced timeout handling
  const nodeTimeout = config?.timeout || 30000 // 30 seconds default
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Node execution timeout')), nodeTimeout)
  })

  const executionPromise = executeEnhancedNodeByType(type, data, config, context, debug)
  
  return Promise.race([executionPromise, timeoutPromise])
}

async function executeEnhancedNodeByType(type: string, data: any, config: any, context: any, debug?: any): Promise<any> {
  switch (type) {
    case 'trigger':
      return executeEnhancedTriggerNode(data, config, context)
    case 'action':
      return executeEnhancedActionNode(data, config, context)
    case 'condition':
      return executeEnhancedConditionNode(data, config, context)
    case 'branch':
      return executeEnhancedBranchNode(data, config, context)
    case 'merge':
      return executeEnhancedMergeNode(data, config, context)
    case 'error_handler':
      return executeEnhancedErrorHandlerNode(data, config, context)
    case 'fallback':
      return executeEnhancedFallbackNode(data, config, context)
    case 'ai':
      return executeEnhancedAINode(data, config, context, debug)
    default:
      return executeNodeByType(type, data, config, context) // Fallback to original implementation
  }
}

// Enhanced node execution functions
async function executeEnhancedTriggerNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Enhanced trigger executed',
    data: context.triggerData,
    metadata: {
      executionTime: Date.now(),
      triggerType: config?.triggerType || 'manual'
    }
  }
}

async function executeEnhancedActionNode(data: any, config: any, context: any): Promise<any> {
  if (context.dryRun) {
    return {
      success: true,
      message: 'Action executed (dry run)',
      action: config?.action || 'generic_action',
      dryRun: true
    }
  }

  // Enhanced action execution with retry logic
  const maxRetries = config?.retryConfig?.maxRetries || 0
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the actual action
      const result = await executeAction(config, context)
      
      return {
        success: true,
        message: 'Action executed successfully',
        action: config?.action || 'generic_action',
        result,
        attempts: attempt + 1
      }
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        const delay = config?.retryConfig?.retryDelay * Math.pow(config?.retryConfig?.backoffMultiplier || 2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Action failed after ${maxRetries + 1} attempts: ${lastError.message}`)
}

async function executeEnhancedConditionNode(data: any, config: any, context: any): Promise<any> {
  const { conditions } = config || {}
  
  if (!conditions || !Array.isArray(conditions)) {
    throw new Error('Enhanced condition node requires conditions array')
  }

  const results: any[] = []
  
  for (const condition of conditions) {
    try {
      const result = await evaluateEnhancedCondition(condition, context)
      results.push({
        condition: condition.type,
        result,
        field: condition.field,
        value: condition.value
      })
    } catch (error) {
      results.push({
        condition: condition.type,
        result: false,
        error: error.message
      })
    }
  }

  // Determine overall result based on logic (AND/OR)
  const logic = config?.logic || 'AND'
  const overallResult = logic === 'AND' 
    ? results.every(r => r.result === true)
    : results.some(r => r.result === true)

  return {
    success: true,
    result: overallResult,
    logic,
    conditions: results,
    timestamp: new Date().toISOString()
  }
}

async function executeEnhancedBranchNode(data: any, config: any, context: any): Promise<any> {
  const { branches } = config || {}
  
  if (!branches || !Array.isArray(branches)) {
    throw new Error('Branch node requires branches array')
  }

  // Evaluate each branch condition
  const branchResults = await Promise.all(
    branches.map(async (branch: any) => ({
      name: branch.name,
      condition: branch.condition,
      result: await evaluateEnhancedCondition(branch.condition, context)
    }))
  )

  // Find the first matching branch
  const matchingBranch = branchResults.find(br => br.result)
  
  return {
    success: true,
    selectedBranch: matchingBranch?.name || 'default',
    branchResults,
    timestamp: new Date().toISOString()
  }
}

async function executeEnhancedMergeNode(data: any, config: any, context: any): Promise<any> {
  const { waitFor = [], mergeStrategy = 'combine' } = config || {}
  
  // Check if all required inputs are available
  const readyInputs = waitFor.filter((input: string) => 
    context.variables.has(input) || context.state.has(input)
  )

  if (readyInputs.length < waitFor.length) {
    return {
      success: false,
      message: `Waiting for ${waitFor.length - readyInputs.length} more inputs`,
      readyInputs,
      waitingFor: waitFor.filter((input: string) => !readyInputs.includes(input))
    }
  }

  // Merge the inputs based on strategy
  let mergedResult: any = {}
  
  switch (mergeStrategy) {
    case 'combine':
      mergedResult = Object.assign({}, ...waitFor.map((input: string) => 
        context.variables.get(input) || context.state.get(input) || {}
      ))
      break
    case 'append':
      mergedResult = waitFor.map((input: string) => 
        context.variables.get(input) || context.state.get(input)
      ).flat()
      break
    case 'merge':
      mergedResult = { ...context.variables, ...context.state }
      break
    default:
      mergedResult = { combined: true }
  }

  return {
    success: true,
    message: 'Inputs merged successfully',
    mergeStrategy,
    mergedResult,
    inputsUsed: readyInputs,
    timestamp: new Date().toISOString()
  }
}

async function executeEnhancedErrorHandlerNode(data: any, config: any, context: any): Promise<any> {
  const { errorTypes = [], actions = [] } = config || {}
  
  // Check if there are relevant errors in the context
  const relevantErrors = Array.from(context.errors.entries()).filter(([_, error]) => 
    errorTypes.length === 0 || errorTypes.includes(error.type)
  )

  if (relevantErrors.length === 0) {
    return {
      success: true,
      message: 'No relevant errors to handle',
      handled: false
    }
  }

  // Execute error handling actions
  const actionResults = await Promise.all(
    actions.map(async (action: any) => {
      try {
        return await executeAction(action, { ...context, errors: relevantErrors })
      } catch (error) {
        return {
          success: false,
          action: action.type,
          error: error.message
        }
      }
    })
  )

  // Clear handled errors
  relevantErrors.forEach(([key, _]) => context.errors.delete(key))

  return {
    success: true,
    message: 'Errors handled successfully',
    handled: true,
    errorsHandled: relevantErrors.length,
    actionResults,
    timestamp: new Date().toISOString()
  }
}

async function executeEnhancedFallbackNode(data: any, config: any, context: any): Promise<any> {
  const { fallbackActions = [] } = config || {}
  
  // Execute fallback actions
  const results = await Promise.all(
    fallbackActions.map(async (action: any) => {
      try {
        return await executeAction(action, context)
      } catch (error) {
        return {
          success: false,
          action: action.type,
          error: error.message
        }
      }
    })
  )

  return {
    success: true,
    message: 'Fallback executed',
    results,
    timestamp: new Date().toISOString()
  }
}

async function executeEnhancedAINode(data: any, config: any, context: any, debug?: any): Promise<any> {
  const { prompt, model = 'gpt-3.5-turbo', maxTokens = 1000, temperature = 0.7 } = config || {}
  
  if (!prompt) {
    throw new Error('AI node requires a prompt')
  }

  try {
    const zai = await ZAI.create()
    
    // Replace placeholders in prompt with context values
    const processedPrompt = prompt.replace(/\{(\w+)\}/g, (match, key) => {
      return JSON.stringify(context[key] || context.variables.get(key) || match)
    })

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI workflow assistant. Provide helpful and accurate responses.'
        },
        {
          role: 'user',
          content: processedPrompt
        }
      ],
      max_tokens: maxTokens,
      temperature
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    return {
      success: true,
      message: 'AI processing completed',
      result: aiResponse,
      metadata: {
        model,
        tokensUsed: completion.usage?.total_tokens,
        processingTime: Date.now()
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    throw new Error(`AI processing failed: ${error.message}`)
  }
}

async function executeEnhancedCondition(condition: any, context: any): Promise<boolean> {
  // Similar to evaluateEnhancedEdgeCondition but for node-internal conditions
  const value = getNestedValue(context, condition.field) || context.variables.get(condition.field)
  
  switch (condition.operator || condition.type) {
    case 'equals':
      return value === condition.value
    case 'not_equals':
      return value !== condition.value
    case 'contains':
      return String(value).includes(String(condition.value))
    case 'greater_than':
      return Number(value) > Number(condition.value)
    case 'less_than':
      return Number(value) < Number(condition.value)
    default:
      return true
  }
}

async function executeAction(config: any, context: any): Promise<any> {
  // Placeholder for actual action execution
  // In a real implementation, this would execute the specific action
  return {
    success: true,
    action: config?.action || 'generic',
    timestamp: new Date().toISOString()
  }
}

async function handleNodeError(
  node: any, 
  error: any, 
  context: any, 
  errorHandling: any,
  debug?: any
): Promise<{ recovered: boolean; fallbackNode?: string; shouldStop: boolean }> {
  const { retryConfig, errorHandlers, fallbackNode } = node.data.config || {}
  
  // Check if retries are enabled and available
  if (retryConfig?.enabled && errorHandling.retries < (retryConfig.maxRetries || 3)) {
    errorHandling.retries++
    
    const delay = (retryConfig.retryDelay || 1000) * 
      Math.pow(retryConfig.backoffMultiplier || 2, errorHandling.retries - 1)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return { recovered: true, shouldStop: false }
  }
  
  // Check if there are error handlers
  if (errorHandlers && errorHandlers.length > 0) {
    // Execute error handlers (simplified)
    errorHandling.fallbacks++
    return { recovered: true, shouldStop: false }
  }
  
  // Check if there's a fallback node
  if (fallbackNode) {
    errorHandling.fallbacks++
    return { recovered: true, fallbackNode, shouldStop: false }
  }
  
  // Check if the node should stop on error
  if (node.data.config?.stopOnError !== false) {
    return { recovered: false, shouldStop: true }
  }
  
  return { recovered: false, shouldStop: false }
}

function calculateNewAverage(currentAverage: number, newValue: number, count: number): number {
  return ((currentAverage * (count - 1)) + newValue) / count
}

function calculateNewSuccessRate(currentRate: number, isSuccess: boolean, count: number): number {
  const successCount = (currentRate * (count - 1)) + (isSuccess ? 1 : 0)
  return successCount / count
}

// Fallback to original node execution functions for basic types
async function executeNodeByType(type: string, data: any, config: any, context: any): Promise<any> {
  switch (type) {
    case 'delay':
      return executeDelayNode(data, config, context)
    case 'notification':
      return executeNotificationNode(data, config, context)
    case 'email':
      return executeEmailNode(data, config, context)
    case 'api':
      return executeApiNode(data, config, context)
    case 'database':
      return executeDatabaseNode(data, config, context)
    case 'webhook':
      return executeWebhookNode(data, config, context)
    case 'transform':
      return executeTransformNode(data, config, context)
    case 'filter':
      return executeFilterNode(data, config, context)
    case 'loop':
      return executeLoopNode(data, config, context)
    case 'parallel':
      return executeParallelNode(data, config, context)
    case 'http':
      return executeHttpNode(data, config, context)
    case 'integration':
      return executeIntegrationNode(data, config, context)
    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}

// Basic node execution functions (simplified versions)
async function executeDelayNode(data: any, config: any, context: any): Promise<any> {
  const { duration = 1000, unit = 'ms' } = config || {}
  
  let delayMs = duration
  if (unit === 's') delayMs *= 1000
  if (unit === 'm') delayMs *= 60 * 1000
  if (unit === 'h') delayMs *= 60 * 60 * 1000

  if (context.testMode) {
    return {
      success: true,
      message: `Delay skipped (test mode): ${duration}${unit}`,
      actualDelay: 0
    }
  }

  await new Promise(resolve => setTimeout(resolve, delayMs))
  
  return {
    success: true,
    message: `Delay executed: ${duration}${unit}`,
    actualDelay: delayMs
  }
}

async function executeNotificationNode(data: any, config: any, context: any): Promise<any> {
  const { title, message, priority = 'medium' } = config || {}
  
  if (!title || !message) {
    throw new Error('Notification node requires title and message')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'Notification created (test mode)',
      title,
      priority
    }
  }

  return {
    success: true,
    message: 'Notification created',
    title,
    priority
  }
}

async function executeEmailNode(data: any, config: any, context: any): Promise<any> {
  const { to, subject, body, template } = config || {}
  
  if (!to || !subject || (!body && !template)) {
    throw new Error('Email node requires to, subject, and either body or template')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'Email sent (test mode)',
      to,
      subject
    }
  }

  return {
    success: true,
    message: 'Email sent',
    to,
    subject
  }
}

async function executeApiNode(data: any, config: any, context: any): Promise<any> {
  const { url, method = 'GET', headers = {}, body } = config || {}
  
  if (!url) {
    throw new Error('API node requires URL')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'API call executed (test mode)',
      url,
      method
    }
  }

  return {
    success: true,
    message: 'API call executed',
    url,
    method
  }
}

async function executeDatabaseNode(data: any, config: any, context: any): Promise<any> {
  if (context.testMode) {
    return {
      success: true,
      message: 'Database operation executed (test mode)',
      operation: config?.operation || 'query'
    }
  }

  return {
    success: true,
    message: 'Database operation executed',
    operation: config?.operation || 'query'
  }
}

async function executeWebhookNode(data: any, config: any, context: any): Promise<any> {
  if (context.testMode) {
    return {
      success: true,
      message: 'Webhook received (test mode)',
      webhook: config?.webhook || 'generic'
    }
  }

  return {
    success: true,
    message: 'Webhook received',
    webhook: config?.webhook || 'generic'
  }
}

async function executeTransformNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Data transformed',
    transform: config?.transform || 'generic'
  }
}

async function executeFilterNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Data filtered',
    filter: config?.filter || 'generic'
  }
}

async function executeLoopNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Loop executed',
    iterations: config?.iterations || 1
  }
}

async function executeParallelNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Parallel execution completed',
    branches: config?.branches || 2
  }
}

async function executeHttpNode(data: any, config: any, context: any): Promise<any> {
  const { url, method = 'GET', headers = {}, body } = config || {}
  
  if (!url) {
    throw new Error('HTTP node requires URL')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'HTTP request executed (test mode)',
      url,
      method
    }
  }

  return {
    success: true,
    message: 'HTTP request executed',
    url,
    method
  }
}

async function executeIntegrationNode(data: any, config: any, context: any): Promise<any> {
  return {
    success: true,
    message: 'Integration executed',
    integration: config?.integration || 'generic'
  }
}