// Test script to verify user registration API
const testUserRegistration = async () => {
  const testData = {
    service_number: 'TEST-001',
    name: 'Test User API',
    rank: 'Soldier',
    role: 'soldier',
    company: 'BHQ',
    email: 'testapi@example.com',
    phone: '1234567890',
    password: 'password123'
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Registration result:', result);

    if (response.ok) {
      console.log('✅ User registration successful!');
    } else {
      console.log('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testUserRegistration();