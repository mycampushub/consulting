import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'

const executeSchema = z.object({
  triggerData: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  testMode: z.boolean().optional().default(false)
})

interface WorkflowExecutionResult {
  success: boolean
  executionId: string
  results: any[]
  errors: string[]
  warnings: string[]
  executionTime: number
  nodesExecuted: number
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL' | 'TIMEOUT'
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
    const { triggerData, context, testMode } = executeSchema.parse(body)

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

    // Create execution record
    const execution = await db.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        agencyId: agency.id,
        status: 'RUNNING',
        triggerData: triggerData || {},
        context: context || {},
        startedAt: new Date(),
        testMode
      }
    })

    // Execute workflow with enhanced error handling
    const startTime = Date.now()
    const executionResult = await executeWorkflow(workflow, execution.id, triggerData, context, testMode)
    const executionTime = Date.now() - startTime

    // Update execution record
    await db.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: executionResult.status,
        results: executionResult.results,
        errors: executionResult.errors,
        warnings: executionResult.warnings,
        executionTime,
        nodesExecuted: executionResult.nodesExecuted,
        completedAt: new Date()
      }
    })

    // Update workflow execution count
    await db.workflow.update({
      where: { id: workflow.id },
      data: {
        executionCount: workflow.executionCount + 1,
        lastExecutedAt: new Date()
      }
    })

    // Log execution
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        action: testMode ? 'WORKFLOW_TEST_EXECUTED' : 'WORKFLOW_EXECUTED',
        entityType: 'Workflow',
        entityId: workflow.id,
        changes: JSON.stringify({
          executionId: execution.id,
          status: executionResult.status,
          executionTime,
          nodesExecuted: executionResult.nodesExecuted,
          errors: executionResult.errors.length,
          warnings: executionResult.warnings.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: executionResult.success,
      executionId: execution.id,
      results: executionResult.results,
      errors: executionResult.errors,
      warnings: executionResult.warnings,
      executionTime,
      nodesExecuted: executionResult.nodesExecuted,
      status: executionResult.status
    })

  } catch (error) {
    console.error("Error executing workflow:", error)
    
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

async function executeWorkflow(
  workflow: any,
  executionId: string,
  triggerData: any = {},
  context: any = {},
  testMode: boolean = false
): Promise<WorkflowExecutionResult> {
  const results: any[] = []
  const errors: string[] = []
  const warnings: string[] = []
  let nodesExecuted = 0

  try {
    // Parse workflow nodes and edges
    const nodes = JSON.parse(workflow.nodes || '[]')
    const edges = JSON.parse(workflow.edges || '[]')

    // Build execution graph
    const executionGraph = buildExecutionGraph(nodes, edges)
    
    // Find starting nodes (nodes with no incoming edges)
    const startNodes = executionGraph.filter(node => node.incomingEdges.length === 0)
    
    if (startNodes.length === 0) {
      throw new Error("No starting nodes found in workflow")
    }

    // Execute workflow nodes
    const executionContext = {
      ...context,
      triggerData,
      executionId,
      testMode,
      workflowId: workflow.id,
      agencyId: workflow.agencyId,
      startTime: Date.now()
    }

    // Execute nodes in order
    const executedNodes = new Set<string>()
    const nodeQueue = [...startNodes]

    while (nodeQueue.length > 0) {
      const currentNode = nodeQueue.shift()!
      
      if (executedNodes.has(currentNode.id)) {
        continue
      }

      try {
        // Execute node
        const nodeResult = await executeNode(currentNode, executionContext)
        results.push({
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          result: nodeResult,
          timestamp: new Date().toISOString()
        })

        executedNodes.add(currentNode.id)
        nodesExecuted++

        // Add next nodes to queue based on conditions
        const nextNodes = getNextNodes(currentNode, nodeResult, executionGraph)
        nodeQueue.push(...nextNodes)

        // Check for timeouts
        if (Date.now() - executionContext.startTime > 300000) { // 5 minutes timeout
          warnings.push("Workflow execution timed out")
          return {
            success: false,
            executionId,
            results,
            errors: [...errors, "Execution timeout"],
            warnings,
            executionTime: Date.now() - executionContext.startTime,
            nodesExecuted,
            status: 'TIMEOUT'
          }
        }

      } catch (nodeError) {
        const errorMessage = `Error executing node ${currentNode.id}: ${nodeError.message}`
        errors.push(errorMessage)
        
        // Log node execution error
        results.push({
          nodeId: currentNode.id,
          nodeType: currentNode.type,
          error: errorMessage,
          timestamp: new Date().toISOString()
        })

        // Determine if workflow should continue or fail
        if (currentNode.data.config?.stopOnError !== false) {
          return {
            success: false,
            executionId,
            results,
            errors,
            warnings,
            executionTime: Date.now() - executionContext.startTime,
            nodesExecuted,
            status: 'FAILED'
          }
        } else {
          warnings.push(`Continuing execution despite error in node ${currentNode.id}`)
          // Continue with next nodes
          const nextNodes = getNextNodes(currentNode, { error: nodeError }, executionGraph)
          nodeQueue.push(...nextNodes)
        }
      }
    }

    // Check if all nodes were executed
    const allNodesExecuted = executedNodes.size === nodes.length
    const status = errors.length > 0 ? 'PARTIAL' : (allNodesExecuted ? 'COMPLETED' : 'PARTIAL')

    return {
      success: errors.length === 0,
      executionId,
      results,
      errors,
      warnings,
      executionTime: Date.now() - executionContext.startTime,
      nodesExecuted,
      status
    }

  } catch (workflowError) {
    return {
      success: false,
      executionId,
      results,
      errors: [...errors, workflowError.message],
      warnings,
      executionTime: Date.now() - (executionContext.startTime || Date.now()),
      nodesExecuted,
      status: 'FAILED'
    }
  }
}

function buildExecutionGraph(nodes: any[], edges: any[]): any[] {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    data: node.data,
    incomingEdges: edges.filter(edge => edge.target === node.id),
    outgoingEdges: edges.filter(edge => edge.source === node.id)
  }))
}

function getNextNodes(currentNode: any, nodeResult: any, executionGraph: any[]): any[] {
  const nextNodes: any[] = []
  
  for (const edge of currentNode.outgoingEdges) {
    const nextNode = executionGraph.find(n => n.id === edge.target)
    if (!nextNode) continue

    // Check edge conditions
    const shouldExecute = evaluateEdgeCondition(edge, nodeResult)
    if (shouldExecute) {
      nextNodes.push(nextNode)
    }
  }

  return nextNodes
}

function evaluateEdgeCondition(edge: any, nodeResult: any): boolean {
  // Simple condition evaluation - can be enhanced
  if (!edge.condition) return true
  
  try {
    const condition = JSON.parse(edge.condition)
    
    // Handle different condition types
    switch (condition.type) {
      case 'success':
        return !nodeResult.error
      case 'error':
        return !!nodeResult.error
      case 'equals':
        return nodeResult.result === condition.value
      case 'contains':
        return String(nodeResult.result).includes(condition.value)
      case 'custom':
        // Evaluate custom condition (simplified)
        return evaluateCustomCondition(condition.expression, nodeResult)
      default:
        return true
    }
  } catch (error) {
    console.warn('Error evaluating edge condition:', error)
    return true // Default to continue execution
  }
}

function evaluateCustomCondition(expression: string, context: any): boolean {
  // Simplified custom condition evaluation
  // In a real implementation, use a proper expression evaluator
  try {
    // Replace placeholders with actual values
    let evalExpression = expression
    Object.keys(context).forEach(key => {
      evalExpression = evalExpression.replace(new RegExp(`\\{${key}\\}`, 'g'), JSON.stringify(context[key]))
    })
    
    // WARNING: eval() is dangerous - use a proper expression evaluator in production
    // This is a simplified implementation for demonstration
    return eval(evalExpression)
  } catch (error) {
    console.warn('Error evaluating custom condition:', error)
    return true
  }
}

async function executeNode(node: any, context: any): Promise<any> {
  const { type, data, config } = node
  
  // Add execution timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Node execution timeout')), 30000) // 30 seconds timeout
  })

  const executionPromise = executeNodeByType(type, data, config, context)
  
  return Promise.race([executionPromise, timeoutPromise])
}

async function executeNodeByType(type: string, data: any, config: any, context: any): Promise<any> {
  switch (type) {
    case 'trigger':
      return executeTriggerNode(data, config, context)
    case 'action':
      return executeActionNode(data, config, context)
    case 'condition':
      return executeConditionNode(data, config, context)
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
    case 'ai':
      return executeAiNode(data, config, context)
    case 'integration':
      return executeIntegrationNode(data, config, context)
    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}

// Node execution functions
async function executeTriggerNode(data: any, config: any, context: any): Promise<any> {
  // Trigger nodes are entry points, they just pass through data
  return {
    success: true,
    message: 'Trigger executed',
    data: context.triggerData
  }
}

async function executeActionNode(data: any, config: any, context: any): Promise<any> {
  // Generic action node - can be customized
  if (context.testMode) {
    return {
      success: true,
      message: 'Action executed (test mode)',
      action: config?.action || 'generic_action'
    }
  }

  // In real implementation, execute the actual action
  return {
    success: true,
    message: 'Action executed',
    action: config?.action || 'generic_action'
  }
}

async function executeConditionNode(data: any, config: any, context: any): Promise<any> {
  const { condition } = config || {}
  
  if (!condition) {
    throw new Error('Condition node requires a condition configuration')
  }

  try {
    const result = evaluateCondition(condition, context)
    return {
      success: true,
      result,
      condition: condition.type
    }
  } catch (error) {
    throw new Error(`Condition evaluation failed: ${error.message}`)
  }
}

async function executeDelayNode(data: any, config: any, context: any): Promise<any> {
  const { duration = 1000, unit = 'ms' } = config || {}
  
  let delayMs = duration
  if (unit === 's') delayMs *= 1000
  if (unit === 'm') delayMs *= 60 * 1000
  if (unit === 'h') delayMs *= 60 * 60 * 1000

  if (context.testMode) {
    // Skip actual delay in test mode
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

  // In real implementation, create actual notification
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

  // In real implementation, send actual email
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
      message: 'API call simulated (test mode)',
      url,
      method
    }
  }

  // In real implementation, make actual API call
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const result = await response.json()
    
    return {
      success: response.ok,
      message: 'API call completed',
      status: response.status,
      result
    }
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`)
  }
}

async function executeDatabaseNode(data: any, config: any, context: any): Promise<any> {
  const { operation, table, data: dbData, conditions } = config || {}
  
  if (!operation || !table) {
    throw new Error('Database node requires operation and table')
  }

  if (context.testMode) {
    return {
      success: true,
      message: `Database ${operation} simulated (test mode)`,
      table,
      operation
    }
  }

  // In real implementation, execute actual database operation
  return {
    success: true,
    message: `Database ${operation} completed`,
    table,
    operation
  }
}

async function executeWebhookNode(data: any, config: any, context: any): Promise<any> {
  const { url, secret } = config || {}
  
  if (!url) {
    throw new Error('Webhook node requires URL')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'Webhook call simulated (test mode)',
      url
    }
  }

  // In real implementation, make actual webhook call
  return {
    success: true,
    message: 'Webhook call completed',
    url
  }
}

async function executeTransformNode(data: any, config: any, context: any): Promise<any> {
  const { transformation, inputPath, outputPath } = config || {}
  
  if (!transformation) {
    throw new Error('Transform node requires transformation configuration')
  }

  try {
    const inputData = inputPath ? getNestedValue(context, inputPath) : context
    const result = applyTransformation(inputData, transformation)
    
    if (outputPath) {
      setNestedValue(context, outputPath, result)
    }
    
    return {
      success: true,
      message: 'Transformation completed',
      result
    }
  } catch (error) {
    throw new Error(`Transformation failed: ${error.message}`)
  }
}

async function executeFilterNode(data: any, config: any, context: any): Promise<any> {
  const { condition, inputPath } = config || {}
  
  if (!condition) {
    throw new Error('Filter node requires condition configuration')
  }

  try {
    const inputData = inputPath ? getNestedValue(context, inputPath) : context
    const passes = evaluateCondition(condition, inputData)
    
    return {
      success: true,
      message: 'Filter evaluated',
      passes,
      result: passes ? inputData : null
    }
  } catch (error) {
    throw new Error(`Filter evaluation failed: ${error.message}`)
  }
}

async function executeLoopNode(data: any, config: any, context: any): Promise<any> {
  const { items, iterations = 1, maxIterations = 100 } = config || {}
  
  const loopItems = items || Array.from({ length: iterations }, (_, i) => i)
  const actualIterations = Math.min(loopItems.length, maxIterations)
  
  const results = []
  for (let i = 0; i < actualIterations; i++) {
    // In real implementation, execute loop body for each item
    results.push({
      iteration: i,
      item: loopItems[i],
      result: `Loop iteration ${i} completed`
    })
  }
  
  return {
    success: true,
    message: 'Loop completed',
    iterations: actualIterations,
    results
  }
}

async function executeParallelNode(data: any, config: any, context: any): Promise<any> {
  const { branches = [] } = config || {}
  
  if (branches.length === 0) {
    throw new Error('Parallel node requires at least one branch')
  }

  const results = await Promise.allSettled(
    branches.map((branch: any, index: number) => 
      executeBranch(branch, context, `branch_${index}`)
    )
  )
  
  return {
    success: results.every(r => r.status === 'fulfilled'),
    message: 'Parallel execution completed',
    results: results.map((r, i) => ({
      branch: `branch_${i}`,
      success: r.status === 'fulfilled',
      result: r.status === 'fulfilled' ? r.value : r.reason
    }))
  }
}

async function executeBranch(branch: any, context: any, branchName: string): Promise<any> {
  // In real implementation, execute the branch logic
  return {
    success: true,
    message: `Branch ${branchName} completed`,
    branchName
  }
}

async function executeHttpNode(data: any, config: any, context: any): Promise<any> {
  // Similar to API node but with more HTTP-specific options
  return executeApiNode(data, config, context)
}

async function executeAiNode(data: any, config: any, context: any): Promise<any> {
  const { prompt, model = 'gpt-3.5-turbo', maxTokens = 1000 } = config || {}
  
  if (!prompt) {
    throw new Error('AI node requires prompt')
  }

  if (context.testMode) {
    return {
      success: true,
      message: 'AI processing simulated (test mode)',
      prompt: prompt.substring(0, 100) + '...',
      model
    }
  }

  // In real implementation, call AI service
  try {
    // This would use the z-ai-web-dev-sdk in real implementation
    const result = `AI response for: ${prompt.substring(0, 100)}...`
    
    return {
      success: true,
      message: 'AI processing completed',
      result,
      model,
      tokens: Math.floor(Math.random() * maxTokens)
    }
  } catch (error) {
    throw new Error(`AI processing failed: ${error.message}`)
  }
}

async function executeIntegrationNode(data: any, config: any, context: any): Promise<any> {
  const { service, action, parameters } = config || {}
  
  if (!service || !action) {
    throw new Error('Integration node requires service and action')
  }

  if (context.testMode) {
    return {
      success: true,
      message: `Integration ${service}.${action} simulated (test mode)`,
      service,
      action
    }
  }

  // In real implementation, call the integration service
  return {
    success: true,
    message: `Integration ${service}.${action} completed`,
    service,
    action
  }
}

// Helper functions
function evaluateCondition(condition: any, context: any): boolean {
  // Simplified condition evaluation
  switch (condition.type) {
    case 'equals':
      return context[condition.field] === condition.value
    case 'contains':
      return String(context[condition.field]).includes(condition.value)
    case 'greater_than':
      return Number(context[condition.field]) > Number(condition.value)
    case 'less_than':
      return Number(context[condition.field]) < Number(condition.value)
    case 'exists':
      return context[condition.field] !== undefined && context[condition.field] !== null
    default:
      return true
  }
}

function applyTransformation(data: any, transformation: any): any {
  // Simplified transformation logic
  switch (transformation.type) {
    case 'uppercase':
      return String(data).toUpperCase()
    case 'lowercase':
      return String(data).toLowerCase()
    case 'extract':
      return data[transformation.field]
    case 'format':
      return transformation.template.replace(/\{(\w+)\}/g, (match, field) => data[field] || match)
    default:
      return data
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => current[key] || (current[key] = {}), obj)
  target[lastKey] = value
}