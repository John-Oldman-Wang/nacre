// 网络状态：application.network。

/**
 * 网络状态。不能 `new`，从 `application.network` 拿，每次是同一个对象。
 * 三个属性有一个变了就派发 `change`（延后一轮派发，不能取消）。
 */
declare class Network extends EventTarget {
  private constructor();
  /** 连没连上：系统有一条能用的网络路径。 */
  readonly isConnected: boolean;
  /** 走的是什么网络。断着是 `'none'`。 */
  readonly type: 'wifi' | 'cellular' | 'wired' | 'other' | 'none';
  /** 按流量计费：蜂窝数据、个人热点。 */
  readonly isExpensive: boolean;
  addEventListener(type: 'change', callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'change', callback: EventListener | null): void;
}

interface Application {
  /** 网络状态。 */
  readonly network: Network;
}
