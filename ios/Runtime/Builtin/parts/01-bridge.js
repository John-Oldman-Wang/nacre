// 桥：原生对象的包装、所有权镜像、过桥通道、参数转换
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define, kListeners, native } = ctx;

  const kHandle = Symbol('nativeHandle');

  const nativeClasses = Object.create(null);
  // 反查：类 → 原生类名。构造时用它判断「被 new 的是不是运行时自己的类」
  const nativeClassNames = new WeakMap();

  function defineNativeClass(name, cls) {
    nativeClasses[name] = cls;
    nativeClassNames.set(cls, name);
    define(globalThis, name, cls);
    return cls;
  }

  // 原生属性的读写。值走 JSON 编码，所以字符串、数字、布尔、数组、字典都能过。
  // 这样加一个属性不用动 C++，只要在 iOS 层的分发表里加一行。
  function nativeGet(obj, name) {
    return JSON.parse(native.getProp(obj[kHandle], name));
  }
  // 写不进去时原生层自己抛，这里什么都不用做。错误信息也由原生层凑：
  // 可选值列表就在它那张表里，而且它知道是哪个类的哪个属性——按属性名
  // 索引的表会撞（UIControl.state 和 UIGestureRecognizer.state 是两个
  // 毫无关系的枚举）。
  function nativeSet(obj, name, value) {
    native.setProp(obj[kHandle], name,
                   JSON.stringify(value === undefined ? null : value));
  }
  function nativeGetObject(obj, name) {
    const result = native.getObjProp(obj[kHandle], name);
    return result === undefined ? null : result;
  }
  function nativeCallAsync(obj, name, args) {
    const { values, handles } = splitArgs(args, name);
    return native.callAsync(obj[kHandle], name, JSON.stringify(values), handles);
  }
  // 值是原生对象的属性。照 Web IDL：对象不转换。null / undefined 是「没有」；
  // 别的值必须是一个原生对象——以前字符串、数字这些会被当成句柄 0，
  // 原生收到 nil，静默把属性清掉（label.font = 'Helvetica'）
  function nativeSetObject(obj, name, value) {
    if (value != null && value[kHandle] === undefined) {
      rejectUnbacked(value, name);
      throw new TypeError(name + ' needs a native object or null, got ' + describeValue(value));
    }
    native.setObjProp(obj[kHandle], name, value == null ? 0 : value[kHandle]);
  }
  function nativeCallVoid(obj, name) {
    native.callVoid(obj[kHandle], name);
  }

  // ---- 所有权镜像 ----
  //
  // 原生对象的 JS 包装是弱的（Engine 里 SetWeak）。包装被回收之后再从原生
  // 读回来，拿到的是**按原生类名新建的**包装——ES 子类实例会变回基类，挂在
  // 包装上的 JS 状态和事件监听器全丢（EmitObjectEvent 也走同一条路）。
  //
  // 修法是在 JS 侧把原生的所有权边补出来：原生对象 A 持有 B，A 的包装就也
  // 持有 B 的包装。这样从 application 出发可达的原生对象，包装一定活着。
  // 原生用引用计数，weak 边是为了断环；V8 是追踪式 GC，环不要钱——所以边的
  // 强度要按 V8 的需求重定，不能照抄原生。
  //
  // 用 WeakMap 不用包装上的属性：JS 侧完全看不见（getOwnPropertySymbols 也
  // 列不出来），而且 owner 一死整条记录跟着死。
  //
  // 代价是保活可能过久——UIKit 自己改原生的树时（pop 一个控制器之类）我们
  // 看不到。但它**只会多留一份引用，永远不会给错答案**：所有的读都走原生，
  // 这张表只给 GC 当根。读 subviews / scenes 时按原生的真相整层重建，碰到
  // 哪层修哪层。
  const ownership = new WeakMap();  // owner 包装 -> Map(边名 -> 包装 | 包装数组)

  function ownSlot(owner) {
    let slot = ownership.get(owner);
    if (!slot) ownership.set(owner, (slot = new Map()));
    return slot;
  }
  // 单值边：owner.name 持有 value
  function own(owner, name, value) {
    if (owner != null) {
      if (value == null) {
        const slot = ownership.get(owner);
        if (slot) slot.delete(name);
      } else {
        ownSlot(owner).set(name, value);
      }
    }
    return value;
  }
  // 多值边：按原生的真相整层重建
  function ownAll(owner, name, values) {
    if (owner != null) ownSlot(owner).set(name, Array.prototype.slice.call(values));
    return values;
  }
  // 多值边：加一个
  function ownOne(owner, name, value) {
    if (owner == null || value == null) return;
    const slot = ownSlot(owner);
    const list = slot.get(name);
    if (!list) slot.set(name, [value]);
    else if (!list.includes(value)) list.push(value);
  }
  // 多值边：去掉一个
  function disown(owner, name, value) {
    const slot = owner == null ? undefined : ownership.get(owner);
    const list = slot === undefined ? undefined : slot.get(name);
    if (!list) return;
    const i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1);
  }
  // 所有权边上的对象属性。和 nativeGetObject / nativeSetObject 的差别只是
  // 记一笔。回边不走这里：superview、window、windowScene 在原生侧也不是
  // 持有，而且它们的另一端已经被上游的所有权边兜住了。
  // 只问镜像，不过桥。给那些「原生读回来会换一个对象」的属性用：
  // CAShapeLayer.path 存的是 CGPath，每次读都现包一个新的 UIBezierPath，
  // 而写进去的那个对象 JS 这边是有的——镜像里有就还它，身份才稳得住。
  // 返回 undefined 表示镜像里没有（包装被回收重建过），由调用方决定怎么办。
  function ownedValue(owner, name) {
    const slot = owner == null ? undefined : ownership.get(owner);
    return slot === undefined ? undefined : slot.get(name);
  }
  function nativeGetOwned(obj, name) {
    return own(obj, name, nativeGetObject(obj, name));
  }

  // 原生类的订阅钩子都走这里：某个事件类型的监听器从无到有、从有到无时
  // 告诉原生。只管通知，**不碰对象的寿命**。
  // @ 开头的名字是运行时自己用的内部事件（见事件汇入口），不让用户订
  function subscribeNative(target, type, on) {
    requireNative(target, 'addEventListener');
    if (type.charCodeAt(0) === 64 /* @ */) {
      throw new TypeError('addEventListener has no value "' + type +
                          '"; names starting with @ are reserved for the runtime');
    }
    native.subscribe(target[kHandle], type, on);
  }
  function nativeSetOwned(obj, name, value) {
    nativeSetObject(obj, name, value);
    own(obj, name, value);
  }
  // 锚点。原生侧 NSLayoutAnchor 对它的 item 是 **weak**，而且 iOS 上根本读不
  // 回来（NSLayoutAnchor.item 标着 API_UNAVAILABLE(ios)）。所以这条回边只能
  // 在给出锚点的那一刻记下来——实测不补的后果不是数据过期，是 **SIGSEGV**：
  // JS 只留锚点、view 的包装被 GC 之后，拿这个锚点建约束再激活，进程直接段错误。
  function anchorOf(owner, name) {
    requireNative(owner, name);
    const anchor = nativeGetObject(owner, name);
    own(anchor, 'item', owner);
    return anchor;
  }
  // 约束强持有两端的锚点（原生是 copy，实测对不可变的锚点返回自己），
  // 锚点又持有各自的 view，所以一条约束能把两个 view 都兜住。
  function constraintOf(result, first, second) {
    own(result, 'firstAnchor', first);
    own(result, 'secondAnchor', second);
    return result;
  }

  // 换父节点时原生会自动从旧父节点摘掉，镜像要跟上。没有原生对象时返回
  // null——那种 view 还没进任何树。
  // options 对象里某个成员「带没带」。照 Web IDL 的约定：值是 undefined 的
  // 成员视为没带，{ scale: undefined } 等于 {}。
  //
  // 不能写 'key' in o——那只看键在不在，undefined 会被当成有效值一路传到
  // 原生（过 JSON 变成 null，原生拿到 NSNull）。条件表达式里顺手写出来的
  // { atIndex: cond ? 0 : undefined } 是很常见的写法，不该因此出错
  function has(o, key) {
    return o[key] !== undefined;
  }

  // ---- 参数转换：照 Web IDL（project.md 的 API 设计原则第 13 条）----
  //
  // API 层宽松接收，在这里转成原生要的那个类型；原生只校验、不转换。
  // 转换必须在 JS 一侧做：值过了 JSON，NaN / Infinity / undefined 全成了
  // null，原生已经分不清原来是什么。
  function describeValue(v) {
    if (typeof v === 'string') return JSON.stringify(v);
    if (v !== null && typeof v === 'object') return Array.isArray(v) ? 'an array' : 'an object';
    if (typeof v === 'function') return 'a function';
    return String(v);   // undefined / null / NaN / Infinity / true
  }
  // 数。Number() 能转出有限数就用——'0.5' 是 0.5，null 是 0，true 是 1，
  // 和 audio.volume = … 一致。转不出来（undefined、'abc'、{}）才抛
  function toNumber(v, what) {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      throw new TypeError(what + ' must be a finite number, got ' + describeValue(v));
    }
    return n;
  }
  // 整数（下标、个数）。向零取整。这里**不学** Web 的老接口——它们把 NaN
  // 当 0、还按 32 位回绕；Web 自己的新接口也改成抛了
  function toInteger(v, what) {
    return Math.trunc(toNumber(v, what)) + 0;   // + 0 把 -0 归成 0
  }
  // 布尔。JS 的真假值，所以 'false' 是 true，和 button.disabled 一致
  function toBoolean(v) {
    return Boolean(v);
  }
  // 不可空的字符串。5 是 '5'，和 setAttribute 一致。null 和 undefined 给
  // 空串——Web 的普通字符串会得到 'null' / 'undefined' 这两个字面量，那是
  // 公认的坑；这里学的是 input.value = null 得到 '' 的那一类
  function toText(v) {
    return v == null ? '' : String(v);
  }
  // 可空的字符串。null 和 undefined 都是「没有」，和 textContent 一致
  function toTextOrNull(v) {
    return v == null ? null : String(v);
  }
  // 「数，或者一个名字」：spacing 的 'system'、priority 的 'required'。
  // 看着像数的字符串按数转，其余原样交给原生去认名字
  function toNumberOrName(v, what) {
    if (typeof v === 'string') {
      const n = Number(v);
      return v.trim() !== '' && Number.isFinite(n) ? n : v;
    }
    return toNumber(v, what);
  }
  // 可空的数组，元素是数
  function toNumbersOrNull(v, what) {
    if (v == null) return null;
    if (typeof v !== 'object' || typeof v[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' must be an array of numbers or null, got ' + describeValue(v));
    }
    return Array.from(v, (item, i) => toNumber(item, what + '[' + i + ']'));
  }

  function superviewOf(view) {
    if (view == null || view[kHandle] === undefined) return null;
    return nativeGetObject(view, 'superview');
  }
  // 同一件事，页面那一侧：它现在的父控制器是谁
  function parentControllerOf(vc) {
    if (vc == null || vc[kHandle] === undefined) return null;
    return nativeGetObject(vc, 'parentViewController');
  }
  // 同一件事，手势识别器那一侧：它现在挂在哪个视图上
  function gestureViewOf(recognizer) {
    if (recognizer == null || recognizer[kHandle] === undefined) return null;
    return nativeGetObject(recognizer, 'view');
  }
  // 带参数的方法。selector 是完整的 ObjC selector，JS 层的
  // 「第一段 + options」在各自的方法里还原成它。
  // 对象参数在 JSON 里留 null，句柄按同样的下标单独传。
  // 看着像原生对象、却没有句柄 —— 原生对象还没创建。继承那条路已经在
  // 构造时就拦掉了（见 finalCheck），所以现在只剩一种来头：
  //   new UIWindow()   还没绑场景
  // 不拦的话它会走「普通值」那条路，句柄填 0，原生收到 nil 然后**静默
  // 什么都不做**——实测 parent.addSubview(子类实例) 就是这个下场。
  // 和只读属性静默失败是同一类错，所以一样要抛。
  function rejectUnbacked(value, where) {
    if (value instanceof NSObject) {
      const name = (value.constructor && value.constructor.name) || 'object';
      throw new TypeError(
        where + ': ' + name + ' has no native object yet, so it cannot be passed as an argument');
    }
  }
  function splitArgs(args, where) {
    const list = args || [];
    const values = [];
    const handles = [];
    for (const a of list) {
      const isObject = a != null && a[kHandle] !== undefined;
      if (!isObject) rejectUnbacked(a, where || 'call');
      values.push(isObject ? null : a);
      handles.push(isObject ? a[kHandle] : 0);
    }
    return { values, handles };
  }
  function nativeCall(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    return JSON.parse(
      native.call(obj[kHandle], selector, JSON.stringify(values), handles));
  }
  function nativeCallObject(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    const result =
      native.callObj(obj[kHandle], selector, JSON.stringify(values), handles);
    return result === undefined ? null : result;
  }
  // 可写的原生对象数组属性。值按「每个元素一个句柄」传，和方法的数组参数同路
  function nativeSetObjectArray(obj, name, values) {
    requireNative(obj, name);
    const list = Array.from(values || []);
    const handles = list.map((v) => {
      if (v == null) return 0;
      if (v[kHandle] === undefined) rejectUnbacked(v, name);
      return v[kHandle] || 0;
    });
    native.setObjArray(obj[kHandle], name, handles);
  }
  function nativeGetObjectArray(obj, name) {
    requireNative(obj, name);
    return native.getObjArray(obj[kHandle], name);
  }
  // 返回原生对象数组的方法。参数规则和 nativeCall 一样
  function nativeCallObjectArray(obj, selector, args) {
    requireNative(obj, selector);
    const { values, handles } = splitArgs(args, selector);
    return native.callObjArray(obj[kHandle], selector, JSON.stringify(values), handles);
  }
  // 带参数的类方法，比如 UIFont.systemFontOfSize(17)
  function nativeClassCall(className, selector, args) {
    const { values, handles } = splitArgs(args, className + '.' + selector);
    const result =
      native.classCall(className, selector, JSON.stringify(values), handles);
    return result === undefined ? null : result;
  }
  // 返回值不是原生对象的类方法，比如 CATransaction.begin()
  function nativeClassCallValue(className, selector, args) {
    const { values, handles } = splitArgs(args, className + '.' + selector);
    return JSON.parse(
      native.classCallValue(className, selector, JSON.stringify(values), handles));
  }
  // 类级属性（ObjC 的 @property(class, readonly)）。没有实例，用类名定位。
  function nativeClassObject(className, name) {
    const result = native.classObjProp(className, name);
    return result === undefined ? null : result;
  }
  // JS 构造原生对象：先有 this，再让原生造出对象并和 this 绑定。
  // 和包装工厂方向相反——那边是原生对象先有、JS 包装后建。
  function constructNative(wrapper, builtAs, className, args) {
    // 构造链上每个类都调一次，只有「正在被 new 的那个类」真的去建。
    // 新加一个类照抄这一行就行，不用判断「会不会被别的类继承」——
    // 以前那条规则漏过一次（UINavigationController），也抄错过一次（UIButton）。
    if (nativeClasses[className] !== builtAs) return;
    // 和方法通道同一个拆法：标量进 values，对象进 handles，对象位在
    // values 里留 null。**原来只传 handles**，所以 new 一个要字符串或
    // 数字的类做不了——CAMediaTimingFunction、弹簧的感知时长初始化器、
    // WebSocket 的 url 都撞过这堵墙
    const { values, handles } = splitArgs(args, 'new ' + className);
    const handle = native.construct(className, JSON.stringify(values), handles, wrapper);
    // 建不出来就抛，别留一个没句柄的空壳——那种对象之后每碰一下都报
    // 「还没连接到场景」，根本看不出真正的原因在构造这一步
    if (!handle) {
      throw new TypeError('cannot construct ' + className + ' with these arguments');
    }
    Object.defineProperty(wrapper, kHandle, { value: handle });
  }

  // 只有被原生侧创建时才允许构造。用于系统给的对象（场景、session）。
  // 原生对象还没创建时，除了 windowScene 之外的访问都没有事实可依据，
  // 与其返回一个编出来的值，不如直接报错
  // 「没有原生对象」有两种，病因完全不同，所以分开报：
  //   走过构造函数但还没绑   → 只剩 new UIWindow() 等场景这一种，是**合法**状态
  //   没走过任何构造函数     → Object.create(X.prototype) 出来的，原型链对但
  //                            一个内部状态都没有。Chrome 对这种报 Illegal
  //                            invocation，我们跟它一致
  // 判据是 kListeners：它由 EventTarget 的构造函数（和包装工厂）装上，
  // 绕过构造的对象上没有。
  function requireNative(obj, what) {
    if (obj[kHandle] !== undefined) return;
    if (obj[kListeners] === undefined) {
      throw new TypeError(what + ': Illegal invocation');
    }
    throw new TypeError(
      what + ': this object is not connected to a scene yet, so no native object exists');
  }

  // 原生类一律是 final。运行时还没有把覆写转发回 JS 的机制（M2），子类的
  // super() 建不出原生对象——以前它静默给一个空壳，等到第一次读属性才在
  // 三十行之外抛「还没连接到场景」，指向完全无关的地方。现在在构造那一刻说。
  // 所有原生类的构造链都经过 NSObject，所以拦这一处就够。
  //
  // 拦不到 `class X extends UIView {}` 那一行本身：JS 没有「拒绝被继承」的
  // 钩子，extends 只是读 prototype 再 setPrototypeOf，没有可以挂的陷阱。
  // 所以错误信息里把两个类名都点出来，让它指得回去。
  function finalCheck(newTarget) {
    if (nativeClassNames.has(newTarget)) return;
    let base = Object.getPrototypeOf(newTarget);
    while (typeof base === 'function' && !nativeClassNames.has(base)) {
      base = Object.getPrototypeOf(base);
    }
    const name = (newTarget && newTarget.name) || 'this class';
    const baseName = nativeClassNames.get(base) || 'a native class';
    throw new TypeError(
      'Illegal constructor: ' + name + ' extends ' + baseName +
      ', but subclassing native classes is not supported yet');
  }

  // 只能由运行时的包装工厂建的类（UIColor、CALayer、场景…）。
  // 工厂不走构造函数，所以这里无条件抛。
  function nativeOnly(newTarget) {
    finalCheck(newTarget);   // 是子类化就先报子类化，那个错更接近原因
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' is created by the runtime, not by new');
  }

  // 继承链上的空壳：ObjC 侧没有可用的 init，自己不可直接构造，
  // 但不能挡住可构造的子类。new.target 在子类的 super() 里是子类。
  function shellOnly(newTarget, cls, name) {
    if (newTarget === cls) {
      throw new TypeError('Illegal constructor: ' + name + ' cannot be constructed');
    }
  }

  // ---- 结构体 ----
  // ObjC 里结构体按值传递，`view.frame.x = 10` 是编译错误（改的是一个
  // 临时副本）。JS 没有值类型，用普通对象表示的话这行会**静默无效**，
  // 所以每个字段都定义成带 setter 的访问器，赋值直接抛。
  // 不用 Object.freeze：冻结只在严格模式下抛，而用户的 JS 是普通脚本。

  // 这个 part 对外提供的东西
  Object.assign(ctx, {
    anchorOf,
    constraintOf,
    constructNative,
    defineNativeClass,
    describeValue,
    disown,
    finalCheck,
    gestureViewOf,
    has,
    kHandle,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeCallObjectArray,
    nativeCallVoid,
    nativeClassCall,
    nativeClassCallValue,
    nativeClassNames,
    nativeClassObject,
    nativeClasses,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetObject,
    nativeSetObjectArray,
    nativeSetOwned,
    own,
    ownAll,
    ownOne,
    ownedValue,
    parentControllerOf,
    requireNative,
    shellOnly,
    subscribeNative,
    superviewOf,
    toBoolean,
    toInteger,
    toNumber,
    toNumberOrName,
    toNumbersOrNull,
    toText,
    toTextOrNull,
  });
})
