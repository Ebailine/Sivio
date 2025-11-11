#!/usr/bin/env tsx

/**
 * Test script for job analysis and company research
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../.env.local') })

async function testJobResearch() {
  console.log('Testing Job Research System...\n')

  // Test with real job postings
  const testJobs = [
    {
      name: 'Indeed Job Posting',
      url: 'https://www.indeed.com/viewjob?jk=123456789',
    },
    {
      name: 'Adzuna Job Posting',
      url: 'https://www.adzuna.com/details/12345678',
    },
  ]

  for (const job of testJobs) {
    console.log(`\nTesting: ${job.name}`)
    console.log('='.repeat(60))

    try {
      const response = await fetch('http://localhost:3000/api/test/job-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl: job.url }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ SUCCESS')
        console.log(`Duration: ${data.duration}s`)
        console.log(`Job: ${data.step1_jobAnalysis.jobTitle}`)
        console.log(`Company: ${data.step1_jobAnalysis.company.name}`)
        console.log(`Team Members Found: ${data.step2_companyResearch.teamMembers.length}`)
        console.log(`Scrape Quality: ${data.step2_companyResearch.scrapeQuality}%`)
      } else {
        console.log('❌ FAILED')
        console.log('Error:', data.error)
      }
    } catch (error) {
      console.log('❌ ERROR:', error)
    }
  }

  console.log('\nTests complete!')
}

testJobResearch().catch(console.error)
