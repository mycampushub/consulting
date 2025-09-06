export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data: {
      label: string
      description?: string
      icon?: string
      category?: string
      inputs?: string[]
      outputs?: string[]
      config?: Record<string, any>
    }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    label?: string
    type?: 'smoothstep' | 'bezier' | 'straight' | 'step'
    animated?: boolean
    data?: {
      condition?: string
      validation?: boolean
      errorHandling?: string
      priority?: number
      description?: string
    }
  }>
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'student-onboarding',
    name: 'Student Onboarding',
    description: 'Welcome new students and guide them through the onboarding process',
    category: 'Student Management',
    icon: 'Users',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'New Student Registered',
          description: 'Trigger when a new student registers',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['trigger'],
          config: {
            triggerType: 'student_registration',
            webhookUrl: ''
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 350, y: 100 },
        data: {
          label: 'Welcome Email',
          description: 'Send welcome email to new student',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'welcome_email',
            subject: 'Welcome to Our Agency!',
            body: 'Dear student, welcome to our educational agency...'
          }
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 600, y: 100 },
        data: {
          label: 'Wait 24 Hours',
          description: 'Wait before sending follow-up',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['out'],
          config: {
            delayType: 'hours',
            duration: 24
          }
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        position: { x: 850, y: 100 },
        data: {
          label: 'Notify Consultant',
          description: 'Notify assigned consultant about new student',
          icon: 'Bell',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success'],
          config: {
            notificationType: 'consultant_assignment',
            message: 'New student assigned to you'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Trigger to welcome email'
        }
      },
      {
        id: 'edge-2',
        source: 'email-1',
        target: 'delay-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Email sent successfully'
        }
      },
      {
        id: 'edge-3',
        source: 'delay-1',
        target: 'notification-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Delay completed'
        }
      }
    ]
  },
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing',
    description: 'Automated lead nurturing sequence with multiple touchpoints',
    category: 'Marketing',
    icon: 'Target',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'New Lead Created',
          description: 'Trigger when a new lead is created',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['trigger'],
          config: {
            triggerType: 'lead_creation',
            webhookUrl: ''
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 350, y: 50 },
        data: {
          label: 'Initial Contact',
          description: 'Send initial contact email',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'initial_contact',
            subject: 'Thanks for Your Interest!',
            body: 'Thank you for your interest in our educational services...'
          }
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 600, y: 50 },
        data: {
          label: 'Wait 2 Days',
          description: 'Wait before follow-up',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['out'],
          config: {
            delayType: 'days',
            duration: 2
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 350, y: 200 },
        data: {
          label: 'Lead Score > 50?',
          description: 'Check if lead score is above threshold',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['input'],
          outputs: ['true', 'false'],
          config: {
            condition: 'lead_score > 50',
            truePath: 'high_priority',
            falsePath: 'normal_priority'
          }
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 600, y: 150 },
        data: {
          label: 'Priority Follow-up',
          description: 'Send priority follow-up to high-scoring leads',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'priority_followup',
            subject: 'Personalized Educational Consultation',
            body: 'Based on your profile, we recommend...'
          }
        }
      },
      {
        id: 'email-3',
        type: 'email',
        position: { x: 600, y: 250 },
        data: {
          label: 'Standard Follow-up',
          description: 'Send standard follow-up email',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'standard_followup',
            subject: 'Following Up on Your Inquiry',
            body: 'Just following up on your educational inquiry...'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Trigger to initial email'
        }
      },
      {
        id: 'edge-2',
        source: 'email-1',
        target: 'delay-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Initial email sent'
        }
      },
      {
        id: 'edge-3',
        source: 'email-1',
        target: 'condition-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Check lead score'
        }
      },
      {
        id: 'edge-4',
        source: 'condition-1',
        target: 'email-2',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'true',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'High priority path'
        }
      },
      {
        id: 'edge-5',
        source: 'condition-1',
        target: 'email-3',
        sourceHandle: 'output-1',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'false',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Standard priority path'
        }
      }
    ]
  },
  {
    id: 'follow-up-sequence',
    name: 'Follow-up Sequence',
    description: 'Automated follow-up sequence for applications and inquiries',
    category: 'Communication',
    icon: 'MessageSquare',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Application Submitted',
          description: 'Trigger when application is submitted',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['trigger'],
          config: {
            triggerType: 'application_submission',
            webhookUrl: ''
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 350, y: 100 },
        data: {
          label: 'Application Confirmation',
          description: 'Send application confirmation email',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'application_confirmation',
            subject: 'Application Received - Confirmation',
            body: 'We have received your application and will review it shortly...'
          }
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 600, y: 100 },
        data: {
          label: 'Wait 3 Days',
          description: 'Wait for initial review',
          icon: 'Clock',
          category: 'Timing',
          inputs: ['input'],
          outputs: ['out'],
          config: {
            delayType: 'days',
            duration: 3
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 350, y: 250 },
        data: {
          label: 'Documents Complete?',
          description: 'Check if all required documents are submitted',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['input'],
          outputs: ['true', 'false'],
          config: {
            condition: 'documents_complete',
            truePath: 'proceed',
            falsePath: 'request_docs'
          }
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 600, y: 200 },
        data: {
          label: 'Request Documents',
          description: 'Request missing documents',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'document_request',
            subject: 'Action Required: Missing Documents',
            body: 'We need additional documents to process your application...'
          }
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        position: { x: 850, y: 100 },
        data: {
          label: 'Notify Review Team',
          description: 'Notify review team to start assessment',
          icon: 'Bell',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success'],
          config: {
            notificationType: 'review_assignment',
            message: 'New application ready for review'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Trigger to confirmation'
        }
      },
      {
        id: 'edge-2',
        source: 'email-1',
        target: 'delay-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Confirmation sent'
        }
      },
      {
        id: 'edge-3',
        source: 'email-1',
        target: 'condition-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Check documents'
        }
      },
      {
        id: 'edge-4',
        source: 'condition-1',
        target: 'email-2',
        sourceHandle: 'output-1',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'false',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Documents missing'
        }
      },
      {
        id: 'edge-5',
        source: 'delay-1',
        target: 'notification-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Delay completed'
        }
      }
    ]
  },
  {
    id: 'notification-workflow',
    name: 'Notification Workflow',
    description: 'Send notifications based on various triggers and conditions',
    category: 'Notifications',
    icon: 'Bell',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Task Due Soon',
          description: 'Trigger when task is due within 24 hours',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['trigger'],
          config: {
            triggerType: 'task_due_soon',
            webhookUrl: ''
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 350, y: 150 },
        data: {
          label: 'High Priority?',
          description: 'Check if task is high priority',
          icon: 'GitBranch',
          category: 'Logic',
          inputs: ['input'],
          outputs: ['true', 'false'],
          config: {
            condition: 'priority == "HIGH" || priority == "URGENT"',
            truePath: 'immediate',
            falsePath: 'normal'
          }
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        position: { x: 600, y: 100 },
        data: {
          label: 'Urgent Notification',
          description: 'Send urgent notification for high priority tasks',
          icon: 'Bell',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success'],
          config: {
            notificationType: 'urgent_task',
            message: 'High priority task due soon',
            priority: 'high'
          }
        }
      },
      {
        id: 'notification-2',
        type: 'notification',
        position: { x: 600, y: 200 },
        data: {
          label: 'Standard Notification',
          description: 'Send standard notification for normal priority tasks',
          icon: 'Bell',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success'],
          config: {
            notificationType: 'standard_task',
            message: 'Task due soon',
            priority: 'normal'
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 850, y: 150 },
        data: {
          label: 'Email Summary',
          description: 'Send email summary of due tasks',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'task_due_summary',
            subject: 'Tasks Due Soon - Summary',
            body: 'Here is a summary of tasks due soon...'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'condition-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Trigger to condition'
        }
      },
      {
        id: 'edge-2',
        source: 'condition-1',
        target: 'notification-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'true',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'High priority path'
        }
      },
      {
        id: 'edge-3',
        source: 'condition-1',
        target: 'notification-2',
        sourceHandle: 'output-1',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'false',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Normal priority path'
        }
      },
      {
        id: 'edge-4',
        source: 'notification-1',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Urgent to email'
        }
      },
      {
        id: 'edge-5',
        source: 'notification-2',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Standard to email'
        }
      }
    ]
  },
  {
    id: 'document-processing',
    name: 'Document Processing',
    description: 'Automated document processing and verification workflow',
    category: 'Documents',
    icon: 'FileText',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Document Uploaded',
          description: 'Trigger when document is uploaded',
          icon: 'Zap',
          category: 'Triggers',
          inputs: [],
          outputs: ['trigger'],
          config: {
            triggerType: 'document_upload',
            webhookUrl: ''
          }
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 350, y: 100 },
        data: {
          label: 'Validate Document',
          description: 'Validate document format and content',
          icon: 'CheckCircle',
          category: 'Actions',
          inputs: ['input'],
          outputs: ['valid', 'invalid'],
          config: {
            actionType: 'document_validation',
            parameters: {
              checkFormat: true,
              checkContent: true,
              maxSize: '10MB'
            }
          }
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 600, y: 50 },
        data: {
          label: 'Success Notification',
          description: 'Notify user of successful validation',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'document_valid',
            subject: 'Document Validation Successful',
            body: 'Your document has been successfully validated...'
          }
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 600, y: 200 },
        data: {
          label: 'Error Notification',
          description: 'Notify user of validation errors',
          icon: 'Mail',
          category: 'Communication',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            template: 'document_invalid',
            subject: 'Document Validation Failed',
            body: 'There were issues with your document...'
          }
        }
      },
      {
        id: 'database-1',
        type: 'database',
        position: { x: 850, y: 150 },
        data: {
          label: 'Save to Database',
          description: 'Save validated document to database',
          icon: 'DatabaseIcon',
          category: 'Data',
          inputs: ['input'],
          outputs: ['success', 'error'],
          config: {
            action: 'save_document',
            table: 'documents',
            fields: ['file_path', 'validation_status', 'uploaded_by']
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'action-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: '',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Trigger to validation'
        }
      },
      {
        id: 'edge-2',
        source: 'action-1',
        target: 'email-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'valid',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Valid document path'
        }
      },
      {
        id: 'edge-3',
        source: 'action-1',
        target: 'email-2',
        sourceHandle: 'output-1',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'invalid',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Invalid document path'
        }
      },
      {
        id: 'edge-4',
        source: 'email-1',
        target: 'database-1',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        type: 'smoothstep',
        animated: true,
        data: {
          condition: 'success',
          validation: true,
          errorHandling: 'stop',
          priority: 1,
          description: 'Success to database'
        }
      }
    ]
  }
]