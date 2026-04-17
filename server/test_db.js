const { createClient } = require('@libsql/client');
require('dotenv').config();

const test = async () => {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
        console.error('ERROR: DATABASE_URL is missing!');
        return;
    }
    const client = createClient({
        url: process.env.DATABASE_URL,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    try {
        const start = Date.now();
        const res = await client.execute('SELECT 1');
        console.log('SUCCESS! Response time:', Date.now() - start, 'ms');
        console.log('Result:', res.rows);
    } catch (err) {
        console.error('CONNECTION FAILED:', err.message);
    }
};

test();
