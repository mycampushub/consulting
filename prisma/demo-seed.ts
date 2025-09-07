import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding demo data...')

  try {
    // Create demo agency
    const demoAgency = await db.agency.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        id: 'demo-agency-id',
        name: 'Demo Education Agency',
        subdomain: 'demo',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        status: 'ACTIVE',
        plan: 'FREE'
      }
    })

    console.log('✅ Demo agency created/updated:', demoAgency.name)

    // Create demo user
    const demoUser = await db.user.upsert({
      where: { email: 'demo@agency.com' },
      update: {},
      create: {
        id: 'demo-user-id',
        email: 'demo@agency.com',
        name: 'Demo User',
        role: 'AGENCY_ADMIN',
        status: 'ACTIVE',
        agencyId: demoAgency.id
      }
    })

    console.log('✅ Demo user created/updated:', demoUser.name)

    // Create demo branch
    const demoBranch = await db.branch.upsert({
      where: { 
        agencyId_code: {
          agencyId: demoAgency.id,
          code: 'MAIN'
        }
      },
      update: {},
      create: {
        id: 'demo-branch-id',
        name: 'Main Office',
        code: 'MAIN',
        type: 'MAIN',
        status: 'ACTIVE',
        agencyId: demoAgency.id,
        address: '123 Business Avenue',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
        email: 'info@demoagency.com',
        phone: '+1 (555) 123-4567',
        maxStudents: 1000,
        maxStaff: 50,
        description: 'Main headquarters of Demo Education Agency'
      }
    })

    console.log('✅ Demo branch created/updated:', demoBranch.name)

    // Create demo brand settings
    await db.brandSettings.upsert({
      where: { agencyId: demoAgency.id },
      update: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981'
      },
      create: {
        agencyId: demoAgency.id,
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981'
      }
    })

    console.log('✅ Demo brand settings created/updated')

    console.log('🎉 Demo data seeding completed successfully!')
    console.log('📝 Demo credentials:')
    console.log('   Email: demo@agency.com')
    console.log('   Password: any (demo mode)')
    console.log('   Agency: demo')
    console.log('   Access: http://localhost:3000/demo')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })