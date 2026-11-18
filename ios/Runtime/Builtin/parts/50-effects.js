// 毛玻璃：UIVisualEffectView 和它显示的效果
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    colorArg,
    colorString,
    constructNative,
    defineNativeClass,
    finalCheck,
    has,
    nativeClassCall,
    nativeClassNames,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    own,
    requireNative,
    shellOnly,
    toBoolean,
    toNumber,
  } = ctx;

  // ---- 效果 ----
  //
  // 效果是「怎么处理视图后面的画面」的一份说明，自己不显示任何东西，要交给
  // UIVisualEffectView 才看得见。
  //
  // 模糊、鲜明、玻璃都由类方法造出来，不是 new 出来的——ObjC 那边它们的
  // -init 是从 NSObject 继承来的，造出来的是一个什么都不做的效果
  function factoryOnly(newTarget, hint) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' is not created with new; use ' + hint);
  }

  // 基类。自己不可构造，但不能挡住可构造的子类（UIGlassContainerEffect）
  const UIVisualEffect = defineNativeClass('UIVisualEffect',
                                           class UIVisualEffect extends NSObject {
    constructor() { shellOnly(new.target, UIVisualEffect, 'UIVisualEffect'); super(); }
  });

  // 模糊：把视图后面的画面糊掉。不可变，同一个对象可以给多个视图用
  defineNativeClass('UIBlurEffect', class UIBlurEffect extends UIVisualEffect {
    constructor() { factoryOnly(new.target, 'UIBlurEffect.effectWithStyle(style)'); }
    static effectWithStyle(style) {
      return nativeClassCall('UIBlurEffect', 'effectWithStyle:', [style]);
    }
  });

  // 鲜明：让放在模糊上面的文字和图标透出底下的颜色。照着一个模糊效果来建，
  // 用在盖在那块模糊上面（或它的 contentView 里面）的另一个效果视图上
  defineNativeClass('UIVibrancyEffect', class UIVibrancyEffect extends UIVisualEffect {
    constructor() {
      factoryOnly(new.target, 'UIVibrancyEffect.effectForBlurEffect(blurEffect, { style })');
    }
    static effectForBlurEffect(blurEffect, options) {
      const o = options || {};
      if (has(o, 'style')) {
        return nativeClassCall('UIVibrancyEffect', 'effectForBlurEffect:style:',
                               [blurEffect, o.style]);
      }
      return nativeClassCall('UIVibrancyEffect', 'effectForBlurEffect:', [blurEffect]);
    }
  });

  // 玻璃（iOS 26）。和模糊、鲜明不同，它带可写的属性——所以效果视图存的是
  // **赋值那一刻的副本**：赋值之后再改这个对象，视图不跟着变，要重新赋一次
  defineNativeClass('UIGlassEffect', class UIGlassEffect extends UIVisualEffect {
    constructor() { factoryOnly(new.target, 'UIGlassEffect.effectWithStyle(style)'); }
    static effectWithStyle(style) {
      return nativeClassCall('UIGlassEffect', 'effectWithStyle:', [style]);
    }
    // 手指按上去时玻璃要不要有反应。默认 false
    get isInteractive() {
      requireNative(this, 'isInteractive');
      return nativeGet(this, 'isInteractive');
    }
    set isInteractive(value) {
      requireNative(this, 'isInteractive');
      nativeSet(this, 'isInteractive', toBoolean(value));
    }
    // 给玻璃染的颜色。默认 null（不染）
    get tintColor() {
      requireNative(this, 'tintColor');
      return colorString(nativeGetOwned(this, 'tintColor'));
    }
    set tintColor(value) {
      requireNative(this, 'tintColor');
      const color = colorArg(value, 'tintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'tintColor', color);
    }
  });

  // 玻璃容器（iOS 26）：把它的 contentView 里的几块玻璃合成一组来画，
  // 靠得够近的会融在一起。和玻璃一样，视图存的是副本
  defineNativeClass('UIGlassContainerEffect',
                    class UIGlassContainerEffect extends UIVisualEffect {
    constructor() {
      super();
      constructNative(this, new.target, 'UIGlassContainerEffect', []);
    }
    // 两块玻璃相距多近开始融合，点。默认 0
    get spacing() { requireNative(this, 'spacing'); return nativeGet(this, 'spacing'); }
    set spacing(value) {
      requireNative(this, 'spacing');
      nativeSet(this, 'spacing', toNumber(value, 'spacing'));
    }
  });

  // ---- 效果视图 ----
  //
  // 把一个效果显示出来的视图。**内容不加在它自己上面，加在 contentView 上**
  // ——直接 addSubview 会抛（原生那一侧拦的，见 NacreEffects.mm）。
  defineNativeClass('UIVisualEffectView', class UIVisualEffectView extends UIView {
    constructor(effect) {
      super();
      constructNative(this, new.target, 'UIVisualEffectView', [effect]);
      own(this, 'effect', effect);
    }
    // 模糊和鲜明读回来是写进去的那个对象。玻璃和玻璃容器读回来是视图里
    // 那份副本的又一份副本，每次读都是新的——镜像记的是最近读到的那个
    get effect() { requireNative(this, 'effect'); return nativeGetOwned(this, 'effect'); }
    set effect(value) {
      requireNative(this, 'effect');
      nativeSetOwned(this, 'effect', value);
    }
    // 放内容的地方。一直是同一个视图，换效果、清效果都不变
    get contentView() {
      requireNative(this, 'contentView');
      return nativeGetOwned(this, 'contentView');
    }
  });
})
