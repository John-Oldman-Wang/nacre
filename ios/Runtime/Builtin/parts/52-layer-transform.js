// 图层的 3D 变换和遮罩：CALayer 的 transform / sublayerTransform / isDoubleSided / mask。
// CATransform3D 这个结构体类在 02-struct.js（和别的结构体放在一起）。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    TRANSFORM3D_FIELDS,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    requireNative,
    structArg,
    toBoolean,
    toTransform3D,
  } = ctx;

  // 图层的 3D 变换。写进去的可以是 CATransform3D，也可以是带齐 16 个字段的
  // 普通对象（{ ...CATransform3D.identity, m34: -1 / 500 } 这种写透视）
  Object.defineProperty(CALayer.prototype, 'transform', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'transform'); return toTransform3D(nativeGet(this, 'transform')); },
    set(value) {
      requireNative(this, 'transform');
      nativeSet(this, 'transform', structArg(value, TRANSFORM3D_FIELDS, 'transform'));
    },
  });
  // 给所有子图层统一加的变换。常用来给一组子图层一个共同的透视
  Object.defineProperty(CALayer.prototype, 'sublayerTransform', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'sublayerTransform');
      return toTransform3D(nativeGet(this, 'sublayerTransform'));
    },
    set(value) {
      requireNative(this, 'sublayerTransform');
      nativeSet(this, 'sublayerTransform', structArg(value, TRANSFORM3D_FIELDS, 'sublayerTransform'));
    },
  });
  // 转到背面时还画不画。翻面效果里背面那一张设成 false
  Object.defineProperty(CALayer.prototype, 'isDoubleSided', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isDoubleSided'); return nativeGet(this, 'isDoubleSided'); },
    set(value) { requireNative(this, 'isDoubleSided'); nativeSet(this, 'isDoubleSided', toBoolean(value)); },
  });
  // 遮罩：只显示这个图层里遮罩图层不透明的部分。原生强持有它，JS 这边记一条持有边
  Object.defineProperty(CALayer.prototype, 'mask', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'mask'); return nativeGetOwned(this, 'mask'); },
    set(value) { requireNative(this, 'mask'); nativeSetOwned(this, 'mask', value); },
  });
})
