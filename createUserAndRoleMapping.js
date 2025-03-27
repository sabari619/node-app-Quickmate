require('dotenv').config();
const axios = require('axios');
const https = require('https');
const { getAccessToken } = require('./getAccessToken'); // Import token function


const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
const KEYCLOAK_REALM = "finalTest"; // Change this as needed
const DEFAULT_ROLES = process.env.DEFAULT_ROLES.split(','); //Change this as needed

// Create an Axios instance with SSL disabled
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL verification
});
// const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
// const KEYCLOAK_REALM = "finalRealm"; // Change this as needed
// const DEFAULT_ROLES = process.env.DEFAULT_ROLES.split(','); //Change this as needed

// Function to Create a User
async function createUser(username, email, password) {
    const token = await getAccessToken();
    if (!token) return;



    try {
        await axiosInstance.post(
            `${KEYCLOAK_HOST}/admin/realms/${KEYCLOAK_REALM}/users`,
           {
                username: username,
                firstName: "nathan",
                lastName: "m",
                emailVerified: true,  
                email:email,
                enabled: true,
                credentials: [
                    {
                         type: "password",
                         value: password,
                         temporary: false 
                        }
                ],
                requiredActions: ["UPDATE_PASSWORD"]
                  
            },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        console.log(`✅ User '${username}' created successfully.`);

        setTimeout(async () => {
            const userId = await getUserId(username, token);
            if (userId) {
                await assignRolesToUser(userId, token);
            }
        }, 2000);
    } catch (error) {
        console.error(`❌ Error creating user:`, error.response?.data || error.message);
    }
}

// Function to Get User ID
async function getUserId(username, token) {
    try {
        const response = await axiosInstance.get(
            `${KEYCLOAK_HOST}/admin/realms/${KEYCLOAK_REALM}/users?username=${username}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.length > 0) {
            return response.data[0].id;
        } else {
            console.error(`❌ User '${username}' not found.`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error fetching user ID:`, error.response?.data || error.message);
        return null;
    }
}


async function assignRolesToUser(userId, token) {
    try {
        // Extract role name from environment variable
        const roleName = process.env.DEFAULT_ROLES.split(',').find(role => role === 'SupportDesk');

        if (!roleName) {
            console.warn("⚠️ Role 'EngineerDesk' not found in environment variables.");
            return;
        }

        // Fetch all roles from Keycloak
        const rolesResponse = await axiosInstance.get(
            `${KEYCLOAK_HOST}/admin/realms/${KEYCLOAK_REALM}/roles`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Find the matching role
        const roleToAssign = rolesResponse.data.find(role => role.name === roleName);

        if (!roleToAssign) {
            console.warn(`⚠️ Role '${roleName}' not found in Keycloak.`);
            return;
        }

        // Prepare the request body
        const requestBody = [
            {
                id: roleToAssign.id,
                name: roleName
            }
        ];

        // Assign the role to the user
        await axiosInstance.post(
            `${KEYCLOAK_HOST}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
            requestBody,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        console.log(`✅ Role '${roleName}' assigned to user '${userId}'`);
    } catch (error) {
        console.error(`❌ Error assigning role:`, error.response?.data || error.message);
    }
}



// Example usage: Create a user and assign roles
createUser("Gokul", "gokul@example.com", "gokul@1234");

