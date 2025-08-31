import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding branches...')

  // Get the demo agency
  const agency = await prisma.agency.findUnique({
    where: { subdomain: 'demo' }
  })

  if (!agency) {
    console.error('Demo agency not found')
    return
  }

  // Get the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' }
  })

  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  // Create sample branches
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'Main Branch',
        code: 'MAIN',
        type: 'BRANCH',
        status: 'ACTIVE',
        email: 'main@demo.com',
        phone: '+1234567890',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        managerId: adminUser.id,
        maxStudents: 1000,
        maxStaff: 50,
        description: 'Main headquarters branch',
        features: JSON.stringify(['student_management', 'visa_processing', 'university_partnerships']),
        settings: JSON.stringify({
          workingHours: '9:00 AM - 6:00 PM',
          timezone: 'America/New_York',
          currency: 'USD'
        })
      },
    }),
    prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'Downtown Branch',
        code: 'DT',
        type: 'BRANCH',
        status: 'ACTIVE',
        email: 'downtown@demo.com',
        phone: '+1234567891',
        address: '456 Downtown Avenue',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10002',
        maxStudents: 500,
        maxStaff: 25,
        description: 'Downtown satellite branch',
        features: JSON.stringify(['student_management', 'counseling']),
        settings: JSON.stringify({
          workingHours: '10:00 AM - 7:00 PM',
          timezone: 'America/New_York',
          currency: 'USD'
        })
      },
    }),
    prisma.branch.create({
      data: {
        agencyId: agency.id,
        name: 'Queens Branch',
        code: 'QNS',
        type: 'BRANCH',
        status: 'PENDING',
        email: 'queens@demo.com',
        phone: '+1234567892',
        address: '789 Queens Boulevard',
        city: 'Queens',
        state: 'NY',
        country: 'USA',
        postalCode: '11372',
        maxStudents: 300,
        maxStaff: 15,
        description: 'Queens branch - opening soon',
        features: JSON.stringify(['student_management']),
        settings: JSON.stringify({
          workingHours: '9:00 AM - 5:00 PM',
          timezone: 'America/New_York',
          currency: 'USD'
        })
      },
    }),
  ])

  console.log('Created', branches.length, 'branches')

  // Update some students to be associated with branches
  const students = await prisma.student.findMany({
    where: { agencyId: agency.id },
    take: 5
  })

  for (let i = 0; i < students.length; i++) {
    await prisma.student.update({
      where: { id: students[i].id },
      data: {
        branchId: branches[i % branches.length].id
      }
    })
  }

  console.log('Assigned', students.length, 'students to branches')

  console.log('Branches seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })