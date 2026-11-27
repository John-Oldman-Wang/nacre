// application：App 这一层的上层对象（Nacre 自己定义的，不是 Android 的类）。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 运行时跟着 App 的进程生死，页面来来去去（2026-11-26）：运行时在进程启动时建、执行 main.js；
// 页面由系统建，建好时（onCreate 跑完、第一帧之前）当场派发 activitycreate，销毁时（onDestroy 里）
// 当场派发 activitydestroy，JS 从事件里拿。只有继承 NacreActivity 的页面交给 JS。
// application.activities 是现在有的页面，可能一个都没有。生命周期、返回键这些在 33-app.js。
(function (ctx) {
  'use strict';

  const { Activity, Event, EventTarget, native, pageOf, releaseActivity } = ctx;

  const kToken = Symbol('application');

  // 现在有的页面：冻结的数组，变了换一个新的
  let activities = Object.freeze([]);

  class Application extends EventTarget {
    constructor(token) {
      if (token !== kToken) throw new TypeError('Illegal constructor: Application is a singleton; use application');
      super();
    }

    // 现在有的页面。application 是全局的，所以页面和它的内容都活着
    get activities() {
      return activities;
    }
  }

  const application = new Application(kToken);

  // activitycreate、activitydestroy 的事件类：带着是哪个页面，必填
  const ActivityEvent = ctx.defineEventClass('ActivityEvent', Event, { activity: ['any', null] }, {
    check(o) {
      if (!(o.activity instanceof Activity)) {
        throw new TypeError("Failed to construct 'ActivityEvent': init.activity must be an Activity, got " +
                            ctx.describeValue(o.activity));
      }
    },
  });

  // 运行时派发 App 级事件的入口。返回值告诉引擎有没有人调了 preventDefault（返回 false 是调了）
  native.setEventSink(function (type, payload) {
    if (type === 'activitycreate') {
      // 页面先登记、再派发：监听器里 activities 已经有它了
      const activity = payload.activity;
      pageOf(activity);
      activities = Object.freeze([...activities, activity]);
      application.dispatchEvent(new ActivityEvent(type, { activity }));
      return true;
    }
    if (type === 'activitydestroy') {
      // 先派发、再拿掉：监听器里还能用这个页面和它的内容。派发完内容变回自由的
      const activity = payload.activity;
      application.dispatchEvent(new ActivityEvent(type, { activity }));
      releaseActivity(activity);
      activities = Object.freeze(activities.filter((a) => a !== activity));
      return true;
    }
    // error、unhandledrejection：Android 上还没有派发给 application，照原来的样子打默认的那行日志
    return true;
  });

  Object.assign(ctx, { Application, application });
})
