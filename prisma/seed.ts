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

  let mainBranch, branch2, branch3
  
  // Check if branches already exist, if not create sample branches
  const existingBranches = await prisma.branch.findMany({
    where: { agencyId: agency.id }
  })

  if (existingBranches.length === 0) {
    console.log('Creating sample branches...')
    
    mainBranch = await prisma.branch.create({
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

    branch2 = await prisma.branch.create({
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

    branch3 = await prisma.branch.create({
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
    // Use existing branches
    mainBranch = existingBranches.find(b => b.code === 'MAIN') || existingBranches[0]
    branch2 = existingBranches.find(b => b.code === 'NYC') || existingBranches[1]
    branch3 = existingBranches.find(b => b.code === 'LON') || existingBranches[2]
  }

  // Create sample universities
  const universities = await Promise.all([
    prisma.university.create({
      data: {
        agencyId: agency.id,
        name: 'Harvard University',
        country: 'United States',
        city: 'Cambridge',
        website: 'https://harvard.edu',
        description: 'World-renowned research university',
        worldRanking: 1,
        isPartner: true,
        partnershipLevel: 'PREMIUM',
        commissionRate: 8.5,
        contactEmail: 'admissions@harvard.edu',
        programs: JSON.stringify(['Computer Science', 'Business', 'Law', 'Medicine']),
        requirements: JSON.stringify({
          toefl: 100,
          ielts: 7.0,
          gpa: 3.8
        })
      },
    }),
    prisma.university.create({
      data: {
        agencyId: agency.id,
        name: 'Stanford University',
        country: 'United States',
        city: 'Stanford',
        website: 'https://stanford.edu',
        description: 'Leading research and teaching institution',
        worldRanking: 3,
        isPartner: true,
        partnershipLevel: 'PREMIUM',
        commissionRate: 8.0,
        contactEmail: 'admissions@stanford.edu',
        programs: JSON.stringify(['Engineering', 'Computer Science', 'Business']),
        requirements: JSON.stringify({
          toefl: 100,
          ielts: 7.0,
          gpa: 3.7
        })
      },
    }),
    prisma.university.create({
      data: {
        agencyId: agency.id,
        name: 'University of Oxford',
        country: 'United Kingdom',
        city: 'Oxford',
        website: 'https://ox.ac.uk',
        description: 'Oldest university in the English-speaking world',
        worldRanking: 2,
        isPartner: true,
        partnershipLevel: 'BASIC',
        commissionRate: 7.5,
        contactEmail: 'admissions@ox.ac.uk',
        programs: JSON.stringify(['Philosophy, Politics and Economics', 'Law', 'Medicine']),
        requirements: JSON.stringify({
          ielts: 7.5,
          gpa: 3.8
        })
      },
    }),
    prisma.university.create({
      data: {
        agencyId: agency.id,
        name: 'MIT',
        country: 'United States',
        city: 'Cambridge',
        website: 'https://mit.edu',
        description: 'Premier institution for science and technology',
        worldRanking: 4,
        isPartner: false,
        partnershipLevel: 'NONE',
        contactEmail: 'admissions@mit.edu',
        programs: JSON.stringify(['Engineering', 'Computer Science', 'Physics']),
        requirements: JSON.stringify({
          toefl: 100,
          ielts: 7.0,
          gpa: 3.9
        })
      },
    })
  ])

  console.log('Created universities:', universities.map(u => u.name))

  // Create sample campuses for universities
  const campuses = await Promise.all([
    prisma.campus.create({
      data: {
        agencyId: agency.id,
        universityId: universities[0].id,
        name: 'Harvard Yard Campus',
        city: 'Cambridge',
        state: 'MA',
        country: 'United States',
        address: 'Cambridge, MA 02138',
        contactEmail: 'info@harvard.edu',
        contactPhone: '+1-617-495-1000',
        studentCapacity: 7000,
        currentStudents: 6800,
        facilities: JSON.stringify(['Library', 'Laboratories', 'Sports Complex', 'Student Housing'])
      },
    }),
    prisma.campus.create({
      data: {
        agencyId: agency.id,
        universityId: universities[1].id,
        name: 'Stanford Main Campus',
        city: 'Stanford',
        state: 'CA',
        country: 'United States',
        address: '450 Serra Mall, Stanford, CA 94305',
        contactEmail: 'info@stanford.edu',
        contactPhone: '+1-650-723-2300',
        studentCapacity: 7000,
        currentStudents: 6900,
        facilities: JSON.stringify(['Research Centers', 'Libraries', 'Athletic Facilities'])
      },
    })
  ])

  console.log('Created campuses:', campuses.map(c => c.name))

  // Create sample subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        agencyId: agency.id,
        campusId: campuses[0].id,
        name: 'Computer Science',
        code: 'CS-101',
        level: 'UNDERGRADUATE',
        department: 'School of Engineering',
        faculty: 'Engineering',
        duration: 4,
        studyMode: 'FULL_TIME',
        entryRequirements: JSON.stringify({
          math: 'A-Level Mathematics',
          physics: 'A-Level Physics preferred'
        }),
        tuitionFee: 55000,
        currency: 'USD',
        capacity: 200,
        enrolled: 185,
        accreditation: JSON.stringify(['ABET', 'NEASC']),
        description: 'Comprehensive computer science program with focus on software development and AI',
        careerProspects: JSON.stringify(['Software Engineer', 'Data Scientist', 'AI Researcher', 'Systems Analyst'])
      },
    }),
    prisma.subject.create({
      data: {
        agencyId: agency.id,
        campusId: campuses[1].id,
        name: 'Business Administration',
        code: 'BA-101',
        level: 'UNDERGRADUATE',
        department: 'Graduate School of Business',
        faculty: 'Business',
        duration: 4,
        studyMode: 'FULL_TIME',
        entryRequirements: JSON.stringify({
          math: 'A-Level Mathematics',
          economics: 'A-Level Economics preferred'
        }),
        tuitionFee: 58000,
        currency: 'USD',
        capacity: 150,
        enrolled: 142,
        accreditation: JSON.stringify(['AACSB', 'AMBA']),
        description: 'Comprehensive business program with focus on entrepreneurship and management',
        careerProspects: JSON.stringify(['Business Analyst', 'Management Consultant', 'Entrepreneur', 'Investment Banker'])
      },
    })
  ])

  console.log('Created subjects:', subjects.map(s => s.name))

  // Create sample students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        agencyId: agency.id,
        branchId: mainBranch.id,
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@example.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('2002-05-15'),
        nationality: 'Canadian',
        passportNumber: 'AB123456',
        status: 'APPLIED',
        stage: 'APPLICATION',
        currentEducation: 'High School Diploma',
        gpa: 3.8,
        preferredCountries: JSON.stringify(['United States', 'United Kingdom']),
        preferredCourses: JSON.stringify(['Computer Science', 'Engineering']),
        budget: 50000,
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Passport', type: 'identification', status: 'UPLOADED', uploadedAt: '2024-01-10T10:00:00Z' },
          { name: 'Transcript', type: 'academic', status: 'UPLOADED', uploadedAt: '2024-01-12T14:30:00Z' }
        ])
      },
    }),
    prisma.student.create({
      data: {
        agencyId: agency.id,
        branchId: branch2.id,
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@example.com',
        phone: '+1-555-0102',
        dateOfBirth: new Date('2001-08-22'),
        nationality: 'Spanish',
        passportNumber: 'ES789012',
        status: 'ACCEPTED',
        stage: 'DOCUMENTATION',
        currentEducation: 'IB Diploma',
        gpa: 3.6,
        preferredCountries: JSON.stringify(['United States', 'Canada']),
        preferredCourses: JSON.stringify(['Business Administration', 'Marketing']),
        budget: 45000,
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Passport', type: 'identification', status: 'APPROVED', uploadedAt: '2024-01-08T09:15:00Z' },
          { name: 'IB Certificate', type: 'academic', status: 'APPROVED', uploadedAt: '2024-01-09T11:20:00Z' },
          { name: 'Language Test', type: 'language', status: 'PENDING', uploadedAt: '2024-01-11T16:45:00Z' }
        ])
      },
    }),
    prisma.student.create({
      data: {
        agencyId: agency.id,
        branchId: mainBranch.id,
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@example.com',
        phone: '+1-555-0103',
        dateOfBirth: new Date('2003-03-10'),
        nationality: 'British',
        passportNumber: 'GB345678',
        status: 'ENROLLED',
        stage: 'PRE_DEPARTURE',
        currentEducation: 'A-Levels',
        gpa: 3.9,
        preferredCountries: JSON.stringify(['United States', 'Australia']),
        preferredCourses: JSON.stringify(['Engineering', 'Physics']),
        budget: 60000,
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Passport', type: 'identification', status: 'APPROVED', uploadedAt: '2024-01-05T08:30:00Z' },
          { name: 'A-Level Results', type: 'academic', status: 'APPROVED', uploadedAt: '2024-01-06T10:15:00Z' },
          { name: 'Visa', type: 'visa', status: 'APPROVED', uploadedAt: '2024-01-20T13:00:00Z' }
        ])
      },
    })
  ])

  // Create demo student with password for testing login
  const demoStudent = await prisma.student.create({
    data: {
      agencyId: agency.id,
      branchId: mainBranch.id,
      firstName: 'Demo',
      lastName: 'Student',
      email: 'demo@student.com',
      phone: '+1-555-9999',
      dateOfBirth: new Date('2000-01-01'),
      nationality: 'Demo',
      status: 'PROSPECT',
      stage: 'INQUIRY',
      currentEducation: 'High School',
      gpa: 3.5,
      preferredCountries: JSON.stringify(['United States']),
      preferredCourses: JSON.stringify(['Computer Science']),
      budget: 50000,
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      emailVerified: true,
      assignedTo: user.id,
      documents: JSON.stringify([])
    }
  })

  console.log('Created demo student for login testing:', `${demoStudent.firstName} ${demoStudent.lastName}`)

  console.log('Created students:', students.map(s => `${s.firstName} ${s.lastName}`))

  // Create sample applications
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        agencyId: agency.id,
        branchId: mainBranch.id,
        studentId: students[0].id,
        universityId: universities[0].id,
        campusId: campuses[0].id,
        subjectId: subjects[0].id,
        program: 'Computer Science B.S.',
        intake: 'Fall 2024',
        status: 'UNDER_REVIEW',
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Application Form', status: 'SUBMITTED', submittedAt: '2024-01-15T10:00:00Z' },
          { name: 'Personal Statement', status: 'SUBMITTED', submittedAt: '2024-01-16T14:30:00Z' },
          { name: 'Recommendation Letters', status: 'PENDING', submittedAt: null }
        ]),
        communications: JSON.stringify([
          { type: 'email', direction: 'sent', date: '2024-01-15T10:05:00Z', content: 'Application submitted confirmation' },
          { type: 'email', direction: 'received', date: '2024-01-16T09:15:00Z', content: 'Request for additional documents' }
        ])
      },
    }),
    prisma.application.create({
      data: {
        agencyId: agency.id,
        branchId: branch2.id,
        studentId: students[1].id,
        universityId: universities[1].id,
        campusId: campuses[1].id,
        subjectId: subjects[1].id,
        program: 'Business Administration B.S.',
        intake: 'Fall 2024',
        status: 'APPROVED',
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Application Form', status: 'APPROVED', submittedAt: '2024-01-08T11:00:00Z' },
          { name: 'Personal Statement', status: 'APPROVED', submittedAt: '2024-01-09T15:20:00Z' },
          { name: 'Financial Documents', status: 'APPROVED', submittedAt: '2024-01-10T12:30:00Z' }
        ]),
        communications: JSON.stringify([
          { type: 'email', direction: 'sent', date: '2024-01-08T11:05:00Z', content: 'Application submitted' },
          { type: 'email', direction: 'received', date: '2024-01-12T14:20:00Z', content: 'Offer of admission' }
        ])
      },
    }),
    prisma.application.create({
      data: {
        agencyId: agency.id,
        branchId: mainBranch.id,
        studentId: students[2].id,
        universityId: universities[0].id,
        campusId: campuses[0].id,
        subjectId: subjects[0].id,
        program: 'Engineering B.S.',
        intake: 'Spring 2024',
        status: 'APPROVED',
        assignedTo: user.id,
        documents: JSON.stringify([
          { name: 'Application Form', status: 'APPROVED', submittedAt: '2023-12-01T09:00:00Z' },
          { name: 'Personal Statement', status: 'APPROVED', submittedAt: '2023-12-02T11:30:00Z' }
        ]),
        communications: JSON.stringify([
          { type: 'email', direction: 'sent', date: '2023-12-01T09:05:00Z', content: 'Application submitted' },
          { type: 'email', direction: 'received', date: '2023-12-15T16:45:00Z', content: 'Offer of admission' },
          { type: 'email', direction: 'sent', date: '2023-12-16T10:20:00Z', content: 'Offer accepted' }
        ])
      },
    })
  ])

  console.log('Created applications:', applications.length)

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        agencyId: agency.id,
        title: 'Review Alex Thompson application',
        description: 'Review and evaluate Alex Thompson\'s application for Harvard Computer Science program',
        type: 'APPLICATION_REVIEW',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: user.id,
        assignedBy: user.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        studentId: students[0].id,
        applicationId: applications[0].id
      },
    }),
    prisma.task.create({
      data: {
        agencyId: agency.id,
        title: 'Schedule consultation with Maria Garcia',
        description: 'Schedule a consultation call to discuss program options and next steps',
        type: 'CALL',
        priority: 'MEDIUM',
        status: 'PENDING',
        assignedTo: user.id,
        assignedBy: user.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        studentId: students[1].id
      },
    }),
    prisma.task.create({
      data: {
        agencyId: agency.id,
        title: 'Prepare visa documents for James Wilson',
        description: 'Prepare and review all necessary visa documents for James Wilson',
        type: 'DOCUMENT_REVIEW',
        priority: 'HIGH',
        status: 'PENDING',
        assignedTo: user.id,
        assignedBy: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        studentId: students[2].id,
        applicationId: applications[2].id
      },
    })
  ])

  console.log('Created tasks:', tasks.map(t => t.title))

  // Create brand settings
  const brandSettings = await prisma.brandSettings.upsert({
    where: { agencyId: agency.id },
    update: {},
    create: {
      agencyId: agency.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      emailTemplate: 'Hello {{studentName}},\n\nThank you for your interest in {{agencyName}}!',
      smsTemplate: 'Hi {{studentName}}, thanks for contacting {{agencyName}}!'
    },
  })

  // Create billing record
  const billing = await prisma.billing.upsert({
    where: { agencyId: agency.id },
    update: {},
    create: {
      agencyId: agency.id,
      plan: 'FREE',
      studentCount: students.length,
      userCount: 1,
      storageUsed: 25, // MB
    },
  })

  console.log('Created brand settings and billing records')

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