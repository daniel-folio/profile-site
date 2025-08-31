const memoryLeakArray: Buffer[] = [];

// 라우트 '설계도' 객체
const testMemoryLeakRoute = {
  method: 'GET',
  path: '/test/memory-leak',
  handler: (ctx: any) => {
    const largeData = Buffer.alloc(100 * 1024 * 1024, 'leak');
    memoryLeakArray.push(largeData);

    const memoryUsage = process.memoryUsage().rss / (1024 * 1024);
    const message = `Memory leak simulated! Current usage: ${memoryUsage.toFixed(2)} MB. Leaked chunks: ${memoryLeakArray.length}`;

    console.log(message);
    ctx.send(message);
  },
  config: { auth: false },
};

// CommonJS 방식으로 '설계도'를 내보냅니다.
module.exports = testMemoryLeakRoute;