// 网页的自定义协议：session.protocol（Protocol 类）。原生在 NacreWebProtocol.mm。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
//
// 位置照 Electron 的 session.protocol：一个分区一个。unhandle / isProtocolHandled
// 是 Electron 的名字；serveDirectory 是我们的，Electron 没有声明式的写法。它不发
// 事件，所以不继承任何类。
(function (ctx) {
  'use strict';

  const { define, nativeCall, toText } = ctx;

  const kSession = Symbol('protocol.session');
  let allowConstruct = false;

  class Protocol {
    constructor() {
      if (!allowConstruct) throw new TypeError('Illegal constructor');
    }
    /**
     * 之后新建的、用这个分区的网页里，scheme://任意主机/路径 从 directory 里取文件。
     * 协议名、目录的检查在原生那一侧（WebKit 自己处理哪些协议只有它知道）
     */
    serveDirectory(scheme, directory) {
      nativeCall(this[kSession], 'nacre:serveDirectory', [toText(scheme), toText(directory)]);
    }
    /** 去掉。之后新建的网页不再认这个协议；没注册过就什么都不做 */
    unhandle(scheme) {
      nativeCall(this[kSession], 'nacre:unhandle', [toText(scheme)]);
    }
    isProtocolHandled(scheme) {
      return nativeCall(this[kSession], 'nacre:isProtocolHandled', [toText(scheme)]);
    }
  }
  define(globalThis, 'Protocol', Protocol);

  // 一个 Session 一个，每次读是同一个对象。它拿着 Session，Session 的包装就不会
  // 在它还在时被回收
  const protocols = new WeakMap();
  Object.defineProperty(Session.prototype, 'protocol', {
    configurable: true,
    enumerable: false,
    get() {
      let protocol = protocols.get(this);
      if (protocol === undefined) {
        allowConstruct = true;
        try { protocol = new Protocol(); } finally { allowConstruct = false; }
        Object.defineProperty(protocol, kSession, { value: this });
        protocols.set(this, protocol);
      }
      return protocol;
    },
  });
})
