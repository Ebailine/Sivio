/**
 * Comprehensive Contact Search Testing
 * Tests the multi-tier fallback system across diverse companies
 *
 * Purpose: Verify iterations 1-10 work correctly
 */

const testCompanies = [
  // Test 1: Original failing case
  {
    name: "Gpac",
    domain: "gpac.com",
    jobTitle: "Financial Advisor",
    expectedBehavior: "Should use fallback (pattern gen or LinkedIn)"
  },

  // Test 2: Large company (likely has Snov.io data)
  {
    name: "Microsoft",
    domain: "microsoft.com",
    jobTitle: "Software Engineer",
    expectedBehavior: "Should succeed with Snov.io (Tier 0)"
  },

  // Test 3: Medium tech company
  {
    name: "Shopify",
    domain: "shopify.com",
    jobTitle: "Product Manager",
    expectedBehavior: "Should succeed with Snov.io or pattern gen"
  },

  // Test 4: Small startup (might not be in Snov.io)
  {
    name: "Notion",
    domain: "notion.so",
    jobTitle: "Product Designer",
    expectedBehavior: "Should use fallback tiers"
  },

  // Test 5: Financial services
  {
    name: "Hantz Group",
    domain: "hantz.com",
    jobTitle: "Financial Advisor",
    expectedBehavior: "Should use fallback (user reported issues)"
  },

  // Test 6: Healthcare
  {
    name: "Cleveland Clinic",
    domain: "clevelandclinic.org",
    jobTitle: "Registered Nurse",
    expectedBehavior: "Should work via any tier"
  },

  // Test 7: Education
  {
    name: "Khan Academy",
    domain: "khanacademy.org",
    jobTitle: "Software Engineer",
    expectedBehavior: "Should use fallback tiers"
  },

  // Test 8: Retail
  {
    name: "Trader Joe's",
    domain: "traderjoes.com",
    jobTitle: "Store Manager",
    expectedBehavior: "Should work via any tier"
  },

  // Test 9: Manufacturing
  {
    name: "Tesla",
    domain: "tesla.com",
    jobTitle: "Manufacturing Engineer",
    expectedBehavior: "Should succeed with Snov.io"
  },

  // Test 10: Non-profit
  {
    name: "Charity: Water",
    domain: "charitywater.org",
    jobTitle: "Program Manager",
    expectedBehavior: "Should use fallback tiers"
  }
]

async function testContactSearch(company) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`TEST: ${company.name} (${company.domain})`)
  console.log(`JOB: ${company.jobTitle}`)
  console.log(`EXPECTED: ${company.expectedBehavior}`)
  console.log('='.repeat(80))

  const startTime = Date.now()

  try {
    const response = await fetch('http://localhost:3000/api/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: company.name,
        domain: company.domain,
        jobTitle: company.jobTitle,
        jobUrl: null // Testing without job URL
      })
    })

    const duration = Date.now() - startTime
    const data = await response.json()

    // Analyze results
    console.log(`\n✅ Status: ${response.status}`)
    console.log(`⏱️  Duration: ${duration}ms`)

    if (data.success) {
      console.log(`📊 Results:`)
      console.log(`   - Contacts found: ${data.contacts?.length || 0}`)

      if (data.contacts && data.contacts.length > 0) {
        const hrCount = data.contacts.filter(c => c.is_hr_role).length
        const teamCount = data.contacts.filter(c => c.is_team_role).length
        const withEmail = data.contacts.filter(c => c.email).length
        const withLinkedIn = data.contacts.filter(c => c.linkedin_url).length

        console.log(`   - HR roles: ${hrCount}`)
        console.log(`   - Team roles: ${teamCount}`)
        console.log(`   - With email: ${withEmail}`)
        console.log(`   - With LinkedIn: ${withLinkedIn}`)

        // Show first contact as example
        const first = data.contacts[0]
        console.log(`\n   Example contact:`)
        console.log(`   - Name: ${first.name}`)
        console.log(`   - Title: ${first.title}`)
        console.log(`   - Email: ${first.email || 'N/A'}`)
        console.log(`   - Source: ${first.source || 'unknown'}`)
        console.log(`   - Contact Method: ${first.contact_method || 'unknown'}`)
      }

      // Cost analysis
      if (data.cost) {
        console.log(`\n💰 Cost:`)
        console.log(`   - Credits used: ${data.cost.credits}`)
        console.log(`   - USD: $${data.cost.usd?.toFixed(4) || '0.0000'}`)
        console.log(`   - Details: ${data.cost.details || 'N/A'}`)
      }

      return {
        company: company.name,
        success: true,
        contacts: data.contacts?.length || 0,
        duration,
        cost: data.cost,
        tier: data.contacts?.[0]?.source || 'unknown'
      }

    } else if (data.manual_guidance) {
      console.log(`\n🔍 Manual Guidance Provided (Tier 3):`)
      console.log(`   - LinkedIn search URL provided`)
      console.log(`   - Google search URL provided`)
      console.log(`   - Search tips provided`)

      return {
        company: company.name,
        success: true, // Providing guidance is still success
        contacts: 0,
        duration,
        tier: 'manual_guidance'
      }

    } else {
      console.log(`\n❌ Failed:`, data.error || 'Unknown error')

      return {
        company: company.name,
        success: false,
        error: data.error,
        duration
      }
    }

  } catch (error) {
    console.log(`\n❌ ERROR:`, error.message)

    return {
      company: company.name,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    }
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(80))
  console.log('CONTACT SEARCH TESTING - ITERATIONS 1-10')
  console.log('Testing multi-tier fallback system across diverse companies')
  console.log('█'.repeat(80))

  const results = []

  for (const company of testCompanies) {
    const result = await testContactSearch(company)
    results.push(result)

    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Summary report
  console.log('\n' + '█'.repeat(80))
  console.log('SUMMARY REPORT')
  console.log('█'.repeat(80))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const withContacts = results.filter(r => r.contacts > 0)

  console.log(`\n📊 Overall Results:`)
  console.log(`   - Tests run: ${results.length}`)
  console.log(`   - Successful: ${successful.length} (${(successful.length/results.length*100).toFixed(1)}%)`)
  console.log(`   - Failed: ${failed.length}`)
  console.log(`   - With contacts: ${withContacts.length}`)

  // Tier distribution
  const tierCounts = {}
  results.forEach(r => {
    if (r.tier) {
      tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1
    }
  })

  console.log(`\n🎯 Tier Distribution:`)
  Object.entries(tierCounts).forEach(([tier, count]) => {
    console.log(`   - ${tier}: ${count}`)
  })

  // Cost analysis
  const totalCost = results.reduce((sum, r) => sum + (r.cost?.usd || 0), 0)
  const avgCost = totalCost / results.length

  console.log(`\n💰 Cost Analysis:`)
  console.log(`   - Total cost: $${totalCost.toFixed(4)}`)
  console.log(`   - Average per search: $${avgCost.toFixed(4)}`)
  console.log(`   - Target: < $0.20 per search`)
  console.log(`   - Within budget: ${avgCost < 0.20 ? '✅ YES' : '❌ NO'}`)

  // Failed tests
  if (failed.length > 0) {
    console.log(`\n❌ Failed Tests:`)
    failed.forEach(f => {
      console.log(`   - ${f.company}: ${f.error}`)
    })
  }

  console.log('\n' + '█'.repeat(80))
  console.log('TESTING COMPLETE')
  console.log('█'.repeat(80) + '\n')
}

// Run the tests
runAllTests().catch(console.error)
