// 远程推送的 JS 那一半：application.remoteNotifications（RemoteNotifications 类）。
// 原生在 NacrePush.mm。
//
// 这是能力包自己的 part：跟着 NacrePush.framework 走，运行时在核心的 part 全部
// 跑完之后，用同一个 ctx 调它一次。
//
//   register()      向 Apple 注册，兑现成设备令牌（十六进制）
//   unregister()
//   isRegistered    这台设备现在是不是注册着
//   token           这次启动以来最近一次拿到的令牌，没拿到过是 null
//   tokenchange     令牌变了（包括第一次拿到）。延后一轮派发，不可取消
//   push            静默推送到了。PushEvent：data 是推送的内容；waitUntil(promise)
//                   让系统等那件事做完（照 Web 推送的 push 事件）
(function (ctx) {
  'use strict';

  const {
    EventTarget,
    define,
    defineField,
    defineNativeClass,
    internalEventHandlers,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    own,
    requireNative,
    subscribeNative,
  } = ctx;

  defineNativeClass('RemoteNotifications', class RemoteNotifications extends EventTarget {
    constructor() { nativeOnly(new.target); }
    /** 向 Apple 注册推送，兑现成设备令牌（小写十六进制）。系统拒绝时拒绝，带着系统给的原因 */
    register() {
      requireNative(this, 'register');
      return nativeCallAsync(this, 'registerForRemoteNotifications', []);
    }
    unregister() { nativeCall(this, 'unregisterForRemoteNotifications', []); }
    get isRegistered() { requireNative(this, 'isRegistered'); return nativeGet(this, 'isRegistered'); }
    get token() { requireNative(this, 'token'); return nativeGet(this, 'token'); }
    // tokenchange、push
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });

  const kDispatching = Symbol('push.dispatching');
  const kPromises = Symbol('push.promises');

  // Web 推送的 push 事件是 ExtendableEvent：waitUntil 只能在派发的过程中调
  class PushEvent extends Event {
    constructor(type, init) {
      super(type);
      const o = init == null ? {} : init;
      defineField(this, 'data', o.data === undefined ? {} : o.data);
      this[kDispatching] = false;
      this[kPromises] = [];
    }
    waitUntil(promise) {
      if (!this[kDispatching]) {
        const err = new Error('waitUntil must be called while the push event is being dispatched');
        err.name = 'InvalidStateError';
        throw err;
      }
      this[kPromises].push(Promise.resolve(promise));
    }
  }
  define(globalThis, 'PushEvent', PushEvent);

  // 原生把静默推送作为内部事件 @push 派发在 RemoteNotifications 上：带着号和内容。
  // 这里建 PushEvent、派发，等 waitUntil 收下的 Promise 都落定，把结果交回原生：
  // 都兑现是 newData，有一个拒绝是 failed，一个都没有是 noData
  internalEventHandlers.set('@push', (target, payload) => {
    const event = new PushEvent('push', { data: payload.data });
    event[kDispatching] = true;
    try {
      target.dispatchEvent(event);
    } finally {
      event[kDispatching] = false;
    }
    const promises = event[kPromises];
    const finish = (result) => nativeCall(target, 'nacre:finishPush', [payload.id, result]);
    if (promises.length === 0) {
      finish('noData');
      return;
    }
    Promise.allSettled(promises).then((results) => {
      finish(results.some((r) => r.status === 'rejected') ? 'failed' : 'newData');
    });
  });

  // App 级的单例，由 application 拿着它的包装
  Object.defineProperty(Application.prototype, 'remoteNotifications', {
    configurable: true,
    enumerable: false,
    get() { return own(this, 'remoteNotifications', nativeClassObject('RemoteNotifications', 'shared')); },
  });
})
