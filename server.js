// Minimal Next.js custom server for cPanel Node.js App Manager
const next = require('next');
const http = require('http');

const dev = false; // production server
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req, res) => {
        handle(req, res);
    });

    server.listen(port, hostname, () => {
        console.log(`Next.js server running on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('Failed to start Next.js server', err);
    process.exit(1);
});





