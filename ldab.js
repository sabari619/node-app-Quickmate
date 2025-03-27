const axios = require('axios');
const https = require('https');
const { getAccessToken } = require('./getAccessToken');

async function createLdapConnection() {
  try {
    const realmToken = await getAccessToken();
    const realmName = 'newrealm';

    const ldapConfig = {
      name: 'AzureAD-LDAP',
      providerId: 'ldap',
      providerType: 'org.keycloak.storage.UserStorageProvider',
      parentId: 'newrealm',
      config: {
        enabled: ['true'],
        priority: ['0'],
        authType: ['simple'],
        bindDn: ['dcadmin@demodc.local'],
        bindCredential: ['Password@123'],
        connectionUrl: ['ldap://20.168.243.12:389'],
        usersDn: ['CN=Users,DC=demodc,DC=local'],
        usernameLDAPAttribute: ['sAMAccountName'],
        rdnLDAPAttribute: ['cn'],
        uuidLDAPAttribute: ['objectGUID'],
        userObjectClasses: ['user', 'person', 'organizationalPerson'],
        editMode: ['READ_ONLY'],
        syncRegistrations: ['true'],
        trustEmail: ['false'],
        importEnabled: ['true']
      }
    };

    const httpsAgent = new https.Agent({  
      rejectUnauthorized: false  
    });

    const createResponse = await axios.post(
      `https://auth.kloudstacks.com/admin/realms/${realmName}/components`,
      ldapConfig,
      {
        headers: {
          Authorization: `Bearer ${realmToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent
      }
    );

    console.log('LDAP Connection Created:', createResponse.data);

    const getResponse = await axios.get(
      `https://auth.kloudstacks.com/admin/realms/newrealm/components?type=org.keycloak.storage.UserStorageProvider`,
      {
        headers: {
          Authorization: `Bearer ${realmToken}`,
        },
        httpsAgent
      }
    );

    const providerId = getResponse.data[0].id;
    console.log('Provider ID:', providerId);

    const syncResponse = await axios.post(
      `https://auth.kloudstacks.com/admin/realms/${realmName}/user-storage/${providerId}/sync?action=triggerFullSync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${realmToken}`,
        },
        httpsAgent
      }
    );

    console.log('LDAP Sync Triggered:', syncResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

createLdapConnection();
