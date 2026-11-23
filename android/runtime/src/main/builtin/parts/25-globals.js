// 把运行时的公开名字挂上 globalThis：Event 和 EventTarget。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。iOS 的同名文件还挂 application，
// Android 还没有上层对象。
(function (ctx) {
  'use strict';

  const { Event, EventTarget, define } = ctx;

  define(globalThis, 'Event', Event);
  define(globalThis, 'EventTarget', EventTarget);

  // 内置脚本都拿到原生入口了（00-core 放进了 ctx），从全局摘掉，App 的代码碰不到
  delete globalThis.__nacre_native;
})
