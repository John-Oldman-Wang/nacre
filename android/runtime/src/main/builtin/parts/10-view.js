// 视图的基础：自由和挂上的机制、视图树、页面的内容，和最基础的几个类：Activity、View、
// ViewGroup、LinearLayout、TextView。原生那一侧是 ViewDomain.kt。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 规矩（2026-11-26 定，见 docs/project.md 第 4 节和 docs/internals/android.md「自由和挂上」）：
//
// - 视图建出来是**自由**的：new 不收参数，没有原生对象，不属于任何页面。放进某个页面的树
//   （写 activity.contentView，或者加进挂着的父视图）才**挂上**：这时才用那个页面建原生对象。
//   拿下来又按自由处理。
// - 每个视图两个对象：JS 拿着的公开对象（永远不绑原生），和挂上时建的**替身**（内部的，
//   绑着原生对象）。引擎的包装一旦绑上原生对象就换不了，放进另一个页面要重建，所以分开。
// - 树记在 JS 里（children、parent）。挂上时按 JS 的树把原生的子视图排好。
// - 状态（文字、内边距、方向……）以 JS 为准：自由时只写 JS，挂着时写 JS 也设到原生。挂上时
//   按登记的顺序把写过的状态设到原生。各组用 ctx.defineViewState 在自己的文件里登记。
// - 长度是 dp，挂着时按页面的密度换成整数像素；密度、系统字号变了，挂着的整棵树重设一遍。
//
// 不接 Button：它就是 TextView 加上系统主题的样式，没有 TextView 做不到的能力。
// JS 的类可以继承这些类，但继承只在 JS 这一层（见 01-bridge.js 的 nearestNative）。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    IGNORE,
    abstractOnly,
    defineNativeClass,
    describeValue,
    enumProperty,
    kHandle,
    kListeners,
    kOwner,
    kSubscribe,
    kView,
    makeWindowInsets,
    native,
    nativeCall,
    nativeClassNames,
    nativeGet,
    nativeOnly,
    nativeSet,
    nearestNative,
    notAttached,
    subscribeNative,
    toInteger,
    toText,
  } = ctx;

  // ---- 参数转换 ----

  // 数：Number(v)，不是有限数抛 TypeError（Web IDL 的 double）
  function toDouble(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(what + ': expected a finite number, got ' + describeValue(v));
    return n;
  }

  // ---- 长度：dp ↔ 像素 ----
  //
  // 四舍五入（正负对称），不是 0 的至少 1 像素：细线不会因为密度低就没了
  function px(page, dp) {
    const n = Math.round(Math.abs(dp) * page.density);
    return Math.sign(dp) * (dp !== 0 && n === 0 ? 1 : n);
  }
  // Java 收小数（float）的长度用这个：不取整，逐帧改 translationX 这类做动画时不会一顿一顿的。
  // 收整数（int）的用上面的 px
  function pxFloat(page, dp) {
    return dp * page.density;
  }
  function dp(page, pixels) {
    return pixels / page.density;
  }

  // ---- 页面的记录：内容、密度、系统字号 ----

  const pages = new WeakMap();  // Activity -> { contentView, density, fontScale }
  // 已经销毁的页面：contentView 读出 null，不能再放视图
  const destroyed = new WeakSet();

  function pageOf(activity) {
    let page = pages.get(activity);
    if (page === undefined) {
      const metrics = nativeGet(activity, '@metrics');
      page = { contentView: null, density: metrics.density, fontScale: metrics.fontScale };
      pages.set(activity, page);
      // 密度、系统字号变了原生当场告诉这里（页面不重建）
      activity.addEventListener('@metricschange', onMetricsChange);
    }
    return page;
  }

  // ---- 视图的记录 ----

  function newViewState(nativeClass) {
    return {
      nativeClass,          // 挂上时建哪个原生类
      parent: null,         // JS 里的父视图
      children: [],         // JS 里的子视图（只有 ViewGroup 用）
      snapshot: null,       // children 的冻结快照，树变了置 null
      contentOf: null,      // 是哪个页面的 contentView
      activity: null,       // 挂在哪个页面上；自由、拿下来时是 null
      standIn: null,        // 替身：挂上时建，拿下来留着
      values: new Map(),    // 写过的状态
      layoutPending: false, // 挂着、在等原生排完版（afterLayout 的状态还没设）
    };
  }

  function stateOf(obj, what) {
    const st = obj == null ? undefined : obj[kView];
    if (st === undefined) throw new TypeError(what + ': Illegal invocation');
    return st;
  }

  // 整棵子树（含自己）挨个做一件事
  function walk(view, fn) {
    fn(view);
    for (const child of view[kView].children) walk(child, fn);
  }

  // ---- 状态的登记（各组在自己的文件里用）----
  //
  // defineViewState(Cls, name, { order, initial, convert, apply, units })：
  //   order    挂上时设到原生的先后，小的先设，一样的按登记的先后。留着空隙：方向 100、
  //            内边距 300、文字 500；背景要排在内边距前面（背景会改掉内边距）
  //   initial  没写过时读到的值。必须等于新建的原生对象的默认值：没写过的状态不设到原生
  //   convert  (v, name) => 要存的值。在 JS 里当场转换、校验：类型不对直接抛；属性位写错
  //            （枚举名）打警告后返回 IGNORE，值不变
  //   apply    (替身, 值, 页面, 视图) => 设到原生。替身交给 nativeSet / nativeCall；页面是
  //            { density, fontScale }；几个状态合成一次调用的（四个内边距）从视图上读别的
  //   units    'dp'：密度变了重设；'sp'：密度或系统字号变了重设；省略：不重设
  //   release  (视图, 值) => 视图离开页面时（拿下来，或者页面销毁）放掉这一项在原生那边另外占着的
  //            东西（外观组：背景那个 Drawable 在这个页面上建的原生对象）。省略：没有要放的
  //   applyInitial  true：没写过也按 initial 设到原生（挂上时、配置变化时）。给原生的默认值跟不上
  //            配置变化的用：TextView 主题给的字号是建的时候按当时的密度和系统字号取整的像素，
  //            之后系统字号变了它不跟着变（文字组实测）
  //   placement true：给父视图读的（布局组的 view.layout）。挂上时不和别的状态一起设，等原生的
  //            父视图排好之后由 place 设；没写过也设（用 initial），见 place
  //   read     (替身, 页面, 视图) => 原生现在的值。系统也会改的状态（触摸组的 isPressed）：挂着时读
  //            原生；拿下来（或者页面销毁）时把原生的值读回 JS，和 JS 读到的不一样才记下（记下的
  //            算写过，下次挂上时设到原生）。自由时读 JS 的值
  //   afterLayout  true：排完版才能设（滚动组的 scrollX / scrollY：排版之前 ScrollView 会把它夹成 0，实测）。
  //            挂上时、配置变化重设时不和别的状态一起设，等原生这个视图下一次排完版（OnLayoutChangeListener，
  //            当场派发 @laidout）再设；挂着时写，原生说还在等排版（刚换了内容）也等着。等着的期间读到的、
  //            读回的都是 JS 的值
  const ownStates = new Map();    // 原型 -> 这个原型自己登记的
  const statesCache = new Map();  // 原型 -> 连同继承来的，排好序
  let serial = 0;

  function statesOf(proto) {
    let list = statesCache.get(proto);
    if (list !== undefined) return list;
    list = [];
    for (let p = proto; p !== null; p = Object.getPrototypeOf(p)) {
      const own = ownStates.get(p);
      if (own !== undefined) list.push(...own);
    }
    list.sort((x, y) => x.order - y.order || x.serial - y.serial);
    statesCache.set(proto, list);
    return list;
  }

  function defineViewState(Cls, name, spec) {
    const entry = {
      name,
      order: spec.order,
      initial: spec.initial,
      convert: spec.convert,
      apply: spec.apply,
      units: spec.units,
      release: spec.release,
      applyInitial: spec.applyInitial === true,
      placement: spec.placement === true,
      read: spec.read,
      afterLayout: spec.afterLayout === true,
      serial: serial++,
    };
    const proto = Cls.prototype;
    if (!ownStates.has(proto)) ownStates.set(proto, []);
    ownStates.get(proto).push(entry);
    statesCache.clear();
    Object.defineProperty(proto, name, {
      get() {
        const st = stateOf(this, name);
        if (entry.afterLayout && st.layoutPending) return st.values.has(name) ? st.values.get(name) : entry.initial;
        if (entry.read !== undefined && st.activity !== null) return entry.read(st.standIn, pageOf(st.activity), this);
        return st.values.has(name) ? st.values.get(name) : entry.initial;
      },
      set(v) {
        const st = stateOf(this, name);
        const value = entry.convert(v, name);
        if (value === IGNORE) return;
        // 先存再设：几个状态合成一次调用的（内边距）要从视图上读到新值。原生拒了就还原
        const had = st.values.has(name);
        const old = st.values.get(name);
        st.values.set(name, value);
        if (st.activity === null) return;
        if (entry.afterLayout && !laidOut(this, st, false)) return;
        try {
          entry.apply(st.standIn, value, pageOf(st.activity), this);
        } catch (err) {
          if (had) st.values.set(name, old);
          else st.values.delete(name);
          throw err;
        }
      },
      enumerable: false,
      configurable: true,
    });
  }

  // 把写过的状态设到原生。filter 给了就只设它挑的（配置变化时只设和长度、字号有关的）。
  // 每项单独 try：原生拒了（JS 没查住的）打一条警告跳过，不让挂上做到一半失败
  function applyStates(view, st, page, filter) {
    let waiting = false;
    for (const entry of statesOf(Object.getPrototypeOf(view))) {
      const written = st.values.has(entry.name);
      if (!written && !entry.applyInitial) continue;
      if (filter !== undefined && !filter(entry)) continue;
      // 排完版才能设的：这一轮不设，等原生下一次排完版（afterLaidOut）
      if (entry.afterLayout) {
        waiting = true;
        continue;
      }
      try {
        entry.apply(st.standIn, written ? st.values.get(entry.name) : entry.initial, page, view);
      } catch (err) {
        warnSkipped('could not apply ' + entry.name + ' to ' + view.constructor.name, err);
      }
    }
    if (waiting) laidOut(view, st, true);
  }

  // ---- 排完版才能设的状态（afterLayout）----
  //
  // 原生这个视图排过版、也没在等排版，返回 true（可以当场设）。不然让原生在它下一次排完版时当场发
  // @laidout（只发一次），返回 false，记下在等。force：不问，直接等下一次（挂上、密度变了时：原生的视图
  // 这时候排没排过版不算数），并请求一次排版，保证一定有下一次
  const waitingViews = new WeakSet();  // 装过 @laidout 监听器的视图

  function laidOut(view, st, force) {
    if (st.layoutPending) return false;
    let ready;
    try {
      ready = nativeCall(st.standIn, '@whenLaidOut', [force]);
    } catch (err) {
      warnSkipped('could not wait for the layout of ' + view.constructor.name, err);
      return true;
    }
    if (ready === true) return true;
    st.layoutPending = true;
    if (!waitingViews.has(view)) {
      waitingViews.add(view);
      view.addEventListener('@laidout', afterLaidOut);
    }
    return false;
  }

  // 原生排完版了（还在这一次排版里，画之前）：把写过的、排完版才能设的状态设上
  function afterLaidOut(e) {
    const view = e.target;
    const st = view[kView];
    if (!st.layoutPending) return;
    st.layoutPending = false;
    if (st.activity === null) return;
    const page = pageOf(st.activity);
    for (const entry of statesOf(Object.getPrototypeOf(view))) {
      if (!entry.afterLayout || !st.values.has(entry.name)) continue;
      try {
        entry.apply(st.standIn, st.values.get(entry.name), page, view);
      } catch (err) {
        warnSkipped('could not apply ' + String(entry.name) + ' to ' + view.constructor.name, err);
      }
    }
  }

  // 视图要离开页面了（还挂着、替身还在）：系统也会改的状态（登记了 read 的）把原生现在的值读回 JS
  // filter 给了就只读它挑的（密度变了时只读和长度有关的）
  function captureStates(view, filter) {
    const st = view[kView];
    if (st.activity === null || st.standIn === null) return;
    const page = pageOf(st.activity);
    for (const entry of statesOf(Object.getPrototypeOf(view))) {
      if (entry.read === undefined) continue;
      if (filter !== undefined && !filter(entry)) continue;
      // 还在等排版的：原生那边还没设，JS 的值才是对的
      if (entry.afterLayout && st.layoutPending) continue;
      try {
        const value = entry.read(st.standIn, page, view);
        const current = st.values.has(entry.name) ? st.values.get(entry.name) : entry.initial;
        if (value !== current) st.values.set(entry.name, value);
      } catch (err) {
        warnSkipped('could not read ' + entry.name + ' of ' + view.constructor.name + ' back', err);
      }
    }
  }

  // 视图离开页面：写过的状态里登记了 release 的，放掉它在原生那边另外占着的东西
  function releaseStates(view) {
    const st = view[kView];
    for (const entry of statesOf(Object.getPrototypeOf(view))) {
      if (entry.release === undefined || !st.values.has(entry.name)) continue;
      try {
        entry.release(view, st.values.get(entry.name));
      } catch (err) {
        warnSkipped('could not release ' + entry.name + ' of ' + view.constructor.name, err);
      }
    }
  }

  // 给父视图读的状态（placement）：子视图放进一个父视图、原生那边也排好之后，按父视图的类型设到原生。
  // 没写过的也设（用初始值）：原生换父视图时会把旧父视图的参数转换过来，不是新父视图的默认值。
  // 页面的 contentView 没有父视图，各组的 apply 自己跳过
  const notPlacement = (entry) => !entry.placement;
  function place(view, page) {
    const st = view[kView];
    for (const entry of statesOf(Object.getPrototypeOf(view))) {
      if (!entry.placement) continue;
      try {
        entry.apply(st.standIn, st.values.has(entry.name) ? st.values.get(entry.name) : entry.initial, page, view);
      } catch (err) {
        warnSkipped('could not apply ' + entry.name + ' to ' + view.constructor.name, err);
      }
    }
  }

  function warnSkipped(what, err) {
    console.warn('[Nacre] ' + what + ' (' + (err instanceof Error ? err.name + ': ' + err.message : String(err)) +
                 '), skipped');
  }

  // ---- 替身 ----

  function createStandIn(view, st, activity) {
    const standIn = Object.create(null);
    standIn[kOwner] = view;
    standIn.activity = activity;
    const handle = native.construct(st.nativeClass, [null], [activity[kHandle]], standIn);
    if (!handle) throw new TypeError('cannot construct ' + st.nativeClass);
    Object.defineProperty(standIn, kHandle, { value: handle });
    st.standIn = standIn;
  }

  // 把 JS 里记着的监听器装到原生上（on），或者摘掉。各组的 [kSubscribe] 会调 subscribeNative，
  // 它看到视图有替身就订在替身上
  function listen(view, on) {
    for (const type of view[kListeners].keys()) {
      try {
        view[kSubscribe](type, on);
      } catch (err) {
        warnSkipped('could not ' + (on ? 'add' : 'remove') + ' the "' + type + '" listener of ' +
                    view.constructor.name, err);
      }
    }
  }

  // 丢掉替身：摘掉原生上的监听器，从原生的父视图上拿下来。之后它被回收，引擎放手原生对象
  function dropStandIn(view, st) {
    listen(view, false);
    try {
      nativeCall(st.standIn, '@detach', []);
    } catch (err) {
      warnSkipped('could not detach ' + view.constructor.name, err);
    }
    st.standIn = null;
  }

  // 原生的子视图排成 JS 的这一串
  function syncChildren(view, st) {
    try {
      nativeCall(st.standIn, '@setChildren', st.children.map((child) => child[kView].standIn));
    } catch (err) {
      warnSkipped('could not add the children of ' + view.constructor.name, err);
    }
  }

  // 从原生的父视图（或者页面的内容）上拿下来
  function detachNative(view, st) {
    try {
      nativeCall(st.standIn, '@detach', []);
    } catch (err) {
      warnSkipped('could not detach ' + view.constructor.name, err);
    }
  }

  // ---- 挂上 ----
  //
  // 整棵子树从下往上：建替身（同一个页面的替身复用，别的页面的丢掉重建）、设写过的状态、
  // 把原生的子视图排好、装监听器（先状态后事件：装 click 会顺手改可点）。调用方最后把
  // 子树的根挂到页面或者挂着的父视图上，整棵子树只挂一次窗口
  function build(view, activity, page) {
    const st = view[kView];
    // 已经挂在这个页面上（挂着的视图挪个地方）：原生那边是好的，不用重设
    if (st.activity === activity) return;
    // 替身是别的页面的（比如在已经销毁的页面上挂过、拿下来时留着的）：丢掉，在这个页面上重建
    if (st.standIn !== null && st.standIn.activity !== activity) dropStandIn(view, st);
    const reused = st.standIn !== null;
    // 复用的替身先把监听器摘掉，状态设完再装回去，保证先状态后事件
    if (reused) listen(view, false);
    else createStandIn(view, st, activity);
    for (const child of st.children) build(child, activity, page);
    applyStates(view, st, page, notPlacement);
    if (view[kContainer] === true && (reused || st.children.length > 0)) {
      syncChildren(view, st);
      for (const child of st.children) place(child, page);
    }
    listen(view, true);
  }

  function markAttached(view, activity) {
    walk(view, (v) => { v[kView].activity = activity; });
  }

  function markDetached(view) {
    walk(view, (v) => {
      captureStates(v);
      v[kView].activity = null;
      v[kView].layoutPending = false;
      releaseStates(v);
    });
  }

  // 把一个视图从它现在待的地方（父视图，或者页面的内容）拿出来。只动 JS 的记录
  function unlink(view, st) {
    if (st.parent !== null) {
      const pst = st.parent[kView];
      pst.children.splice(pst.children.indexOf(view), 1);
      pst.snapshot = null;
      st.parent = null;
    } else if (st.contentOf !== null) {
      pageOf(st.contentOf).contentView = null;
      st.contentOf = null;
    }
  }

  // ---- 密度、系统字号变了 ----

  function onMetricsChange(e) {
    const activity = e.target;
    const page = pages.get(activity);
    if (page === undefined) return;
    const metrics = nativeGet(activity, '@metrics');
    const densityChanged = metrics.density !== page.density;
    const fontScaleChanged = metrics.fontScale !== page.fontScale;
    const affected = (entry) => (entry.units === 'dp' ? densityChanged
      : entry.units === 'sp' ? densityChanged || fontScaleChanged : false);
    // 系统也会改的状态（滚动位置、动画改过的平移）先按旧的密度读回 JS，不然下面重设时会设回 JS 里旧的值
    if (page.contentView !== null) walk(page.contentView, (v) => captureStates(v, affected));
    page.density = metrics.density;
    page.fontScale = metrics.fontScale;
    if (page.contentView === null || (!densityChanged && !fontScaleChanged)) return;
    walk(page.contentView, (v) => applyStates(v, v[kView], page, affected));
  }

  // 页面要销毁了（activitydestroy 派发完）：内容拿下来、替身丢掉，内容变回自由的，可以放进别的
  // 页面重建。原生的视图跟着页面没了，不用一个个拆。拿下来时留着这个页面替身的视图不在树上，
  // 下次挂上时 build 发现替身是别的页面的，丢掉重建
  function releaseActivity(activity) {
    destroyed.add(activity);
    const page = pages.get(activity);
    if (page === undefined) return;
    const content = page.contentView;
    if (content !== null) {
      page.contentView = null;
      content[kView].contentOf = null;
      walk(content, (v) => {
        const st = v[kView];
        captureStates(v);
        if (st.standIn !== null) {
          listen(v, false);
          st.standIn = null;
        }
        st.activity = null;
        st.layoutPending = false;
        releaseStates(v);
      });
    }
    activity.removeEventListener('@metricschange', onMetricsChange);
    pages.delete(activity);
  }

  // ---- 容器 ----
  //
  // 有子视图的视图（原型上 kContainer 是 true）：ViewGroup，还有只放一份内容的滚动视图（JS 里不是
  // ViewGroup、没有 addView，见 36-scroll.js：容器的限制用 API 的形状表达）。挂上时按 JS 的树排原生的
  // 子视图。下面两个是树的操作本身（参数已经查过），ViewGroup 的 addView / removeView 和滚动视图的
  // contentView 都用它们
  const kContainer = Symbol('container');

  // 把 child 放进 parent，排第 index 个。child 原来在别处（别的父视图下、某个页面的内容）就移过来；
  // parent 挂着时 child 那棵子树当场在同一个页面上挂上
  function adoptChild(parent, child, index) {
    const st = parent[kView];
    const cst = child[kView];
    const wasAttached = cst.activity !== null;
    unlink(child, cst);
    st.children.splice(index, 0, child);
    st.snapshot = null;
    cst.parent = parent;
    const activity = st.activity;
    if (activity !== null) {
      const page = pageOf(activity);
      build(child, activity, page);
      syncChildren(parent, st);
      place(child, page);
      markAttached(child, activity);
    } else if (wasAttached) {
      // 从挂着的地方移到自由的父视图下：原生那边拿下来
      detachNative(child, cst);
      markDetached(child);
    }
  }

  // 把 parent 的子视图 child 拿下来
  function dropChild(parent, child) {
    const cst = child[kView];
    unlink(child, cst);
    if (cst.activity !== null) {
      detachNative(child, cst);
      markDetached(child);
    }
  }

  // ---- 给各组的另外几个助手 ----

  // 挂着时返回替身，不然 null。页面值（排版结果这类）自由时是 null
  function attachedNative(view) {
    const st = stateOf(view, 'attachedNative');
    return st.activity !== null ? st.standIn : null;
  }
  // 挂着时返回替身，不然抛 InvalidStateError。动作用
  function requireAttached(view, what) {
    const st = stateOf(view, what);
    if (st.activity === null) throw notAttached(what);
    return st.standIn;
  }

  function requireView(v, what, cls) {
    if (!(v instanceof View) || v[kView] === undefined) {
      throw new TypeError("Failed to execute '" + what + "' on '" + cls + "': parameter 1 is not of type 'View'.");
    }
    return v[kView];
  }

  // ---- Activity：系统建的，不能 new ----

  // 页面上原生真的会发的事件
  const activityEvents = new Set(['windowinsetschange', '@metricschange']);

  class Activity extends EventTarget {
    constructor() {
      nativeOnly(new.target);
      super();
    }

    // 窗口边衬（安全区域）：状态栏、导航条、开孔、键盘……各占了多少。每次读是一份新的快照。
    // 窗口还没挂到屏幕上时（onCreate 那一刻）系统还没分发过，是 null
    get windowInsets() {
      const raw = nativeGet(this, 'windowInsets');
      return raw === null ? null : makeWindowInsets(raw);
    }

    // 页面的内容。写一个视图就是挂上：在这个页面上建好整棵树，原来的内容拿下来；这个视图
    // 原来在别处（别的父视图下、别的页面）就移过来。写 null 是拿下来。
    // 页面销毁之后读出 null；写视图抛 InvalidStateError，写 null 什么都不做
    get contentView() {
      if (destroyed.has(this)) return null;
      return pageOf(this).contentView;
    }
    set contentView(view) {
      const next = view == null ? null : view;
      if (next !== null && (!(next instanceof View) || next[kView] === undefined)) {
        throw new TypeError("Failed to set the 'contentView' property on 'Activity': the value is not of type 'View'.");
      }
      if (destroyed.has(this)) {
        if (next === null) return;
        throw new ctx.DOMException("Failed to set the 'contentView' property on 'Activity': the activity has been destroyed",
                                   'InvalidStateError');
      }
      const page = pageOf(this);
      if (page.contentView === next) return;
      const old = page.contentView;
      if (next !== null) unlink(next, next[kView]);
      if (old !== null) {
        old[kView].contentOf = null;
        markDetached(old);
      }
      page.contentView = next;
      if (next === null) {
        nativeCall(this, '@setContent', [null]);
        return;
      }
      const st = next[kView];
      st.contentOf = this;
      build(next, this, page);
      nativeCall(this, '@setContent', [st.standIn]);
      markAttached(next, this);
    }

    [kSubscribe](type, on) {
      if (activityEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  defineNativeClass('Activity', Activity);

  // ---- View 一族 ----

  // 原生真的会发的事件。别的名字是 JS 自己的自定义事件，不用告诉原生
  const viewEvents = new Set(['click']);

  class View extends EventTarget {
    // 不收参数（多给的不管）。建出来是自由的：记下挂上时建哪个原生类（原型链上最近的那个）
    constructor() {
      super();
      Object.defineProperty(this, kView, { value: newViewState(nativeClassNames.get(nearestNative(new.target))) });
    }

    // 挂在哪个页面的树上；自由、拿下来时是 null
    get activity() { return stateOf(this, 'activity').activity; }

    // JS 里的父视图：ViewGroup，或者滚动视图（这个视图是它的 contentView）。页面的 contentView 的 parent 是 null
    get parent() { return stateOf(this, 'parent').parent; }

    [kSubscribe](type, on) {
      if (viewEvents.has(type)) subscribeNative(this, type, on);
    }
  }
  defineNativeClass('View', View);

  // 内边距：四个 dp。start / end 跟着布局方向（从左到右时 start 是左边）。原生只有一个设四边的
  // 方法，所以每个都把四个一起设
  const paddingOrder = ['paddingStart', 'paddingTop', 'paddingEnd', 'paddingBottom'];
  for (const name of ['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd']) {
    defineViewState(View, name, {
      order: 300,
      initial: 0,
      units: 'dp',
      convert: (v, what) => toDouble(v, what),
      apply: (standIn, value, page, view) => {
        nativeCall(standIn, '@padding', paddingOrder.map((n) => px(page, view[n])));
      },
    });
  }

  class ViewGroup extends View {
    constructor() {
      abstractOnly(new.target, ViewGroup);
      super();
    }

    // 子视图，冻结的数组。树没变时每次读是同一个，变了换一个新的
    get children() {
      const st = stateOf(this, 'children');
      if (st.snapshot === null) st.snapshot = Object.freeze(st.children.slice());
      return st.snapshot;
    }

    // 加一个子视图。index 是「加完之后它排第几」，省略是加到最后。child 已经有父视图（或者是
    // 某个页面的内容）就移过来。这个视图挂着时，child 那棵子树当场在同一个页面上挂上
    addView(child, options) {
      const st = stateOf(this, 'addView');
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'addView' on 'ViewGroup': 1 argument required, but only 0 present.");
      }
      const cst = requireView(child, 'addView', 'ViewGroup');
      if (options != null && typeof options !== 'object' && typeof options !== 'function') {
        throw new TypeError("Failed to execute 'addView' on 'ViewGroup': parameter 2 is not of type 'object'.");
      }
      const o = options == null ? {} : options;
      const index = o.index === undefined ? undefined : toInteger(o.index, 'addView');
      for (let p = this; p !== null; p = p[kView].parent) {
        if (p === child) {
          throw new ctx.DOMException(
            "Failed to execute 'addView' on 'ViewGroup': the new child is this view or one of its ancestors",
            'HierarchyRequestError');
        }
      }
      const max = st.children.length - (cst.parent === this ? 1 : 0);
      const at = index === undefined ? max : index;
      if (at < 0 || at > max) {
        throw new RangeError("Failed to execute 'addView' on 'ViewGroup': index " + at +
                             ' is out of range [0, ' + max + ']');
      }
      adoptChild(this, child, at);
    }

    // 拿下一个子视图。不是这个视图的子视图抛 NotFoundError
    removeView(child) {
      stateOf(this, 'removeView');
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'removeView' on 'ViewGroup': 1 argument required, but only 0 present.");
      }
      const cst = requireView(child, 'removeView', 'ViewGroup');
      if (cst.parent !== this) {
        throw new ctx.DOMException(
          "Failed to execute 'removeView' on 'ViewGroup': the view is not a child of this view", 'NotFoundError');
      }
      dropChild(this, child);
    }

    // 全部拿下来
    removeAllViews() {
      const st = stateOf(this, 'removeAllViews');
      const removed = st.children.slice();
      for (const child of removed) child[kView].parent = null;
      st.children.length = 0;
      st.snapshot = null;
      if (st.activity !== null) {
        syncChildren(this, st);
        for (const child of removed) markDetached(child);
      }
    }
  }
  defineNativeClass('ViewGroup', ViewGroup);
  Object.defineProperty(ViewGroup.prototype, kContainer, { value: true });

  class LinearLayout extends ViewGroup {}
  defineNativeClass('LinearLayout', LinearLayout);

  // 排列方向。名字由原生在启动时交给 JS，写错自由时就当场打警告
  defineViewState(LinearLayout, 'orientation', {
    order: 100,
    initial: 'horizontal',
    convert: (v, what) => enumProperty('orientation', v, what),
    apply: (standIn, value) => nativeSet(standIn, 'orientation', value),
  });

  class TextView extends View {}
  defineNativeClass('TextView', TextView);

  defineViewState(TextView, 'text', {
    order: 500,
    initial: '',
    convert: (v) => toText(v),
    apply: (standIn, value) => nativeSet(standIn, 'text', value),
  });

  Object.assign(ctx, {
    Activity,
    adoptChild,
    attachedNative,
    defineViewState,
    dp,
    dropChild,
    kContainer,
    pageOf,
    px,
    pxFloat,
    releaseActivity,
    requireAttached,
  });
})
