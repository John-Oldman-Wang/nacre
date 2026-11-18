// @nacrejs/example-module 的类型定义。
//
// 用到的 NativeModuleValue、NativeModuleArgument 是 @nacrejs/types 声明的全局类型。
// 这个文件不自己去引它：用 Nacre 的入口文件本来就引了 @nacrejs/types（见
// @nacrejs/keychain 的 index.d.ts 里同一段说明）。

/** 原生那一半登记的名字，`application.nativeModules.get(moduleName)` 拿得到它。 */
export declare const moduleName: 'example';

/** 可以让原生原样交回来的值。 */
export type EchoValue = NativeModuleArgument;

/** 算 SHA-256，返回 32 个字节。 */
export declare function sha256(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;

/** 过 `delayMs` 毫秒把同一个值交回来。原生那边在后台线程上等。 */
export declare function echoLater(value: EchoValue, delayMs: number): Promise<NativeModuleValue>;

/** 听 `tick` 事件，回调收到的是原生给的那份数据。返回一个函数，调它就不再听。 */
export declare function onTick(listener: (detail: NativeModuleValue) => void): () => void;
