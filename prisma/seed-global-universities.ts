import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const globalUniversities = [
  {
    name: "Harvard University",
    country: "United States",
    city: "Cambridge",
    state: "Massachusetts",
    website: "https://harvard.edu",
    description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, Harvard is the oldest institution of higher education in the United States.",
    worldRanking: 1,
    nationalRanking: 1,
    type: "Private",
    establishedYear: 1636,
    studentPopulation: 23000,
    internationalStudentRatio: 0.25,
    studentFacultyRatio: 7,
    programs: JSON.stringify([
      "Computer Science", "Engineering", "Business Administration", "Medicine", 
      "Law", "Liberal Arts", "Economics", "Psychology", "Biology", "Chemistry"
    ]),
    subjects: JSON.stringify([
      "Computer Science", "Electrical Engineering", "Mechanical Engineering", 
      "Business Administration", "Medicine", "Law", "Economics", "Psychology"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 54000,
      max: 59000,
      currency: "USD"
    }),
    acceptanceRate: 3.4,
    contactEmail: "international@harvard.edu",
    contactPhone: "+1 (617) 495-1000",
    address: "Cambridge, MA 02138, USA",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "University of Oxford",
    country: "United Kingdom",
    city: "Oxford",
    website: "https://ox.ac.uk",
    description: "The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world.",
    worldRanking: 2,
    nationalRanking: 1,
    type: "Public",
    establishedYear: 1096,
    studentPopulation: 24000,
    internationalStudentRatio: 0.45,
    studentFacultyRatio: 11,
    programs: JSON.stringify([
      "Philosophy, Politics and Economics", "Medicine", "Computer Science", 
      "History", "Mathematics", "Law", "English Literature", "Physics"
    ]),
    subjects: JSON.stringify([
      "Philosophy", "Politics", "Economics", "Medicine", "Computer Science", 
      "History", "Mathematics", "Law", "English Literature", "Physics"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 25000,
      max: 37000,
      currency: "GBP"
    }),
    acceptanceRate: 17.5,
    contactEmail: "undergraduate.admissions@ox.ac.uk",
    contactPhone: "+44 1865 270000",
    address: "Oxford OX1 2JD, UK",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "Stanford University",
    country: "United States",
    city: "Stanford",
    state: "California",
    website: "https://stanford.edu",
    description: "Stanford University is a private research university in Stanford, California. Founded in 1885 by Leland and Jane Stanford in memory of their only child, Leland Stanford Jr.",
    worldRanking: 3,
    nationalRanking: 2,
    type: "Private",
    establishedYear: 1885,
    studentPopulation: 17000,
    internationalStudentRatio: 0.23,
    studentFacultyRatio: 5,
    programs: JSON.stringify([
      "Computer Science", "Engineering", "Business", "Medicine", 
      "Law", "Humanities", "Sciences", "Earth Sciences"
    ]),
    subjects: JSON.stringify([
      "Computer Science", "Electrical Engineering", "Mechanical Engineering", 
      "Business Administration", "Medicine", "Law", "Psychology", "Biology"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 56000,
      max: 58000,
      currency: "USD"
    }),
    acceptanceRate: 4.3,
    contactEmail: "admissions@stanford.edu",
    contactPhone: "+1 (650) 723-2300",
    address: "450 Serra Mall, Stanford, CA 94305, USA",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    city: "Cambridge",
    state: "Massachusetts",
    website: "https://mit.edu",
    description: "The Massachusetts Institute of Technology is a private land-grant research university in Cambridge, Massachusetts. Founded in 1861, MIT has since played a key role in the development of modern technology and science.",
    worldRanking: 4,
    nationalRanking: 3,
    type: "Private",
    establishedYear: 1861,
    studentPopulation: 12000,
    internationalStudentRatio: 0.33,
    studentFacultyRatio: 3,
    programs: JSON.stringify([
      "Computer Science", "Engineering", "Physics", "Mathematics", 
      "Economics", "Management", "Biology", "Chemistry"
    ]),
    subjects: JSON.stringify([
      "Computer Science", "Electrical Engineering", "Mechanical Engineering", 
      "Physics", "Mathematics", "Economics", "Management", "Biology", "Chemistry"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 53000,
      max: 57000,
      currency: "USD"
    }),
    acceptanceRate: 6.7,
    contactEmail: "admissions@mit.edu",
    contactPhone: "+1 (617) 253-1000",
    address: "77 Massachusetts Ave, Cambridge, MA 02139, USA",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    state: "Ontario",
    website: "https://utoronto.ca",
    description: "The University of Toronto is a public research university in Toronto, Ontario, Canada. Founded in 1827 by royal charter, it is the oldest university in Upper Canada.",
    worldRanking: 25,
    nationalRanking: 1,
    type: "Public",
    establishedYear: 1827,
    studentPopulation: 60000,
    internationalStudentRatio: 0.20,
    studentFacultyRatio: 20,
    programs: JSON.stringify([
      "Computer Science", "Engineering", "Medicine", "Law", 
      "Business", "Arts & Science", "Architecture", "Music"
    ]),
    subjects: JSON.stringify([
      "Computer Science", "Engineering", "Medicine", "Law", "Business Administration", 
      "Psychology", "Biology", "Chemistry", "Mathematics", "Physics"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 31000,
      max: 67000,
      currency: "CAD"
    }),
    acceptanceRate: 43,
    contactEmail: "ask@utoronto.ca",
    contactPhone: "+1 (416) 978-2011",
    address: "27 King's College Cir, Toronto, ON M5S, Canada",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    state: "Victoria",
    website: "https://unimelb.edu.au",
    description: "The University of Melbourne is a public research university located in Melbourne, Australia. Founded in 1853, it is Australia's second oldest university.",
    worldRanking: 37,
    nationalRanking: 1,
    type: "Public",
    establishedYear: 1853,
    studentPopulation: 48000,
    internationalStudentRatio: 0.40,
    studentFacultyRatio: 17,
    programs: JSON.stringify([
      "Medicine", "Law", "Commerce", "Engineering", "Arts", 
      "Science", "Music", "Dentistry", "Health Sciences"
    ]),
    subjects: JSON.stringify([
      "Medicine", "Law", "Business Administration", "Engineering", "Computer Science", 
      "Psychology", "Biology", "Chemistry", "Mathematics", "Physics"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 30000,
      max: 45000,
      currency: "AUD"
    }),
    acceptanceRate: 70,
    contactEmail: "international-unimelb@unimelb.edu.au",
    contactPhone: "+61 3 9035 5511",
    address: "Parkville, VIC 3010, Australia",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    state: "Bavaria",
    website: "https://tum.de",
    description: "The Technical University of Munich is a public research university in Munich, Germany. It specializes in engineering, technology, medicine, and applied and natural sciences.",
    worldRanking: 50,
    nationalRanking: 1,
    type: "Public",
    establishedYear: 1868,
    studentPopulation: 42000,
    internationalStudentRatio: 0.35,
    studentFacultyRatio: 12,
    programs: JSON.stringify([
      "Engineering", "Computer Science", "Physics", "Chemistry", 
      "Mathematics", "Medicine", "Management", "Life Sciences"
    ]),
    subjects: JSON.stringify([
      "Mechanical Engineering", "Electrical Engineering", "Computer Science", 
      "Physics", "Chemistry", "Mathematics", "Medicine", "Business Administration"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 0,
      max: 6000,
      currency: "EUR"
    }),
    acceptanceRate: 8,
    contactEmail: "international@tum.de",
    contactPhone: "+49 89 289-01",
    address: "Arcisstraße 21, 80333 München, Germany",
    verified: true,
    verificationStatus: "VERIFIED"
  },
  {
    name: "National University of Singapore (NUS)",
    country: "Singapore",
    city: "Singapore",
    website: "https://nus.edu.sg",
    description: "The National University of Singapore is a national research university located in Singapore. Founded in 1905, it is the oldest autonomous university in the country.",
    worldRanking: 8,
    nationalRanking: 1,
    type: "Public",
    establishedYear: 1905,
    studentPopulation: 38000,
    internationalStudentRatio: 0.30,
    studentFacultyRatio: 8,
    programs: JSON.stringify([
      "Computer Science", "Engineering", "Business", "Medicine", 
      "Law", "Dentistry", "Music", "Design & Environment"
    ]),
    subjects: JSON.stringify([
      "Computer Science", "Engineering", "Business Administration", "Medicine", 
      "Law", "Psychology", "Biology", "Chemistry", "Mathematics", "Physics"
    ]),
    studyLevels: JSON.stringify(["Undergraduate", "Postgraduate", "PhD"]),
    tuitionFeeRange: JSON.stringify({
      min: 17000,
      max: 35000,
      currency: "SGD"
    }),
    acceptanceRate: 7,
    contactEmail: "admissions@nus.edu.sg",
    contactPhone: "+65 6516 6666",
    address: "21 Lower Kent Ridge Rd, Singapore 119077",
    verified: true,
    verificationStatus: "VERIFIED"
  }
]

async function main() {
  console.log('Seeding global universities database...')

  for (const university of globalUniversities) {
    // Create search terms for autocomplete
    const searchTerms = [
      university.name.toLowerCase(),
      university.country.toLowerCase(),
      university.city.toLowerCase(),
      ...(university.state ? [university.state.toLowerCase()] : []),
      ...(JSON.parse(university.programs).map((p: string) => p.toLowerCase())),
      ...(JSON.parse(university.subjects).map((s: string) => s.toLowerCase()))
    ]

    try {
      const createdUniversity = await prisma.globalUniversity.create({
        data: {
          ...university,
          searchTerms: JSON.stringify(searchTerms),
          popularityScore: Math.random() * 100, // Random popularity score
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`Created university: ${createdUniversity.name}`)
    } catch (error) {
      console.error(`Error creating university ${university.name}:`, error)
    }
  }

  console.log('Global universities database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })