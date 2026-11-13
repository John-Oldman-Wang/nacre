// 本地存储：application.storage（就是 NSUserDefaults 的 standard 实例）。
//
// 这一段里最要紧的一条是**启动计数器**：它跨进程验「真的落盘了」，
// 是别的断言都替代不了的——同一次运行里写了再读，内存缓存就能满足。

import { assert } from '../support.js';

/**
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string} needle
 */
function throws(label, fn, needle) {
  try {
    fn();
    assert(label, '没抛', '抛 ' + needle);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    assert(label, message.includes(needle) ? needle : message, needle);
  }
}

export function stepStorage() {
  console.log('--- 本地存储 ---');
  const storage = application.storage;

  assert('两次读回来是同一个包装', application.storage === storage, true);
  assert('它是 NSUserDefaults', storage instanceof NSUserDefaults, true);

  // ---- 先清掉上一轮留下的，计数器那条除外 ----
  for (const k of ['s', 'n', 'b', 'arr', 'obj', 'coerce', 'gone', 'watched']) {
    storage.remove(k);
  }

  // ---- registerDefaults：没写过时读到什么 ----
  storage.registerDefaults({ theme: 'auto', pageSize: 20 });
  assert('没写过的键读到注册值', storage.get('theme'), 'auto');
  assert('注册过的键 has 为真', storage.has('theme'), true);
  storage.set('theme', 'dark');
  assert('写过之后盖掉注册值', storage.get('theme'), 'dark');
  storage.remove('theme');
  assert('删掉之后又回到注册值', storage.get('theme'), 'auto');

  // ---- 各种值类型 ----
  storage.set('s', 'hello');
  storage.set('n', 3.5);
  storage.set('b', true);
  storage.set('arr', [1, 'two', false, [3]]);
  storage.set('obj', { a: 1, nested: { b: ['x'] } });
  assert('字符串', storage.get('s'), 'hello');
  assert('数字', storage.get('n'), 3.5);
  assert('布尔', storage.get('b'), true);
  assert('数组', JSON.stringify(storage.get('arr')), '[1,"two",false,[3]]');
  assert('嵌套对象', JSON.stringify(storage.get('obj')), '{"a":1,"nested":{"b":["x"]}}');

  // ---- null 等于删除；has 和 get 对得上 ----
  assert('没有的键 get 给 null', storage.get('gone'), null);
  assert('没有的键 has 为假', storage.has('gone'), false);
  storage.set('gone', 'x');
  assert('写进去之后 has 为真', storage.has('gone'), true);
  storage.set('gone', null);
  assert('写 null 等于删除', storage.get('gone'), null);
  assert('删掉之后 has 为假', storage.has('gone'), false);

  // ---- 存不下的东西当场抛，不静默 ----
  // 不拦的话 JSON.stringify 会把函数和 undefined 悄悄变成 null，
  // 而 null 在这里是「删除」——写错类型会静默删掉一个键
  throws('undefined 抛', () => storage.set('x', /** @type {any} */ (undefined)),
         'value is undefined; pass null to remove the key');
  throws('函数抛', () => storage.set('x', /** @type {any} */ (() => {})),
         'function cannot be stored');
  throws('NaN 抛', () => storage.set('x', NaN), 'NaN and Infinity cannot be stored');
  throws('Infinity 抛', () => storage.set('x', Infinity), 'NaN and Infinity cannot be stored');
  throws('Date 抛（第一版不支持）', () => storage.set('x', /** @type {any} */ (new Date())),
         'only plain objects can be stored, got Date');
  throws('原生对象抛', () => storage.set('x', /** @type {any} */ (UIColor.redColor)),
         'only plain objects can be stored, got UIColor');
  throws('嵌套里的函数也抛',
         () => storage.set('x', /** @type {any} */ ({ a: [1, { b: () => {} }] })),
         'set("x").a[1].b: function cannot be stored');
  throws('嵌套的 null 抛（plist 没有 null）',
         () => storage.set('x', /** @type {any} */ ([1, null])),
         'null cannot be stored');
  const loop = /** @type {any} */ ({});
  loop.self = loop;
  throws('循环结构抛', () => storage.set('x', loop), 'circular structures cannot be stored');
  throws('键不是字符串抛', () => storage.get(/** @type {any} */ (1)), 'key must be a string');
  assert('抛过之后那个键还是空的', storage.has('x'), false);

  // ---- 带类型的取值器会做强制，和 get 行为不同 ----
  storage.set('coerce', '42');
  assert('get 给字符串', storage.get('coerce'), '42');
  assert('integerForKey 强制成数字', storage.integerForKey('coerce'), 42);
  assert('doubleForKey 同样强制', storage.doubleForKey('coerce'), 42);
  // 实测：boolForKey **不做通用真值转换**，字符串 '42' 给 false。
  // 它只认 'YES' / 'true' / '1' 那几种写法和非零数字
  assert('实测：boolForKey 对字符串 "42" 给 false', storage.boolForKey('coerce'), false);
  storage.set('bt', true);
  assert('boolForKey 对真布尔给 true', storage.boolForKey('bt'), true);
  storage.set('bt', '1');
  assert('实测：boolForKey 对字符串 "1" 给', storage.boolForKey('bt'), true);
  storage.set('bt', 'YES');
  assert('实测：boolForKey 对字符串 "YES" 给', storage.boolForKey('bt'), true);
  storage.remove('bt');
  assert('stringForKey 给字符串', storage.stringForKey('coerce'), '42');
  assert('arrayForKey 对非数组给 null', storage.arrayForKey('coerce'), null);
  assert('没有的键 integerForKey 给 0 不是 null',
         storage.integerForKey('没有这个键'), 0);
  assert('没有的键 boolForKey 给 false', storage.boolForKey('没有这个键'), false);
  storage.set('arr', ['a', 'b']);
  assert('stringArrayForKey 全是字符串时给数组',
         JSON.stringify(storage.stringArrayForKey('arr')), '["a","b"]');
  storage.set('arr', ['a', 1]);
  assert('stringArrayForKey 混了非字符串给 null', storage.stringArrayForKey('arr'), null);

  // ---- change 事件 ----
  /** @type {string[]} */
  const changes = [];
  const onChange = (/** @type {Event} */ e) => changes.push(e.type);
  storage.addEventListener('change', onChange);
  storage.set('watched', 1);
  // 原生通知延后一轮派发，所以这里立刻读是读不到的
  assert('事件延后一轮，同步读不到', changes.length, 0);
  // 原生的派发走 dispatch_async(main_queue)，而 setTimeout 走定时器堆，
  // 两者的先后没有保证，所以轮询而不是假设「下一轮一定到」
  let turns = 0;
  const waitChange = () => {
    turns++;
    if (changes.length === 0 && turns < 30) { setTimeout(waitChange, 0); return; }
    assert('change 事件到了', changes[0], 'change');
    console.log('  实测：change 事件在第 ' + turns + ' 轮定时器回调时已到达');
    storage.removeEventListener('change', onChange);
    // 记下摘牌那一刻的条数再比，不能写死 1：这条通知**不按发送者过滤**
    // （过滤了一条都收不到，见 internals/storage.md），所以进程里任何一次
    // UserDefaults 写入都会发一条，而且**每次写一条、不合并**。
    // 真正要验的是「摘牌之后不再增长」，不是「总共几条」。
    const atRemoval = changes.length;
    storage.set('watched', 2);
    let after = 0;
    const waitSilence = () => {
      after++;
      if (after < turns + 3) { setTimeout(waitSilence, 0); return; }
      assert('移除监听之后不再增长', changes.length, atRemoval);
      storage.remove('watched');
    };
    setTimeout(waitSilence, 0);
  };
  setTimeout(waitChange, 0);

  throws('不认识的事件名被拒',
         () => storage.addEventListener('removed', () => {}),
         "'removed' is not a storage event");

  // ---- 启动计数器：跨进程验「真的落盘了」----
  // run-sim.sh 只做 simctl install，不抹 App 容器，所以第二次跑应该看到 2
  const launches = storage.integerForKey('launchCount') + 1;
  storage.set('launchCount', launches);
  console.log('  ✓ 这是第 ' + launches + ' 次启动' +
              (launches > 1 ? '（上一次的值留住了，确实落盘了）'
                            : '（再跑一次 run-sim.sh 应该看到 2）'));
}
