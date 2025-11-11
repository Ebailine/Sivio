/**
 * Test script to verify contact-reasoner returns valid JSON
 * Tests the fix for: Unexpected token 'I', "I apologiz"... is not valid JSON
 */

const testContactReasoner = async () => {
  console.log('🧪 Testing Contact Reasoner JSON Fix\n')

  try {
    // Import the contact reasoner
    const { contactReasoner } = await import('./src/lib/services/contact-reasoner.ts')

    // Test 1: analyzeJob should return valid JSON
    console.log('Test 1: Testing analyzeJob()...')
    const jobContext = {
      title: 'Software Engineer',
      company: 'Stripe',
      companyUrl: 'https://stripe.com',
      description: 'We are looking for a talented software engineer to join our payments team.',
      jobType: 'full-time',
      location: 'San Francisco, CA'
    }

    const strategy = await contactReasoner.analyzeJob(jobContext)
    console.log('✅ analyzeJob returned valid JSON')
    console.log('   Approach:', strategy.approach)
    console.log('   Confidence:', strategy.confidenceScore)
    console.log('   Target Titles:', strategy.targetTitles.slice(0, 2).join(', '))
    console.log('')

    // Test 2: researchCompany should return valid JSON
    console.log('Test 2: Testing researchCompany()...')
    const companyInfo = await contactReasoner.researchCompany('Stripe', 'https://stripe.com')
    console.log('✅ researchCompany returned valid JSON')
    console.log('   Domain:', companyInfo.verifiedDomain)
    console.log('   Size:', companyInfo.companySize)
    console.log('   Industry:', companyInfo.industry)
    console.log('')

    // Test 3: rankContacts should return valid JSON (mock contacts)
    console.log('Test 3: Testing rankContacts()...')
    const mockContacts = [
      {
        email: 'john.doe@stripe.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        position: 'Engineering Manager',
        email_status: 'valid'
      },
      {
        email: 'jane.smith@stripe.com',
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        position: 'Senior Software Engineer',
        email_status: 'valid'
      },
      {
        email: 'bob.wilson@stripe.com',
        first_name: 'Bob',
        last_name: 'Wilson',
        full_name: 'Bob Wilson',
        position: 'HR Manager',
        email_status: 'valid'
      }
    ]

    const rankedContacts = await contactReasoner.rankContacts(mockContacts, jobContext, strategy)
    console.log('✅ rankContacts returned valid JSON')
    console.log(`   Ranked ${rankedContacts.length} contacts`)
    if (rankedContacts.length > 0) {
      console.log('   Top contact:', rankedContacts[0].full_name)
      console.log('   Relevance score:', rankedContacts[0].analysis.relevanceScore)
    }
    console.log('')

    console.log('🎉 All tests passed! Contact reasoner is returning valid JSON.')
    console.log('✅ The "Unexpected token I" bug has been fixed.')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

testContactReasoner()
