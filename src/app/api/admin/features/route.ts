import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')
    const category = searchParams.get('category')
    const global = searchParams.get('global') === 'true'

    // Build where clause
    const where: any = {}
    
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId
    }
    
    if (category && category !== 'all') {
      where.category = category
    }

    // Fetch feature settings
    const featureSettings = await db.featureSettings.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true
          }
        }
      }
    })

    // Get global feature definitions
    const globalFeatures = await getGlobalFeatureDefinitions()

    // Get feature usage statistics
    const usageStats = await getFeatureUsageStats(where)

    // Get feature categories
    const categories = await getFeatureCategories()

    return NextResponse.json({
      success: true,
      data: {
        featureSettings: featureSettings.map(setting => ({
          id: setting.id,
          agency: setting.agency,
          maxStudents: setting.maxStudents,
          maxUsers: setting.maxUsers,
          maxStorage: setting.maxStorage,
          features: setting.features,
          customFeatures: setting.customFeatures,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt
        })),
        globalFeatures,
        usageStats,
        categories,
        global
      }
    })

  } catch (error) {
    console.error("Error fetching feature settings:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agencyId,
      maxStudents,
      maxUsers,
      maxStorage,
      features,
      customFeatures
    } = body

    // Validate required fields
    if (!agencyId) {
      return NextResponse.json(
        { error: "Agency ID is required" },
        { status: 400 }
      )
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Check if feature settings already exist
    const existingSettings = await db.featureSettings.findUnique({
      where: { agencyId }
    })

    if (existingSettings) {
      return NextResponse.json(
        { error: "Feature settings already exist for this agency" },
        { status: 400 }
      )
    }

    // Create feature settings
    const featureSettings = await db.featureSettings.create({
      data: {
        agencyId,
        maxStudents: maxStudents || getDefaultLimits(agency.plan).maxStudents,
        maxUsers: maxUsers || getDefaultLimits(agency.plan).maxUsers,
        maxStorage: maxStorage || getDefaultLimits(agency.plan).maxStorage,
        features: features || getDefaultFeatures(agency.plan),
        customFeatures: customFeatures || {}
      }
    })

    // Log the feature setup
    await db.activityLog.create({
      data: {
        agencyId,
        action: 'FEATURE_SETTINGS_CREATED',
        entityType: 'FeatureSettings',
        entityId: featureSettings.id,
        changes: JSON.stringify({
          maxStudents,
          maxUsers,
          maxStorage,
          features
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        featureSettings: {
          id: featureSettings.id,
          agencyId: featureSettings.agencyId,
          maxStudents: featureSettings.maxStudents,
          maxUsers: featureSettings.maxUsers,
          maxStorage: featureSettings.maxStorage,
          features: featureSettings.features,
          customFeatures: featureSettings.customFeatures,
          createdAt: featureSettings.createdAt
        }
      }
    })

  } catch (error) {
    console.error("Error creating feature settings:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      maxStudents,
      maxUsers,
      maxStorage,
      features,
      customFeatures
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Feature settings ID is required" },
        { status: 400 }
      )
    }

    // Check if feature settings exist
    const existingSettings = await db.featureSettings.findUnique({
      where: { id },
      include: { agency: true }
    })

    if (!existingSettings) {
      return NextResponse.json(
        { error: "Feature settings not found" },
        { status: 404 }
      )
    }

    // Update feature settings
    const updatedSettings = await db.featureSettings.update({
      where: { id },
      data: {
        ...(maxStudents !== undefined && { maxStudents }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxStorage !== undefined && { maxStorage }),
        ...(features !== undefined && { features }),
        ...(customFeatures !== undefined && { customFeatures })
      }
    })

    // Log the update
    await db.activityLog.create({
      data: {
        agencyId: existingSettings.agencyId,
        action: 'FEATURE_SETTINGS_UPDATED',
        entityType: 'FeatureSettings',
        entityId: id,
        changes: JSON.stringify({
          before: existingSettings,
          after: updatedSettings
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        featureSettings: updatedSettings
      }
    })

  } catch (error) {
    console.error("Error updating feature settings:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function getGlobalFeatureDefinitions() {
  return [
    {
      id: 'custom_domain',
      name: 'Custom Domain',
      description: 'Allow agencies to use custom domains',
      category: 'branding',
      type: 'boolean',
      defaultValue: false,
      plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'white_label',
      name: 'White Label',
      description: 'Complete white-label solution for agencies',
      category: 'branding',
      type: 'boolean',
      defaultValue: false,
      plans: ['ENTERPRISE']
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'Provide API access for integrations',
      category: 'integrations',
      type: 'boolean',
      defaultValue: false,
      plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Advanced analytics and reporting features',
      category: 'analytics',
      type: 'boolean',
      defaultValue: false,
      plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      description: 'Priority customer support',
      category: 'support',
      type: 'boolean',
      defaultValue: false,
      plans: ['ENTERPRISE']
    },
    {
      id: 'custom_integrations',
      name: 'Custom Integrations',
      description: 'Ability to create custom integrations',
      category: 'integrations',
      type: 'boolean',
      defaultValue: false,
      plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'unlimited_students',
      name: 'Unlimited Students',
      description: 'No limit on number of students',
      category: 'limits',
      type: 'boolean',
      defaultValue: false,
      plans: ['ENTERPRISE']
    },
    {
      id: 'unlimited_users',
      name: 'Unlimited Users',
      description: 'No limit on number of users',
      category: 'limits',
      type: 'boolean',
      defaultValue: false,
      plans: ['ENTERPRISE']
    },
    {
      id: 'unlimited_storage',
      name: 'Unlimited Storage',
      description: 'No limit on storage space',
      category: 'limits',
      type: 'boolean',
      defaultValue: false,
      plans: ['ENTERPRISE']
    },
    {
      id: 'ai_features',
      name: 'AI Features',
      description: 'AI-powered features and insights',
      category: 'ai',
      type: 'boolean',
      defaultValue: false,
      plans: ['PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'advanced_workflow',
      name: 'Advanced Workflow',
      description: 'Advanced workflow automation',
      category: 'automation',
      type: 'boolean',
      defaultValue: false,
      plans: ['PROFESSIONAL', 'ENTERPRISE']
    },
    {
      id: 'multi_language',
      name: 'Multi-language Support',
      description: 'Support for multiple languages',
      category: 'localization',
      type: 'boolean',
      defaultValue: false,
      plans: ['PROFESSIONAL', 'ENTERPRISE']
    }
  ]
}

async function getFeatureUsageStats(where: any) {
  const [
    totalAgencies,
    featureUsage,
    planDistribution,
    categoryUsage
  ] = await Promise.all([
    // Total agencies with feature settings
    db.featureSettings.count({ where }),

    // Feature usage across agencies
    db.featureSettings.findMany({
      where,
      select: {
        features: true,
        agency: {
          select: {
            plan: true
          }
        }
      }
    }),

    // Distribution by plan
    db.featureSettings.groupBy({
      by: ['agencyId'],
      where,
      include: {
        agency: {
          select: {
            plan: true
          }
        }
      }
    }),

    // Usage by category
    db.featureSettings.findMany({
      where,
      select: {
        features: true
      }
    })
  ])

  // Calculate feature usage
  const featureCounts: Record<string, number> = {}
  featureUsage.forEach(setting => {
    Object.entries(setting.features).forEach(([feature, enabled]) => {
      if (enabled) {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1
      }
    })
  })

  // Calculate plan distribution
  const planCounts = planDistribution.reduce((acc, item) => {
    const plan = item.agency.plan
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate category usage
  const categoryCounts: Record<string, number> = {}
  const globalFeatures = await getGlobalFeatureDefinitions()
  
  categoryUsage.forEach(setting => {
    Object.entries(setting.features).forEach(([feature, enabled]) => {
      if (enabled) {
        const featureDef = globalFeatures.find(f => f.id === feature)
        if (featureDef) {
          categoryCounts[featureDef.category] = (categoryCounts[featureDef.category] || 0) + 1
        }
      }
    })
  })

  return {
    totalAgencies,
    featureUsage: Object.entries(featureCounts).map(([feature, count]) => ({
      feature,
      count,
      percentage: totalAgencies > 0 ? (count / totalAgencies) * 100 : 0
    })),
    planDistribution: Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
      percentage: totalAgencies > 0 ? (count / totalAgencies) * 100 : 0
    })),
    categoryUsage: Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: totalAgencies > 0 ? (count / totalAgencies) * 100 : 0
    }))
  }
}

async function getFeatureCategories() {
  return [
    { id: 'branding', name: 'Branding', description: 'Customization and branding features' },
    { id: 'integrations', name: 'Integrations', description: 'Third-party integrations and API access' },
    { id: 'analytics', name: 'Analytics', description: 'Analytics and reporting features' },
    { id: 'support', name: 'Support', description: 'Customer support features' },
    { id: 'limits', name: 'Limits', description: 'Resource limits and restrictions' },
    { id: 'ai', name: 'AI Features', description: 'Artificial intelligence features' },
    { id: 'automation', name: 'Automation', description: 'Workflow automation features' },
    { id: 'localization', name: 'Localization', description: 'Multi-language and regional features' }
  ]
}

function getDefaultLimits(plan: string) {
  switch (plan) {
    case 'FREE':
      return {
        maxStudents: 50,
        maxUsers: 3,
        maxStorage: 1024 // 1GB
      }
    case 'STARTER':
      return {
        maxStudents: 200,
        maxUsers: 10,
        maxStorage: 5120 // 5GB
      }
    case 'PROFESSIONAL':
      return {
        maxStudents: 1000,
        maxUsers: 50,
        maxStorage: 25600 // 25GB
      }
    case 'ENTERPRISE':
      return {
        maxStudents: Infinity,
        maxUsers: Infinity,
        maxStorage: Infinity
      }
    default:
      return {
        maxStudents: 50,
        maxUsers: 3,
        maxStorage: 1024
      }
  }
}

function getDefaultFeatures(plan: string) {
  const features = {
    customDomain: plan !== 'FREE',
    whiteLabel: plan === 'ENTERPRISE',
    apiAccess: plan !== 'FREE',
    advancedAnalytics: plan !== 'FREE',
    prioritySupport: plan === 'ENTERPRISE',
    customIntegrations: plan !== 'FREE',
    unlimitedStudents: plan === 'ENTERPRISE',
    unlimitedUsers: plan === 'ENTERPRISE',
    unlimitedStorage: plan === 'ENTERPRISE',
    aiFeatures: ['PROFESSIONAL', 'ENTERPRISE'].includes(plan),
    advancedWorkflow: ['PROFESSIONAL', 'ENTERPRISE'].includes(plan),
    multiLanguage: ['PROFESSIONAL', 'ENTERPRISE'].includes(plan)
  }

  return features
}