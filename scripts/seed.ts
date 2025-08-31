import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a sample agency
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

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      role: 'AGENCY_ADMIN',
      status: 'ACTIVE',
      agencyId: agency.id,
    },
  })

  console.log('Created user:', user.email)

  // Create a sample marketing campaign
  const campaign = await prisma.marketingCampaign.create({
    data: {
      agencyId: agency.id,
      name: 'Spring Intake Campaign 2024',
      description: 'Campaign targeting students for spring 2024 intake',
      type: 'EMAIL',
      status: 'ACTIVE',
      targetAudience: JSON.stringify([
        { field: 'program', operator: 'equals', value: 'Computer Science' },
        { field: 'country', operator: 'equals', value: 'USA' }
      ]),
      content: JSON.stringify({
        subject: 'Spring 2024 Intake - Apply Now!',
        body: 'Dear student, applications are now open for spring 2024 intake...'
      }),
      budget: 5000,
      spent: 1200,
    },
  })

  console.log('Created campaign:', campaign.name)

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        agencyId: agency.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        source: 'Google',
        status: 'NEW',
        campaignId: campaign.id,
      },
    }),
    prisma.lead.create({
      data: {
        agencyId: agency.id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        source: 'Facebook',
        status: 'CONTACTED',
        campaignId: campaign.id,
      },
    }),
    prisma.lead.create({
      data: {
        agencyId: agency.id,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        source: 'Organic',
        status: 'QUALIFIED',
      },
    }),
  ])

  console.log('Created', leads.length, 'leads')

  // Create a sample workflow
  const workflow = await prisma.workflow.create({
    data: {
      agencyId: agency.id,
      name: 'Lead Nurturing Workflow',
      description: 'Automated lead nurturing sequence',
      category: 'LEAD_NURTURING',
      status: 'ACTIVE',
      triggers: JSON.stringify([
        { type: 'NEW_LEAD', conditions: [] }
      ]),
      isActive: true,
      nodes: JSON.stringify([
        { id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: { label: 'New Lead' } },
        { id: '2', type: 'email', position: { x: 200, y: 0 }, data: { label: 'Welcome Email' } },
        { id: '3', type: 'delay', position: { x: 400, y: 0 }, data: { label: 'Wait 2 days' } },
      ]),
      edges: JSON.stringify([
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
      ]),
    },
  })

  console.log('Created workflow:', workflow.name)

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