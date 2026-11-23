// 第 1 步的验收：引擎能跑 JS，console 的输出按级别进 logcat。
// android/scripts/run-device.sh 照着下面这几行判定
console.log('JS 跑起来了', typeof globalThis, 1 + 1);
console.log('严格模式', (function () { return this === undefined; })());
console.warn('警告', 1);
console.error('出错', [1, 2]);
console.log('结束');
