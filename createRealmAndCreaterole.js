const axios = require('axios');
const https = require('https');
const { getAccessToken } = require('./getAccessToken');
require('dotenv').config(); // Load .env variables

// Create an axios instance to ignore SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL verification
});

async function createRealmAndRoles(realmName) {
  const token = await getAccessToken();

  // Read roles from the environment variable
  const roles = process.env.DEFAULT_ROLES.split(',').map(role => role.trim());

  try {
    // Step 1: Create the Realm
    const realmUrl = `https://auth.kloudstacks.com/admin/realms`;
    const realmData = {
      realm: realmName,
      enabled: true
    };

    await axiosInstance.post(realmUrl, realmData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Realm "${realmName}" created successfully!`);

    // Step 2: Create Roles
    const roleUrl = `https://auth.kloudstacks.com/admin/realms/${realmName}/roles`;

    for (const role of roles) {
      const roleData = {
        name: role,
        description: `${role} role for ${realmName}`,
      };

      await axiosInstance.post(roleUrl, roleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Role "${role}" created successfully!`);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Call the function
createRealmAndRoles('finalTest'); // Replace with your desired realm name
