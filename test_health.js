import http from 'http';

const testHealth = () => {
    const options = {
        hostname: 'localhost',
        port: 59201,
        path: '/api/health',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Response:', data);
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error(`Request error:`, e.message);
        process.exit(1);
    });

    req.end();
};

testHealth();
