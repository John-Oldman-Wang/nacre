// 输入框的 should… 事件带的字段
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 五个 should… 事件本身不用在这里写什么：UITextField 继承 UIControl 的订阅
// 钩子，名字原样交给原生，原生那边登记的域认领（NacreTextFieldDelegate.mm）。
// 这里只管一件事：beforeinput 带的 range 过桥时是 { location, length }，
// 换成 NSRange，和 UITextView.selectedRange 是同一个类型。
(function (ctx) {
  'use strict';

  ctx.eventFieldConverters.set('beforeinput', (fields) => {
    const range = fields.range;
    // NSRange 定义在多行输入那个 part 里，这个函数到派发事件时才执行，那时它已经在了
    return {
      range: new NSRange(range.location, range.length),
      replacementString: fields.replacementString,
    };
  });
})
