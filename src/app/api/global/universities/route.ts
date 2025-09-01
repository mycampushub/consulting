import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const country = searchParams.get('country') || ''
    const studyLevel = searchParams.get('studyLevel') || ''

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 })
    }

    // Build search conditions
    const searchConditions = []
    const searchQuery = query.toLowerCase().trim()
    
    // Search in name, country, city, and other relevant fields
    searchConditions.push(`LOWER(name) LIKE '%${searchQuery}%'`)
    searchConditions.push(`LOWER(country) LIKE '%${searchQuery}%'`)
    searchConditions.push(`LOWER(city) LIKE '%${searchQuery}%'`)
    
    // Search in programs and subjects if they exist
    searchConditions.push(`(programs LIKE '%${searchQuery}%' OR subjects LIKE '%${searchQuery}%')`)
    
    // Search in search terms if they exist
    searchConditions.push(`searchTerms LIKE '%${searchQuery}%'`)

    let whereClause = `(${searchConditions.join(' OR ')})`
    
    // Add country filter if provided
    if (country) {
      whereClause += ` AND LOWER(country) = '${country.toLowerCase()}'`
    }

    // Add study level filter if provided
    if (studyLevel) {
      whereClause += ` AND studyLevels LIKE '%${studyLevel}%'`
    }

    // Only return verified universities
    whereClause += ` AND verified = true`

    // Get global universities with search
    const universities = await db.$queryRaw`
      SELECT 
        id,
        name,
        country,
        city,
        state,
        website,
        description,
        worldRanking,
        nationalRanking,
        type,
        programs,
        subjects,
        studyLevels,
        tuitionFeeRange,
        acceptanceRate,
        popularityScore,
        logo,
        establishedYear,
        studentPopulation,
        verificationStatus,
        createdAt,
        updatedAt
      FROM GlobalUniversity 
      WHERE ${whereClause}
      ORDER BY 
        CASE 
          WHEN LOWER(name) = ${searchQuery} THEN 1
          WHEN LOWER(name) LIKE ${searchQuery + '%'} THEN 2
          WHEN LOWER(name) LIKE '%${searchQuery}%' THEN 3
          ELSE 4
        END,
        popularityScore DESC,
        worldRanking ASC NULLS LAST
      LIMIT ${limit}
    ` as Array<any>

    // Format the response
    const formattedUniversities = universities.map(uni => ({
      id: uni.id,
      name: uni.name,
      country: uni.country,
      city: uni.city,
      state: uni.state,
      website: uni.website,
      description: uni.description,
      worldRanking: uni.worldRanking,
      nationalRanking: uni.nationalRanking,
      type: uni.type,
      programs: uni.programs ? JSON.parse(uni.programs) : [],
      subjects: uni.subjects ? JSON.parse(uni.subjects) : [],
      studyLevels: uni.studyLevels ? JSON.parse(uni.studyLevels) : [],
      tuitionFeeRange: uni.tuitionFeeRange ? JSON.parse(uni.tuitionFeeRange) : null,
      acceptanceRate: uni.acceptanceRate,
      popularityScore: uni.popularityScore,
      logo: uni.logo,
      establishedYear: uni.establishedYear,
      studentPopulation: uni.studentPopulation,
      verificationStatus: uni.verificationStatus,
      createdAt: uni.createdAt,
      updatedAt: uni.updatedAt,
      isGlobal: true
    }))

    return NextResponse.json({
      success: true,
      universities: formattedUniversities,
      count: formattedUniversities.length,
      query: searchQuery
    })

  } catch (error) {
    console.error('Error searching global universities:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search universities'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      country,
      city,
      state,
      website,
      description,
      worldRanking,
      nationalRanking,
      type,
      programs,
      subjects,
      studyLevels,
      tuitionFeeRange,
      acceptanceRate,
      establishedYear,
      studentPopulation,
      contactEmail,
      contactPhone,
      address
    } = body

    // Validate required fields
    if (!name || !country || !city) {
      return NextResponse.json({
        success: false,
        error: 'Name, country, and city are required'
      }, { status: 400 })
    }

    // Check if university already exists
    const existingUniversity = await db.globalUniversity.findFirst({
      where: {
        name: name,
        country: country,
        city: city
      }
    })

    if (existingUniversity) {
      return NextResponse.json({
        success: false,
        error: 'University already exists in global database'
      }, { status: 409 })
    }

    // Create search terms for autocomplete
    const searchTerms = [
      name.toLowerCase(),
      country.toLowerCase(),
      city.toLowerCase(),
      ...(state ? [state.toLowerCase()] : []),
      ...(programs ? JSON.parse(programs).map((p: string) => p.toLowerCase()) : []),
      ...(subjects ? JSON.parse(subjects).map((s: string) => s.toLowerCase()) : [])
    ]

    // Create new global university
    const newUniversity = await db.globalUniversity.create({
      data: {
        name,
        country,
        city,
        state,
        website,
        description,
        worldRanking,
        nationalRanking,
        type,
        programs,
        subjects,
        studyLevels,
        tuitionFeeRange,
        acceptanceRate,
        establishedYear,
        studentPopulation,
        contactEmail,
        contactPhone,
        address,
        searchTerms: JSON.stringify(searchTerms),
        verified: false,
        verificationStatus: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      university: newUniversity,
      message: 'University added to global database pending verification'
    })

  } catch (error) {
    console.error('Error creating global university:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create university'
    }, { status: 500 })
  }
}