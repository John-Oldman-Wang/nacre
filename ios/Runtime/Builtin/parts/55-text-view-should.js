// 多行输入框的拦截事件带的字段。原生在 NacreTextViewShould.mm。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
//
// 四个事件本身不用在这里写：UITextView 的订阅钩子把名字原样交给原生，由那个
// 域认领。beforeinput 带的 range 在单行输入框那个 part 里已经换成 NSRange 了
// （按事件名换，两个类共用）；这里只管 linkclick 的。
(function (ctx) {
  'use strict';

  ctx.eventFieldConverters.set('linkclick', (fields) => ({
    url: fields.url,
    range: new NSRange(fields.range.location, fields.range.length),
  }));
})
