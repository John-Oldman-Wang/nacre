// 第 1 步：EventTarget / Event 的语义，application 的 Info.plist、状态、事件。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

// ===== 第 1 步：EventTarget 和 application 的验收用例 =====

console.log('--- 全局类型 ---');
console.log('EventTarget', typeof EventTarget, '| Event', typeof Event,
            '| Application', typeof Application, '| application', typeof application);
console.log('application instanceof EventTarget =', application instanceof EventTarget);

console.log('--- 原生桥不应该暴露给用户代码 ---');
// @ts-expect-error 原生桥故意不声明在类型里，用户代码不该碰它
console.log('typeof __nacre_native =', typeof __nacre_native);
console.log('globalThis 上还有吗 =', '__nacre_native' in globalThis);
console.log('能从属性名找到吗 =',
            Object.getOwnPropertyNames(globalThis).some(n => n.includes('nacre')));

console.log('--- 单例保护 ---');
try { new Application(); console.log('✗ 居然构造成功了'); }
catch (e) { console.log('✓', e.constructor.name + ':', e.message); }

console.log('--- Info.plist ---');
console.log('bundleIdentifier =', application.bundleIdentifier);
console.log('version =', application.version, '| build =', application.build);
console.log('info 的键数 =', Object.keys(application.info).length);
console.log('info 的全部键 =', Object.keys(application.info).sort().join(' '));
console.log('MinimumOSVersion =', application.info.MinimumOSVersion);
console.log('info 已冻结 =', Object.isFrozen(application.info),
            '| 嵌套也冻结 =', Object.isFrozen(application.info.UIApplicationSceneManifest));

console.log('--- 多场景：声明值 vs 实际能力 ---');
// info 是 Info.plist 的原样内容，运行时不知道里面长什么样，所以是 unknown。
// 取嵌套字段要自己断言——这正是类型定义该有的诚实。
const manifest = /** @type {any} */ (application.info.UIApplicationSceneManifest);
console.log('声明值 =', manifest.UIApplicationSupportsMultipleScenes);
console.log('实际能力 =', application.supportsMultipleScenes);

console.log('--- 运行状态 ---');
console.log('state =', application.state);

console.log('--- EventTarget 语义 ---');
let hits = 0;
const listener = () => { hits++; };
application.addEventListener('自测', listener);
application.addEventListener('自测', listener);          // 重复注册应被忽略
application.dispatchEvent(new Event('自测'));
console.log('重复注册只触发一次 =', hits === 1);

application.removeEventListener('自测', listener);
application.dispatchEvent(new Event('自测'));
console.log('移除后不再触发 =', hits === 1);

let onceCount = 0;
application.addEventListener('一次性', () => { onceCount++; }, { once: true });
application.dispatchEvent(new Event('一次性'));
application.dispatchEvent(new Event('一次性'));
console.log('once 只触发一次 =', onceCount === 1);

application.addEventListener('抛异常', () => { throw new Error('监听器炸了'); });
application.addEventListener('抛异常', () => console.log('✓ 前一个监听器抛异常不影响后续'));
application.dispatchEvent(new Event('抛异常'));

const cancelableEvent = new Event('可取消', { cancelable: true });
application.addEventListener('可取消', (e) => e.preventDefault());
console.log('JS 自己派发时 preventDefault 生效，dispatchEvent 返回 =',
            application.dispatchEvent(cancelableEvent));

const plainEvent = new Event('不可取消');
application.addEventListener('不可取消', (e) => e.preventDefault());
console.log('cancelable=false 时静默失效，返回 =',
            application.dispatchEvent(plainEvent));

console.log('--- 等待原生事件 ---');
console.log('在模拟器的设备菜单里选 Simulate Memory Warning 触发');
application.addEventListener('memorywarning', (e) => {
  console.log('✓ 收到原生事件:', e.type, '| target 是 application =', e.target === application,
              '| cancelable =', e.cancelable);
  // 顺便验证 state 会随通知更新：启动时是 background，场景激活后应该变成 active
  console.log('✓ 此刻 application.state =', application.state, '（启动时是 background）');
});
