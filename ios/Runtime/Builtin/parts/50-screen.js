// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 屏幕：UIScreen、UIScreenMode，和场景上的 screen。两个类都不能 new，屏幕只从场景拿。
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    kSubscribe,
    nativeCallObject,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetOwned,
    requireNative,
    subscribeNative,
    toBoolean,
    toNumber,
    toRect,
    toSize,
  } = ctx;

  // 场景上的 screen：拿屏幕的唯一入口（UIScreen.mainScreen 在 iOS 26 废弃了）。
  // 系统的屏幕一直活着，由场景拿着它的包装
  Object.defineProperty(UIWindowScene.prototype, 'screen', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'screen'); return nativeGetOwned(this, 'screen'); },
  });

  defineNativeClass('UIScreen', class UIScreen extends NSObject {
    constructor() { nativeOnly(new.target); }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    get bounds() { requireNative(this, 'bounds'); return toRect(nativeGet(this, 'bounds')); }
    get scale() { requireNative(this, 'scale'); return nativeGet(this, 'scale'); }
    get preferredMode() { requireNative(this, 'preferredMode'); return nativeGetOwned(this, 'preferredMode'); }
    get currentMode() { requireNative(this, 'currentMode'); return nativeGetOwned(this, 'currentMode'); }
    set currentMode(value) { requireNative(this, 'currentMode'); nativeSetOwned(this, 'currentMode', value); }
    get mirroredScreen() { requireNative(this, 'mirroredScreen'); return nativeGetOwned(this, 'mirroredScreen'); }
    get isCaptured() { requireNative(this, 'isCaptured'); return nativeGet(this, 'isCaptured'); }
    get brightness() { requireNative(this, 'brightness'); return nativeGet(this, 'brightness'); }
    set brightness(value) {
      requireNative(this, 'brightness');
      const n = toNumber(value, 'brightness');
      if (n < 0 || n > 1) throw new TypeError('brightness must be between 0 and 1, got ' + n);
      nativeSet(this, 'brightness', n);
    }
    get wantsSoftwareDimming() { requireNative(this, 'wantsSoftwareDimming'); return nativeGet(this, 'wantsSoftwareDimming'); }
    set wantsSoftwareDimming(value) { requireNative(this, 'wantsSoftwareDimming'); nativeSet(this, 'wantsSoftwareDimming', toBoolean(value)); }
    get nativeBounds() { requireNative(this, 'nativeBounds'); return toRect(nativeGet(this, 'nativeBounds')); }
    get nativeScale() { requireNative(this, 'nativeScale'); return nativeGet(this, 'nativeScale'); }
    get maximumFramesPerSecond() { requireNative(this, 'maximumFramesPerSecond'); return nativeGet(this, 'maximumFramesPerSecond'); }
    get calibratedLatency() { requireNative(this, 'calibratedLatency'); return nativeGet(this, 'calibratedLatency'); }
    get referenceDisplayModeStatus() { requireNative(this, 'referenceDisplayModeStatus'); return nativeGet(this, 'referenceDisplayModeStatus'); }
    get currentEDRHeadroom() { requireNative(this, 'currentEDRHeadroom'); return nativeGet(this, 'currentEDRHeadroom'); }
    get potentialEDRHeadroom() { requireNative(this, 'potentialEDRHeadroom'); return nativeGet(this, 'potentialEDRHeadroom'); }
    get availableModes() { requireNative(this, 'availableModes'); return nativeGetObjectArray(this, 'availableModes'); }
    get traitCollection() { requireNative(this, 'traitCollection'); return nativeGetObject(this, 'traitCollection'); }

    snapshotViewAfterScreenUpdates(afterUpdates) {
      return nativeCallObject(this, 'snapshotViewAfterScreenUpdates:', [toBoolean(afterUpdates)]);
    }
  });

  defineNativeClass('UIScreenMode', class UIScreenMode extends NSObject {
    constructor() { nativeOnly(new.target); }

    get size() { requireNative(this, 'size'); return toSize(nativeGet(this, 'size')); }
    get pixelAspectRatio() { requireNative(this, 'pixelAspectRatio'); return nativeGet(this, 'pixelAspectRatio'); }
  });
})
