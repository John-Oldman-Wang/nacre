// @nacrejs/push：远程推送。装了这个包才有 application.remoteNotifications。

/**
 * 远程推送。不能 `new`，从 `application.remoteNotifications` 拿，每次是同一个对象。
 *
 * 能看见的推送（横幅、声音）到了和被点了，由 `@nacrejs/user-notifications` 的通知
 * 中心派发，和本地通知走同一条路。这里管的是注册和静默推送。
 */
declare class RemoteNotifications extends EventTarget {
  private constructor();
  /**
   * 向 Apple 注册推送，兑现成设备令牌：小写的十六进制字符串。把它交给你的服务器，
   * 服务器用它给这台设备发推送。系统拒绝时（比如签名里没有推送的权限）拒绝，
   * 错误信息是系统给的原因。同时等着的几个调用拿到同一个结果。
   */
  register(): Promise<string>;
  /** 取消注册。之后这台设备收不到这个 App 的远程推送，直到再注册。 */
  unregister(): void;
  /** 这台设备现在是不是注册着推送。 */
  readonly isRegistered: boolean;
  /** 这次启动以来最近一次拿到的令牌。还没拿到过是 `null`。 */
  readonly token: string | null;

  /** `tokenchange`：令牌变了（包括第一次拿到）。读 `token` 拿新的。延后一轮派发，不可取消。 */
  addEventListener(type: 'tokenchange', callback: EventListener | null, options?: AddEventListenerOptions): void;
  /** `push`：静默推送到了。 */
  addEventListener(type: 'push', callback: EventListener<PushEvent> | null, options?: AddEventListenerOptions): void;
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'push', callback: EventListener<PushEvent> | null): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}

/**
 * 静默推送到了：推送里带 `"content-available": 1`，系统在后台唤醒 App。不可取消。
 *
 * 在监听器里调 `waitUntil(promise)`，系统等那件事做完再让 App 回去睡（大约 30 秒，
 * 由系统决定）。都兑现告诉系统「有新数据」，有一个拒绝告诉系统「失败了」，
 * 一个都没调告诉系统「没有新数据」。
 */
declare class PushEvent extends Event {
  /** 和 Web 的 `PushEvent` 一样可以自己建，比如派发一个测试用的推送事件。 */
  constructor(type: string, init?: { data?: { [key: string]: any } });
  /** 推送的内容：服务器发来的整个 JSON，包括 `aps`。 */
  readonly data: { [key: string]: any };
  /**
   * 让系统等这件事做完。只能在监听器里同步调，派发完之后再调抛 `InvalidStateError`。
   * 给的不是 Promise 时当成已经兑现。
   */
  waitUntil(promise: PromiseLike<unknown>): void;
}

interface Application {
  /** 远程推送。装了 `@nacrejs/push` 才有。 */
  readonly remoteNotifications: RemoteNotifications;
}
