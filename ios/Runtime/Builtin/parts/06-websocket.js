// WebSocket
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeGet,
    nativeSet,
    ownOne,
    requireNative,
    subscribeNative,
    toInteger,
    toTextOrNull,
  } = ctx;

  const WebSocketClass = defineNativeClass('WebSocket', class WebSocket extends NSObject {
    constructor(url, options) {
      super();
      constructNative(this, new.target, 'WebSocket', [String(url), options || {}]);
      // 连接没关之前，系统的网络会话一直拿着它、给它发消息。它没有父对象，
      // 所以由 application 拿着；收到关闭事件之后放开（见事件汇入口）
      ownOne(ctx.application, 'webSockets', this);
    }

    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    /**
     * 发一条。字符串、Blob、ArrayBuffer 或者 TypedArray。
     * 返回的 Promise 在**发出去之后**兑现，不等对端确认。
     *
     * 后两种在这里包成 Blob 再走——原生侧只认字符串和 Blob，而 Blob 的
     * 构造本来就吃 ArrayBuffer / TypedArray（字节按下标单独过桥）
     */
    send(data) {
      const payload = (data instanceof ArrayBuffer || ArrayBuffer.isView(data))
        ? new Blob([data]) : data;
      return nativeCallAsync(this, 'send', [payload]);
    }
    /**
     * 协议级 ping。pong 回来就兑现，连接死了就拒绝——不需要服务端应用做
     * 任何事，这是它比应用层心跳强的地方
     */
    ping() { return nativeCallAsync(this, 'ping', []); }
    /** 关。已经在关或关完了再调是空操作，和 Web 一致 */
    close(code, reason) {
      nativeCall(this, 'close', [code == null ? null : toInteger(code, 'code'),
                                 toTextOrNull(reason)]);
    }

    get url() { requireNative(this, 'url'); return nativeGet(this, 'url'); }
    /** 0 CONNECTING / 1 OPEN / 2 CLOSING / 3 CLOSED */
    get readyState() { requireNative(this, 'readyState'); return nativeGet(this, 'readyState'); }
    /** 服务端选中的子协议。没有就是空串 */
    get protocol() { requireNative(this, 'protocol'); return nativeGet(this, 'protocol'); }
    /** 一条消息最大多少字节。超了接收会失败。**Web 没有这个** */
    get maximumMessageSize() {
      requireNative(this, 'maximumMessageSize');
      return nativeGet(this, 'maximumMessageSize');
    }
    set maximumMessageSize(value) {
      requireNative(this, 'maximumMessageSize');
      nativeSet(this, 'maximumMessageSize', toInteger(value, 'maximumMessageSize'));
    }
  });

  // ---------- 动画 ----------
  //
  // 时间曲线。两种来源：五个内置名字，或者四个控制点的三次贝塞尔。
  // 不给 new——ObjC 的 initWithControlPoints 要四个浮点数，而构造通道
  // 只传对象句柄，传不了标量。

  // 这个 part 对外提供的东西
  Object.assign(ctx, { WebSocketClass });
})
