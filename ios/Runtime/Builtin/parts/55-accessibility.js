// 无障碍：读屏要的那一组属性，挂在 UIView 上。原生在 NacreAccessibility.mm。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { describeValue, nativeGet, nativeSet, requireNative, toBoolean, toTextOrNull } = ctx;

  // 每个属性逐个写出来：check-api.sh 按字面认 JS 挂了哪些名字
  Object.defineProperty(UIView.prototype, 'isAccessibilityElement', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'isAccessibilityElement'); return nativeGet(this, 'isAccessibilityElement'); },
    set(value) { requireNative(this, 'isAccessibilityElement'); nativeSet(this, 'isAccessibilityElement', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityLabel', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityLabel'); return nativeGet(this, 'accessibilityLabel'); },
    set(value) { requireNative(this, 'accessibilityLabel'); nativeSet(this, 'accessibilityLabel', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityHint', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityHint'); return nativeGet(this, 'accessibilityHint'); },
    set(value) { requireNative(this, 'accessibilityHint'); nativeSet(this, 'accessibilityHint', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityValue', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityValue'); return nativeGet(this, 'accessibilityValue'); },
    set(value) { requireNative(this, 'accessibilityValue'); nativeSet(this, 'accessibilityValue', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityIdentifier', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityIdentifier'); return nativeGet(this, 'accessibilityIdentifier'); },
    set(value) { requireNative(this, 'accessibilityIdentifier'); nativeSet(this, 'accessibilityIdentifier', toTextOrNull(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityElementsHidden', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityElementsHidden'); return nativeGet(this, 'accessibilityElementsHidden'); },
    set(value) { requireNative(this, 'accessibilityElementsHidden'); nativeSet(this, 'accessibilityElementsHidden', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'accessibilityViewIsModal', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityViewIsModal'); return nativeGet(this, 'accessibilityViewIsModal'); },
    set(value) { requireNative(this, 'accessibilityViewIsModal'); nativeSet(this, 'accessibilityViewIsModal', toBoolean(value)); },
  });
  Object.defineProperty(UIView.prototype, 'shouldGroupAccessibilityChildren', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'shouldGroupAccessibilityChildren'); return nativeGet(this, 'shouldGroupAccessibilityChildren'); },
    set(value) { requireNative(this, 'shouldGroupAccessibilityChildren'); nativeSet(this, 'shouldGroupAccessibilityChildren', toBoolean(value)); },
  });

  // 特征是位掩码：一组名字。不是数组（可迭代）是类型错，抛；名字不认识由原生
  // 报成警告、整次赋值不生效
  Object.defineProperty(UIView.prototype, 'accessibilityTraits', {
    configurable: true,
    enumerable: false,
    get() { requireNative(this, 'accessibilityTraits'); return nativeGet(this, 'accessibilityTraits'); },
    set(value) {
      requireNative(this, 'accessibilityTraits');
      if (value === null || typeof value !== 'object' || typeof value[Symbol.iterator] !== 'function') {
        throw new TypeError('accessibilityTraits must be an array of trait names, got ' + describeValue(value));
      }
      nativeSet(this, 'accessibilityTraits', Array.from(value));
    },
  });
})
