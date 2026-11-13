// 继承链的根：NSObject / UIResponder / UIScene
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    defineNativeClass,
    finalCheck,
    nativeCall,
    nativeGet,
    shellOnly,
  } = ctx;

  const NSObject = defineNativeClass('NSObject', class NSObject extends EventTarget {
    constructor() {
      // 所有原生类的构造链都经过这里，所以「不许继承」拦这一处
      finalCheck(new.target);
      shellOnly(new.target, NSObject, 'NSObject');
      super();
    }
  });
  // UIResponder 在 ObjC 里的定义就是「能接收事件的对象」，和 EventTarget 语义吻合。
  const UIResponder = defineNativeClass('UIResponder', class UIResponder extends NSObject {
    constructor() { shellOnly(new.target, UIResponder, 'UIResponder'); super(); }

    // ---- first responder ----
    // 输入框弹不弹键盘就看它。返回值是「成没成」——系统可能拒绝，
    // 比如视图还没上屏，所以别忽略它
    becomeFirstResponder() { return nativeCall(this, 'becomeFirstResponder', []); }
    resignFirstResponder() { return nativeCall(this, 'resignFirstResponder', []); }
    get isFirstResponder() { return nativeGet(this, 'isFirstResponder'); }
    get canBecomeFirstResponder() { return nativeGet(this, 'canBecomeFirstResponder'); }
  });
  const UIScene = defineNativeClass('UIScene', class UIScene extends UIResponder {
    constructor() { shellOnly(new.target, UIScene, 'UIScene'); super(); }
  });
  // 图层。每个 UIView 背后都有一个（view.layer），真正把东西画出来的是它。
  //
  // 也可以自己建一个挂上去（new CALayer() + addSublayer），渐变、形状、
  // 图表都是这么做的。**子图层不走 Auto Layout**：iOS 上 CALayer 的
  // autoresizingMask 和 layoutManager 都标了 API_UNAVAILABLE(ios)，约束也
  // 只作用于 view，所以子图层的 frame 得自己设——view 的大小变了也要自己
  // 重设一次。见 docs/api/ca-layer.md。
  //
  // frame / bounds / opacity / isHidden 这些名字 UIView 上也有。view 自己
  // 那一层用 view 的写法（它才是参与布局的那个）；独立建的子图层上 view
  // 没有对应物，只能用这里的。
  // 路径。只管形状，不管怎么画——画出来是 CAShapeLayer 的事。
  //
  // 角度一律是**弧度**，而且 UIKit 的 y 轴朝下：0 弧度在正右方，角度增大
  // 是**顺时针**，和数学课上的方向相反。
  //
  // 没有 -fill / -stroke / -addClip，也没有路径自己那套 lineWidth /
  // lineCapStyle / lineJoinStyle / miterLimit / flatness：它们都只服务于
  // 那两个绘制方法，而绘制要当前 CGContext（= 覆写 drawRect:，还没有）。
  // 路径画在 CAShapeLayer 上时，生效的是**图层**的同名属性。

})
