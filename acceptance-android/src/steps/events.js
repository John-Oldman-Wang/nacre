// 拷自 acceptance/src/steps/events.js，去掉了运行时、视图、页面、动画、网页那些事件类（只留 Web 标准的五个），以及用到它们和原生对象的转换断言。
//
// 事件类：一种字段组合是一个类（2026-11-22 定）。
//
// Web 的做法：MouseEvent 有 clientX，KeyboardEvent 没有。所以每个带字段的事件都是
// 一个真的类：能 new（new XxxEvent(type, init)，字段从 init 里取，没给的取默认值），
// 能 instanceof，字段是原型上的只读 getter（系统当场要答案的那一个可写）。
// 这里测每个类本身；原生发出来的事件是不是那个类，在各自的步骤里测。

/** @param {() => unknown} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/**
 * 每个类：名字、父类、一份 init、只读的字段
 * @type {Array<[string, string, Record<string, unknown>, string[]]>}
 */
const CLASSES = [
  // ---- Web 标准（core） ----
  ['CustomEvent', 'Event', { detail: { a: 1 } }, ['detail']],
  ['MessageEvent', 'Event', { data: 'hi', origin: 'wss://example.com', lastEventId: '7' },
    ['data', 'origin', 'lastEventId', 'source', 'ports']],
  ['CloseEvent', 'Event', { code: 1000, reason: 'bye', wasClean: true }, ['code', 'reason', 'wasClean']],
  ['ErrorEvent', 'Event', { message: 'm', filename: 'f.js', lineno: 3, colno: 4, error: null },
    ['message', 'filename', 'lineno', 'colno', 'error']],
  ['PromiseRejectionEvent', 'Event', { reason: 'r', promise: Promise.resolve() }, ['reason', 'promise']],
];

/** @param {import("../main.js").StepContext} ctx */
export function stepEvents(ctx) {
  const { assert } = ctx;
  console.log('--- 事件类 ---');
  const g = /** @type {Record<string, any>} */ (/** @type {unknown} */ (globalThis));

  for (const [name, parentName, init, readonly] of CLASSES) {
    const Cls = g[name];
    assert(name + '：全局上有这个类', typeof Cls, 'function');
    if (typeof Cls !== 'function') continue;
    assert(name + '：父类是 ' + parentName, Object.getPrototypeOf(Cls.prototype), g[parentName].prototype);
    assert(name + '：不带 new 调用抛 TypeError', thrown(() => Cls('x')), 'TypeError');
    const e = new Cls('sample', init);
    assert(name + '：是 Event 的实例', e instanceof Event, true);
    assert(name + '：type', e.type, 'sample');
    const fields = readonly;
    // 字段从 init 里取
    // 数组照 Web IDL 转成一个新数组，按内容比；别的是同一个值
    const same = (/** @type {unknown} */ a, /** @type {unknown} */ b) =>
      Array.isArray(b) ? Array.isArray(a) && JSON.stringify(a) === JSON.stringify(b) : a === b;
    const wrong = Object.keys(init).filter((key) => !same(e[key], init[key]));
    assert(name + '：字段从 init 里取', wrong.join(', '), '');
    // 字段都在原型链上，是 getter；实例自己没有
    const notGetter = fields.filter((key) => {
      for (let p = Object.getPrototypeOf(e); p !== null; p = Object.getPrototypeOf(p)) {
        const desc = Object.getOwnPropertyDescriptor(p, key);
        if (desc !== undefined) return typeof desc.get !== 'function';
      }
      return true;
    });
    assert(name + '：字段是原型上的 getter', notGetter.join(', '), '');
    const own = fields.filter((key) => Object.prototype.hasOwnProperty.call(e, key));
    assert(name + '：实例自己没有字段', own.join(', '), '');
    // 只读的写了抛 TypeError，值不变
    const writableByMistake = readonly.filter((key) => {
      const before = e[key];
      const result = thrown(() => { e[key] = { changed: true }; });
      return result !== 'TypeError' || e[key] !== before;
    });
    assert(name + '：只读字段写了抛 TypeError、值不变', writableByMistake.join(', '), '');
    // 不给 init 也能建
    assert(name + '：不给 init 也能建', thrown(() => new Cls('bare')), '没抛');
  }

  // ---- 默认值：照 Web 的字典默认值 ----
  const custom = new CustomEvent('c');
  assert('CustomEvent：detail 默认 null', custom.detail, null);
  const message = new MessageEvent('message');
  assert('MessageEvent：默认值', JSON.stringify([message.data, message.origin, message.lastEventId,
                                                message.source, message.ports]), '[null,"","",null,[]]');
  assert('MessageEvent：ports 是冻结的数组', Object.isFrozen(message.ports), true);
  const close = new CloseEvent('close');
  assert('CloseEvent：默认值', JSON.stringify([close.code, close.reason, close.wasClean]), '[0,"",false]');
  const error = new ErrorEvent('error');
  assert('ErrorEvent：默认值', JSON.stringify([error.message, error.filename, error.lineno, error.colno]),
         '["","",0,0]');
  assert('ErrorEvent：error 默认 undefined', error.error, undefined);

  // ---- init 里的值照 Web IDL 转换（和别处的 API 一样），交给原生的类型才精确 ----
  // 数：Number() 转，转不出有限数抛 TypeError
  assert('转换：CloseEvent.code 给字符串按数转', new CloseEvent('close', { code: /** @type {any} */ ('1000') }).code, 1000);
  assert('转换：CloseEvent.code 是整数，向零取整', new CloseEvent('close', { code: /** @type {any} */ (1000.9) }).code, 1000);
  assert('转换：CloseEvent.code 给 abc 抛 TypeError',
         thrown(() => new CloseEvent('close', { code: /** @type {any} */ ('abc') })), 'TypeError');
  // 布尔：Boolean()
  assert('转换：CloseEvent.wasClean 给 1 是 true', new CloseEvent('close', { wasClean: /** @type {any} */ (1) }).wasClean, true);
  // 不可空的字符串：String()，null 给空串
  assert('转换：CloseEvent.reason 给 null 是空串', new CloseEvent('close', { reason: /** @type {any} */ (null) }).reason, '');
  assert('转换：MessageEvent.origin 给数按字符串转', new MessageEvent('message', { origin: /** @type {any} */ (5) }).origin, '5');
  assert('转换：ErrorEvent.lineno 给字符串按整数转', new ErrorEvent('error', { lineno: /** @type {any} */ ('12') }).lineno, 12);
  // 任意值：原样
  const detail = { a: 1 };
  assert('转换：CustomEvent.detail 原样', new CustomEvent('c', { detail }).detail, detail);
  // undefined 视为没给，取默认值
  assert('转换：给 undefined 取默认值', new CloseEvent('close', { code: undefined }).code, 0);

  // ---- cancelable 照旧从 init 里来 ----
  assert('CustomEvent：cancelable 从 init 里来',
         new CustomEvent('c', { cancelable: true }).cancelable, true);

  // ---- 自己派发一个 CustomEvent ----
  const target = new EventTarget();
  /** @type {unknown} */
  let got = null;
  target.addEventListener('ping', (e) => { got = /** @type {CustomEvent} */ (e).detail; });
  target.dispatchEvent(new CustomEvent('ping', { detail: 42 }));
  assert('CustomEvent：派发出去，监听器拿到 detail', got, 42);
}
