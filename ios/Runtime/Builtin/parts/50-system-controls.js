// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// UIColorWell。
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    colorArg,
    colorString,
    constructNative,
    defineNativeClass,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    requireNative,
    toBoolean,
    toNumber,
    toTextOrNull,
  } = ctx;

  defineNativeClass('UIColorWell', class UIColorWell extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIColorWell', []);
    }

    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    set title(value) { requireNative(this, 'title'); nativeSet(this, 'title', toTextOrNull(value)); }
    get supportsAlpha() { requireNative(this, 'supportsAlpha'); return nativeGet(this, 'supportsAlpha'); }
    set supportsAlpha(value) { requireNative(this, 'supportsAlpha'); nativeSet(this, 'supportsAlpha', toBoolean(value)); }
    get selectedColor() {
      requireNative(this, 'selectedColor');
      return colorString(nativeGetOwned(this, 'selectedColor'));
    }
    set selectedColor(value) {
      requireNative(this, 'selectedColor');
      const color = colorArg(value, 'selectedColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'selectedColor', color);
    }
    get supportsEyedropper() { requireNative(this, 'supportsEyedropper'); return nativeGet(this, 'supportsEyedropper'); }
    set supportsEyedropper(value) { requireNative(this, 'supportsEyedropper'); nativeSet(this, 'supportsEyedropper', toBoolean(value)); }
    get maximumLinearExposure() { requireNative(this, 'maximumLinearExposure'); return nativeGet(this, 'maximumLinearExposure'); }
    set maximumLinearExposure(value) { requireNative(this, 'maximumLinearExposure'); nativeSet(this, 'maximumLinearExposure', toNumber(value, 'maximumLinearExposure')); }
  });
})
