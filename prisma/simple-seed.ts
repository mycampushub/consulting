import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating assignee users...')

  try {
    // Get or create the demo agency
    let agency = await prisma.agency.findUnique({
      where: { subdomain: 'demo' }
    })

    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          name: 'Demo Education Agency',
          subdomain: 'demo',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          status: 'ACTIVE',
          plan: 'FREE',
        },
      })
      console.log('Created agency:', agency.name)
    }

    // Create additional users for task assignment
    const usersData = [
      {
        email: 'admin@demo.com',
        name: 'Demo Admin',
        role: 'AGENCY_ADMIN',
        title: 'System Administrator',
        department: 'Management'
      },
      {
        email: 'consultant1@demo.com',
        name: 'Sarah Johnson',
        role: 'CONSULTANT',
        title: 'Senior Education Consultant',
        department: 'Consulting'
      },
      {
        email: 'consultant2@demo.com',
        name: 'Michael Chen',
        role: 'CONSULTANT', 
        title: 'Education Consultant',
        department: 'Consulting'
      },
      {
        email: 'support1@demo.com',
        name: 'Emily Davis',
        role: 'SUPPORT',
        title: 'Student Support Specialist',
        department: 'Support'
      }
    ]

    const hashedPassword = await bcrypt.hash('password', 12)

    for (const userData of usersData) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: userData.email,
          agencyId: agency.id
        }
      })

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            agencyId: agency.id,
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            status: 'ACTIVE',
            emailVerified: true,
            title: userData.title,
            department: userData.department
          }
        })
        console.log(`Created user: ${user.name} (${user.email})`)
      } else {
        console.log(`User already exists: ${userData.email}`)
      }
    }

    console.log('Assignee users created successfully!')
  } catch (error) {
    console.error('Error creating assignee users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()