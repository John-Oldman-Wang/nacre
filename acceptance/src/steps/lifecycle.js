// 前后台事件。把 App 切后台再切回来时会打出来。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

// ===== 前后台事件的验收用例（把 App 切后台再切回来）=====
for (const type of ['active', 'inactive', 'background', 'foreground']) {
  application.addEventListener(type, (e) => {
    // 事件到达时环境快照应该已经更新，所以 state 读到的是新值
    console.log('✓ 生命周期事件:', e.type, '| 此刻 state =', application.state);
  });
}
console.log('--- 已监听 active / inactive / background / foreground ---');
