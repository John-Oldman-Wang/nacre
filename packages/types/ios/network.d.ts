// 网络状态：application.network。

/** 网络状态上每个事件名对应的事件对象。 */
interface NetworkEventMap {
  'change': Event;
}

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
  addEventListener<K extends keyof NetworkEventMap>(
    type: K,
    callback: ((event: NetworkEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof NetworkEventMap>(
    type: K,
    callback: ((event: NetworkEventMap[K]) => void) | null,
  ): void;
}

interface Application {
  /** 网络状态。 */
  readonly network: Network;
}
