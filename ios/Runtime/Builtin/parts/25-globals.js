// 把 application 挂上 globalThis，再把原生入口从全局摘掉。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 原来在 25-crypto.js 的结尾，拆 core/ 时挪到这里（application 是 iOS 的上层对象）。
// 文件名排在 25-crypto 后面，执行顺序和原来一样。Event、EventTarget 由 core 的
// 00-core.js 自己挂
(function (ctx) {
  'use strict';

  const {
    Application,
    application,
    define,
  } = ctx;

  define(globalThis, 'Application', Application);
  define(globalThis, 'application', application);

  // 内置脚本都拿到原生入口了（00-core 放进了 ctx），从全局摘掉，App 的代码碰不到
  delete globalThis.__nacre_native;
})
