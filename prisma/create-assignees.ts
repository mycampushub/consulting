import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAssigneeUsers() {
  console.log('Creating assignee users...')

  try {
    // Get the demo agency
    const agency = await prisma.agency.findUnique({
      where: { subdomain: 'demo' }
    })

    if (!agency) {
      console.error('Demo agency not found')
      return
    }

    // Create additional users for task assignment
    const usersData = [
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
      },
      {
        email: 'admin2@demo.com',
        name: 'Robert Wilson',
        role: 'AGENCY_ADMIN',
        title: 'Operations Manager',
        department: 'Management'
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

createAssigneeUsers()