import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(['GENERAL', 'LEAD_NURTURING', 'STUDENT_ONBOARDING', 'FOLLOW_UP', 'NOTIFICATION', 'INTEGRATION', 'MARKETING', 'SALES', 'SUPPORT', 'HR', 'FINANCE', 'OPERATIONS']),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional().default(false),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  triggers: z.array(z.any()).optional(),
  config: z.record(z.any()).optional(),
  estimatedExecutionTime: z.number().optional(),
  complexity: z.enum(['SIMPLE', 'MODERATE', 'COMPLEX']).optional(),
  requiredIntegrations: z.array(z.string()).optional()
})

interface WorkflowTemplate {
  id: string
  name: string
  description?: string
  category: string
  tags: string[]
  isPublic: boolean
  nodes: any[]
  edges: any[]
  triggers: any[]
  config: Record<string, any>
  estimatedExecutionTime?: number
  complexity: string
  requiredIntegrations: string[]
  usageCount: number
  rating: number
  reviews: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  agencyId?: string
}

const BUILTIN_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'student-onboarding-basic',
    name: 'Student Onboarding - Basic',
    description: 'Basic student onboarding workflow with welcome email and profile setup',
    category: 'STUDENT_ONBOARDING',
    tags: ['onboarding', 'welcome', 'email'],
    isPublic: true,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Student Registered',
          description: 'Triggered when new student registers',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['student_data']
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 300, y: 100 },
        data: {
          label: 'Send Welcome Email',
          description: 'Send welcome email to new student',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['student_data'],
          outputs: ['success', 'error'],
          config: {
            template: 'welcome-email',
            subject: 'Welcome to Our Education Agency!',
            body: 'Dear {student_name},\n\nWelcome to our agency! We\'re excited to help you with your study abroad journey.'
          }
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 500, y: 100 },
        data: {
          label: 'Wait 24 Hours',
          description: 'Wait 24 hours before follow-up',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['output'],
          config: {
            duration: 24,
            unit: 'h'
          }
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        position: { x: 700, y: 100 },
        data: {
          label: 'Notify Consultant',
          description: 'Notify consultant about new student',
          icon: 'Bell',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            title: 'New Student Assigned',
            message: 'A new student has been assigned to you: {student_name}',
            priority: 'medium'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'email-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-2',
        source: 'email-1',
        target: 'delay-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'success',
          field: 'status',
          value: 'success'
        }
      },
      {
        id: 'edge-3',
        source: 'delay-1',
        target: 'notification-1',
        type: 'smoothstep',
        animated: true
      }
    ],
    triggers: [
      {
        type: 'student_registered',
        config: {
          auto_start: true
        }
      }
    ],
    config: {
      autoStart: true,
      retryOnFailure: true
    },
    estimatedExecutionTime: 86400000, // 24 hours
    complexity: 'SIMPLE',
    requiredIntegrations: ['email'],
    usageCount: 1250,
    rating: 4.8,
    reviews: 89,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'lead-nurturing-advanced',
    name: 'Lead Nurturing - Advanced',
    description: 'Advanced lead nurturing with conditional logic and multiple touchpoints',
    category: 'LEAD_NURTURING',
    tags: ['lead', 'nurturing', 'email', 'conditional'],
    isPublic: true,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'New Lead',
          description: 'Triggered when new lead is created',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['lead_data']
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 300, y: 100 },
        data: {
          label: 'Lead Quality Check',
          description: 'Check lead quality based on budget and preferences',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['lead_data'],
          outputs: ['high_quality', 'low_quality'],
          conditions: [
            {
              type: 'greater_than',
              field: 'budget',
              value: 30000,
              operator: 'greater_than'
            }
          ],
          config: {
            logic: 'AND'
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 500, y: 50 },
        data: {
          label: 'Premium Welcome Email',
          description: 'Send premium welcome email for high-quality leads',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'premium-welcome',
            subject: 'Exclusive Study Abroad Opportunities',
            body: 'Dear {lead_name},\n\nBased on your preferences, we have exclusive opportunities for you.'
          }
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 500, y: 150 },
        data: {
          label: 'Standard Welcome Email',
          description: 'Send standard welcome email for other leads',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'standard-welcome',
            subject: 'Welcome to Our Agency',
            body: 'Dear {lead_name},\n\nThank you for your interest in our services.'
          }
        }
      },
      {
        id: 'branch-1',
        type: 'branch',
        position: { x: 700, y: 100 },
        data: {
          label: 'Follow-up Branch',
          description: 'Branch for different follow-up strategies',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['input'],
          outputs: ['immediate', 'delayed'],
          config: {
            branches: [
              {
                name: 'immediate',
                condition: {
                  type: 'equals',
                  field: 'lead_source',
                  value: 'website'
                }
              },
              {
                name: 'delayed',
                condition: {
                  type: 'not_equals',
                  field: 'lead_source',
                  value: 'website'
                }
              }
            ]
          }
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 900, y: 50 },
        data: {
          label: 'Immediate Follow-up',
          description: 'Immediate follow-up for website leads',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['output'],
          config: {
            duration: 1,
            unit: 'h'
          }
        }
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 900, y: 150 },
        data: {
          label: 'Delayed Follow-up',
          description: 'Delayed follow-up for other leads',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['output'],
          config: {
            duration: 24,
            unit: 'h'
          }
        }
      },
      {
        id: 'merge-1',
        type: 'merge',
        position: { x: 1100, y: 100 },
        data: {
          label: 'Merge Follow-up',
          description: 'Merge follow-up paths',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['input'],
          outputs: ['output'],
          config: {
            waitFor: ['immediate', 'delayed'],
            mergeStrategy: 'combine'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'condition-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-2',
        source: 'condition-1',
        target: 'email-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'result',
          value: 'high_quality'
        }
      },
      {
        id: 'edge-3',
        source: 'condition-1',
        target: 'email-2',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'result',
          value: 'low_quality'
        }
      },
      {
        id: 'edge-4',
        source: 'email-1',
        target: 'branch-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-5',
        source: 'email-2',
        target: 'branch-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-6',
        source: 'branch-1',
        target: 'delay-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'selectedBranch',
          value: 'immediate'
        }
      },
      {
        id: 'edge-7',
        source: 'branch-1',
        target: 'delay-2',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'selectedBranch',
          value: 'delayed'
        }
      },
      {
        id: 'edge-8',
        source: 'delay-1',
        target: 'merge-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-9',
        source: 'delay-2',
        target: 'merge-1',
        type: 'smoothstep',
        animated: true
      }
    ],
    triggers: [
      {
        type: 'lead_created',
        config: {
          auto_start: true
        }
      }
    ],
    config: {
      autoStart: true,
      retryOnFailure: true,
      conditionalLogic: true
    },
    estimatedExecutionTime: 172800000, // 48 hours
    complexity: 'MODERATE',
    requiredIntegrations: ['email'],
    usageCount: 856,
    rating: 4.6,
    reviews: 67,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'application-processing-complex',
    name: 'Application Processing - Complex',
    description: 'Complex application processing with AI decision making and error handling',
    category: 'GENERAL',
    tags: ['application', 'ai', 'processing', 'error-handling'],
    isPublic: true,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Application Submitted',
          description: 'Triggered when application is submitted',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['application_data']
        }
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 300, y: 100 },
        data: {
          label: 'AI Application Review',
          description: 'AI-powered application completeness check',
          icon: 'Brain',
          category: 'AI',
          inputs: ['application_data'],
          outputs: ['result', 'error'],
          config: {
            prompt: 'Review this application for completeness and quality. Check for missing documents, proper formatting, and overall quality. Provide a score from 1-10 and list any issues found.',
            model: 'gpt-4',
            maxTokens: 500,
            temperature: 0.3
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          label: 'Quality Check',
          description: 'Check if application meets quality threshold',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['ai_result'],
          outputs: ['approved', 'needs_review', 'rejected'],
          conditions: [
            {
              type: 'greater_than',
              field: 'score',
              value: 7
            }
          ],
          config: {
            logic: 'AND'
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 700, y: 50 },
        data: {
          label: 'Application Approved',
          description: 'Send approval email',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'application-approved',
            subject: 'Your Application Has Been Approved!',
            body: 'Congratulations! Your application has been approved and will proceed to the next stage.'
          }
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 700, y: 150 },
        data: {
          label: 'Review Required',
          description: 'Send review required email',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'review-required',
            subject: 'Application Review Required',
            body: 'Your application requires additional review. Please address the following issues: {issues}'
          }
        }
      },
      {
        id: 'error-handler-1',
        type: 'error_handler',
        position: { x: 500, y: 250 },
        data: {
          label: 'Error Handler',
          description: 'Handle AI processing errors',
          icon: 'AlertTriangle',
          category: 'Error Handling',
          inputs: ['error'],
          outputs: ['success'],
          config: {
            errorTypes: ['ai_processing_error', 'timeout_error'],
            actions: [
              {
                type: 'notification',
                config: {
                  title: 'AI Processing Error',
                  message: 'Failed to process application with AI. Manual review required.',
                  priority: 'high'
                }
              },
              {
                type: 'email',
                config: {
                  to: 'admin@agency.com',
                  subject: 'AI Processing Failed',
                  body: 'AI processing failed for application {application_id}. Manual review required.'
                }
              }
            ]
          }
        }
      },
      {
        id: 'fallback-1',
        type: 'fallback',
        position: { x: 700, y: 250 },
        data: {
          label: 'Manual Review Fallback',
          description: 'Fallback to manual review process',
          icon: 'Settings',
          category: 'Fallback',
          inputs: ['input'],
          outputs: ['success'],
          config: {
            fallbackActions: [
              {
                type: 'notification',
                config: {
                  title: 'Manual Review Required',
                  message: 'Application requires manual review due to processing issues.',
                  priority: 'medium'
                }
              },
              {
                type: 'task',
                config: {
                  title: 'Manual Application Review',
                  description: 'Review application {application_id} manually',
                  assignTo: 'review_team'
                }
              }
            ]
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'ai-1',
        type: 'smoothstep',
        animated: true
      },
      {
        id: 'edge-2',
        source: 'ai-1',
        target: 'condition-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'success',
          field: 'status',
          value: 'success'
        }
      },
      {
        id: 'edge-3',
        source: 'ai-1',
        target: 'error-handler-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'error',
          field: 'status',
          value: 'error'
        }
      },
      {
        id: 'edge-4',
        source: 'condition-1',
        target: 'email-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'result',
          value: 'approved'
        }
      },
      {
        id: 'edge-5',
        source: 'condition-1',
        target: 'email-2',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'equals',
          field: 'result',
          value: 'needs_review'
        }
      },
      {
        id: 'edge-6',
        source: 'error-handler-1',
        target: 'fallback-1',
        type: 'smoothstep',
        animated: true,
        condition: {
          type: 'success',
          field: 'status',
          value: 'success'
        }
      }
    ],
    triggers: [
      {
        type: 'application_submitted',
        config: {
          auto_start: true
        }
      }
    ],
    config: {
      autoStart: true,
      aiEnabled: true,
      errorHandling: true,
      fallbackEnabled: true
    },
    estimatedExecutionTime: 300000, // 5 minutes
    complexity: 'COMPLEX',
    requiredIntegrations: ['email', 'ai', 'task_management'],
    usageCount: 423,
    rating: 4.9,
    reviews: 45,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
]

// GET /api/[subdomain]/workflows/templates - List workflow templates
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isPublic = searchParams.get('public') === 'true'
    const complexity = searchParams.get('complexity')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Get agency-specific templates
    const agencyTemplates = await db.workflowTemplate.findMany({
      where: {
        agencyId: agency.id,
        ...(category && { category }),
        ...(complexity && { complexity: complexity as any }),
        ...(tags && { tags: { hasSome: tags } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Filter built-in templates based on query parameters
    let filteredBuiltinTemplates = BUILTIN_TEMPLATES
    
    if (category) {
      filteredBuiltinTemplates = filteredBuiltinTemplates.filter(t => t.category === category)
    }
    
    if (complexity) {
      filteredBuiltinTemplates = filteredBuiltinTemplates.filter(t => t.complexity === complexity)
    }
    
    if (tags && tags.length > 0) {
      filteredBuiltinTemplates = filteredBuiltinTemplates.filter(t => 
        tags.some(tag => t.tags.includes(tag))
      )
    }
    
    if (search) {
      filteredBuiltinTemplates = filteredBuiltinTemplates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    if (isPublic) {
      filteredBuiltinTemplates = filteredBuiltinTemplates.filter(t => t.isPublic)
    }

    // Combine and format templates
    const allTemplates = [
      ...agencyTemplates.map(t => ({
        ...t,
        isBuiltin: false,
        isPublic: t.isPublic || false
      })),
      ...filteredBuiltinTemplates.map(t => ({
        ...t,
        isBuiltin: true,
        isPublic: t.isPublic
      }))
    ]

    return NextResponse.json({
      templates: allTemplates,
      categories: [...new Set(allTemplates.map(t => t.category))],
      total: allTemplates.length,
      builtinCount: filteredBuiltinTemplates.length,
      agencyCount: agencyTemplates.length
    })

  } catch (error) {
    console.error("Error fetching workflow templates:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/[subdomain]/workflows/templates - Create new workflow template
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
    const validatedData = templateSchema.parse(body)

    // Create new workflow template
    const template = await db.workflowTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        tags: validatedData.tags || [],
        isPublic: validatedData.isPublic,
        nodes: validatedData.nodes,
        edges: validatedData.edges,
        triggers: validatedData.triggers || [],
        config: validatedData.config || {},
        estimatedExecutionTime: validatedData.estimatedExecutionTime,
        complexity: validatedData.complexity,
        requiredIntegrations: validatedData.requiredIntegrations || [],
        agencyId: agency.id,
        usageCount: 0,
        rating: 0,
        reviews: 0
      }
    })

    // Log template creation
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        action: 'WORKFLOW_TEMPLATE_CREATED',
        entityType: 'WorkflowTemplate',
        entityId: template.id,
        changes: JSON.stringify({
          name: template.name,
          category: template.category,
          isPublic: template.isPublic
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        isBuiltin: false
      },
      message: "Workflow template created successfully"
    })

  } catch (error) {
    console.error("Error creating workflow template:", error)
    
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