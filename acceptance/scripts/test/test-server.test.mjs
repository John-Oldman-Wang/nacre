// 验收用的本机测试服务（scripts/test-server.mjs）自己的用例。
// 每条用例起一个监听随机端口的实例，不占验收用的那个固定端口。
//
//   cd acceptance && npm test
import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';
import { TEST_SERVER_ORIGIN, TEST_SERVER_PORT } from '../../src/test-server-config.js';
import { startTestServer } from '../test-server.mjs';

/** 起一个实例，跑完关掉。 */
async function withServer(run) {
  const server = await startTestServer({ port: 0, quiet: true });
  try {
    await run('http://127.0.0.1:' + server.address().port);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 用 http.get 发请求，拿到还没开始读的响应。 */
function open(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, options, (res) => resolve({ req, res }));
    req.on('error', reject);
  });
}

/** 把响应读完，记下每块到的时刻。 */
function drain(res) {
  return new Promise((resolve) => {
    const chunks = [];
    const times = [];
    let failed = false;
    res.on('data', (chunk) => { chunks.push(chunk); times.push(performance.now()); });
    res.on('error', () => { failed = true; });
    res.on('aborted', () => { failed = true; });
    res.on('close', () => resolve({ body: Buffer.concat(chunks), times, failed, complete: res.complete }));
  });
}

const stats = async (origin, id) => (await fetch(origin + '/stats?id=' + id)).json();

test('端口常量是固定的，地址由它拼出来', () => {
  assert.equal(TEST_SERVER_PORT, 47831);
  assert.equal(TEST_SERVER_ORIGIN, 'http://127.0.0.1:47831');
});

test('/ping 探活', async () => {
  await withServer(async (origin) => {
    const res = await fetch(origin + '/ping');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, server: 'nacre-acceptance-test-server' });
  });
});

test('/chunks：块数和每块大小由参数定，内容按块的序号排', async () => {
  await withServer(async (origin) => {
    const res = await fetch(origin + '/chunks?count=3&size=4');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'aaaabbbbcccc');
  });
});

test('/chunks：默认不带 Content-Length（分块传输），length=1 时带', async () => {
  await withServer(async (origin) => {
    const chunked = await open(origin + '/chunks?count=2&size=8');
    assert.equal(chunked.res.headers['content-length'], undefined);
    assert.equal(chunked.res.headers['transfer-encoding'], 'chunked');
    await drain(chunked.res);

    const sized = await open(origin + '/chunks?count=2&size=8&length=1');
    assert.equal(sized.res.headers['content-length'], '16');
    assert.equal(sized.res.headers['transfer-encoding'], undefined);
    assert.equal((await drain(sized.res)).body.length, 16);
  });
});

test('/chunks：不让客户端猜内容类型（否则系统会攒够一截才往上交）', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/chunks?count=1&size=1');
    assert.equal(res.headers['content-type'], 'application/octet-stream');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    await drain(res);
  });
});

test('/chunks：type 换响应的类型，sniff=1 去掉「不许猜类型」那个头', async () => {
  await withServer(async (origin) => {
    const typed = await open(origin + '/chunks?count=1&size=1&type=text/event-stream');
    assert.equal(typed.res.headers['content-type'], 'text/event-stream');
    assert.equal(typed.res.headers['x-content-type-options'], 'nosniff');
    await drain(typed.res);
    const loose = await open(origin + '/chunks?count=1&size=1&type=text/plain;charset=utf-8&sniff=1');
    assert.equal(loose.res.headers['content-type'], 'text/plain;charset=utf-8');
    assert.equal(loose.res.headers['x-content-type-options'], undefined);
    await drain(loose.res);
    assert.equal((await fetch(origin + '/chunks?type=not a type')).status, 400);
  });
});

test('/chunks：interval 是块之间的间隔，块是一块一块到的', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/chunks?count=4&size=16&interval=80');
    const { body, times } = await drain(res);
    assert.equal(body.length, 64);
    assert.ok(times.length >= 3, '至少分三次到，实际 ' + times.length);
    assert.ok(times.at(-1) - times[0] >= 150, '首尾相隔 ' + (times.at(-1) - times[0]) + ' ms');
  });
});

test('/chunks：delay 是响应头发出之后、第一块之前等多久', async () => {
  await withServer(async (origin) => {
    const t0 = performance.now();
    const { res } = await open(origin + '/chunks?count=1&size=4&delay=200');
    const headersAt = performance.now() - t0;
    const { body, times } = await drain(res);
    assert.equal(body.toString(), 'aaaa');
    assert.ok(headersAt < 150, '响应头在 ' + headersAt + ' ms 到');
    assert.ok(times[0] - t0 >= 190, '第一块在 ' + (times[0] - t0) + ' ms 到');
  });
});

test('/drop：发了 after 块之后直接断开，客户端收到的不完整', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/drop?count=5&size=10&after=2&interval=20&length=1');
    assert.equal(res.headers['content-length'], '50');
    const { body, failed, complete } = await drain(res);
    assert.equal(body.toString(), 'aaaaaaaaaabbbbbbbbbb');
    assert.equal(complete, false);
    assert.equal(failed, true);
  });
});

test('/drop：不带 Content-Length 时同样是没发完就断', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/drop?count=5&size=10&after=1');
    const { body, complete } = await drain(res);
    assert.equal(body.toString(), 'aaaaaaaaaa');
    assert.equal(complete, false);
  });
});

test('/drop：reset=1 时是重置连接，客户端收到连接错误', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/drop?count=5&size=10&after=1&reset=1');
    const error = await new Promise((resolve) => {
      res.on('error', resolve);
      res.on('end', () => resolve(null));
      res.resume();
    });
    assert.equal(error?.code, 'ECONNRESET');
  });
});

test('/endless：一直发，客户端断开才停；/stats 看得到它发了多少、连接断没断', async () => {
  await withServer(async (origin) => {
    const { req, res } = await open(origin + '/endless?id=e1&size=1024&interval=5');
    let received = 0;
    res.on('data', (chunk) => { received += chunk.length; });
    await sleep(150);
    const during = await stats(origin, 'e1');
    assert.equal(during.found, true);
    assert.equal(during.closed, false);
    assert.equal(during.finished, false);
    assert.ok(during.bytesSent >= 4096, '已经发了 ' + during.bytesSent);
    assert.ok(received > 0);

    req.destroy();
    await sleep(100);
    const after = await stats(origin, 'e1');
    assert.equal(after.closed, true);
    assert.equal(after.finished, false);
    await sleep(100);
    assert.equal((await stats(origin, 'e1')).bytesSent, after.bytesSent, '断开之后不再发');
  });
});

test('/endless：客户端不读，服务端发到缓冲满就停住（背压），读了又接着发', async () => {
  await withServer(async (origin) => {
    // interval=0：能发多快发多快。客户端拿到响应之后不读
    const { req, res } = await open(origin + '/endless?id=bp&size=65536&interval=0');
    let last = -1;
    let stalled = null;
    for (let i = 0; i < 100; i++) {
      await sleep(100);
      const now = await stats(origin, 'bp');
      if (now.bytesSent === last && now.blocked) { stalled = now; break; }
      last = now.bytesSent;
    }
    assert.ok(stalled !== null, '10 秒内服务端没有停住');
    assert.equal(stalled.closed, false);

    // 开始读：服务端接着发
    res.on('data', () => {});
    await sleep(300);
    const resumed = await stats(origin, 'bp');
    assert.ok(resumed.bytesSent > stalled.bytesSent,
              '读之前 ' + stalled.bytesSent + '，读之后 ' + resumed.bytesSent);
    req.destroy();
  });
});

test('/chunks 也记进 /stats：发完之后 finished，连接是正常结束的', async () => {
  await withServer(async (origin) => {
    await (await fetch(origin + '/chunks?id=c1&count=2&size=3')).arrayBuffer();
    await sleep(50);
    const s = await stats(origin, 'c1');
    assert.equal(s.found, true);
    assert.equal(s.bytesSent, 6);
    assert.equal(s.chunksSent, 2);
    assert.equal(s.finished, true);
  });
});

test('/stats：没见过的 id', async () => {
  await withServer(async (origin) => {
    assert.deepEqual(await stats(origin, 'nope'), { id: 'nope', found: false });
    assert.equal((await fetch(origin + '/stats')).status, 400);
  });
});

test('/lines：一行一个 JSON，行会被切在两次发送中间', async () => {
  await withServer(async (origin) => {
    const { res } = await open(origin + '/lines?count=3&interval=30');
    assert.equal(res.headers['content-type'], 'application/x-ndjson');
    const { body, times } = await drain(res);
    assert.equal(body.toString(), '{"n":0,"text":"第 0 行"}\n{"n":1,"text":"第 1 行"}\n{"n":2,"text":"第 2 行"}\n');
    assert.ok(times.length >= 3, '分了 ' + times.length + ' 次到');
  });
});

test('/status：只回状态码，没有内容', async () => {
  await withServer(async (origin) => {
    const none = await fetch(origin + '/status?code=204');
    assert.equal(none.status, 204);
    assert.equal(await none.text(), '');
    assert.equal((await fetch(origin + '/status?code=404')).status, 404);
    assert.equal((await fetch(origin + '/status?code=99')).status, 400);
  });
});

test('HEAD：有响应头，没有内容', async () => {
  await withServer(async (origin) => {
    const res = await fetch(origin + '/chunks?count=2&size=8&length=1', { method: 'HEAD' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-length'), '16');
    assert.equal(await res.text(), '');
  });
});

test('参数不对回 400，不认识的路径回 404', async () => {
  await withServer(async (origin) => {
    assert.equal((await fetch(origin + '/chunks?count=abc')).status, 400);
    assert.equal((await fetch(origin + '/chunks?count=-1')).status, 400);
    assert.equal((await fetch(origin + '/chunks?size=99999999')).status, 400);
    assert.equal((await fetch(origin + '/drop?count=2&after=5')).status, 400);
    assert.equal((await fetch(origin + '/nowhere')).status, 404);
  });
});

test('同一个端口起第二个实例：报错里说清楚是端口被占了', async () => {
  await withServer(async (origin) => {
    const port = Number(new URL(origin).port);
    await assert.rejects(startTestServer({ port, quiet: true }), /already in use/);
  });
});
