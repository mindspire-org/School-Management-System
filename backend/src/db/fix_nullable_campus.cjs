
const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgres://postgres:admin@127.0.0.1:5432/school_db'
});

async function applyFix() {
    try {
        await client.connect();
        console.log('Connected to database');
        
        await client.query('ALTER TABLE id_card_templates ALTER COLUMN "campusId" DROP NOT NULL;');
        console.log('Fixed id_card_templates');
        
        await client.query('ALTER TABLE admit_card_templates ALTER COLUMN "campusId" DROP NOT NULL;');
        console.log('Fixed admit_card_templates');
        
        await client.query('ALTER TABLE certificate_templates ALTER COLUMN "campusId" DROP NOT NULL;');
        console.log('Fixed certificate_templates');
        
        console.log('All tables updated successfully to allow NULL campusId');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

applyFix();
