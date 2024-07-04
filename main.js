const http = require('http');

let requestCounter = 0;

// API 요청을 시뮬레이션하는 함수
async function simulateAPICall(requestID, requestTime) {
    console.log(`Starting request ${requestID} at ${requestTime.toISOString()}`);
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
    const completionTime = new Date();
    console.log(`Completed request ${requestID} at ${completionTime.toISOString()}`);
    return `Response for request ${requestID}, started at ${requestTime.toISOString()}, completed at ${completionTime.toISOString()}`;
}

// 요청을 처리하는 함수
async function handleRequest(requestID, requestTime) {
    return await simulateAPICall(requestID, requestTime);
}

// 단일 엔드포인트 핸들러
async function requestHandler(req, res) {
    const requestID = ++requestCounter;
    const requestTime = new Date();
    console.log("requested requestID:", requestID);

    try {
        const result = await handleRequest(requestID, requestTime);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(result);
    } catch (error) {
        console.error('Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

const server = http.createServer((req, res) => {
    if (req.url === '/request' && req.method === 'GET') {
        requestHandler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Starting server at port ${PORT}`);
});