// 网络状态：application.network（Network 类，不能 new）。
// 原生在 NacreNetwork.mm；为什么这么搭见那个文件开头。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    kSubscribe,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    own,
    requireNative,
    subscribeNative,
  } = ctx;

  defineNativeClass('Network', class Network extends NSObject {
    constructor() { nativeOnly(new.target); }
    /** 连没连上：系统说有一条能用的网络路径 */
    get isConnected() { requireNative(this, 'isConnected'); return nativeGet(this, 'isConnected'); }
    /** 走的是什么网络：'wifi' | 'cellular' | 'wired' | 'other'，断着是 'none' */
    get type() { requireNative(this, 'type'); return nativeGet(this, 'type'); }
    /** 按流量计费：蜂窝数据、个人热点 */
    get isExpensive() { requireNative(this, 'isExpensive'); return nativeGet(this, 'isExpensive'); }
    // 只认 change：上面三个里有一个变了
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });

  // 原生是 App 级的单例，由 application 拿着它的包装
  Object.defineProperty(Application.prototype, 'network', {
    configurable: true,
    enumerable: false,
    get() { return own(this, 'network', nativeClassObject('Network', 'shared')); },
  });
})
