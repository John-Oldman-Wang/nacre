import { customEventWorks } from '../support.js';
// 原生模块：application.nativeModules。
//
// 被调的是示例模块 @nacrejs/example-module——用 Swift 写的，只用运行时公开的头
// （ios/Capabilities/ExampleModule/ExampleModule.swift）。它登记的名字是
// 'example'：一组把值原样交回来的方法、故意报错的、在后台线程上兑现的、发事件的。
//
// 这一步盯四件事：
//   - JS 这一侧的每个成员，和每一种用错的情况（都该是 TypeError，而且在过桥之前）
//   - 每一种值来回一遍：null、布尔、数、字符串、数组、对象、二进制
//   - 异步：成功、失败、在后台线程上调回调、回调调了两次、一次都没调
//   - 事件：延后一轮到、带的数据、先后、从后台线程发、摘掉之后不再到
import { echoLater, moduleName, onTick, sha256 } from '@nacrejs/example-module';

/** 抛了就把抛出来的东西交回来，没抛给 null @param {() => unknown} fn */
const thrown = (fn) => {
  try { fn(); } catch (err) { return err; }
  return null;
};

/** Promise 被拒绝就把原因交回来，兑现了给 null @param {Promise<unknown>} promise */
const rejection = (promise) => promise.then(() => null, (err) => err);

/** 字节写成十六进制 @param {unknown} buffer */
const hex = (buffer) => (buffer instanceof ArrayBuffer
  ? Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')
  : '（不是 ArrayBuffer）');

/** 字节写成逗号隔开的十进制 @param {unknown} buffer */
const bytes = (buffer) => (buffer instanceof ArrayBuffer
  ? Array.from(new Uint8Array(buffer)).join(',')
  : '（不是 ArrayBuffer）');

// 对象成员的先后过桥之后不保证（原生那边是不保证顺序的字典），所以比内容时
// 先把键排好再写成文本
/** @param {unknown} value @returns {string} */
const canon = (value) => JSON.stringify(value, (key, v) => {
  if (v instanceof ArrayBuffer) return 'bytes:' + bytes(v);
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    /** @type {Record<string, unknown>} */
    const sorted = {};
    for (const k of Object.keys(v).sort()) sorted[k] = v[k];
    return sorted;
  }
  return v;
});

/** 等一个条件成立，每 10 毫秒看一次 @param {() => boolean} ready @param {number} limitMs */
const until = (ready, limitMs) => new Promise((resolve) => {
  const t0 = Date.now();
  const tick = () => {
    if (ready()) { resolve(true); return; }
    if (Date.now() - t0 > limitMs) { resolve(false); return; }
    setTimeout(tick, 10);
  };
  tick();
});

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/** @param {import("../main.js").StepContext} ctx */
export function stepNativeModules(ctx) {
  const assert = (/** @type {string} */ label, /** @type {unknown} */ actual,
                  /** @type {unknown} */ expected) =>
    ctx.assert('原生模块 ' + label, actual, expected);
  ctx.section('原生模块：application.nativeModules（没有界面，看日志）', 8);
  console.log('  --- 原生模块：入口 ---');

  // ===================================================================
  // 1. 入口：application.nativeModules
  const modules = application.nativeModules;
  assert('application 上有 nativeModules', 'nativeModules' in application, true);
  assert('每次读是同一个对象', application.nativeModules === modules, true);
  assert('它是 NativeModules', modules instanceof NativeModules, true);
  {
    const d = Object.getOwnPropertyDescriptor(Application.prototype, 'nativeModules');
    assert('nativeModules 是原型上的取值器', typeof (d && d.get), 'function');
    assert('nativeModules 没有 setter', d && d.set, undefined);
    assert('nativeModules 不可枚举', d && d.enumerable, false);
  }
  // @ts-expect-error 不能 new
  assert('new NativeModules() 抛 TypeError', thrown(() => new NativeModules()) instanceof TypeError, true);
  // @ts-expect-error 不能 new
  assert('new NativeModule() 抛 TypeError', thrown(() => new NativeModule()) instanceof TypeError, true);

  const names = modules.names;
  assert('names 是数组', Array.isArray(names), true);
  assert('names 是冻结的', Object.isFrozen(names), true);
  assert('names 里有示例模块', names.includes('example'), true);
  assert('names 按名字排好了', names.join('\n'), names.slice().sort().join('\n'));
  assert('示例包导出的名字就是登记的名字', moduleName, 'example');
  // 示例模块的 provider 交了两个都叫 example 的模块：后一个登记不上
  assert('同一个名字只登记上一个', names.filter((name) => name === 'example').length, 1);

  assert('has：登记过的名字', modules.has('example'), true);
  assert('has：没登记过的名字', modules.has('nope'), false);
  // @ts-expect-error 名字要是字符串
  assert('has：不是字符串的名字按字符串看', modules.has(5), false);

  const mod = modules.get('example');
  assert('get 给的是 NativeModule', mod instanceof NativeModule, true);
  assert('它也是 EventTarget', mod instanceof EventTarget, true);
  assert('同一个名字每次给同一个对象', modules.get('example') === mod, true);
  {
    const err = thrown(() => modules.get('nope'));
    assert('get 没登记过的名字：抛 TypeError', err instanceof TypeError, true);
    assert('报错里点了要的名字', String(err && err.message).includes('nope'), true);
    assert('报错里列了登记过的名字', String(err && err.message).includes('example'), true);
  }

  // ===================================================================
  // 2. 模块对象
  console.log('  --- 原生模块：模块对象 ---');
  assert('name', mod.name, 'example');
  assert('methods.sync 是冻结的数组',
         Array.isArray(mod.methods.sync) && Object.isFrozen(mod.methods.sync), true);
  assert('methods.async 是冻结的数组',
         Array.isArray(mod.methods.async) && Object.isFrozen(mod.methods.async), true);
  assert('methods 本身是冻结的', Object.isFrozen(mod.methods), true);
  assert('methods 每次读是同一个对象', mod.methods === mod.methods, true);
  assert('methods.sync 的内容', mod.methods.sync.join(','),
         'add,argumentCount,bytes,cachedByte,echo,echoAll,emit,emitUnsupported,fail,failWithNSError,' +
         'isMainThread,nonFinite,sha256,simulateDragEnd,simulateGestureAsk,simulateMarkedText,simulateMemoryWarning,simulateTextViewAsk,typeOf,unsupported');
  assert('methods.async 的内容', mod.methods.async.join(','),
         'bytesAsync,cachedBytesAsync,drop,echoAsync,echoLater,emitLater,failLater,nestedBytesAsync,' +
         'resolveThenReject,settleTwice,simulateSheetSwipeDown,threads,unsupportedAsync');
  assert('同名的第二个模块没有盖掉先登记的', mod.methods.sync.includes('shadow'), false);
  assert('events 的内容', mod.events.join(','), 'data,tick');
  assert('events 是冻结的', Object.isFrozen(mod.events), true);
  // @ts-expect-error name 只读
  assert('写 name 抛 TypeError', thrown(() => { mod.name = 'other'; }) instanceof TypeError, true);
  // @ts-expect-error methods 只读
  assert('写 methods 抛 TypeError', thrown(() => { mod.methods = null; }) instanceof TypeError, true);

  // ===================================================================
  // 3. 值来回一遍（同步方法 echo 把第一个参数原样交回来）
  console.log('  --- 原生模块：值的往返 ---');
  assert('echo(null)', mod.call('echo', null), null);
  assert('echo(true)', mod.call('echo', true), true);
  assert('echo(false)', mod.call('echo', false), false);
  assert('echo(0)', mod.call('echo', 0), 0);
  assert('echo(1)', mod.call('echo', 1), 1);
  assert('echo(-1.5)', mod.call('echo', -1.5), -1.5);
  assert('echo(最大的安全整数)', mod.call('echo', Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  assert('echo(1e21)', mod.call('echo', 1e21), 1e21);
  assert('echo(0.1 + 0.2)：双精度不走样', mod.call('echo', 0.1 + 0.2), 0.1 + 0.2);
  assert('echo(字符串)', mod.call('echo', 'text'), 'text');
  assert('echo(空串)', mod.call('echo', ''), '');
  assert('echo(中文和表情)', mod.call('echo', '中文 😀 "quoted" \\ \n'), '中文 😀 "quoted" \\ \n');
  assert('echo(undefined) 是 null', mod.call('echo', undefined), null);
  assert('echo() 不带参数是 null', mod.call('echo'), null);
  assert('echo(数组)', canon(mod.call('echo', [1, 'a', null, true, [2, [3]]])),
         '[1,"a",null,true,[2,[3]]]');
  assert('echo(空数组)', canon(mod.call('echo', [])), '[]');
  assert('echo(对象)', canon(mod.call('echo', { a: 1, b: 'x', c: null, d: { e: [false] } })),
         '{"a":1,"b":"x","c":null,"d":{"e":[false]}}');
  assert('echo(空对象)', canon(mod.call('echo', {})), '{}');
  assert('对象里值是 undefined 的成员等于没写', canon(mod.call('echo', { a: undefined, b: 1 })), '{"b":1}');
  assert('数组里的 undefined 是 null', canon(mod.call('echo', [1, undefined, 3])), '[1,null,3]');
  assert('没有原型的对象也能传', canon(mod.call('echo', Object.assign(Object.create(null), { k: 1 }))),
         '{"k":1}');
  {
    // 同一个对象出现两次不是环，可以传
    const shared = { v: 1 };
    assert('同一个对象出现两次（不是环）', canon(mod.call('echo', [shared, shared])), '[{"v":1},{"v":1}]');
  }
  assert('echoAll 把全部参数交回来', canon(mod.call('echoAll', 1, 'a', null, [true])), '[1,"a",null,[true]]');
  assert('参数个数：中间的 undefined 占一个位置', mod.call('argumentCount', 1, undefined, 3), 3);
  assert('参数个数：不带参数', mod.call('argumentCount'), 0);
  assert('add(1, 2)', mod.call('add', 1, 2), 3);

  // 原生那边看到的类型。布尔和数要分得清
  assert('原生看到的类型：null', mod.call('typeOf', null), 'null');
  assert('原生看到的类型：true', mod.call('typeOf', true), 'boolean');
  assert('原生看到的类型：false', mod.call('typeOf', false), 'boolean');
  assert('原生看到的类型：1（不是布尔）', mod.call('typeOf', 1), 'number');
  assert('原生看到的类型：0（不是布尔）', mod.call('typeOf', 0), 'number');
  assert('原生看到的类型：1.5', mod.call('typeOf', 1.5), 'number');
  assert('原生看到的类型：字符串', mod.call('typeOf', 'x'), 'string');
  assert('原生看到的类型：数组', mod.call('typeOf', []), 'array');
  assert('原生看到的类型：对象', mod.call('typeOf', {}), 'object');
  assert('原生看到的类型：ArrayBuffer', mod.call('typeOf', new ArrayBuffer(2)), 'bytes');
  assert('原生看到的类型：Uint8Array', mod.call('typeOf', new Uint8Array(2)), 'bytes');
  assert('原生看到的类型：DataView', mod.call('typeOf', new DataView(new ArrayBuffer(2))), 'bytes');

  // ===================================================================
  // 4. 二进制
  console.log('  --- 原生模块：二进制 ---');
  {
    const back = mod.call('echo', new Uint8Array([0, 1, 127, 128, 254, 255]));
    assert('二进制交回来是 ArrayBuffer', back instanceof ArrayBuffer, true);
    assert('字节一个不差', bytes(back), '0,1,127,128,254,255');
  }
  {
    const whole = new Uint8Array([10, 20, 30, 40, 50]);
    assert('视图只传它盖住的那一段', bytes(mod.call('echo', new Uint8Array(whole.buffer, 1, 3))), '20,30,40');
    assert('Uint16Array 按它的字节传', bytes(mod.call('echo', new Uint16Array([0x0201]))), '1,2');
    assert('ArrayBuffer 整个传', bytes(mod.call('echo', whole.buffer)), '10,20,30,40,50');
  }
  {
    const empty = mod.call('echo', new ArrayBuffer(0));
    assert('空的二进制交回来还是 ArrayBuffer', empty instanceof ArrayBuffer, true);
    assert('空的二进制长度是 0', empty instanceof ArrayBuffer ? empty.byteLength : -1, 0);
  }
  assert('二进制可以在数组和对象里面',
         canon(mod.call('echo', { list: [new Uint8Array([1, 2]), 'x'], head: new Uint8Array([3]) })),
         '{"head":"bytes:3","list":["bytes:1,2","x"]}');
  {
    const made = mod.call('bytes', 300);
    assert('原生造的 300 个字节', made instanceof ArrayBuffer ? made.byteLength : -1, 300);
    const view = made instanceof ArrayBuffer ? new Uint8Array(made) : new Uint8Array(300);
    assert('第 255 个字节', view[255], 255);
    assert('第 256 个字节', view[256], 0);
  }
  // 示例包自己的 JS 包了一层：sha256(data)。'abc' 的摘要是公开的测试向量
  assert('sha256("abc")（走示例包的 JS）', hex(sha256(new Uint8Array([97, 98, 99]))),
         'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert('sha256(空)', hex(sha256(new ArrayBuffer(0))),
         'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  // ===================================================================
  // 5. 原生报的错（同步）：抛出来的 Error，带 name、message，可选 code
  console.log('  --- 原生模块：同步方法报错 ---');
  {
    const err = thrown(() => mod.call('fail', 'NotFound', 'no such thing'));
    assert('原生报错：抛出来的是 Error', err instanceof Error, true);
    assert('原生报错：name', err && err.name, 'NotFound');
    assert('原生报错：message', err && err.message, 'no such thing');
    assert('原生报错：没给 code 就没有 code', err !== null && 'code' in err, false);
    assert('原生报错：没给 code 就没有 domain', err !== null && 'domain' in err, false);
  }
  {
    const err = thrown(() => mod.call('fail', 'Busy', 'try later', 42));
    assert('原生报错带 code：name', err && err.name, 'Busy');
    assert('原生报错带 code：code', err && err.code, 42);
  }
  {
    const err = thrown(() => mod.call('fail', 'Zero', 'code zero', 0));
    assert('原生报错：code 给的是 0 也带上', err && err.code, 0);
  }
  {
    const err = thrown(() => mod.call('fail', 'TypeError', 'wrong kind'));
    assert('name 是 TypeError：是真的 TypeError', err instanceof TypeError, true);
    assert('name 是 TypeError：message', err && err.message, 'wrong kind');
  }
  {
    const err = thrown(() => mod.call('fail', 'RangeError', 'too big'));
    assert('name 是 RangeError：是真的 RangeError', err instanceof RangeError, true);
  }
  {
    // 原生直接交一个别处来的 NSError（第三方 SDK 给的那种）
    const err = thrown(() => mod.call('failWithNSError'));
    assert('别处来的 NSError：是 Error', err instanceof Error, true);
    assert('别处来的 NSError：name 是 Error', err && err.name, 'Error');
    assert('别处来的 NSError：message', err && err.message, 'no such file');
    assert('别处来的 NSError：code', err && err.code, 260);
    assert('别处来的 NSError：domain', err && err.domain, 'NSCocoaErrorDomain');
  }
  {
    const err = thrown(() => mod.call('add', 'a', 1));
    assert('模块自己查参数报的错', err instanceof TypeError, true);
    assert('模块自己查参数报的错：message', err && err.message, 'add needs two numbers');
  }
  {
    // 原生交回来一个过不了桥的值（一个日期）：不能悄悄变成别的
    const err = thrown(() => mod.call('unsupported'));
    assert('原生返回了过不了桥的值：抛 TypeError', err instanceof TypeError, true);
    assert('报错里点了是哪个方法', String(err && err.message).includes('unsupported'), true);
  }
  assert('原生返回了 NaN：抛 TypeError', thrown(() => mod.call('nonFinite')) instanceof TypeError, true);
  assert('报错之后模块照常能用', mod.call('echo', 'still works'), 'still works');

  // ===================================================================
  // 6. 用错了：都是 TypeError，而且在过桥之前
  console.log('  --- 原生模块：用错的情况 ---');
  {
    const err = thrown(() => mod.call('nope'));
    assert('调不存在的方法：抛 TypeError', err instanceof TypeError, true);
    assert('报错里点了方法名', String(err && err.message).includes('nope'), true);
    assert('报错里列了有哪些方法', String(err && err.message).includes('echoAll') &&
                                  String(err && err.message).includes('echoLater'), true);
  }
  {
    const err = thrown(() => mod.call('echoLater', 1, 0));
    assert('用 call 调异步方法：抛 TypeError', err instanceof TypeError, true);
    assert('报错里说该用 callAsync', String(err && err.message).includes('callAsync'), true);
  }
  {
    const err = thrown(() => mod.callAsync('echo', 1));
    assert('用 callAsync 调同步方法：当场抛 TypeError', err instanceof TypeError, true);
    assert('报错里说该用 call', /\bcall\(/.test(String(err && err.message)), true);
  }
  assert('callAsync 调不存在的方法：当场抛 TypeError',
         thrown(() => mod.callAsync('nope')) instanceof TypeError, true);
  // @ts-expect-error 方法名必填
  assert('call 不给方法名：抛 TypeError', thrown(() => mod.call()) instanceof TypeError, true);
  {
    const { call } = mod;
    assert('把 call 摘下来调：抛 TypeError', thrown(() => call('echo', 1)) instanceof TypeError, true);
  }

  // 参数里有传不过去的值。类型定义先拦一道（前两条），其余的走 any 直接看运行时
  // @ts-expect-error 函数不能传
  assert('参数是函数：抛 TypeError', thrown(() => mod.call('echo', () => 1)) instanceof TypeError, true);
  // @ts-expect-error 原生对象不能传
  assert('参数是原生对象：抛 TypeError', thrown(() => mod.call('echo', application.storage)) instanceof TypeError, true);
  /** @type {[string, any][]} */
  const unsupported = [
    ['NaN', NaN],
    ['正无穷', Infinity],
    ['负无穷', -Infinity],
    ['BigInt', 10n],
    ['Symbol', Symbol('s')],
    ['Date', new Date(0)],
    ['Map', new Map()],
    ['Set', new Set()],
    ['正则', /x/],
    ['类的实例', new (class Point { constructor() { this.x = 1; } })()],
    ['Error', new Error('e')],
    ['Promise', Promise.resolve(1)],
    ['Blob', new Blob(['x'])],
    ['模块对象自己', mod],
    ['落单的代理项', 'a\ud800b'],
    ['对象里面的函数', { a: { b: [1, () => 1] } }],
    ['数组里面的 NaN', [1, [NaN]]],
    ['键是落单的代理项', { '\udc00': 1 }],
  ];
  for (const [what, value] of unsupported) {
    assert('参数是' + what + '：抛 TypeError', thrown(() => mod.call('echo', value)) instanceof TypeError, true);
  }
  {
    /** @type {any} */
    const loop = { name: 'loop' };
    loop.self = loop;
    assert('参数是带环的对象：抛 TypeError', thrown(() => mod.call('echo', loop)) instanceof TypeError, true);
    /** @type {any[]} */
    const ring = [1];
    ring.push([ring]);
    assert('参数是带环的数组：抛 TypeError', thrown(() => mod.call('echo', ring)) instanceof TypeError, true);
  }
  {
    const err = thrown(() => mod.call('echo', /** @type {any} */ ({ list: [1, { fn() {} }] })));
    assert('报错里说了是哪个参数的哪个位置', String(err && err.message).includes('list[1].fn'), true);
  }
  assert('异步方法的参数也一样查：当场抛 TypeError',
         thrown(() => mod.callAsync('echoAsync', /** @type {any} */ (() => 1))) instanceof TypeError, true);
  assert('用错之后模块照常能用', mod.call('echo', 7), 7);

  // ===================================================================
  // 7. 线程：处理函数在主线程上被调
  assert('同步方法在主线程上执行', mod.call('isMainThread'), true);

  // ===================================================================
  // 8. 事件里用错的情况（同步的部分）
  console.log('  --- 原生模块：事件 ---');
  {
    // 没声明的事件名不拒绝，当自定义事件（和浏览器里的 EventTarget 一样）
    assert('监听没声明的事件：当自定义事件', customEventWorks(mod, 'nope'), '收到一次');
    assert('监听 @ 开头的名字：抛 TypeError', thrown(() => mod.addEventListener('@x', () => {})) instanceof TypeError, true);
    assert('再来一遍没声明的事件：还是当自定义事件', customEventWorks(mod, 'nope'), '收到一次');
  }
  assert('发一个没声明的事件：原生那边丢掉，调用本身不报错', mod.call('emit', 'undeclared', 1), null);

  // 下面是异步的部分。整步「做完了」作为 Promise 交出去
  return asyncPart(mod, assert).catch((err) => {
    assert('异步的部分中途抛了: ' + (err instanceof Error ? err.message : String(err)), false, true);
  });
}

/**
 * @param {NativeModule} mod
 * @param {(label: string, actual: unknown, expected: unknown) => void} assert
 */
async function asyncPart(mod, assert) {
  // ===================================================================
  // 9. 事件：延后一轮到、带的数据、先后
  /** @type {NativeModuleEvent[]} */
  const ticks = [];
  const onTickEvent = (/** @type {NativeModuleEvent} */ e) => { ticks.push(e); };
  mod.addEventListener('tick', onTickEvent);
  mod.call('emit', 'tick', { n: 1, data: new Uint8Array([7, 8]), list: [true, null] });
  assert('事件不是当场到的（延后一轮）', ticks.length, 0);
  assert('事件到了', await until(() => ticks.length === 1, 3000), true);
  if (ticks.length === 1) {
    const e = ticks[0];
    const detail = /** @type {any} */ (e.detail);
    assert('事件对象是 Event', e instanceof Event, true);
    assert('事件的 type', e.type, 'tick');
    assert('事件的 target 是模块对象', e.target === mod, true);
    assert('事件不可取消', e.cancelable, false);
    assert('事件带的数据', canon(detail), '{"data":"bytes:7,8","list":[true,null],"n":1}');
    assert('事件里的二进制是 ArrayBuffer', detail.data instanceof ArrayBuffer, true);
  }
  ticks.length = 0;
  mod.call('emit', 'tick');
  await until(() => ticks.length === 1, 3000);
  assert('事件没带数据：detail 是 null', ticks.length === 1 ? ticks[0].detail : '（没到）', null);

  ticks.length = 0;
  mod.call('emit', 'tick', 1);
  mod.call('emit', 'tick', 2);
  mod.call('emit', 'tick', 3);
  await until(() => ticks.length === 3, 3000);
  assert('连发三个事件：按发的先后到', ticks.map((e) => e.detail).join(','), '1,2,3');

  // 另一个事件名不串
  /** @type {unknown[]} */
  const datas = [];
  const onData = (/** @type {NativeModuleEvent} */ e) => { datas.push(e.detail); };
  mod.addEventListener('data', onData);
  ticks.length = 0;
  mod.call('emit', 'data', 'only-data');
  await until(() => datas.length === 1, 3000);
  assert('data 事件到了 data 的监听器', datas.join(','), 'only-data');
  assert('tick 的监听器没收到 data', ticks.length, 0);

  // 从后台线程发
  datas.length = 0;
  await mod.callAsync('emitLater', 'data', { from: 'background' }, 20);
  await until(() => datas.length === 1, 3000);
  assert('后台线程发的事件到了', canon(datas[0]), '{"from":"background"}');

  // 原生给了一份过不了桥的数据：这个事件被丢掉（原生那边打一条警告）
  datas.length = 0;
  mod.call('emitUnsupported', 'data');
  mod.call('emit', 'data', 'after-unsupported');
  await until(() => datas.length >= 1, 3000);
  await wait(50);
  assert('数据过不了桥的事件被丢掉，后面的照常到', datas.join(','), 'after-unsupported');

  // 摘掉之后不再到
  mod.removeEventListener('data', onData);
  datas.length = 0;
  ticks.length = 0;
  mod.call('emit', 'data', 'nobody');
  mod.call('emit', 'tick', 'marker');
  await until(() => ticks.length === 1, 3000);
  assert('摘掉监听器之后不再收到', datas.length, 0);
  // 没人听的时候发的事件不会攒着
  mod.addEventListener('data', onData);
  await wait(50);
  assert('没人听的时候发的事件不补发', datas.length, 0);
  mod.removeEventListener('data', onData);
  mod.removeEventListener('tick', onTickEvent);

  // 示例包自己的 JS 包的那一层：onTick 返回「不再听」
  {
    /** @type {unknown[]} */
    const got = [];
    const stop = onTick((detail) => { got.push(detail); });
    mod.call('emit', 'tick', 'via-package');
    await until(() => got.length === 1, 3000);
    assert('示例包的 onTick 收到了', got.join(','), 'via-package');
    stop();
    mod.call('emit', 'tick', 'after-stop');
    await wait(100);
    assert('示例包的 onTick 停了之后不再收到', got.join(','), 'via-package');
  }

  // 纯 JS 的派发照常能用（它是 EventTarget）
  {
    let seen = 0;
    const local = () => { seen++; };
    mod.addEventListener('tick', local);
    mod.dispatchEvent(new Event('tick'));
    mod.removeEventListener('tick', local);
    assert('JS 自己 dispatchEvent 也收得到', seen, 1);
  }

  // ===================================================================
  // 10. 异步方法
  console.log('  --- 原生模块：异步方法 ---');
  {
    const pending = mod.callAsync('echoAsync', 'now');
    assert('callAsync 返回 Promise', pending instanceof Promise, true);
    let settled = false;
    pending.then(() => { settled = true; });
    await Promise.resolve();
    assert('原生当场兑现的，JS 这边也不是当场拿到', settled, false);
    assert('异步：兑现的值', await pending, 'now');
  }
  assert('异步：各种值来回一遍',
         canon(await mod.callAsync('echoAsync', [null, true, 1.5, 'x', { k: [new Uint8Array([9])] }])),
         '[null,true,1.5,"x",{"k":["bytes:9"]}]');
  assert('异步：不带参数是 null', await mod.callAsync('echoAsync'), null);
  {
    // 原生在后台线程上等 30 毫秒再兑现（走示例包的 JS）
    let early = true;
    const pending = echoLater('later', 30).then((value) => { early = false; return value; });
    await wait(0);
    assert('后台线程上还没兑现时，JS 照常往下跑', early, true);
    assert('后台线程上兑现的值', await pending, 'later');
  }
  {
    const info = /** @type {any} */ (await mod.callAsync('threads'));
    assert('异步方法的处理函数在主线程上被调', info.handlerOnMain, true);
    assert('它是在后台线程上兑现的', info.settledOnMain, false);
  }
  {
    const big = await mod.callAsync('bytesAsync', 4096);
    assert('异步：直接交回二进制是 ArrayBuffer', big instanceof ArrayBuffer, true);
    assert('异步：二进制的长度', big instanceof ArrayBuffer ? big.byteLength : -1, 4096);
    const view = big instanceof ArrayBuffer ? new Uint8Array(big) : new Uint8Array(4096);
    assert('异步：二进制的内容', view[1] + ',' + view[255] + ',' + view[256] + ',' + view[4095], '1,255,0,255');
    const none = await mod.callAsync('bytesAsync', 0);
    assert('异步：空的二进制', none instanceof ArrayBuffer ? none.byteLength : -1, 0);
  }
  {
    // 模块两次交回它自己留着的同一份数据（原生那边是同一个不可变的 NSData）。
    // JS 拿到的 ArrayBuffer 是可写的，所以每次都得是独立的一份：改了它，
    // 模块留着的那份和下一次交回来的都不能跟着变
    const first = await mod.callAsync('cachedBytesAsync');
    assert('异步：模块留着的数据交回来是 ArrayBuffer', first instanceof ArrayBuffer, true);
    const firstView = new Uint8Array(first instanceof ArrayBuffer ? first : new ArrayBuffer(64));
    assert('异步：模块留着的数据的内容', firstView.length + ':' + firstView[0] + ',' + firstView[63], '64:0,63');
    firstView[0] = 200;
    firstView[63] = 201;
    assert('改了交回来的缓冲区：模块留着的那份没变',
           mod.call('cachedByte', 0) + ',' + mod.call('cachedByte', 63), '0,63');
    const second = await mod.callAsync('cachedBytesAsync');
    const secondView = new Uint8Array(second instanceof ArrayBuffer ? second : new ArrayBuffer(64));
    assert('改了第一次交回来的：第二次交回来的不受影响', secondView[0] + ',' + secondView[63], '0,63');
    secondView[1] = 99;
    assert('两次交回来的不是同一块内存', firstView[1], 1);
  }
  assert('异步：二进制在对象和数组里面', canon(await mod.callAsync('nestedBytesAsync')),
         '{"head":"bytes:1,2,3","list":["bytes:4","x"]}');
  {
    const err = await rejection(mod.callAsync('failLater', 'Offline', 'no network', 7));
    assert('异步报错：Promise 被拒绝，原因是 Error', err instanceof Error, true);
    assert('异步报错：name', err && err.name, 'Offline');
    assert('异步报错：message', err && err.message, 'no network');
    assert('异步报错：code', err && err.code, 7);
  }
  {
    const err = await rejection(mod.callAsync('failLater', 'Plain', 'no code'));
    assert('异步报错：没给 code 就没有 code', err !== null && 'code' in err, false);
  }
  assert('异步报错：name 是 TypeError 时是真的 TypeError',
         (await rejection(mod.callAsync('failLater', 'TypeError', 'bad'))) instanceof TypeError, true);
  assert('回调调了两次：第一次算数', await mod.callAsync('settleTwice', 'first', 'second'), 'first');
  assert('先成功再失败：成功算数', await mod.callAsync('resolveThenReject', 'kept'), 'kept');
  {
    // 两个回调一个都没调就丢了：Promise 不会永远挂着
    const err = await Promise.race([
      rejection(mod.callAsync('drop')),
      wait(5000).then(() => 'timeout'),
    ]);
    assert('两个回调都没调就丢了：Promise 被拒绝', err instanceof Error, true);
    assert('报错里说了原因', String(err && err.message).includes('without calling resolve or reject'), true);
  }
  assert('异步交回过不了桥的值：拒绝，TypeError',
         (await rejection(mod.callAsync('unsupportedAsync'))) instanceof TypeError, true);
  {
    // 几个同时在跑的调用各回各的
    const results = await Promise.all([
      mod.callAsync('echoLater', 'a', 40),
      mod.callAsync('echoLater', 'b', 10),
      mod.callAsync('echoAsync', 'c'),
    ]);
    assert('同时在跑的调用各回各的', results.join(','), 'a,b,c');
  }
  assert('全部跑完之后模块照常能用', mod.call('echo', 'done'), 'done');
}
