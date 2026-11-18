// 路径：UIBezierPath
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    RECT_FIELDS,
    SIZE_FIELDS,
    TRANSFORM_FIELDS,
    constructNative,
    defineNativeClass,
    has,
    nativeCall,
    nativeCallObject,
    nativeClassCall,
    nativeGet,
    nativeSet,
    requireNative,
    structArg,
    toBoolean,
    toNumber,
    toPoint,
    toRect,
  } = ctx;

  const UIBezierPath = defineNativeClass('UIBezierPath', class UIBezierPath extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'UIBezierPath', []);
    }

    // ---- 现成的形状 ----
    static bezierPathWithRect(rect) {
      return nativeClassCall('UIBezierPath', 'bezierPathWithRect:',
                             [structArg(rect, RECT_FIELDS, 'bezierPathWithRect')]);
    }
    // 内切椭圆。正方形进去就是个正圆
    static bezierPathWithOvalInRect(rect) {
      return nativeClassCall('UIBezierPath', 'bezierPathWithOvalInRect:',
                             [structArg(rect, RECT_FIELDS, 'bezierPathWithOvalInRect')]);
    }
    // 两种写法：{ cornerRadius } 四个角一样圆，
    // { byRoundingCorners, cornerRadii } 挑角，半径是 CGSize（横纵可以不同）
    static bezierPathWithRoundedRect(rect, options) {
      const o = options || {};
      const r = structArg(rect, RECT_FIELDS, 'bezierPathWithRoundedRect');
      if (has(o, 'byRoundingCorners')) {
        return nativeClassCall(
          'UIBezierPath', 'bezierPathWithRoundedRect:byRoundingCorners:cornerRadii:',
          [r, o.byRoundingCorners,
           structArg(o.cornerRadii, SIZE_FIELDS, 'cornerRadii')]);
      }
      if (has(o, 'cornerRadius')) {
        return nativeClassCall('UIBezierPath', 'bezierPathWithRoundedRect:cornerRadius:',
                               [r, toNumber(o.cornerRadius, 'cornerRadius')]);
      }
      throw new TypeError('bezierPathWithRoundedRect needs { cornerRadius } ' +
                          'or { byRoundingCorners, cornerRadii }');
    }
    // 一段圆弧。四个选项都要给——原生这里没有默认值，我们也不发明一个
    static bezierPathWithArcCenter(center, options) {
      const o = options || {};
      for (const key of ['radius', 'startAngle', 'endAngle', 'clockwise']) {
        if (!(key in o)) {
          throw new TypeError('bezierPathWithArcCenter needs { radius, startAngle, ' +
                              'endAngle, clockwise }; missing ' + key);
        }
      }
      return nativeClassCall(
        'UIBezierPath', 'bezierPathWithArcCenter:radius:startAngle:endAngle:clockwise:',
        [structArg(center, POINT_FIELDS, 'bezierPathWithArcCenter'),
         o.radius, o.startAngle, o.endAngle, o.clockwise]);
    }

    // ---- 自己画 ----
    // 抬笔移到某处，开一段新的子路径
    moveToPoint(point) {
      nativeCall(this, 'moveToPoint:', [structArg(point, POINT_FIELDS, 'moveToPoint')]);
    }
    // 从 currentPoint 连一条直线过去。没有 currentPoint 时什么都不画
    addLineToPoint(point) {
      nativeCall(this, 'addLineToPoint:', [structArg(point, POINT_FIELDS, 'addLineToPoint')]);
    }
    // 三次贝塞尔：两个控制点
    addCurveToPoint(point, options) {
      const o = options || {};
      nativeCall(this, 'addCurveToPoint:controlPoint1:controlPoint2:', [
        structArg(point, POINT_FIELDS, 'addCurveToPoint'),
        structArg(o.controlPoint1, POINT_FIELDS, 'controlPoint1'),
        structArg(o.controlPoint2, POINT_FIELDS, 'controlPoint2'),
      ]);
    }
    // 二次贝塞尔：一个控制点
    addQuadCurveToPoint(point, options) {
      const o = options || {};
      nativeCall(this, 'addQuadCurveToPoint:controlPoint:', [
        structArg(point, POINT_FIELDS, 'addQuadCurveToPoint'),
        structArg(o.controlPoint, POINT_FIELDS, 'controlPoint'),
      ]);
    }
    // 接一段圆弧。已经有 currentPoint 的话会先连一条直线到弧的起点
    addArcWithCenter(center, options) {
      const o = options || {};
      for (const key of ['radius', 'startAngle', 'endAngle', 'clockwise']) {
        if (!(key in o)) {
          throw new TypeError('addArcWithCenter needs { radius, startAngle, ' +
                              'endAngle, clockwise }; missing ' + key);
        }
      }
      nativeCall(this, 'addArcWithCenter:radius:startAngle:endAngle:clockwise:', [
        structArg(center, POINT_FIELDS, 'addArcWithCenter'),
        toNumber(o.radius, 'radius'), toNumber(o.startAngle, 'startAngle'),
        toNumber(o.endAngle, 'endAngle'), toBoolean(o.clockwise),
      ]);
    }
    // 连回这段子路径的起点。填充时开口路径会被当成闭合的，但描边看得出区别
    closePath() { nativeCall(this, 'closePath', []); }
    removeAllPoints() { nativeCall(this, 'removeAllPoints', []); }
    // 把另一条路径整段接过来。接的是副本，之后改它不影响这一条
    appendPath(path) { nativeCall(this, 'appendPath:', [path]); }
    // **就地**变换，不返回新路径
    applyTransform(transform) {
      nativeCall(this, 'applyTransform:',
                 [structArg(transform, TRANSFORM_FIELDS, 'applyTransform')]);
    }
    // 反向的一条新路径。方向只在 nonZero 填充规则下看得出来
    bezierPathByReversingPath() {
      return nativeCallObject(this, 'bezierPathByReversingPath', []);
    }

    // ---- 问它 ----
    // 只看**填充区域**，描边不算；开口路径按闭合之后算
    containsPoint(point) {
      return nativeCall(this, 'containsPoint:',
                        [structArg(point, POINT_FIELDS, 'containsPoint')]);
    }
    get isEmpty() {
      requireNative(this, 'isEmpty');
      return nativeGet(this, 'isEmpty');
    }
    // 把路径包住的最小矩形。算的是**路径本身**，不含线宽
    get bounds() {
      requireNative(this, 'bounds');
      return toRect(nativeGet(this, 'bounds'));
    }
    // 笔尖在哪。空路径时是 (0, 0)
    get currentPoint() {
      requireNative(this, 'currentPoint');
      return toPoint(nativeGet(this, 'currentPoint'));
    }
    // 填充规则。默认 false = nonZero。注意画在图层上时不看这个，
    // 看的是 CAShapeLayer.fillRule——这条只影响 containsPoint 的判定
    get usesEvenOddFillRule() {
      requireNative(this, 'usesEvenOddFillRule');
      return nativeGet(this, 'usesEvenOddFillRule');
    }
    set usesEvenOddFillRule(value) {
      requireNative(this, 'usesEvenOddFillRule');
      nativeSet(this, 'usesEvenOddFillRule', toBoolean(value));
    }
  });


})
