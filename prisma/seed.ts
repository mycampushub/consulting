import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test agency
  const agency = await prisma.agency.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Education Agency',
      subdomain: 'demo',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      status: 'ACTIVE',
      plan: 'FREE',
    },
  })

  console.log('Created agency:', agency.name)

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      role: 'AGENCY_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      agencyId: agency.id,
    },
  })

  console.log('Created user:', user.email)

  // Create sample marketing campaigns
  const campaign1 = await prisma.marketingCampaign.create({
    data: {
      agencyId: agency.id,
      name: 'Fall 2024 Student Recruitment',
      description: 'Campaign targeting international students for Fall 2024 intake',
      type: 'EMAIL',
      status: 'ACTIVE',
      targetAudience: JSON.stringify([
        { field: 'country', operator: 'in', value: ['India', 'China', 'Brazil'] },
        { field: 'program', operator: 'contains', value: 'Engineering' }
      ]),
      content: JSON.stringify({
        subject: 'Study Abroad Opportunities for Fall 2024',
        body: 'Discover amazing opportunities to study abroad...',
        template: 'fall-recruitment'
      }),
      budget: 5000,
      spent: 1200,
      sentCount: 1500,
      deliveredCount: 1450,
      openedCount: 420,
      clickedCount: 85,
      conversionCount: 12,
    },
  })

  const campaign2 = await prisma.marketingCampaign.create({
    data: {
      agencyId: agency.id,
      name: 'Webinar Series 2024',
      description: 'Monthly webinar series for prospective students',
      type: 'WEBINAR',
      status: 'SCHEDULED',
      targetAudience: JSON.stringify([
        { field: 'interest', operator: 'contains', value: 'Business' }
      ]),
      content: JSON.stringify({
        subject: 'Join Our Business Webinar Series',
        body: 'Learn about business programs worldwide...',
        template: 'webinar-series'
      }),
      budget: 2000,
      spent: 0,
      scheduledAt: new Date('2024-09-01T10:00:00Z'),
    },
  })

  console.log('Created campaigns:', [campaign1.name, campaign2.name])

  // Create sample leads
  const lead1 = await prisma.lead.create({
    data: {
      agencyId: agency.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      source: 'Google',
      status: 'QUALIFIED',
      campaignId: campaign1.id,
      customFields: JSON.stringify({
        country: 'India',
        programOfInterest: 'Computer Science',
        budget: '25000-30000'
      }),
    },
  })

  const lead2 = await prisma.lead.create({
    data: {
      agencyId: agency.id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      source: 'Facebook',
      status: 'CONTACTED',
      campaignId: campaign1.id,
      customFields: JSON.stringify({
        country: 'China',
        programOfInterest: 'Business Administration',
        budget: '30000-35000'
      }),
    },
  })

  const lead3 = await prisma.lead.create({
    data: {
      agencyId: agency.id,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      source: 'Organic',
      status: 'NEW',
      customFields: JSON.stringify({
        country: 'Brazil',
        programOfInterest: 'Engineering',
        budget: '20000-25000'
      }),
    },
  })

  console.log('Created leads:', [lead1.email, lead2.email, lead3.email])

  // Create sample workflows
  const workflow1 = await prisma.workflow.create({
    data: {
      agencyId: agency.id,
      name: 'Lead Nurturing Workflow',
      description: 'Automated follow-up sequence for new leads',
      category: 'LEAD_NURTURING',
      status: 'ACTIVE',
      isActive: true,
      triggers: JSON.stringify([
        { type: 'lead_created', conditions: [] }
      ]),
      nodes: JSON.stringify([
        { id: '1', type: 'email', data: { template: 'welcome-email' } },
        { id: '2', type: 'delay', data: { days: 3 } },
        { id: '3', type: 'email', data: { template: 'follow-up-email' } }
      ]),
      edges: JSON.stringify([
        { from: '1', to: '2' },
        { from: '2', to: '3' }
      ]),
      executionCount: 45,
      lastExecutedAt: new Date(),
    },
  })

  const workflow2 = await prisma.workflow.create({
    data: {
      agencyId: agency.id,
      name: 'Student Onboarding',
      description: 'Welcome sequence for enrolled students',
      category: 'STUDENT_ONBOARDING',
      status: 'ACTIVE',
      isActive: true,
      triggers: JSON.stringify([
        { type: 'student_enrolled', conditions: [] }
      ]),
      nodes: JSON.stringify([
        { id: '1', type: 'email', data: { template: 'welcome-student' } },
        { id: '2', type: 'task', data: { assignTo: 'admin', title: 'Schedule orientation call' } }
      ]),
      edges: JSON.stringify([
        { from: '1', to: '2' }
      ]),
      executionCount: 12,
      lastExecutedAt: new Date(),
    },
  })

  console.log('Created workflows:', [workflow1.name, workflow2.name])

  // Check if branches already exist, if not create sample branches
  const existingBranches = await prisma.branch.findMany({
    where: { agencyId: agency.id }
  })

  if (existingBranches.length === 0) {
    console.log('Creating sample branches...')
    
    const mainBranch = await prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'Main Office',
        code: 'MAIN',
        type: 'MAIN',
        status: 'ACTIVE',
        email: 'main@demo.com',
        phone: '+1-555-0001',
        address: '123 Education Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        postalCode: '94105',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        businessHours: JSON.stringify({
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: 'Closed' }
        }),
        maxStudents: 500,
        maxStaff: 20,
        description: 'Main headquarters and administrative office',
        features: JSON.stringify(['all']),
        managerId: user.id,
      },
    })

    const branch2 = await prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'New York Branch',
        code: 'NYC',
        type: 'BRANCH',
        status: 'ACTIVE',
        email: 'nyc@demo.com',
        phone: '+1-555-0002',
        address: '456 Manhattan Avenue',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        postalCode: '10001',
        timezone: 'America/New_York',
        currency: 'USD',
        businessHours: JSON.stringify({
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: 'Closed' },
          sunday: { open: 'Closed' }
        }),
        maxStudents: 300,
        maxStaff: 15,
        description: 'East Coast regional branch',
        features: JSON.stringify(['consulting', 'applications']),
      },
    })

    const branch3 = await prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'London Office',
        code: 'LON',
        type: 'BRANCH',
        status: 'PENDING',
        email: 'london@demo.com',
        phone: '+44-20-0000-0001',
        address: '789 Oxford Street',
        city: 'London',
        state: 'England',
        country: 'United Kingdom',
        postalCode: 'W1D 1BS',
        timezone: 'Europe/London',
        currency: 'GBP',
        businessHours: JSON.stringify({
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: 'Closed' },
          sunday: { open: 'Closed' }
        }),
        maxStudents: 200,
        maxStaff: 10,
        description: 'UK regional office',
        features: JSON.stringify(['consulting']),
      },
    })

    console.log('Created branches:', [mainBranch.name, branch2.name, branch3.name])
  } else {
    console.log('Branches already exist:', existingBranches.map(b => b.name))
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })