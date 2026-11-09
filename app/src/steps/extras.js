// 补充能力：openURL、idleTimerDisabled 等。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

// ===== 补充能力的验收用例 =====

console.log('--- 新增的环境属性 ---');
console.log('protectedDataAvailable =', application.protectedDataAvailable);
console.log('layoutDirection =', application.layoutDirection);
console.log('contentSizeCategory =', application.contentSizeCategory);
console.log('backgroundRefreshStatus =', application.backgroundRefreshStatus);
console.log('prefersReducedResourceUsage =', application.prefersReducedResourceUsage);

console.log('--- idleTimerDisabled 读写 ---');
console.log('写之前 =', application.idleTimerDisabled);
application.idleTimerDisabled = true;
console.log('刚写完立刻读 =', application.idleTimerDisabled, '（JS 已在主线程，写入同步生效，应该是 true）');

console.log('--- openURL 返回 Promise ---');
// 故意用一个没有 App 注册的 scheme：能走完整条链路（NSURL 合法 → UIKit 真的
// 去打开 → 失败），但不会把 App 切走，否则每次截图验证都要手动切回来
const p1 = application.openURL('nacre-nonexistent-scheme://test');
console.log('返回值是 Promise =', p1 instanceof Promise);
p1.then((ok) => {
  console.log('✓ openURL 兑现 =', ok, '（没有 App 注册这个 scheme，预期 false）',
              '| 此刻 idleTimerDisabled =', application.idleTimerDisabled);
  return application.openURL('这不是一个合法 URL::::');
}).then((ok) => {
  console.log('✓ 非法 URL 兑现为 =', ok);
});
