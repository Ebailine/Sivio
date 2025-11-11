const testEndpoint = async () => {
  try {
    console.log('Testing job research endpoint...\n');

    const response = await fetch('http://localhost:3000/api/test/job-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobUrl: 'https://www.indeed.com/viewjob?jk=test123'
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
};

testEndpoint();
