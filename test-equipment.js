// Test script to verify equipment registration API
const testEquipmentRegistration = async () => {
  const testData = {
    equipment_id: 'EQ-001',
    name: 'AK-47 Rifle',
    type: 'weapon',
    company: 'BHQ',
    status: 'available',
    location: 'Armory',
    notes: 'Test equipment'
  };

  // First login to get token - you'll need to register a user first
  const loginData = {
    service_number: 'ADMIN-001', // Change this to your registered user
    password: 'password123'
  };

  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResult.error);
      return;
    }

    const token = loginResult.token;
    console.log('✅ Login successful, got token');

    // Now register equipment
    const response = await fetch('http://localhost:5000/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Equipment registration result:', result);

    if (response.ok) {
      console.log('✅ Equipment registration successful!');
    } else {
      console.log('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testEquipmentRegistration();