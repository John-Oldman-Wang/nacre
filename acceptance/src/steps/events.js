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
 * 每个类：名字、父类、一份 init、只读的字段、可写的字段
 * @type {Array<[string, string, Record<string, unknown>, string[], string[]]>}
 */
const CLASSES = [
  // ---- Web 标准（core） ----
  ['CustomEvent', 'Event', { detail: { a: 1 } }, ['detail'], []],
  ['MessageEvent', 'Event', { data: 'hi', origin: 'wss://example.com', lastEventId: '7' },
    ['data', 'origin', 'lastEventId', 'source', 'ports'], []],
  ['CloseEvent', 'Event', { code: 1000, reason: 'bye', wasClean: true }, ['code', 'reason', 'wasClean'], []],
  ['ErrorEvent', 'Event', { message: 'm', filename: 'f.js', lineno: 3, colno: 4, error: null },
    ['message', 'filename', 'lineno', 'colno', 'error'], []],
  ['PromiseRejectionEvent', 'Event', { reason: 'r', promise: Promise.resolve() }, ['reason', 'promise'], []],
  // ---- 运行时 ----
  ['OpenURLEvent', 'Event', { url: 'myapp://x', scene: null, sourceApplication: null },
    ['url', 'scene', 'sourceApplication'], []],
  ['SceneEvent', 'Event', { scene: null }, ['scene'], []],
  // ---- 视图、控件、手势 ----
  ['UIControlTouchEvent', 'Event', { location: null, tapCount: 2 }, ['location', 'tapCount'], []],
  ['UIGestureRecognizerEvent', 'Event', { location: null, numberOfTouches: 1 },
    ['location', 'numberOfTouches'], []],
  ['UIPanGestureRecognizerEvent', 'UIGestureRecognizerEvent', { numberOfTouches: 1 },
    ['location', 'numberOfTouches', 'translation', 'velocity'], []],
  ['UIPinchGestureRecognizerEvent', 'UIGestureRecognizerEvent', { scale: 2, velocity: 0.5 },
    ['location', 'numberOfTouches', 'scale', 'velocity'], []],
  ['UIRotationGestureRecognizerEvent', 'UIGestureRecognizerEvent', { rotation: 1, velocity: 0 },
    ['location', 'numberOfTouches', 'rotation', 'velocity'], []],
  ['UIScrollViewDragEndEvent', 'Event', { velocity: null, targetContentOffset: null },
    ['velocity'], ['targetContentOffset']],
  ['UICollectionViewItemEvent', 'Event', { indexPath: null }, ['indexPath'], []],
  ['UITextBeforeInputEvent', 'Event', { range: null, replacementString: 'x' }, ['range', 'replacementString'], []],
  ['UITextViewLinkClickEvent', 'Event', { url: 'https://example.com', range: null }, ['url', 'range'], []],
  ['UITraitChangeEvent', 'Event', { previousTraitCollection: null }, ['previousTraitCollection'], []],
  ['UIScreenKeyboardEvent', 'Event', { frame: null, previousFrame: null, duration: 0.25 },
    ['frame', 'previousFrame', 'duration'], []],
  ['UIWindowSceneGeometryChangeEvent', 'Event', { previousInterfaceOrientation: 'portrait' },
    ['previousInterfaceOrientation'], []],
  // ---- 页面 ----
  ['UIViewControllerAppearanceEvent', 'Event', { animated: true }, ['animated'], []],
  ['UINavigationControllerEvent', 'Event', { viewController: null }, ['viewController'], []],
  ['UITabBarControllerEvent', 'Event', { viewController: null }, ['viewController'], []],
  ['UIActivityViewControllerCompletionEvent', 'Event', { activityType: null, completed: false, activityError: null },
    ['activityType', 'completed', 'activityError'], []],
  // ---- 动画 ----
  ['CAAnimationEvent', 'Event', { finished: true }, ['finished'], []],
  ['CADisplayLinkEvent', 'Event', { frame: { timestamp: 1, duration: 0.016, targetTimestamp: 1.016 } }, ['frame'], []],
  // ---- 网页 ----
  ['WebContentsWillNavigateEvent', 'Event', { url: 'https://example.com', isMainFrame: true, navigationType: 'other' },
    ['url', 'isMainFrame', 'navigationType'], []],
  ['WebContentsDidNavigateEvent', 'Event', { url: 'https://example.com', httpResponseCode: 200 },
    ['url', 'httpResponseCode'], []],
  ['WebContentsDidFailLoadEvent', 'Event',
    { errorCode: -1003, errorDescription: 'd', validatedURL: 'https://example.com', isMainFrame: true },
    ['errorCode', 'errorDescription', 'validatedURL', 'isMainFrame'], []],
  ['WebContentsIpcMessageEvent', 'Event', { channel: 'c', args: [1] }, ['channel', 'args'], []],
  ['WebContentsPreloadErrorEvent', 'Event', { preloadPath: 'p.js', error: null }, ['preloadPath', 'error'], []],
  ['WebContentsPageTitleUpdatedEvent', 'Event', { title: 't' }, ['title'], []],
  ['WebContentsConsoleMessageEvent', 'Event', { level: 'info', message: 'm', lineNumber: 1, sourceId: 's' },
    ['level', 'message', 'lineNumber', 'sourceId'], []],
];

/** @param {import("../main.js").StepContext} ctx */
export function stepEvents(ctx) {
  const { assert } = ctx;
  console.log('--- 事件类 ---');
  const g = /** @type {Record<string, any>} */ (/** @type {unknown} */ (globalThis));

  for (const [name, parentName, rawInit, readonly, writable] of CLASSES) {
    // 带场景的两个用真的场景：OpenURLEvent 要求 scene 是一个 UIWindowScene
    const init = 'scene' in rawInit ? { ...rawInit, scene: ctx.scene } : rawInit;
    const Cls = g[name];
    assert(name + '：全局上有这个类', typeof Cls, 'function');
    if (typeof Cls !== 'function') continue;
    assert(name + '：父类是 ' + parentName, Object.getPrototypeOf(Cls.prototype), g[parentName].prototype);
    assert(name + '：不带 new 调用抛 TypeError', thrown(() => Cls('x')), 'TypeError');
    const e = new Cls('sample', init);
    assert(name + '：是 Event 的实例', e instanceof Event, true);
    assert(name + '：type', e.type, 'sample');
    const fields = readonly.concat(writable);
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
    // 可写的写得进去
    for (const key of writable) {
      const value = new CGPoint(1, 2);
      e[key] = value;
      assert(name + '：' + key + ' 可写', e[key], value);
    }
    // 不给 init 也能建；OpenURLEvent 例外：url 和 scene 必填
    assert(name + (name === 'OpenURLEvent' ? '：不给 init 抛 TypeError' : '：不给 init 也能建'),
           thrown(() => new Cls('bare')), name === 'OpenURLEvent' ? 'TypeError' : '没抛');
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
  const g2 = /** @type {Record<string, any>} */ (/** @type {unknown} */ (globalThis));
  // 数：Number() 转，转不出有限数抛 TypeError
  assert('转换：CloseEvent.code 给字符串按数转', new CloseEvent('close', { code: /** @type {any} */ ('1000') }).code, 1000);
  assert('转换：CloseEvent.code 是整数，向零取整', new CloseEvent('close', { code: /** @type {any} */ (1000.9) }).code, 1000);
  assert('转换：CloseEvent.code 给 abc 抛 TypeError',
         thrown(() => new CloseEvent('close', { code: /** @type {any} */ ('abc') })), 'TypeError');
  assert('转换：UIPinchGestureRecognizerEvent.scale 给字符串按数转',
         new UIPinchGestureRecognizerEvent('changed', { scale: /** @type {any} */ ('1.5') }).scale, 1.5);
  // 布尔：Boolean()
  assert('转换：CloseEvent.wasClean 给 1 是 true', new CloseEvent('close', { wasClean: /** @type {any} */ (1) }).wasClean, true);
  assert('转换：CAAnimationEvent.finished 给 \'false\' 是 true（JS 的真假值）',
         new CAAnimationEvent('stop', { finished: /** @type {any} */ ('false') }).finished, true);
  // 不可空的字符串：String()，null 给空串
  assert('转换：CloseEvent.reason 给 null 是空串', new CloseEvent('close', { reason: /** @type {any} */ (null) }).reason, '');
  assert('转换：MessageEvent.origin 给数按字符串转', new MessageEvent('message', { origin: /** @type {any} */ (5) }).origin, '5');
  assert('转换：ErrorEvent.lineno 给字符串按整数转', new ErrorEvent('error', { lineno: /** @type {any} */ ('12') }).lineno, 12);
  // 可空的字符串：null 是 null
  assert('转换：UIActivityViewControllerCompletionEvent.activityType 给 null 是 null',
         new UIActivityViewControllerCompletionEvent('complete', { activityType: null }).activityType, null);
  // 结构体：给结构体或者字段齐的普通对象；别的抛 TypeError；可空的给 null 是 null
  const touched = new UIControlTouchEvent('touchdown', { location: /** @type {any} */ ({ x: 1, y: '2' }), tapCount: /** @type {any} */ ('2') });
  assert('转换：location 给普通对象建成 CGPoint', touched.location instanceof CGPoint &&
         touched.location.x === 1 && touched.location.y === 2, true);
  assert('转换：tapCount 给字符串按整数转', touched.tapCount, 2);
  assert('转换：location 给 null 是 null', new UIControlTouchEvent('touchdown', { location: null }).location, null);
  assert('转换：location 给字符串抛 TypeError',
         thrown(() => new UIControlTouchEvent('touchdown', { location: /** @type {any} */ ('here') })), 'TypeError');
  assert('转换：UIScreenKeyboardEvent.frame 给普通对象建成 CGRect',
         new UIScreenKeyboardEvent('keyboardshow', { frame: /** @type {any} */ ({ x: 0, y: 1, width: 2, height: 3 }) }).frame instanceof CGRect, true);
  assert('转换：UITextBeforeInputEvent.range 给普通对象建成 NSRange',
         new UITextBeforeInputEvent('beforeinput', { range: /** @type {any} */ ({ location: 1, length: 2 }) }).range instanceof NSRange, true);
  // 原生对象：不转，不是那个类抛 TypeError
  assert('转换：UINavigationControllerEvent.viewController 给普通对象抛 TypeError',
         thrown(() => new UINavigationControllerEvent('show', { viewController: /** @type {any} */ ({}) })), 'TypeError');
  const page = new UIViewController();
  assert('转换：viewController 给页面原样收下', new UINavigationControllerEvent('show', { viewController: page }).viewController, page);
  assert('转换：SceneEvent.scene 给字符串抛 TypeError',
         thrown(() => new g2.SceneEvent('sceneconnect', { scene: 'main' })), 'TypeError');
  // 数组：要能转成数组（可迭代的），别的抛 TypeError
  assert('转换：WebContentsIpcMessageEvent.args 给 Set 转成数组',
         JSON.stringify(new WebContentsIpcMessageEvent('ipc-message', { args: /** @type {any} */ (new Set([1, 2])) }).args), '[1,2]');
  assert('转换：args 给数抛 TypeError',
         thrown(() => new WebContentsIpcMessageEvent('ipc-message', { args: /** @type {any} */ (5) })), 'TypeError');
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
