require('dotenv').config();
const axios = require('axios');
const https = require('https');

const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER;
const ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD;

// Create an Axios instance with SSL disabled
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL verification
});

// Function to Get Access Token
async function getAccessToken() {
    try {
        const response = await axiosInstance.post(
            `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                username: ADMIN_USER,
                password: ADMIN_PASSWORD,
                grant_type: 'password'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting access token:", error.response?.data || error.message);
        return null;
    }
}

// Example usage
getAccessToken().then(token => {
    if (token) console.log("✅ Access Token:", token);
});

// Export the function
module.exports = {getAccessToken};