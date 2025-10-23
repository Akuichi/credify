// Password validation test script
const axios = require('axios');

// Test data with weak password (no uppercase, no symbols)
const testData = {
  full_name: "Test User",
  email: "test" + Math.floor(Math.random() * 10000) + "@example.com", // Random email to avoid duplicates
  mobile_number: "1234567890",
  password: "password123", // Weak password (no uppercase, no symbols)
  password_confirmation: "password123"
};

console.log("Testing registration with weak password:", testData);

// Make the API request
axios.post('http://localhost:8000/api/register', testData)
  .then(response => {
    console.log('ERROR: Registration succeeded with weak password!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.log('EXPECTED: Registration failed with weak password');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  });