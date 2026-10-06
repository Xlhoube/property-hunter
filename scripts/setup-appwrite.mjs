import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6ac3a869001792f82065')
    .setKey('standard_ed76a99c39d006bbd7815a27097a509ef4bc1ed0d091a5c8cb2b7a8cf366131369517230b1b0f052abef8dc87e394a48ea91b34b8e91dcee5c3f5a0b96b454d4856f8c906eb8029021122276554c09c7aeaded291fa950e468aae737ed9a7e5e90a89a932b42592494bdbb0ec4bf0d8ca31bc3688956101f467cdc3161315863');

const databases = new Databases(client);
const dbId = '6ac3a89d0004b3918cd0';

async function createPropertyCollection() {
    try {
        console.log('Verificando se "properties" existe...');
        try {
            await databases.getCollection(dbId, 'properties');
            console.log('A colecao "properties" ja existe.');
            return;
        } catch (e) {
            console.log('Colecao nao encontrada. Criando "properties"...');
        }

        await databases.createCollection(dbId, 'properties', 'properties', [
            Permission.read(Role.any()),
        ]);
        
        console.log('Colecao properties criada. Adicionando atributos...');
        
        // Criacao sequencial de atributos (strings)
        const strings = ['source_id', 'source_portal', 'title', 'typology', 'condition', 'address', 'freguesia', 'concelho', 'district', 'cover_image', 'opportunity_rating', 'price_change_type', 'created_at', 'last_scraped_at'];
        for (const attr of strings) {
            await databases.createStringAttribute(dbId, 'properties', attr, 255, false);
            console.log(`- String: ${attr}`);
        }
        
        // URL description
        await databases.createStringAttribute(dbId, 'properties', 'original_url', 1000, false);
        await databases.createStringAttribute(dbId, 'properties', 'description', 5000, false);

        // Floats
        const floats = ['price', 'area_m2', 'price_m2', 'latitude', 'longitude', 'zone_avg_price_m2', 'price_deviation_pct', 'previous_price', 'price_change_amount', 'price_change_pct', 'distance_km'];
        for (const attr of floats) {
            await databases.createFloatAttribute(dbId, 'properties', attr, false);
            console.log(`- Float: ${attr}`);
        }

        // Boolean
        await databases.createBooleanAttribute(dbId, 'properties', 'is_active', false);
        
        console.log('Coleção properties configurada com sucesso. Vá à dashboard do Appwrite verificar!');

    } catch (e) {
        console.error('Falha geral ao criar DB:', e.message);
    }
}

createPropertyCollection();
