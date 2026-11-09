// 全局错误出口：unhandledrejection 和 error。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

// ===== 全局错误出口的验收用例 =====

console.log('--- unhandledrejection ---');
application.addEventListener('unhandledrejection', (e) => {
  // reason 是 unknown：JS 允许拒绝任何值，不保证是 Error
  const reason = /** @type {any} */ (e.reason);
  const msg = reason && reason.message;
  console.log('✓ 收到 unhandledrejection | reason =', msg,
              '| promise 是 Promise =', e.promise instanceof Promise,
              '| cancelable =', e.cancelable);
  if (String(msg).includes('要抑制')) {
    e.preventDefault();
    console.log('  → 已 preventDefault，下面不该再出现这条的默认日志');
  }
});
Promise.reject(new Error('这条不抑制，默认日志应该还在'));
Promise.reject(new Error('这条要抑制默认日志'));

console.log('--- error ---');
application.addEventListener('error', (e) => {
  console.log('✓ 收到 error | message =', e.message, '| filename =', e.filename,
              '| lineno =', e.lineno, '| cancelable =', e.cancelable);
  console.log('  error 是 Error 实例 =', e.error instanceof Error);
  e.preventDefault();
  console.log('  → 已 preventDefault，不该再出现默认的 Uncaught 日志');
});
