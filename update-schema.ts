import { Client, Databases } from 'node-appwrite';

const endpoint = 'https://fra.cloud.appwrite.io/v1';
const projectId = '6ac3a869001792f82065';
const apiKey = 'standard_ed76a99c39d006bbd7815a27097a509ef4bc1ed0d091a5c8cb2b7a8cf366131369517230b1b0f052abef8dc87e394a48ea91b34b8e91dcee5c3f5a0b96b454d4856f8c906eb8029021122276554c09c7aeaded291fa950e468aae737ed9a7e5e90a89a932b42592494bdbb0ec4bf0d8ca31bc3688956101f467cdc3161315863';

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

const databases = new Databases(client);

async function run() {
  try {
    await databases.updateStringAttribute(
      '6ac3a89d0004b3918cd0', 
      'properties', 
      'original_url', 
      true, 
      null,
      2048
    );
    console.log('Attribute updated!');
  } catch(e) {
    console.error(e);
  }
}
run();
