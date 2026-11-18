// @nacrejs/example-module 的 JS 那一半。
//
// 这是**普通的 npm 包代码**：打包器把它和 App 的代码一起打进产物。它不进运行时
// 的内置脚本，也碰不到运行时内部的东西，只用公开的 application.nativeModules。
// 第三方的原生模块照这个样子写：原生那一半登记一个名字，JS 这一半按名字拿到
// 模块，包成自己想给使用者的形状。

/** 原生那一半登记的名字（见 ios/Capabilities/ExampleModule/ExampleModule.swift） */
export const moduleName = 'example';

// 每次现拿：application.nativeModules.get 对同一个名字给的是同一个对象，不用自己存
const native = () => application.nativeModules.get(moduleName);

/**
 * 算 SHA-256。同步方法：原生那边当场算完交回来。
 * @param {ArrayBuffer | ArrayBufferView} data
 * @returns {ArrayBuffer}
 */
export function sha256(data) {
  return /** @type {ArrayBuffer} */ (native().call('sha256', data));
}

/**
 * 过一会儿把同一个值交回来。异步方法：原生那边在后台线程上等，等完兑现。
 * @param {NativeModuleArgument} value
 * @param {number} delayMs
 */
export function echoLater(value, delayMs) {
  return native().callAsync('echoLater', value, delayMs);
}

/**
 * 听 tick 事件。返回一个函数，调它就不再听。
 * @param {(detail: unknown) => void} listener
 */
export function onTick(listener) {
  const module = native();
  const handler = (/** @type {{ detail: unknown }} */ event) => listener(event.detail);
  module.addEventListener('tick', handler);
  return () => module.removeEventListener('tick', handler);
}
