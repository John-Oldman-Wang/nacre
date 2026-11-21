// 把运行时的公开名字挂上 globalThis：事件的几个类和 application。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 原来在 25-crypto.js 的结尾。拆 core/ 时 crypto 归了两端共用，这几行是 iOS 自己
// 的（Event、EventTarget 在 00-core 里，和包装机制在一起；application 是 iOS 的
// 上层对象），所以挪到这里。文件名排在 25-crypto 后面，执行顺序和原来一样
(function (ctx) {
  'use strict';

  const {
    Application,
    ErrorEvent,
    Event,
    EventTarget,
    PromiseRejectionEvent,
    application,
    define,
  } = ctx;

  define(globalThis, 'Event', Event);
  define(globalThis, 'ErrorEvent', ErrorEvent);
  define(globalThis, 'PromiseRejectionEvent', PromiseRejectionEvent);
  define(globalThis, 'EventTarget', EventTarget);
  define(globalThis, 'Application', Application);
  define(globalThis, 'application', application);

  // 内置脚本都拿到原生入口了（00-core 放进了 ctx），从全局摘掉，App 的代码碰不到
  delete globalThis.__nacre_native;
})
