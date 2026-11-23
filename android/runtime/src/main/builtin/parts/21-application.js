// application：App 这一层的上层对象（Nacre 自己定义的，不是 Android 的类）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 现在只有 activity 一个成员：App 唯一的那个页面，由系统建、启动壳交给运行时。
// 生命周期、返回键这些以后往上加（project.md 第 4 节的顺序）。
(function (ctx) {
  'use strict';

  const { EventTarget, nativeClassObject, own } = ctx;

  const kToken = Symbol('application');

  class Application extends EventTarget {
    constructor(token) {
      if (token !== kToken) throw new TypeError('Illegal constructor: Application is a singleton; use application');
      super();
    }

    // App 唯一的那个页面。application 是全局的，所以页面和它持有的整棵界面树都活着
    get activity() {
      return own(this, 'activity', nativeClassObject('@application', 'activity'));
    }
  }

  const application = new Application(kToken);
  Object.assign(ctx, { Application, application });
})
