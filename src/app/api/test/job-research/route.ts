/**
 * Test endpoint for job analysis and company research
 *
 * Usage:
 * POST /api/test/job-research
 * Body: { "jobUrl": "https://...", "jobId": "uuid" }
 */

import { NextResponse } from 'next/server'
import { jobAnalyzer } from '@/lib/services/job-analyzer'
import { companyResearcher } from '@/lib/services/company-researcher'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const { jobUrl, jobId } = await request.json()

    if (!jobUrl) {
      return NextResponse.json(
        { error: 'Missing jobUrl parameter' },
        { status: 400 }
      )
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('TESTING JOB ANALYSIS & COMPANY RESEARCH')
    console.log(`${'='.repeat(60)}\n`)

    // STEP 1: Analyze job posting
    console.log('STEP 1: Job Analysis')
    console.log('-'.repeat(40))

    const jobAnalysis = await jobAnalyzer.analyzeJobUrl(jobUrl, jobId)

    console.log(`✅ Job analyzed: ${jobAnalysis.jobTitle}`)
    console.log(`   Company: ${jobAnalysis.company.name}`)
    console.log(`   Location: ${jobAnalysis.location.city}, ${jobAnalysis.location.state}`)
    console.log(`   Confidence: ${jobAnalysis.confidenceScore}%`)
    console.log('')

    // STEP 2: Research company
    console.log('STEP 2: Company Research')
    console.log('-'.repeat(40))

    const companyData = await companyResearcher.researchCompany(
      jobAnalysis.company.domain,
      jobAnalysis.company.name
    )

    console.log(`✅ Company researched: ${companyData.teamMembers.length} team members found`)
    console.log(`   Departments: ${companyData.departments.length}`)
    console.log(`   Offices: ${companyData.officeLocations.length}`)
    console.log(`   Scrape Quality: ${companyData.scrapeQuality}%`)
    console.log('')

    const totalDuration = Math.round((Date.now() - startTime) / 1000)

    console.log(`${'='.repeat(60)}`)
    console.log(`COMPLETED IN ${totalDuration} SECONDS`)
    console.log(`${'='.repeat(60)}\n`)

    return NextResponse.json({
      success: true,
      duration: totalDuration,
      step1_jobAnalysis: jobAnalysis,
      step2_companyResearch: {
        teamMembers: companyData.teamMembers,
        departments: companyData.departments,
        officeLocations: companyData.officeLocations,
        companySize: companyData.companySize,
        industry: companyData.industry,
        scrapeQuality: companyData.scrapeQuality,
        reasoning: companyData.reasoning,
      },
    })

  } catch (error: any) {
    console.error('Test error:', error)

    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
