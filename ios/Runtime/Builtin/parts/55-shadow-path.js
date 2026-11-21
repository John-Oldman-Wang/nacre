// 图层的 shadowPath：阴影照这条路径的形状画。原生在 NacreShadowPath.mm。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { nativeGetObject, nativeSetOwned, ownedValue, requireNative } = ctx;

  // 和 CAShapeLayer.path 同一个写法：写进去的那个对象原样还回来（原生存的是
  // CGPath，读只能现包一个新的）。包装被回收重建过之后读到的是按原生重建的新对象
  Object.defineProperty(CALayer.prototype, 'shadowPath', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'shadowPath');
      const mine = ownedValue(this, 'shadowPath');
      return mine === undefined ? nativeGetObject(this, 'shadowPath') : mine;
    },
    set(value) {
      requireNative(this, 'shadowPath');
      nativeSetOwned(this, 'shadowPath', value);
    },
  });
})
