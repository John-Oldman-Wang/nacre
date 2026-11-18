// 表示「正在进行」的两个视图：UIActivityIndicatorView、UIProgressView
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
    nativeCall,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    own,
    requireNative,
    toBoolean,
    toNumber,
  } = ctx;

  // 转圈：不知道还要多久时用。它只有「在转」和「没在转」两种状态。
  //
  // 两个量出来的事实决定了怎么用它：
  //   - 新建的是**隐藏的**：hidesWhenStopped 默认 true，而它还没开始转。
  //     调 startAnimating() 它自己显示出来，stopAnimating() 自己隐藏
  //   - 新建的 frame 是 0×0。它自己想要的大小（intrinsicContentSize）跟着
  //     样式走：medium 20×20，large 37×37。用约束定位时不用给宽高；
  //     用 frame 定位时调 sizeToFit()
  defineNativeClass('UIActivityIndicatorView', class UIActivityIndicatorView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIActivityIndicatorView', []);
    }

    // 'medium' | 'large'。换样式只改它想要的大小，不动 frame，也不动颜色
    get activityIndicatorViewStyle() {
      requireNative(this, 'activityIndicatorViewStyle');
      return nativeGet(this, 'activityIndicatorViewStyle');
    }
    set activityIndicatorViewStyle(value) {
      requireNative(this, 'activityIndicatorViewStyle');
      nativeSet(this, 'activityIndicatorViewStyle', value);
    }
    // 停下时要不要自己隐藏。改它当场生效：没在转的时候写 false 立刻显示出来
    get hidesWhenStopped() {
      requireNative(this, 'hidesWhenStopped');
      return nativeGet(this, 'hidesWhenStopped');
    }
    set hidesWhenStopped(value) {
      requireNative(this, 'hidesWhenStopped');
      nativeSet(this, 'hidesWhenStopped', toBoolean(value));
    }
    // 读出来永远有值。写 null 是退回系统的默认色（secondaryLabel），
    // 不是「没有颜色」——头文件标的是 null_resettable
    get color() {
      requireNative(this, 'color');
      return colorString(nativeGetOwned(this, 'color'));
    }
    set color(value) {
      requireNative(this, 'color');
      const color = colorArg(value, 'color');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'color', color);
    }
    get isAnimating() {
      requireNative(this, 'isAnimating');
      return nativeGet(this, 'isAnimating');
    }

    startAnimating() {
      nativeCall(this, 'startAnimating', []);
    }
    stopAnimating() {
      nativeCall(this, 'stopAnimating', []);
    }
  });

  // 进度条：知道完成了多少时用。progress 是 0 到 1 之间的比例。
  //
  // 量出来的几条：
  //   - 高度由样式定死（default 4 pt），写 frame 只有宽度进得去；要改高度
  //     用高度约束
  //   - 着色和图片二选一：写图片，同一侧的着色被系统清成 null；写着色，
  //     同一侧的图片被清成 null
  defineNativeClass('UIProgressView', class UIProgressView extends UIView {
    constructor() {
      super();
      constructNative(this, new.target, 'UIProgressView', []);
    }

    // 'default' | 'bar'
    get progressViewStyle() {
      requireNative(this, 'progressViewStyle');
      return nativeGet(this, 'progressViewStyle');
    }
    set progressViewStyle(value) {
      requireNative(this, 'progressViewStyle');
      nativeSet(this, 'progressViewStyle', value);
    }
    // 原生存的是 32 位浮点：写 0.3 读回来是 Math.fround(0.3)。
    // 0 到 1 之外的值不抛，系统把它收到两端（头文件写明的行为）
    get progress() { requireNative(this, 'progress'); return nativeGet(this, 'progress'); }
    set progress(value) {
      requireNative(this, 'progress');
      nativeSet(this, 'progress', toNumber(value, 'progress'));
    }
    // 带动画时 progress 属性当场就是目标值，动的只是画面
    setProgress(progress, options) {
      const o = options || {};
      nativeCall(this, 'setProgress:animated:',
                 [toNumber(progress, 'progress'), toBoolean(o.animated)]);
    }

    // ---- 着色 ----
    // 已完成的那一段。null 是没单独设，这时跟着视图的 tintColor 走
    get progressTintColor() {
      requireNative(this, 'progressTintColor');
      return colorString(nativeGetOwned(this, 'progressTintColor'));
    }
    set progressTintColor(value) {
      requireNative(this, 'progressTintColor');
      const color = colorArg(value, 'progressTintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'progressTintColor', color);
      // 写了着色，系统把同一侧的图片清掉了，镜像跟上
      if (color !== null) own(this, 'progressImage', null);
    }
    // 还没完成的那一段
    get trackTintColor() {
      requireNative(this, 'trackTintColor');
      return colorString(nativeGetOwned(this, 'trackTintColor'));
    }
    set trackTintColor(value) {
      requireNative(this, 'trackTintColor');
      const color = colorArg(value, 'trackTintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'trackTintColor', color);
      if (color !== null) own(this, 'trackImage', null);
    }

    // ---- 图片 ----
    get progressImage() {
      requireNative(this, 'progressImage');
      return nativeGetOwned(this, 'progressImage');
    }
    set progressImage(value) {
      requireNative(this, 'progressImage');
      nativeSetOwned(this, 'progressImage', value);
      // 写了图片，系统把同一侧的着色清掉了，镜像跟上
      if (value != null) own(this, 'progressTintColor', null);
    }
    get trackImage() {
      requireNative(this, 'trackImage');
      return nativeGetOwned(this, 'trackImage');
    }
    set trackImage(value) {
      requireNative(this, 'trackImage');
      nativeSetOwned(this, 'trackImage', value);
      if (value != null) own(this, 'trackTintColor', null);
    }
  });
})
