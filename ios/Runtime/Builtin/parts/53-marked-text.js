// 输入法组字的范围：UITextField / UITextView 的 markedTextRange。只读。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { nativeGet, requireNative } = ctx;

  // 原生给的是 { location, length } 或者 null，和 selectedRange 一样包成 NSRange。
  // 两个类各写一段、名字写成字面量：三边核对按字面认挂载和取值的名字
  const toRange = (range) => (range === null ? null : new NSRange(range.location, range.length));
  Object.defineProperty(UITextField.prototype, 'markedTextRange', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'markedTextRange');
      return toRange(nativeGet(this, 'markedTextRange'));
    },
  });
  Object.defineProperty(UITextView.prototype, 'markedTextRange', {
    configurable: true,
    enumerable: false,
    get() {
      requireNative(this, 'markedTextRange');
      return toRange(nativeGet(this, 'markedTextRange'));
    },
  });
})
