const axios = require('axios');
const https = require('https');
const { getAccessToken } = require('./getAccessToken'); // Import token function

const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
const NEW_REALM = "newrealm"; // Change this as needed

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL verification
});

async function createRealm() {
    const token = await getAccessToken();
    if (!token) return;

    try {
        const response = await axiosInstance.post(
            `${KEYCLOAK_HOST}/admin/realms`,
            { id: NEW_REALM, realm: NEW_REALM, enabled: true },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        console.log(`✅ Realm '${NEW_REALM}' created successfully.`);
    } catch (error) {
        console.error(`❌ Error creating realm:`, error.response?.data || error.message);
    }
}

// 🚀 **Call the function when running this file**
createRealm();
