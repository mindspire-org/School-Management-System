import http from 'http';

const testHttp = async () => {
    const endpoints = [
        '/api/transport/stats',
        '/api/transport/buses',
        '/api/transport/routes',
        '/api/transport/student-entries'
    ];

    console.log(`--- Testing HTTP Endpoints on http://localhost:59201 ---`);
    for (const ep of endpoints) {
        await new Promise((resolve) => {
            console.log(`\nTesting ${ep}...`);
            const options = {
                hostname: 'localhost',
                port: 59201,
                path: ep,
                method: 'GET',
                headers: {
                    'x-campus-id': '3'
                }
            };

            const req = http.request(options, (res) => {
                console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    console.log('Response:', data.slice(0, 200));
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error(`Request error for ${ep}:`, e.message);
                resolve();
            });

            req.end();
        });
    }
};

testHttp();
