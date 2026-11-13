// 图层：CALayer 和它的子类
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    constructNative,
    defineNativeClass,
    disown,
    has,
    kHandle,
    nativeCall,
    nativeCallObject,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    nativeSetObjectArray,
    nativeSetOwned,
    ownAll,
    ownOne,
    ownedValue,
    requireNative,
    structArg,
    toBoolean,
    toInteger,
    toNumber,
    toNumbersOrNull,
    toPoint,
    toRect,
    toSize,
    toText,
    toTextOrNull,
  } = ctx;

  // 这几个定义在后面的 part 里，转发一道（原文整个是一个 IIFE，靠函数提升）
  const colorArg = (...a) => ctx.colorArg(...a);
  const colorString = (...a) => ctx.colorString(...a);

  const CALayer = defineNativeClass('CALayer', class CALayer extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'CALayer', []);
    }

    // ---- 几何 ----
    // 自己建的图层默认是 0×0，不设 frame 什么都看不见
    get frame() {
      requireNative(this, 'frame');
      return toRect(nativeGet(this, 'frame'));
    }
    set frame(value) {
      requireNative(this, 'frame');
      nativeSet(this, 'frame', structArg(value, RECT_FIELDS, 'frame'));
    }
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    set bounds(value) {
      requireNative(this, 'bounds');
      nativeSet(this, 'bounds', structArg(value, RECT_FIELDS, 'bounds'));
    }
    // 图层在父图层里的位置。默认锚点在正中，所以这是中心点而不是左上角
    get position() {
      requireNative(this, 'position');
      return toPoint(nativeGet(this, 'position'));
    }
    set position(value) {
      requireNative(this, 'position');
      nativeSet(this, 'position', structArg(value, POINT_FIELDS, 'position'));
    }
    // 不动 sublayers 的顺序就能改叠放次序。默认 0
    get zPosition() {
      requireNative(this, 'zPosition');
      return nativeGet(this, 'zPosition');
    }
    set zPosition(value) {
      requireNative(this, 'zPosition');
      nativeSet(this, 'zPosition', toNumber(value, 'zPosition'));
    }

    // ---- 层级 ----
    get superlayer() { return nativeGetObject(this, 'superlayer'); }
    // 读的同时按原生的真相重建这一层的持有列表（见「所有权镜像」）
    get sublayers() {
      return ownAll(this, 'sublayers', nativeGetObjectArray(this, 'sublayers'));
    }
    addSublayer(layer) {
      const from = superlayerOf(layer);
      nativeCall(this, 'addSublayer:', [layer]);
      disown(from, 'sublayers', layer);
      ownOne(this, 'sublayers', layer);
    }
    insertSublayer(layer, options) {
      const o = options || {};
      const from = superlayerOf(layer);
      if (has(o, 'atIndex')) {
        nativeCall(this, 'insertSublayer:atIndex:', [layer, toInteger(o.atIndex, 'atIndex')]);
      } else if (has(o, 'above')) {
        nativeCall(this, 'insertSublayer:above:', [layer, o.above]);
      } else if (has(o, 'below')) {
        nativeCall(this, 'insertSublayer:below:', [layer, o.below]);
      } else {
        throw new TypeError(
          'insertSublayer needs one of { atIndex } / { above } / { below }');
      }
      disown(from, 'sublayers', layer);
      ownOne(this, 'sublayers', layer);
    }
    removeFromSuperlayer() {
      const from = superlayerOf(this);
      nativeCall(this, 'removeFromSuperlayer', []);
      disown(from, 'sublayers', this);
    }

    // ---- 动画 ----
    //
    // **addAnimation 会拷贝一份动画。** 加完再改原来那个对象不会有任何
    // 效果，animationForKey 读回来的也是那份拷贝，不是你给的对象。
    //
    // JS 侧记一条持有边，让图层的包装拖住动画的包装：原生那边拖住的是
    // 拷贝，而事件要派发给**原来那个**——包装没了就没人收了。
    addAnimation(animation, options) {
      const o = options || {};
      nativeCall(this, 'addAnimation:forKey:',
                 [animation, toTextOrNull(o.forKey)]);
      ownOne(this, 'animations', animation);
    }
    removeAllAnimations() {
      nativeCall(this, 'removeAllAnimations', []);
      ownAll(this, 'animations', []);
    }
    // 持有边不在这里拆：读回来的是拷贝，认不出原来是哪个对象。
    // 多留一份引用是无害的（所有权镜像一路的取舍），少留才会出错
    removeAnimationForKey(key) {
      nativeCall(this, 'removeAnimationForKey:', [toText(key)]);
    }
    // 没有动画时给 []，不是 null
    animationKeys() { return nativeCall(this, 'animationKeys', []); }
    // 给的是**图层持有的那份拷贝**。头文件原话：改它的任何属性都是未定义行为
    animationForKey(key) { return nativeCallObject(this, 'animationForKey:', [toText(key)]); }

    // ---- 外观 ----
    get opacity() {
      requireNative(this, 'opacity');
      return nativeGet(this, 'opacity');
    }
    set opacity(value) {
      requireNative(this, 'opacity');
      nativeSet(this, 'opacity', toNumber(value, 'opacity'));
    }
    get isHidden() {
      requireNative(this, 'isHidden');
      return nativeGet(this, 'isHidden');
    }
    set isHidden(value) {
      requireNative(this, 'isHidden');
      nativeSet(this, 'isHidden', toBoolean(value));
    }
    // 子图层超出自己 bounds 的部分裁不裁掉。配 cornerRadius 用
    get masksToBounds() {
      requireNative(this, 'masksToBounds');
      return nativeGet(this, 'masksToBounds');
    }
    set masksToBounds(value) {
      requireNative(this, 'masksToBounds');
      nativeSet(this, 'masksToBounds', toBoolean(value));
    }
    // **默认是 1，不是屏幕的 scale**，画出来会糊。实测 view.layer 在
    // 场景接入时**也是 1**，所以它当不了屏幕 scale 的替代品
    get contentsScale() {
      requireNative(this, 'contentsScale');
      return nativeGet(this, 'contentsScale');
    }
    set contentsScale(value) {
      requireNative(this, 'contentsScale');
      nativeSet(this, 'contentsScale', toNumber(value, 'contentsScale'));
    }
    get backgroundColor() { return colorString(nativeGetOwned(this, 'backgroundColor')); }
    set backgroundColor(value) { {
      const color = colorArg(value, 'backgroundColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'backgroundColor', color);
    }; }

    // ---- 圆角 ----
    get cornerRadius() {
      requireNative(this, 'cornerRadius');
      return nativeGet(this, 'cornerRadius');
    }
    set cornerRadius(value) {
      requireNative(this, 'cornerRadius');
      nativeSet(this, 'cornerRadius', toNumber(value, 'cornerRadius'));
    }
    // 'continuous' 是 Apple 自己在用的那种圆角（超椭圆），过渡比正圆弧顺。
    // 图标、卡片都是它；默认是 'circular'
    get cornerCurve() {
      requireNative(this, 'cornerCurve');
      return nativeGet(this, 'cornerCurve');
    }
    set cornerCurve(value) {
      requireNative(this, 'cornerCurve');
      nativeSet(this, 'cornerCurve', value);
    }
    // 哪几个角要圆。位掩码，所以是字符串数组。
    // UIKit 的 y 轴朝下，minY 是上边——minXMinY 就是左上角
    get maskedCorners() {
      requireNative(this, 'maskedCorners');
      return nativeGet(this, 'maskedCorners');
    }
    set maskedCorners(value) {
      requireNative(this, 'maskedCorners');
      nativeSet(this, 'maskedCorners', value);
    }

    // ---- 边框 ----
    get borderWidth() {
      requireNative(this, 'borderWidth');
      return nativeGet(this, 'borderWidth');
    }
    set borderWidth(value) {
      requireNative(this, 'borderWidth');
      nativeSet(this, 'borderWidth', toNumber(value, 'borderWidth'));
    }
    // ObjC 这里是 CGColorRef，JS 侧统一用 UIColor。**读出来是新建的对象**，
    // 而且动态色在写入的那一刻就被定死了，详见 ca-layer.md
    get borderColor() { return colorString(nativeGetOwned(this, 'borderColor')); }
    set borderColor(value) { {
      const color = colorArg(value, 'borderColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'borderColor', color);
    }; }

    // ---- 阴影 ----
    // 默认 opacity 是 0，所以只设颜色看不见任何东西
    get shadowColor() { return colorString(nativeGetOwned(this, 'shadowColor')); }
    set shadowColor(value) { {
      const color = colorArg(value, 'shadowColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'shadowColor', color);
    }; }
    get shadowOpacity() {
      requireNative(this, 'shadowOpacity');
      return nativeGet(this, 'shadowOpacity');
    }
    set shadowOpacity(value) {
      requireNative(this, 'shadowOpacity');
      nativeSet(this, 'shadowOpacity', toNumber(value, 'shadowOpacity'));
    }
    get shadowRadius() {
      requireNative(this, 'shadowRadius');
      return nativeGet(this, 'shadowRadius');
    }
    set shadowRadius(value) {
      requireNative(this, 'shadowRadius');
      nativeSet(this, 'shadowRadius', toNumber(value, 'shadowRadius'));
    }
    get shadowOffset() {
      requireNative(this, 'shadowOffset');
      return toSize(nativeGet(this, 'shadowOffset'));
    }
    set shadowOffset(value) {
      requireNative(this, 'shadowOffset');
      nativeSet(this, 'shadowOffset', structArg(value, SIZE_FIELDS, 'shadowOffset'));
    }
  });

  function superlayerOf(layer) {
    if (layer == null || layer[kHandle] === undefined) return null;
    return nativeGetObject(layer, 'superlayer');
  }

  // 渐变。一条直线（axial）、从中心往外（radial）、或者绕中心转一圈（conic）。
  //
  // 它是个图层，所以和别的图层一样要自己设 frame。颜色至少给两个，不然
  // 什么都看不见。
  defineNativeClass('CAGradientLayer', class CAGradientLayer extends CALayer {
    constructor() {
      super();
      constructNative(this, new.target, 'CAGradientLayer', []);
    }

    // 渐变经过的颜色，按顺序。写进去的是字符串（或 UIColor），**读出来是
    // 字符串，但不一定是写进去的那个串**：原生存的是 CGColor，动态色在
    // 写入那一刻就被定死了，读回来只剩当时解析出的那个具体颜色
    get colors() {
      return nativeGetObjectArray(this, 'colors').map(colorString);
    }
    set colors(value) {
      const list = [];
      for (const v of Array.from(value || [])) {
        const color = colorArg(v, 'colors');
        if (color === undefined) return;   // 不合法，警告过了，整条都不写
        list.push(color);
      }
      nativeSetObjectArray(this, 'colors', list);
      ownAll(this, 'colors', list);
    }
    // 每个颜色落在 0…1 的哪一处。null 表示均匀分布（默认），
    // 个数要和 colors 对得上
    get locations() {
      requireNative(this, 'locations');
      return nativeGet(this, 'locations');
    }
    set locations(value) {
      requireNative(this, 'locations');
      nativeSet(this, 'locations', toNumbersOrNull(value, 'locations'));
    }
    // 单位坐标，不是点：(0,0) 是左上角，(1,1) 是右下角。默认从 (0.5,0) 到
    // (0.5,1)，也就是从上到下。radial 时 startPoint 是圆心、endPoint 定半径；
    // conic 时 startPoint 是圆心、endPoint 定起始角度
    get startPoint() {
      requireNative(this, 'startPoint');
      return toPoint(nativeGet(this, 'startPoint'));
    }
    set startPoint(value) {
      requireNative(this, 'startPoint');
      nativeSet(this, 'startPoint', structArg(value, POINT_FIELDS, 'startPoint'));
    }
    get endPoint() {
      requireNative(this, 'endPoint');
      return toPoint(nativeGet(this, 'endPoint'));
    }
    set endPoint(value) {
      requireNative(this, 'endPoint');
      nativeSet(this, 'endPoint', structArg(value, POINT_FIELDS, 'endPoint'));
    }
    get type() {
      requireNative(this, 'type');
      return nativeGet(this, 'type');
    }
    set type(value) {
      requireNative(this, 'type');
      nativeSet(this, 'type', value);
    }
  });

  // 画一条路径的图层。折线、扇形、饼图、K 线都靠它。
  //
  // 它不自己量尺寸：path 的坐标就是**图层自己坐标系里的点**，和 frame
  // 的大小没有关系，路径超出去的部分照样画（除非 masksToBounds）。
  defineNativeClass('CAShapeLayer', class CAShapeLayer extends CALayer {
    constructor() {
      super();
      constructNative(this, new.target, 'CAShapeLayer', []);
    }

    // 要画的路径。null 表示什么都不画。
    //
    // **写进去的那个对象会原样还回来**：原生存的是 CGPath，读回来只能
    // 现包一个新的 UIBezierPath，所以 JS 这边记了一份。包装被回收重建过
    // 之后镜像就没了，那时读到的是按原生重建的新对象——和 sublayers
    // 是同一条规矩：按原生的真相整层重建。
    //
    // 还有一条：路径是**存下来的副本**。写进去之后再改那条 UIBezierPath，
    // 图层不会跟着变，要再赋值一次。
    get path() {
      const mine = ownedValue(this, 'path');
      return mine === undefined ? nativeGetObject(this, 'path') : mine;
    }
    set path(value) {
      nativeSetOwned(this, 'path', value);
    }

    // ---- 填 ----
    // 默认是黑色，**不是透明**：只想要一条线的话记得设成 null
    get fillColor() { return colorString(nativeGetOwned(this, 'fillColor')); }
    set fillColor(value) { {
      if (value == null) { nativeSetOwned(this, 'fillColor', null); return; }
      const color = colorArg(value, 'fillColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'fillColor', color);
    }; }
    // 路径自交或者嵌套时才看得出区别。默认 'nonZero'
    get fillRule() {
      requireNative(this, 'fillRule');
      return nativeGet(this, 'fillRule');
    }
    set fillRule(value) {
      requireNative(this, 'fillRule');
      nativeSet(this, 'fillRule', value);
    }

    // ---- 描 ----
    // 默认是 null，所以只设 lineWidth 看不见线
    get strokeColor() { return colorString(nativeGetOwned(this, 'strokeColor')); }
    set strokeColor(value) { {
      if (value == null) { nativeSetOwned(this, 'strokeColor', null); return; }
      const color = colorArg(value, 'strokeColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'strokeColor', color);
    }; }
    // 默认 1。线是**骑在路径上**的，两边各占一半
    get lineWidth() {
      requireNative(this, 'lineWidth');
      return nativeGet(this, 'lineWidth');
    }
    set lineWidth(value) {
      requireNative(this, 'lineWidth');
      nativeSet(this, 'lineWidth', toNumber(value, 'lineWidth'));
    }
    // 线头：'butt'（默认，齐根切）/ 'round' / 'square'
    get lineCap() {
      requireNative(this, 'lineCap');
      return nativeGet(this, 'lineCap');
    }
    set lineCap(value) {
      requireNative(this, 'lineCap');
      nativeSet(this, 'lineCap', value);
    }
    // 拐角：'miter'（默认，尖角）/ 'round' / 'bevel'
    get lineJoin() {
      requireNative(this, 'lineJoin');
      return nativeGet(this, 'lineJoin');
    }
    set lineJoin(value) {
      requireNative(this, 'lineJoin');
      nativeSet(this, 'lineJoin', value);
    }
    // 尖角尖到什么程度就削平。默认 10
    get miterLimit() {
      requireNative(this, 'miterLimit');
      return nativeGet(this, 'miterLimit');
    }
    set miterLimit(value) {
      requireNative(this, 'miterLimit');
      nativeSet(this, 'miterLimit', toNumber(value, 'miterLimit'));
    }
    // 只描路径的一段，0…1。配动画能做「线一点点画出来」，
    // 现在没有动画，直接设也能做进度条
    get strokeStart() {
      requireNative(this, 'strokeStart');
      return nativeGet(this, 'strokeStart');
    }
    set strokeStart(value) {
      requireNative(this, 'strokeStart');
      nativeSet(this, 'strokeStart', toNumber(value, 'strokeStart'));
    }
    get strokeEnd() {
      requireNative(this, 'strokeEnd');
      return nativeGet(this, 'strokeEnd');
    }
    set strokeEnd(value) {
      requireNative(this, 'strokeEnd');
      nativeSet(this, 'strokeEnd', toNumber(value, 'strokeEnd'));
    }
    // 虚线：画多长、空多长，按顺序循环。null 是实线（默认）
    get lineDashPattern() {
      requireNative(this, 'lineDashPattern');
      return nativeGet(this, 'lineDashPattern');
    }
    set lineDashPattern(value) {
      requireNative(this, 'lineDashPattern');
      nativeSet(this, 'lineDashPattern', toNumbersOrNull(value, 'lineDashPattern'));
    }
    // 虚线从哪里开始。默认 0
    get lineDashPhase() {
      requireNative(this, 'lineDashPhase');
      return nativeGet(this, 'lineDashPhase');
    }
    set lineDashPhase(value) {
      requireNative(this, 'lineDashPhase');
      nativeSet(this, 'lineDashPhase', toNumber(value, 'lineDashPhase'));
    }
  });

  // WebSocket。
  //
  // 上层标准，和 fetch 一个定位——底下是 NSURLSessionWebSocketTask，但那个
  // 类不暴露。形状照 Web，**两处比 Web 多**：
  //
  //   headers   浏览器的构造器给不了首部，那是 Web 的历史限制不是协议的。
  //             真实业务里 Authorization 是刚需
  //   ping()    协议级的 ping，RFC 6455 规定对端必须回 Pong，不需要服务端
  //             应用配合。浏览器不给这个 API，只能做应用层心跳
  //
  // readyState **用数字**，是我们唯一一处为 Web 兼容破掉「枚举一律字符串」
  // 那条规矩的地方——从 Web / React Native 搬过来的代码里
  // `ws.readyState === WebSocket.OPEN` 要能直接跑。理由记在 project.md。

})
