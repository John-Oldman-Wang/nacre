// 边下边读：response.body。
//
// 两部分。前一半不用网络：自己构造的 Response 的 body、锁和「读过」的规则、
// 每一种出错情况、没做的成员确实不存在。后一半对着本机的测试服务
// （acceptance/scripts/test-server.mjs）：公开的测试站控制不了一块一块怎么发、
// 什么时候断，也看不到「客户端是不是真的停了」。
//
// 服务没起时后一半整个跳过，打一行未验证，不算失败。
//
// 不用 TextDecoder（另一步在加它，这里不依赖）：ASCII 用 String.fromCharCode，
// UTF-8 借 Blob 的 text()。

import { collectGarbage } from '../support.js';
import { TEST_SERVER_ORIGIN } from '../test-server-config.js';

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {Uint8Array} bytes */
const ascii = (bytes) => String.fromCharCode(...bytes);

/** 一个值写成能比较的字符串；被拒绝时是 'rejected: ' 加异常的 name。
 *  @param {() => unknown} fn */
async function outcome(fn) {
  try { return await fn(); }
  catch (err) { return 'rejected: ' + (err instanceof Error ? err.name : String(err)); }
}

/** 同步的那一种：抛了就是异常的 name。
 *  @param {() => unknown} fn */
function thrown(fn) {
  try { fn(); return '没抛'; }
  catch (err) { return err instanceof Error ? err.name : String(err); }
}

/**
 * 等一个 Promise，但不无限等：对端不按预期来的时候，这一步要能往下走。
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */
function within(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('等了 ' + ms + ' ms 没有结果');
      err.name = 'Stuck';
      reject(err);
    }, ms);
    promise.then((value) => { clearTimeout(timer); resolve(value); },
                 (err) => { clearTimeout(timer); reject(err); });
  });
}

/** body 一定不是 null 的场合用它，顺便让类型检查知道。
 *  @param {Response} res */
function bodyOf(res) {
  if (res.body === null) throw new Error('这个响应的 body 是 null');
  return res.body;
}

/** 把一个流读完，返回每一块。
 *  @param {ReadableStream} stream */
async function readAll(stream) {
  const reader = stream.getReader();
  /** @type {Uint8Array[]} */
  const chunks = [];
  for (;;) {
    const { done, value } = await within(reader.read(), 15000);
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

/** @param {Uint8Array[]} chunks */
function concat(chunks) {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.byteLength; }
  return out;
}

/**
 * 测试服务 /chunks 发的内容：第 i 块的每个字节都是 'a' + i % 26。
 * 返回第一个对不上的位置，全对是 -1。不假设收到的块和发出的块一样大。
 * @param {Uint8Array} bytes
 * @param {number} size 服务端每块的大小
 */
function firstMismatch(bytes, size) {
  for (let k = 0; k < bytes.length; k++) {
    if (bytes[k] !== 97 + (Math.floor(k / size) % 26)) return k;
  }
  return -1;
}

/**
 * @param {import("../main.js").StepContext} ctx
 * @returns {Promise<void>} 这一步全部做完时兑现
 */
export function stepFetchStream(ctx) {
  const { assert } = ctx;
  ctx.section('边下边读：response.body（没有界面，看日志）', 8);

  /**
   * 一组一组跑：一组中途抛了记一条失败，后面的组照常跑。
   * @param {string} name
   * @param {() => Promise<void>} fn
   */
  const group = async (name, fn) => {
    try {
      await fn();
    } catch (err) {
      console.log('  ✗ body 流：「' + name + '」这一组中途抛了，它后面的断言没跑: ' +
                  (err instanceof Error ? err.name + ': ' + err.message : String(err)));
    }
  };

  // =====================================================================
  // 不用网络的部分
  const local = async () => {
    console.log('  --- body 流：有哪些东西、没有哪些 ---');
    await group('形状', async () => {
      assert('body 流：ReadableStream 是全局的类', typeof ReadableStream, 'function');
      assert('body 流：ReadableStreamDefaultReader 是全局的类', typeof ReadableStreamDefaultReader, 'function');
      // @ts-expect-error 还不能自己造流
      assert('body 流：new ReadableStream() 抛 TypeError', thrown(() => new ReadableStream()), 'TypeError');
      assert('body 流：那句报错说的是还不能自己造',
             (() => {
               // @ts-expect-error 同上
               try { new ReadableStream(); return ''; }
               catch (err) { return /** @type {Error} */ (err).message.includes('cannot be constructed'); }
             })(), true);

      // 这一步没做的成员是「不存在」，不是「在但调了就抛」
      const proto = /** @type {any} */ (ReadableStream.prototype);
      assert('body 流：没有 pipeTo', 'pipeTo' in proto, false);
      assert('body 流：没有 pipeThrough', 'pipeThrough' in proto, false);
      assert('body 流：没有 tee', 'tee' in proto, false);
      assert('body 流：没有 ReadableStream.from', 'from' in ReadableStream, false);
      const globals = /** @type {any} */ (globalThis);
      assert('body 流：没有 WritableStream', typeof globals.WritableStream, 'undefined');
      assert('body 流：没有 TransformStream', typeof globals.TransformStream, 'undefined');
      assert('body 流：没有 ReadableStreamBYOBReader', typeof globals.ReadableStreamBYOBReader, 'undefined');
      assert('body 流：没有 EventSource', typeof globals.EventSource, 'undefined');
      assert('body 流：Request 上没有 body', 'body' in Request.prototype, false);
      assert('body 流：Response 上没有 clone', 'clone' in Response.prototype, false);
      assert('body 流：getReader({ mode: "byob" }) 抛 TypeError',
             thrown(() => /** @type {any} */ (bodyOf(new Response('x')))
               .getReader({ mode: 'byob' })), 'TypeError');
      assert('body 流：getReader(undefined) 和不带参数一样',
             /** @type {any} */ (bodyOf(new Response('x'))).getReader(undefined) instanceof
               ReadableStreamDefaultReader, true);
      assert('body 流：Symbol.asyncIterator 和 values 是同一个函数',
             proto[Symbol.asyncIterator] === proto.values, true);
    });

    console.log('  --- body 流：自己构造的 Response ---');
    await group('自己构造的 Response', async () => {
      const res = new Response('abc');
      const stream = bodyOf(res);
      assert('body 流：new Response("abc").body 是 ReadableStream', stream instanceof ReadableStream, true);
      assert('body 流：每次读 body 是同一个对象', res.body === stream, true);
      assert('body 流：一开始没锁', stream.locked, false);
      assert('body 流：一开始 bodyUsed 是 false', res.bodyUsed, false);
      assert('body 流：new Response() 的 body 是 null', new Response().body, null);
      assert('body 流：new Response(null) 的 body 是 null', new Response(null).body, null);

      const reader = stream.getReader();
      assert('body 流：getReader() 给的是 ReadableStreamDefaultReader',
             reader instanceof ReadableStreamDefaultReader, true);
      assert('body 流：拿了读取器之后 locked', stream.locked, true);
      assert('body 流：只拿读取器不算读过', res.bodyUsed, false);

      const first = await reader.read();
      assert('body 流：第一次 read 的 done', first.done, false);
      assert('body 流：value 是 Uint8Array', first.value instanceof Uint8Array, true);
      assert('body 流：内容一块给完', first.value ? ascii(first.value) : '', 'abc');
      assert('body 流：这一块占满它自己的缓冲区',
             first.value ? first.value.byteOffset === 0 &&
               first.value.byteLength === first.value.buffer.byteLength : false, true);
      assert('body 流：read 过之后 bodyUsed', res.bodyUsed, true);

      const second = await reader.read();
      assert('body 流：读完之后 done 是 true', second.done, true);
      assert('body 流：读完之后 value 是 undefined', second.value, undefined);
      assert('body 流：读完之后 closed 兑现成 undefined', await outcome(() => reader.closed), undefined);
      assert('body 流：读完之后再读还是 done', (await reader.read()).done, true);

      // 别的来源
      const raw = new Uint8Array([0, 255, 16, 128]);
      assert('body 流：body 是类型数组',
             (await readAll(bodyOf(new Response(raw)))).map((c) => c.join(',')).join('|'), '0,255,16,128');
      assert('body 流：body 是 Blob',
             ascii(concat(await readAll(bodyOf(new Response(new Blob(['from ', 'blob'])))))), 'from blob');
      assert('body 流：body 是中文，给的是 UTF-8 的字节',
             concat(await readAll(bodyOf(new Response('第')))).join(','), '231,172,172');

      // 空串：有 body，只是没有内容
      const empty = new Response('');
      const emptyReader = bodyOf(empty).getReader();
      assert('body 流：空串的 body 不是 null', empty.body !== null, true);
      assert('body 流：空串第一次 read 就是 done', (await emptyReader.read()).done, true);
      assert('body 流：空串读过也算 bodyUsed', empty.bodyUsed, true);

      // 读出来的那一块是独立的：改它不影响那个 Blob
      const blob = new Blob(['hello']);
      const chunk = (await readAll(bodyOf(new Response(blob))))[0];
      chunk[0] = 0x58;
      assert('body 流：改了读出来的块，Blob 的内容不变', await blob.text(), 'hello');

      // 同时发两次 read：按先后各得各的
      const twice = bodyOf(new Response('ab')).getReader();
      const [a, b] = await Promise.all([twice.read(), twice.read()]);
      assert('body 流：连着调两次 read，第一次拿到内容', a.value ? ascii(a.value) : '', 'ab');
      assert('body 流：连着调两次 read，第二次是 done', b.done, true);
    });

    console.log('  --- body 流：锁和读过的规则 ---');
    await group('锁和读过', async () => {
      // 锁住、没读过
      const res = new Response('abc');
      const stream = bodyOf(res);
      const reader = stream.getReader();
      assert('body 流：锁住时 text() 被拒', await outcome(() => res.text()), 'rejected: TypeError');
      assert('body 流：锁住时 arrayBuffer() 被拒', await outcome(() => res.arrayBuffer()), 'rejected: TypeError');
      assert('body 流：锁住时 json() 被拒', await outcome(() => res.json()), 'rejected: TypeError');
      assert('body 流：锁住时 blob() 被拒', await outcome(() => res.blob()), 'rejected: TypeError');
      assert('body 流：被拒的读法不算读过', res.bodyUsed, false);
      assert('body 流：锁住时再 getReader() 抛', thrown(() => stream.getReader()), 'TypeError');
      assert('body 流：锁住时 new ReadableStreamDefaultReader(流) 抛',
             thrown(() => new ReadableStreamDefaultReader(stream)), 'TypeError');
      assert('body 流：锁住时 stream.cancel() 被拒', await outcome(() => stream.cancel()), 'rejected: TypeError');
      assert('body 流：锁住时 for await 被拒',
             await outcome(async () => { for await (const c of stream) void c; }), 'rejected: TypeError');

      // 放开之后，没读过的还能整个读
      reader.releaseLock();
      assert('body 流：releaseLock 之后不再 locked', stream.locked, false);
      assert('body 流：放开之后（没读过）text() 照常', await outcome(() => res.text()), 'abc');
      assert('body 流：text() 之后 body 是锁住的', stream.locked, true);
      assert('body 流：text() 之后 bodyUsed', res.bodyUsed, true);
      assert('body 流：text() 之后 getReader() 抛', thrown(() => stream.getReader()), 'TypeError');

      // 放开的读取器
      assert('body 流：放开的读取器 read() 被拒', await outcome(() => reader.read()), 'rejected: TypeError');
      assert('body 流：放开的读取器 closed 被拒', await outcome(() => reader.closed), 'rejected: TypeError');
      assert('body 流：放开的读取器 cancel() 被拒', await outcome(() => reader.cancel()), 'rejected: TypeError');
      assert('body 流：releaseLock 第二次不抛', thrown(() => reader.releaseLock()), '没抛');

      // 读过一块再放开：整个读的四种读法不能再用
      const partial = new Response('abc');
      const partialReader = bodyOf(partial).getReader();
      await partialReader.read();
      partialReader.releaseLock();
      assert('body 流：读过一块再放开，text() 被拒', await outcome(() => partial.text()), 'rejected: TypeError');
      assert('body 流：那句报错和以前「读过第二次」是同一句',
             await partial.text().then(() => '', (err) => err.message), 'Body has already been read');

      // 四种读法调过之后，第一次去拿 body：是一个锁住的流
      const consumed = new Response('abc');
      const pending = consumed.arrayBuffer();
      assert('body 流：arrayBuffer() 一调用 body 就是锁住的', bodyOf(consumed).locked, true);
      assert('body 流：arrayBuffer() 一调用就算读过', consumed.bodyUsed, true);
      assert('body 流：arrayBuffer() 的结果不受影响', (await pending).byteLength, 3);
      assert('body 流：arrayBuffer() 之后 getReader() 抛', thrown(() => bodyOf(consumed).getReader()), 'TypeError');
      assert('body 流：arrayBuffer() 之后 stream.cancel() 被拒',
             await outcome(() => bodyOf(consumed).cancel()), 'rejected: TypeError');

      // 只碰了一下 body（没锁、没读），四种读法照常
      const touched = new Response('abc');
      void touched.body;
      assert('body 流：只取过 body 不影响 text()', await outcome(() => touched.text()), 'abc');

      // 没有 body 的响应没变
      const none = new Response();
      assert('body 流：没有 body 时 text() 还是空串', await outcome(() => none.text()), '');
      assert('body 流：没有 body 时 bodyUsed 保持 false', none.bodyUsed, false);

      // 有 read 在等的时候放开：那个 read 被拒，内容不丢
      const racing = new Response('abc');
      const racingStream = bodyOf(racing);
      const early = racingStream.getReader();
      const waiting = early.read();
      early.releaseLock();
      assert('body 流：有 read 在等时放开，那个 read 被拒', await outcome(() => waiting), 'rejected: TypeError');
      const late = racingStream.getReader();
      const kept = await late.read();
      assert('body 流：换一个读取器，内容还在', kept.value ? ascii(kept.value) : '', 'abc');
      assert('body 流：换的读取器接着读到头', (await late.read()).done, true);

      assert('body 流：new ReadableStreamDefaultReader(流) 等于 getReader()',
             await outcome(async () => {
               const made = new ReadableStreamDefaultReader(bodyOf(new Response('made')));
               const got = await made.read();
               return got.value ? ascii(got.value) : '';
             }), 'made');
      assert('body 流：new ReadableStreamDefaultReader(不是流) 抛',
             thrown(() => new ReadableStreamDefaultReader(/** @type {any} */ ({}))), 'TypeError');
    });

    console.log('  --- body 流：cancel ---');
    await group('cancel', async () => {
      const res = new Response('abc');
      const reader = bodyOf(res).getReader();
      assert('body 流：reader.cancel() 兑现成 undefined', await outcome(() => reader.cancel('不要了')), undefined);
      assert('body 流：cancel 之后 read 是 done', (await reader.read()).done, true);
      assert('body 流：cancel 之后 closed 兑现', await outcome(() => reader.closed), undefined);
      assert('body 流：cancel 也算读过', res.bodyUsed, true);
      assert('body 流：cancel 之后 text() 被拒', await outcome(() => res.text()), 'rejected: TypeError');
      assert('body 流：cancel 第二次照样兑现', await outcome(() => reader.cancel()), undefined);

      const direct = new Response('abc');
      assert('body 流：没锁时 stream.cancel() 兑现', await outcome(() => bodyOf(direct).cancel()), undefined);
      assert('body 流：stream.cancel() 也算读过', direct.bodyUsed, true);
      assert('body 流：stream.cancel() 之后读是 done',
             (await bodyOf(direct).getReader().read()).done, true);

      // 有 read 在等的时候 cancel：那个 read 以 done 结束，不是被拒
      const racing = bodyOf(new Response('abc')).getReader();
      const waiting = racing.read();
      await racing.cancel();
      assert('body 流：cancel 时在等的 read 以 done 结束', (await waiting).done, true);
    });

    console.log('  --- body 流：for await ---');
    await group('for await', async () => {
      const res = new Response('abc');
      const stream = bodyOf(res);
      /** @type {string[]} */
      const seen = [];
      for await (const chunk of stream) seen.push(ascii(chunk));
      assert('body 流：for await 拿到每一块', seen.join('|'), 'abc');
      assert('body 流：for await 走完之后不再 locked', stream.locked, false);
      assert('body 流：for await 走完之后 bodyUsed', res.bodyUsed, true);

      // 循环期间是锁住的
      const during = bodyOf(new Response('abc'));
      let lockedInside = false;
      for await (const chunk of during) { void chunk; lockedInside = during.locked; }
      assert('body 流：for await 期间是 locked', lockedInside, true);

      // 手动用迭代器
      const manual = bodyOf(new Response('abc'));
      const it = manual.values();
      assert('body 流：values() 一调用就锁住', manual.locked, true);
      const step = await it.next();
      assert('body 流：迭代器的 next 给出一块', step.done ? '' : ascii(step.value), 'abc');
      assert('body 流：迭代器到头', (await it.next()).done, true);
      assert('body 流：迭代器到头之后放开了锁', manual.locked, false);

      // 还没 next 就 return：也要把流取消、把锁放开
      const unused = new Response('abc');
      const unusedIt = bodyOf(unused).values();
      const returned = unusedIt.return ? await unusedIt.return('提前走') : { done: false, value: undefined };
      assert('body 流：迭代器 return 的 done', returned.done, true);
      assert('body 流：迭代器 return 把值带回来', returned.value, '提前走');
      assert('body 流：迭代器 return 之后放开了锁', bodyOf(unused).locked, false);
      assert('body 流：迭代器 return 把流取消了（之后读是 done）',
             (await bodyOf(unused).getReader().read()).done, true);
    });
  };

  // =====================================================================
  // 对着本机测试服务的部分
  const origin = TEST_SERVER_ORIGIN;
  // /stats 里的名字每一轮都不一样：服务不随 App 重启，上一轮留下的统计不能算数。
  // 它不进断言的名字
  const run = Date.now().toString(36);

  /**
   * 测试服务对某一次响应的统计。
   * @typedef {{ found: boolean, bytesSent: number, chunksSent: number, blocked: boolean,
   *             finished: boolean, closed: boolean }} ServerStats
   */
  /**
   * @param {string} id
   * @returns {Promise<ServerStats>}
   */
  const stats = async (id) => {
    const res = await within(fetch(origin + '/stats?id=' + id + '-' + run), 5000);
    return res.json();
  };

  /**
   * 等服务端看到这次响应的连接断开。
   * @param {string} id
   * @param {number} ms
   */
  const serverSawClose = async (id, ms) => {
    const t0 = performance.now();
    for (;;) {
      const s = await stats(id);
      if (s.found && s.closed && !s.finished) return true;
      if (performance.now() - t0 > ms) return false;
      await sleep(100);
    }
  };

  const remote = async () => {
    console.log('  --- body 流：一块一块到 ---');
    await group('分块到达', async () => {
      const t0 = performance.now();
      const res = await within(fetch(origin + '/chunks?count=5&size=1000&interval=150'), 5000);
      assert('body 流：网络响应的 body 是 ReadableStream', res.body instanceof ReadableStream, true);
      assert('body 流：分块传输的响应没有 Content-Length', res.headers.get('content-length'), null);
      const reader = bodyOf(res).getReader();
      /** @type {Uint8Array[]} */
      const chunks = [];
      /** @type {number[]} */
      const times = [];
      for (;;) {
        const { done, value } = await within(reader.read(), 5000);
        if (done) break;
        chunks.push(value);
        times.push(performance.now() - t0);
      }
      const all = concat(chunks);
      const spread = times.length > 0 ? times[times.length - 1] - times[0] : 0;
      console.log('    收到 ' + chunks.length + ' 块，大小 ' + chunks.map((c) => c.byteLength).join('/') +
                  '，到达时刻 ' + times.map((t) => Math.round(t)).join('/') + ' ms');
      assert('body 流：总共 5000 字节', all.byteLength, 5000);
      assert('body 流：内容和顺序对得上', firstMismatch(all, 1000), -1);
      assert('body 流：每一块都不是空的', chunks.every((c) => c.byteLength > 0), true);
      assert('body 流：不是攒到最后一次给的（至少分两次）', chunks.length >= 2, true);
      // 服务端首尾相隔 600 ms。下完才给的话，这个差接近 0
      assert('body 流：第一块比最后一块早到 300 ms 以上', spread >= 300, true);
      assert('body 流：读到头之后 closed 兑现', await outcome(() => within(reader.closed, 2000)), undefined);
      assert('body 流：读到头之后 bodyUsed', res.bodyUsed, true);
    });

    await group('带 Content-Length，自己算进度', async () => {
      const res = await within(fetch(origin + '/chunks?count=4&size=2000&interval=50&length=1'), 5000);
      const total = Number(res.headers.get('content-length'));
      assert('body 流：带 Content-Length 的响应读得到它', total, 8000);
      let received = 0;
      /** @type {number[]} */
      const progress = [];
      for await (const chunk of bodyOf(res)) {
        received += chunk.byteLength;
        progress.push(received / total);
      }
      console.log('    进度：' + progress.map((p) => Math.round(p * 100) + '%').join(' → '));
      assert('body 流：已读字节数加起来等于 Content-Length', received, 8000);
      assert('body 流：进度是递增的', progress.every((p, i) => i === 0 || p > progress[i - 1]), true);
      assert('body 流：进度最后到 1', progress[progress.length - 1], 1);
    });

    console.log('  --- body 流：fetch() 什么时候兑现 ---');
    // 系统的网络库要等到响应内容的第一个字节才把响应头交上来，所以服务端
    // 「先发头、过一阵才发内容」时，fetch() 是在第一块内容到的时候才兑现的，
    // 不是响应头到的时候。iOS 27.2 模拟器上量到的是 708 ms / 708 ms（服务端
    // 头发出 700 ms 后才发内容）；macOS 上用原生探针量过同样的结果。
    //
    // 所以这里**不断言** fetch() 早于内容：断言的是确定成立的那一半，两个时刻
    // 打在日志里。下面几种情况（换类型、带长度、先发一个字节）同样只打日志，
    // 行首是「[量]」，给以后对照用
    /**
     * 发一个请求，量 fetch() 兑现和每一块到达的时刻（毫秒，从发请求算起）。
     * @param {string} label
     * @param {string} query
     */
    const timing = async (label, query) => {
      const t0 = performance.now();
      const res = await within(fetch(origin + '/chunks?' + query), 5000);
      const settledAt = performance.now() - t0;
      /** @type {Uint8Array[]} */
      const chunks = [];
      /** @type {number[]} */
      const times = [];
      const reader = bodyOf(res).getReader();
      for (;;) {
        const { done, value } = await within(reader.read(), 5000);
        if (done) break;
        chunks.push(value);
        times.push(performance.now() - t0);
      }
      // 类型打出来：测试服务是旧版本的话不认 type 参数，这一行量的就不是它写的那种情况
      console.log('    [量] ' + label + '（' + res.headers.get('content-type') +
                  (res.headers.get('x-content-type-options') === null ? '，允许猜类型' : '') +
                  '）：fetch() 兑现 ' + Math.round(settledAt) + ' ms，各块 ' +
                  times.map((t, i) => chunks[i].byteLength + ' 字节@' + Math.round(t) + ' ms').join('、'));
      return { settledAt, chunks, times };
    };
    await group('fetch() 什么时候兑现', async () => {
      // 响应头立刻发出，700 ms 之后才有内容
      const late = await timing('头发出 700 ms 后才有内容', 'count=1&size=10&delay=700');
      assert('body 流：fetch() 兑现不晚于第一块内容到达', late.settledAt <= late.times[0], true);
      assert('body 流：内容没到时 read 一直等着', late.times[0] >= 600, true);
      assert('body 流：等到的那一块', ascii(concat(late.chunks)), 'aaaaaaaaaa');
      assert('body 流：只来了这一块', late.chunks.length, 1);

      // 先发 1 个字节，700 ms 之后再发 1 个
      const early = await timing('先发 1 字节，700 ms 后再发 1 字节', 'count=2&size=1&interval=700');
      assert('body 流：先发的 1 个字节和后发的都读得到', ascii(concat(early.chunks)), 'ab');
      assert('body 流：后发的那个字节不会提前到', early.times[early.times.length - 1] >= 600, true);

      // 以下只量不断言
      await timing('头发出 700 ms 后才有内容，带 Content-Length', 'count=1&size=10&delay=700&length=1');
      await timing('头发出 700 ms 后才有内容', 'count=1&size=10&delay=700&type=text/event-stream');
      await timing('先发 1 字节，700 ms 后再发 1 字节', 'count=2&size=1&interval=700&type=text/event-stream');
      await timing('先发 1 字节，700 ms 后再发 1 字节', 'count=2&size=1&interval=700&type=text/plain');
      await timing('先发 1 字节，700 ms 后再发 1 字节', 'count=2&size=1&interval=700&type=text/plain&sniff=1');
      await timing('先发 512 字节，700 ms 后再发 512 字节', 'count=2&size=512&interval=700&type=text/plain&sniff=1');
    });

    console.log('  --- body 流：没有内容的响应、原来的四种读法 ---');
    await group('没有内容的响应', async () => {
      const head = await within(fetch(origin + '/chunks?count=2&size=8&length=1', { method: 'HEAD' }), 5000);
      assert('body 流：HEAD 的响应 body 是 null', head.body, null);
      assert('body 流：HEAD 的响应 Content-Length 照样读得到', head.headers.get('content-length'), '16');
      assert('body 流：HEAD 的响应 text() 是空串', await outcome(() => head.text()), '');
      assert('body 流：HEAD 的响应读了也不算 bodyUsed', head.bodyUsed, false);
      const none = await within(fetch(origin + '/status?code=204'), 5000);
      assert('body 流：204 的 status', none.status, 204);
      assert('body 流：204 的响应 body 是 null', none.body, null);
      assert('body 流：204 的响应 arrayBuffer() 是 0 字节',
             await outcome(async () => (await none.arrayBuffer()).byteLength), 0);
    });

    await group('原来的四种读法', async () => {
      const url = origin + '/chunks?count=3&size=4&interval=30';
      const viaText = await within(fetch(url), 5000);
      assert('body 流：没碰 body 时 text() 照常', await outcome(() => within(viaText.text(), 5000)), 'aaaabbbbcccc');
      assert('body 流：网络响应 text() 之后 body 是锁住的', bodyOf(viaText).locked, true);
      const viaBuffer = await within(fetch(url), 5000);
      void viaBuffer.body;
      assert('body 流：只取过 body 不影响 arrayBuffer()',
             await outcome(async () => (await within(viaBuffer.arrayBuffer(), 5000)).byteLength), 12);
      const viaBlob = await within(fetch(url), 5000);
      assert('body 流：blob() 照常', await outcome(async () => (await within(viaBlob.blob(), 5000)).size), 12);
      // 读了一块之后，四种读法不能再用
      const mixed = await within(fetch(url), 5000);
      const reader = bodyOf(mixed).getReader();
      await within(reader.read(), 5000);
      reader.releaseLock();
      assert('body 流：网络响应读过一块之后 text() 被拒', await outcome(() => mixed.text()), 'rejected: TypeError');
      await bodyOf(mixed).cancel();
    });

    console.log('  --- body 流：按行切服务端推过来的文本 ---');
    await group('按行切', async () => {
      const res = await within(fetch(origin + '/lines?count=4&interval=60'), 5000);
      /** @type {number[]} */
      let rest = [];
      /** @type {{ n: number, text: string }[]} */
      const lines = [];
      let pieces = 0;
      for await (const chunk of bodyOf(res)) {
        pieces++;
        // 服务端故意把每一行切在一个汉字的三个字节中间。所以先按字节找换行，
        // 凑齐一整行再解码
        rest = rest.concat(Array.from(chunk));
        for (let nl = rest.indexOf(10); nl >= 0; nl = rest.indexOf(10)) {
          const line = new Uint8Array(rest.slice(0, nl));
          rest = rest.slice(nl + 1);
          lines.push(JSON.parse(await new Blob([line]).text()));
        }
      }
      console.log('    分 ' + pieces + ' 块到，拼出 ' + lines.length + ' 行');
      assert('body 流：拼出四行，顺序对', lines.map((l) => l.n).join(','), '0,1,2,3');
      assert('body 流：切在汉字中间的那一行拼回来是对的', lines.length > 3 ? lines[3].text : '', '第 3 行');
      assert('body 流：最后没有剩下半行', rest.length, 0);
    });

    console.log('  --- body 流：取消 ---');
    await group('读到一半取消', async () => {
      const res = await within(fetch(origin + '/endless?id=cancel-' + run + '&size=1024&interval=20'), 5000);
      const reader = bodyOf(res).getReader();
      const first = await within(reader.read(), 5000);
      assert('body 流：不停发的响应读得到第一块', first.done, false);
      const waiting = reader.read();
      assert('body 流：网络响应 cancel() 兑现成 undefined',
             await outcome(() => within(reader.cancel(), 2000)), undefined);
      // 在等的那个 read：取消之前数据已经到了就是一块，否则以 done 结束。两种都不是被拒
      assert('body 流：cancel 时在等的 read 没有被拒',
             await within(waiting, 2000).then(() => '结算了', (err) => 'rejected: ' + err.name), '结算了');
      assert('body 流：网络响应 cancel 之后 read 是 done', (await within(reader.read(), 2000)).done, true);
      assert('body 流：网络响应 cancel 之后 closed 兑现', await outcome(() => within(reader.closed, 2000)), undefined);
      assert('body 流：cancel 之后服务端看到连接断了（请求真的停了）',
             await serverSawClose('cancel', 5000), true);
    });

    await group('for await 提前 break', async () => {
      const res = await within(fetch(origin + '/endless?id=break-' + run + '&size=1024&interval=20'), 5000);
      let rounds = 0;
      for await (const chunk of bodyOf(res)) {
        void chunk;
        if (++rounds === 2) break;
      }
      assert('body 流：break 之前走了两轮', rounds, 2);
      assert('body 流：break 之后不再 locked', bodyOf(res).locked, false);
      assert('body 流：break 之后再读是 done（流被取消了）',
             (await within(bodyOf(res).getReader().read(), 2000)).done, true);
      assert('body 流：break 之后服务端看到连接断了', await serverSawClose('break', 5000), true);

      // preventCancel：break 只放锁，不取消
      const kept = await within(fetch(origin + '/endless?id=keep-' + run + '&size=1024&interval=20'), 5000);
      for await (const chunk of bodyOf(kept).values({ preventCancel: true })) { void chunk; break; }
      assert('body 流：preventCancel 时 break 之后不再 locked', bodyOf(kept).locked, false);
      const again = bodyOf(kept).getReader();
      assert('body 流：preventCancel 时 break 之后还能接着读',
             (await within(again.read(), 5000)).done, false);
      await again.cancel();
      assert('body 流：最后 cancel 掉，服务端看到连接断了', await serverSawClose('keep', 5000), true);
    });

    console.log('  --- body 流：AbortSignal ---');
    await group('中止', async () => {
      // 两块之间隔 8 秒：第二个 read 一定是在等着的时候被中止的
      const controller = new AbortController();
      const res = await within(fetch(origin + '/chunks?id=abort-' + run + '&count=2&size=10&interval=8000',
                                     { signal: controller.signal }), 5000);
      const reader = bodyOf(res).getReader();
      await within(reader.read(), 5000);
      const waiting = reader.read();
      const closed = reader.closed;
      setTimeout(() => controller.abort(), 100);
      const err = await within(waiting, 3000).then(() => null, (e) => e);
      assert('body 流：中止时在等的 read 被拒', err instanceof Error, true);
      assert('body 流：中止的异常 name 是 AbortError', err instanceof Error ? err.name : '', 'AbortError');
      assert('body 流：中止之后 closed 被拒，也是 AbortError', await outcome(() => within(closed, 2000)),
             'rejected: AbortError');
      assert('body 流：中止之后再 read 还是 AbortError', await outcome(() => within(reader.read(), 2000)),
             'rejected: AbortError');
      assert('body 流：中止之后服务端看到连接断了', await serverSawClose('abort', 5000), true);

      // 中止时没有 read 在等：下一次 read 被拒
      const idle = new AbortController();
      const quiet = await within(fetch(origin + '/endless?size=1024&interval=20', { signal: idle.signal }), 5000);
      const quietReader = bodyOf(quiet).getReader();
      await within(quietReader.read(), 5000);
      idle.abort();
      assert('body 流：中止时没人在等，下一次 read 被拒', await outcome(() => within(quietReader.read(), 2000)),
             'rejected: AbortError');

      // 超时：和 fetch() 一样给 AbortError
      const slow = await within(fetch(origin + '/chunks?count=2&size=10&interval=8000',
                                      { signal: AbortSignal.timeout(600) }), 5000);
      const slowReader = bodyOf(slow).getReader();
      await within(slowReader.read(), 5000);
      assert('body 流：AbortSignal.timeout 到时间，在等的 read 以 AbortError 被拒',
             await outcome(() => within(slowReader.read(), 3000)), 'rejected: AbortError');

      // 内容已经全部到了、只是还没读，这时中止：照 Web，流还能读就让它出错
      const unread = new AbortController();
      const whole = await within(fetch(origin + '/chunks?count=2&size=10', { signal: unread.signal }), 5000);
      await sleep(400);
      unread.abort();
      assert('body 流：内容到齐了但还没读就中止，read 也被拒',
             await outcome(() => within(bodyOf(whole).getReader().read(), 2000)), 'rejected: AbortError');

      // 读完之后再中止：什么都不发生
      const late = new AbortController();
      const done = await within(fetch(origin + '/chunks?count=1&size=4', { signal: late.signal }), 5000);
      const doneReader = bodyOf(done).getReader();
      while (!(await within(doneReader.read(), 5000)).done) { /* 读到头 */ }
      late.abort();
      assert('body 流：读完之后才中止，closed 还是兑现的', await outcome(() => within(doneReader.closed, 2000)),
             undefined);
    });

    console.log('  --- 取消：signal 带在 Request 上 ---');
    await group('Request 的 signal', async () => {
      // 响应头发出 8 秒之后才有内容：这 8 秒里 fetch() 一直没兑现，正好拿来取消
      /** @param {string} id */
      const pendingURL = (id) => origin + '/chunks?id=' + id + '-' + run + '&count=1&size=10&delay=8000';
      /** 还没结果是 'pending'；有结果了是结果本身。
       *  @param {Promise<unknown>} promise
       *  @param {number} ms */
      const stateAfter = (promise, ms) => Promise.race([
        promise.then(() => '兑现了', (err) => 'rejected: ' + (err instanceof Error ? err.name : String(err))),
        sleep(ms).then(() => 'pending'),
      ]);

      const direct = new AbortController();
      const viaRequest = fetch(new Request(pendingURL('reqsig'), { signal: direct.signal }));
      setTimeout(() => direct.abort(), 200);
      assert('Request 上的 signal 中止：fetch(request) 以 AbortError 被拒',
             await outcome(() => within(viaRequest, 3000)), 'rejected: AbortError');
      assert('Request 上的 signal 中止：服务端看到连接断了', await serverSawClose('reqsig', 5000), true);

      const copied = new AbortController();
      const viaCopy = fetch(new Request(new Request(pendingURL('reqcopy'), { signal: copied.signal })));
      setTimeout(() => copied.abort(), 200);
      assert('从 Request 再构造一个：signal 跟过去了，中止照样取消',
             await outcome(() => within(viaCopy, 3000)), 'rejected: AbortError');
      assert('从 Request 再构造一个：服务端看到连接断了', await serverSawClose('reqcopy', 5000), true);

      const cloned = new AbortController();
      const viaClone = fetch(new Request(pendingURL('reqclone'), { signal: cloned.signal }).clone());
      setTimeout(() => cloned.abort(), 200);
      assert('clone() 出来的 Request：中止照样取消',
             await outcome(() => within(viaClone, 3000)), 'rejected: AbortError');
      assert('clone() 出来的 Request：服务端看到连接断了', await serverSawClose('reqclone', 5000), true);

      // 两边都带：听 fetch 第二个参数的，Request 上那个不再管这次请求
      const onRequest = new AbortController();
      const onInit = new AbortController();
      const both = fetch(new Request(pendingURL('reqinit'), { signal: onRequest.signal }),
                         { signal: onInit.signal });
      onRequest.abort();
      assert('两边都带：中止 Request 上的那个，请求不受影响', await stateAfter(both, 500), 'pending');
      onInit.abort();
      assert('两边都带：中止第二个参数里的那个，请求被取消',
             await outcome(() => within(both, 3000)), 'rejected: AbortError');
      assert('两边都带：服务端看到连接断了', await serverSawClose('reqinit', 5000), true);

      // 第二个参数写 null：去掉 Request 上的，之后中止它不影响这次请求
      const removed = new AbortController();
      const unbound = fetch(new Request(origin + '/chunks?count=1&size=4', { signal: removed.signal }),
                            { signal: null });
      removed.abort();
      assert('第二个参数的 signal 写 null：Request 上那个中止了，请求照常完成',
             await outcome(async () => (await within(unbound, 5000)).status), 200);

      assert('已经中止的 signal 带在 Request 上：直接被拒',
             await outcome(() => within(fetch(new Request(origin + '/ping', { signal: AbortSignal.abort() })), 3000)),
             'rejected: AbortError');
      const custom = new Error('stop');
      custom.name = 'Custom';
      assert('已经中止的 signal 带在 Request 上：拒绝的原因是它的 reason',
             await outcome(() => within(fetch(new Request(origin + '/ping', { signal: AbortSignal.abort(custom) })), 3000)),
             'rejected: Custom');

      // 响应已经到了、内容还在路上：和 signal 写在第二个参数里时一样，在等的 read 被拒
      const streaming = new AbortController();
      const res = await within(fetch(new Request(
          origin + '/chunks?id=reqbody-' + run + '&count=2&size=10&interval=8000',
          { signal: streaming.signal })), 5000);
      const reader = bodyOf(res).getReader();
      await within(reader.read(), 5000);
      const waiting = reader.read();
      setTimeout(() => streaming.abort(), 100);
      assert('Request 上的 signal 在读内容时中止：在等的 read 以 AbortError 被拒',
             await outcome(() => within(waiting, 3000)), 'rejected: AbortError');
      assert('Request 上的 signal 在读内容时中止：服务端看到连接断了', await serverSawClose('reqbody', 5000), true);
    });

    console.log('  --- body 流：服务端中途断开 ---');
    /**
     * @param {string} label
     * @param {string} query
     */
    const dropped = async (label, query) => {
      const res = await within(fetch(origin + '/drop?count=5&size=1000&after=2&interval=300' + query), 5000);
      const reader = bodyOf(res).getReader();
      let received = 0;
      /** @type {unknown} */
      let failure = null;
      try {
        for (;;) {
          const { done, value } = await within(reader.read(), 8000);
          if (done) break;
          received += value.byteLength;
        }
      } catch (err) {
        failure = err;
      }
      console.log('    ' + label + '：断开之前读到 ' + received + ' 字节，异常：' +
                  (failure instanceof Error ? failure.name + ': ' + failure.message : String(failure)));
      assert('body 流：' + label + '，read 以 TypeError 被拒', failure instanceof TypeError, true);
      assert('body 流：' + label + '，报错是网络失败那一句',
             failure instanceof Error && failure.message.startsWith('Network request failed'), true);
      assert('body 流：' + label + '，读到的不超过服务端发出的', received <= 2000, true);
      assert('body 流：' + label + '，closed 也以 TypeError 被拒',
             await outcome(() => within(reader.closed, 2000)), 'rejected: TypeError');
    };
    await group('服务端中途断开（带 Content-Length）', () => dropped('带 Content-Length 的响应没发完就断', '&length=1'));
    await group('服务端中途断开（分块传输，连接被重置）',
                () => dropped('分块传输的响应中途连接被重置', '&reset=1'));
    await group('服务端中途断开（分块传输，正常关闭）', async () => {
      // 没有 Content-Length、对端又是正常关闭连接的：系统的网络库把它当成
      // 「发完了」，不报错（macOS 上用原生探针量过）。所以这种截断流这一层
      // 发现不了，读到的就是断开之前的那一截，然后正常结束
      const res = await within(fetch(origin + '/drop?count=5&size=1000&after=2&interval=300'), 5000);
      const reader = bodyOf(res).getReader();
      let received = 0;
      let ending = 'done';
      try {
        for (;;) {
          const { done, value } = await within(reader.read(), 8000);
          if (done) break;
          received += value.byteLength;
        }
      } catch (err) {
        ending = 'rejected: ' + (err instanceof Error ? err.name : String(err));
      }
      assert('body 流：分块传输被对端正常关闭截断，读到断开之前的 2000 字节', received, 2000);
      assert('body 流：这种截断系统不报错，流正常结束', ending, 'done');
    });

    console.log('  --- body 流：背压 ---');
    await group('背压', async () => {
      // 服务端每 5 ms 发 64 KB（约 13 MB/s），读一块之后停下不读。
      // 背压起作用的话，服务端发出一截之后会被挡住；不起作用的话它会一直发，
      // 这里最多看 6 秒
      const res = await within(fetch(origin + '/endless?id=bp-' + run + '&size=65536&interval=5'), 5000);
      const reader = bodyOf(res).getReader();
      const first = await within(reader.read(), 5000);

      let last = -1;
      /** @type {null | number} */
      let stalledAt = null;
      const t0 = performance.now();
      while (performance.now() - t0 < 6000) {
        await sleep(300);
        const s = await stats('bp');
        if (s.bytesSent === last && s.blocked) { stalledAt = s.bytesSent; break; }
        last = s.bytesSent;
      }
      console.log('    不读的时候，服务端发出 ' + (stalledAt === null ? last : stalledAt) +
                  ' 字节' + (stalledAt === null ? '，6 秒里一直在发' : '之后停住'));
      assert('body 流：读得慢时服务端被挡住（请求被暂停了）', stalledAt !== null, true);

      // 接着读：服务端又能发了，而且是接着传的，不是从头再来。
      // /endless 的第 i 块（64 KB）每个字节都是 'a' + i % 26，所以按总偏移就能
      // 算出每个字节该是什么。逐字节比太慢，每 1024 字节抽一个
      let offset = first.value ? first.value.byteLength : 0;
      let drained = 0;
      let largest = 0;
      let mismatchAt = -1;
      const t1 = performance.now();
      while (drained < 8 << 20 && performance.now() - t1 < 5000) {
        const { done, value } = await within(reader.read(), 5000);
        if (done) break;
        for (let k = 0; k < value.byteLength && mismatchAt < 0; k += 1024) {
          if (value[k] !== 97 + (Math.floor((offset + k) / 65536) % 26)) mismatchAt = offset + k;
        }
        offset += value.byteLength;
        drained += value.byteLength;
        largest = Math.max(largest, value.byteLength);
      }
      const after = await stats('bp');
      console.log('    接着读了 ' + drained + ' 字节（最大的一块 ' + largest + '），服务端发到 ' + after.bytesSent);
      assert('body 流：接着读，请求继续（服务端又发了新的）',
             stalledAt !== null && after.bytesSent > stalledAt, true);
      assert('body 流：暂停之后接着读到了 8 MB', drained >= 8 << 20, true);
      assert('body 流：暂停前后的内容是连着的（不是从头再传）', mismatchAt, -1);
      await reader.cancel();
      assert('body 流：背压那个请求取消之后服务端看到连接断了', await serverSawClose('bp', 5000), true);
    });

    console.log('  --- body 流：没人拿着之后 ---');
    await group('读到一半丢掉', async () => {
      // 读一块，然后把 Response、流、读取器全丢掉。它们被回收之后请求要停掉
      await (async () => {
        const res = await within(fetch(origin + '/endless?id=gc-' + run + '&size=1024&interval=50'), 5000);
        const reader = bodyOf(res).getReader();
        await within(reader.read(), 5000);
      })();
      const before = await stats('gc');
      const ran = await collectGarbage();
      if (!ran) {
        console.log('  ! body 流：对照组没被回收，GC 没跑到，「丢掉的流会把请求停掉」未验证');
        return;
      }
      assert('body 流：丢掉之前请求还在跑', before.found && !before.closed, true);
      assert('body 流：流没读完就没人拿着了，回收之后请求被停掉', await serverSawClose('gc', 5000), true);
    });

    await group('读取期间丢掉 Response', async () => {
      // 响应头立刻到，内容 6 秒之后才来。read() 返回的 Promise 不拿着 Response，
      // 这 6 秒里 Response、流、读取器都没人拿着：它们被回收了，这个 read 也得照常结算
      const t0 = performance.now();
      let state = 'pending';
      let size = -1;
      fetch(origin + '/chunks?count=1&size=10&delay=6000')
        .then((res) => bodyOf(res).getReader().read())
        .then((result) => { state = 'fulfilled'; size = result.value ? result.value.byteLength : -1; },
              (err) => { state = 'rejected: ' + (err instanceof Error ? err.name : String(err)); });
      const ran = await collectGarbage(5000);
      const collectedAt = Math.round(performance.now() - t0);
      const pendingWhenCollected = state === 'pending';
      for (let i = 0; i < 100 && state === 'pending'; i++) await sleep(100);
      if (!ran || !pendingWhenCollected) {
        console.log('  ! body 流：GC 没赶在内容到达之前（' + collectedAt + ' ms，' + state +
                    '），「读取期间丢掉 Response」未验证');
        return;
      }
      console.log('    对照组在 ' + collectedAt + ' ms 被回收，read 在 ' +
                  Math.round(performance.now() - t0) + ' ms 结算');
      assert('body 流：读取期间丢掉 Response，read 照常结算', state, 'fulfilled');
      assert('body 流：读取期间丢掉 Response，内容完整', size, 10);
    });
  };

  return (async () => {
    await local();

    // 探活。连不上有三种可能，这里分不出来，都写在提示里
    let up = false;
    try {
      const ping = await within(fetch(origin + '/ping'), 3000);
      const info = await within(ping.json(), 3000);
      up = info !== null && info.server === 'nacre-acceptance-test-server';
    } catch (err) {
      console.log('    连 ' + origin + '/ping：' + (err instanceof Error ? err.message : String(err)));
    }
    if (!up) {
      console.log('  ! body 流：本机的测试服务没连上，依赖它的部分（分块到达、取消、中止、断开、背压、回收）未验证。' +
                  '先在 Mac 上运行 node acceptance/scripts/test-server.mjs；真机上 127.0.0.1 是手机自己，连不上是预期的');
      return;
    }
    await remote();
  })();
}
