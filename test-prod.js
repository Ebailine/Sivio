const testProd = async () => {
  try {
    console.log('✅ Testing Production Deployment\n');
    console.log('Endpoint: https://sivio.vercel.app/api/test/job-research\n');

    const response = await fetch('https://sivio.vercel.app/api/test/job-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobUrl: 'https://stripe.com/jobs/listing/software-engineer'
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS!\n');
      console.log('Duration:', data.duration, 'seconds');
      console.log('\n--- Job Analysis ---');
      console.log('Job Title:', data.step1_jobAnalysis?.jobTitle);
      console.log('Company:', data.step1_jobAnalysis?.company?.name);
      console.log('Domain:', data.step1_jobAnalysis?.company?.domain);
      console.log('Confidence:', data.step1_jobAnalysis?.confidenceScore + '%');
      console.log('\n--- Company Research ---');
      console.log('Team Members Found:', data.step2_companyResearch?.teamMembers?.length || 0);
      console.log('Departments:', data.step2_companyResearch?.departments?.length || 0);
      console.log('Scrape Quality:', data.step2_companyResearch?.scrapeQuality + '%');
      console.log('\n✅ All systems operational!');
    } else {
      const text = await response.text();
      console.log('❌ ERROR Response:\n', text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

testProd();
