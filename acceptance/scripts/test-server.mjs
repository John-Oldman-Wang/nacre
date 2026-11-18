#!/usr/bin/env node
// 验收用的本机测试服务：给「边下边读」那一步（src/steps/fetch-stream.js）当对端。
//
// 公开的测试站（httpbin）控制不了一块一块怎么发、什么时候断、发多快，也看不到
// 「客户端是不是真的停了」，所以这几样只能对着自己的服务验。
//
//   node acceptance/scripts/test-server.mjs      起在 127.0.0.1:47831，Ctrl+C 停
//
// 只用 Node 自带的模块。端口在 src/test-server-config.js，验收步骤也从那里取。
//
// 接口（都是 GET，参数在查询串里；HEAD 也认，只回响应头）：
//
//   /ping                     探活。回 {"ok":true,"server":"nacre-acceptance-test-server"}
//   /chunks                   一块一块发，发完正常结束
//       count=3                 发几块
//       size=1024               每块多少字节。第 i 块的每个字节都是 'a' + i % 26
//       interval=0              相邻两块之间隔多少毫秒
//       delay=0                 响应头发出之后、第一块之前等多少毫秒
//       length=0                1：带 Content-Length；0：不带（分块传输）
//       type=application/octet-stream   响应的 Content-Type
//       sniff=0                 1：不发「不许猜类型」那个头（X-Content-Type-Options）
//       id=                     给这一次响应起个名字，之后用 /stats 查
//   /drop                     同 /chunks，但发了 after 块之后直接断开连接
//       after=1                 发几块之后断
//       reset=0                 0：正常关闭连接（FIN）；1：重置连接（RST）
//   /endless                  一直发，客户端断开才停。客户端不读，它就停在那儿等
//       size=16384 interval=0 id=
//   /lines                    一行一个 JSON 的文本，每行故意切成两次发
//       count=5 interval=100 id=
//   /status?code=204          只回这个状态码，没有内容
//   /stats?id=名字            查某一次响应：发了多少、是不是被客户端的慢读挡住了、
//                             连接断了没有
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { TEST_SERVER_PORT } from '../src/test-server-config.js';

const HOST = '127.0.0.1';
const SERVER_NAME = 'nacre-acceptance-test-server';

// 参数的上限：这是个测试服务，写错参数时宁可回 400，也别真去发几个 G
const LIMITS = {
  count: 100000,
  size: 1 << 20,       // 1 MiB
  interval: 60000,
  delay: 60000,
};

// 记得住多少次响应的统计。够一轮验收用，再多就丢最早的
const MAX_TRACKED = 200;

class BadRequest extends Error {}

/**
 * 从查询串里取一个非负整数。
 * @param {URLSearchParams} query
 * @param {string} name
 * @param {number} fallback
 * @param {number} max
 */
function intParam(query, name, fallback, max) {
  const raw = query.get(name);
  if (raw === null || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new BadRequest(name + ' must be an integer between 0 and ' + max + ', got ' + JSON.stringify(raw));
  }
  return value;
}

/** 第 index 块的内容：size 个相同的字节，'a' + index % 26。 */
const chunkOf = (index, size) => Buffer.alloc(size, 97 + (index % 26));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {{ port?: number, quiet?: boolean }} [options]
 *   port 默认是验收用的固定端口；0 表示让系统挑一个（用例用）。
 * @returns {Promise<http.Server>} 已经在监听的服务
 */
export function startTestServer(options = {}) {
  const port = options.port === undefined ? TEST_SERVER_PORT : options.port;
  const log = options.quiet ? () => {} : (line) => console.log(line);

  /**
   * 每一次带 id 的响应的统计，/stats 查的就是它。
   * @type {Map<string, { bytesSent: number, chunksSent: number, blocked: boolean,
   *                      finished: boolean, closed: boolean }>}
   */
  const tracked = new Map();

  /** 开一条统计。没给 id 的响应也记，只是查不到。 */
  const track = (id, res) => {
    const entry = { bytesSent: 0, chunksSent: 0, blocked: false, finished: false, closed: false };
    if (id !== null && id !== '') {
      tracked.delete(id);
      tracked.set(id, entry);
      while (tracked.size > MAX_TRACKED) tracked.delete(tracked.keys().next().value);
    }
    // close：连接没了，或者这次响应结束了。两种都会来，靠 finished 区分是不是发完了
    res.on('close', () => { entry.closed = true; });
    return entry;
  };

  /**
   * 写一块，并且**等客户端收得下**再返回：write() 返回 false 表示缓冲满了，
   * 这时不再往里塞，等 drain。客户端一直不读，就一直停在这里——/stats 里的
   * blocked 就是这个状态，背压的验收看的是它。
   * 连接已经断了返回 false。
   */
  const write = async (res, entry, chunk) => {
    if (entry.closed || res.destroyed) return false;
    const accepted = res.write(chunk);
    entry.bytesSent += chunk.length;
    entry.chunksSent += 1;
    if (!accepted) {
      entry.blocked = true;
      await new Promise((resolve) => {
        const done = () => { res.off('drain', done); res.off('close', done); resolve(); };
        res.on('drain', done);
        res.on('close', done);
      });
      entry.blocked = false;
    }
    return !entry.closed;
  };

  const sendJSON = (res, status, value) => {
    const body = JSON.stringify(value);
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'no-store',
    });
    res.end(body);
  };

  // 二进制的那几个接口共用的响应头。
  //
  // nosniff：响应没有声明类型、或者声明成文本时，iOS 的网络库会先攒够一截内容
  // 用来猜类型，攒够之前不往上交——那样「第一块什么时候到」量到的就是它攒了
  // 多久。声明成二进制并且不许猜，数据一到就交上来
  const streamHeaders = (type, sniff = false) => {
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store' };
    if (!sniff) headers['X-Content-Type-Options'] = 'nosniff';
    return headers;
  };

  /** /chunks 和 /drop：dropAfter 为 null 是发完正常结束。 */
  const sendChunks = async (req, res, query, dropAfter) => {
    const count = intParam(query, 'count', 3, LIMITS.count);
    const size = intParam(query, 'size', 1024, LIMITS.size);
    const interval = intParam(query, 'interval', 0, LIMITS.interval);
    const delay = intParam(query, 'delay', 0, LIMITS.delay);
    const withLength = intParam(query, 'length', 0, 1) === 1;
    const reset = intParam(query, 'reset', 0, 1) === 1;
    if (dropAfter !== null && dropAfter >= count) {
      throw new BadRequest('after must be less than count, otherwise nothing is dropped');
    }
    const entry = track(query.get('id'), res);
    // 类型和「许不许猜」可以换：量的是客户端的网络库什么时候把响应头交上来，
    // 这两样可能有影响
    const type = query.get('type') ?? 'application/octet-stream';
    if (!/^[\w.+-]+\/[\w.+-]+(;\s*charset=[\w-]+)?$/.test(type)) {
      throw new BadRequest('type must look like a media type, got ' + JSON.stringify(type));
    }
    const headers = streamHeaders(type, intParam(query, 'sniff', 0, 1) === 1);
    if (withLength) headers['Content-Length'] = String(count * size);
    res.writeHead(200, headers);
    if (req.method === 'HEAD') { entry.finished = true; res.end(); return; }
    // 响应头现在就发，不等第一块：要量的就是「头已经到了、内容还没到」时
    // 客户端的网络库什么时候把响应交上来
    res.flushHeaders();
    if (delay > 0) await sleep(delay);
    for (let i = 0; i < count; i++) {
      if (dropAfter !== null && i === dropAfter) {
        // 没发完就断。先让已经写的那几块真的出去，再拆连接——直接 destroy
        // 可能连前面写的也一起丢掉，客户端就不是「读到一半断了」
        await sleep(Math.max(interval, 30));
        // 两种断法对端看到的不一样：正常关闭是「对方说发完了」，重置是「连接坏了」。
        // 不带 Content-Length 的响应被正常关闭时，有的客户端分不出它没发完
        if (reset) res.socket?.resetAndDestroy();
        else res.destroy();
        return;
      }
      if (i > 0 && interval > 0) await sleep(interval);
      if (!await write(res, entry, chunkOf(i, size))) return;
    }
    entry.finished = true;
    res.end();
  };

  const sendEndless = async (req, res, query) => {
    const size = intParam(query, 'size', 16384, LIMITS.size);
    const interval = intParam(query, 'interval', 0, LIMITS.interval);
    if (size === 0) throw new BadRequest('size must be at least 1');
    const entry = track(query.get('id'), res);
    res.writeHead(200, streamHeaders('application/octet-stream'));
    if (req.method === 'HEAD') { entry.finished = true; res.end(); return; }
    res.flushHeaders();
    for (let i = 0; ; i++) {
      if (!await write(res, entry, chunkOf(i, size))) return;
      // interval 是 0 也要让出去一次，不然这个循环会把别的请求（/stats）饿死
      if (interval > 0) await sleep(interval);
      else await new Promise((resolve) => setImmediate(resolve));
    }
  };

  const sendLines = async (req, res, query) => {
    const count = intParam(query, 'count', 5, LIMITS.count);
    const interval = intParam(query, 'interval', 100, LIMITS.interval);
    const entry = track(query.get('id'), res);
    res.writeHead(200, streamHeaders('application/x-ndjson'));
    if (req.method === 'HEAD') { entry.finished = true; res.end(); return; }
    res.flushHeaders();
    // 每一行切成两次发，而且切在一个汉字的三个字节中间：读的那一边既要自己
    // 按换行拼行，也不能假设一块的结尾是一个完整的字
    let carry = Buffer.alloc(0);
    for (let i = 0; i < count; i++) {
      const line = Buffer.from(JSON.stringify({ n: i, text: '第 ' + i + ' 行' }) + '\n', 'utf8');
      const cut = line.indexOf(0xe7) + 1;   // 「第」是 E7 AC AC，切在第一个字节后面
      if (!await write(res, entry, Buffer.concat([carry, line.subarray(0, cut)]))) return;
      carry = line.subarray(cut);
      if (interval > 0) await sleep(interval);
    }
    if (carry.length > 0 && !await write(res, entry, carry)) return;
    entry.finished = true;
    res.end();
  };

  const handle = async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://' + HOST);
    const query = url.searchParams;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJSON(res, 405, { error: 'only GET and HEAD' });
      return;
    }
    switch (url.pathname) {
      case '/ping':
        sendJSON(res, 200, { ok: true, server: SERVER_NAME });
        return;
      case '/chunks':
        await sendChunks(req, res, query, null);
        return;
      case '/drop':
        await sendChunks(req, res, query, intParam(query, 'after', 1, LIMITS.count));
        return;
      case '/endless':
        await sendEndless(req, res, query);
        return;
      case '/lines':
        await sendLines(req, res, query);
        return;
      case '/status': {
        const code = intParam(query, 'code', 204, 599);
        if (code < 200) throw new BadRequest('code must be between 200 and 599');
        res.writeHead(code, { 'Cache-Control': 'no-store' });
        res.end();
        return;
      }
      case '/stats': {
        const id = query.get('id');
        if (id === null || id === '') throw new BadRequest('id is required');
        const entry = tracked.get(id);
        sendJSON(res, 200, entry === undefined ? { id, found: false } : { id, found: true, ...entry });
        return;
      }
      default:
        sendJSON(res, 404, { error: 'no such path: ' + url.pathname });
    }
  };

  const server = http.createServer((req, res) => {
    log(req.method + ' ' + req.url);
    handle(req, res).catch((err) => {
      if (err instanceof BadRequest && !res.headersSent) {
        sendJSON(res, 400, { error: err.message });
        return;
      }
      if (!(err instanceof BadRequest)) console.error(err);
      res.destroy();
    });
  });
  // 发出去的每一块都要尽快上路，不让系统攒着凑大包
  server.on('connection', (socket) => { socket.setNoDelay(true); });

  return new Promise((resolve, reject) => {
    server.once('error', (err) => {
      if (/** @type {NodeJS.ErrnoException} */ (err).code === 'EADDRINUSE') {
        reject(new Error(HOST + ':' + port + ' is already in use: ' +
                         'another test server is probably running'));
        return;
      }
      reject(err);
    });
    server.listen(port, HOST, () => resolve(server));
  });
}

// 直接运行（不是被用例 import）时起在固定端口上
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startTestServer().then((server) => {
    const address = /** @type {import('node:net').AddressInfo} */ (server.address());
    console.log(SERVER_NAME + ' listening on http://' + address.address + ':' + address.port);
    console.log('Ctrl+C to stop');
    const stop = () => {
      server.closeAllConnections();
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  }, (err) => {
    console.error(err.message);
    process.exit(1);
  });
}
