/// <reference types="@nacre/types" />
//
// 这个 App 的入口。它同时是 Nacre 的**第一个客户**和**验收用例**：
// 每接一块能力，就在 steps/ 下加一段，跑一次模拟器看断言全不全过。
//
// 两类 step：
//   - 顶层那几段在脚本顶层执行，所以作为副作用 import，顺序就是下面的顺序
//   - 场景回调里那几段是函数，拿一个 ctx（scene / assert / vc）
//
// 打包：npm run build  →  ios/JS/main.js（iife，classic script）
// 类型：npm run check

// —— 顶层：按这个顺序执行 ——
import './steps/console-basics.js';
import './steps/application.js';
import './steps/error-outlet.js';
import './steps/extras.js';
import './steps/lifecycle.js';
import './steps/wrapper-scene.js';

import { assert } from './support.js';
import { stepSubclass } from './steps/subclass.js';
import { stepStorage } from './steps/storage.js';
import { stepFileSystem } from './steps/filesystem.js';
import { stepWindow } from './steps/window.js';
import { stepImage } from './steps/image.js';
import { stepUrl } from './steps/url.js';
import { stepFetch } from './steps/fetch.js';
import { stepTimers } from './steps/timers.js';
import { stepAutolayout } from './steps/autolayout.js';  // 含 CALayer
import { stepControl } from './steps/control.js';
import { stepButton } from './steps/button.js';
import { stepScroll } from './steps/scroll.js';
import { stepStack } from './steps/stack.js';
import { stepTransform } from './steps/transform.js';
import { stepNavigation } from './steps/navigation.js';
import { stepModal } from './steps/modal.js';
import { stepOwnership } from './steps/ownership.js';

/**
 * 各步共享的上下文。跨段共享的东西只有三样，其余全是段内局部。
 *
 * @typedef {object} StepContext
 * @property {UIWindowScene} scene 这一次接入的场景
 * @property {typeof assert} assert 断言
 * @property {UIViewController} vc 根页面，由 stepWindow 建好后写回来
 * @property {UIWindow} win 窗口，同上。timers 那段要在它上面挂 becomekey
 * @property {UINavigationController} [nav] 导航控制器，GC 那一步要用它验栈的持有边
 * @property {UIViewController} [modalPage] 可以拖走的那张卡片，由 stepModal 建
 */

application.addEventListener('sceneconnect', (e) => {
  // vc 要等 stepWindow 建出来，所以这里断言式地转一下型
  const ctx = /** @type {StepContext} */ ({ scene: e.scene, assert });

  // 顺序有意义：stepWindow 建出窗口和根页面，后面各步往它上面挂东西
  stepSubclass();
  stepStorage();
  stepFileSystem();
  stepWindow(ctx);
  stepImage(ctx);
  stepUrl(ctx);
  stepFetch(ctx);
  stepTimers(ctx);
  stepAutolayout(ctx);
  stepControl(ctx);
  stepButton(ctx);
  stepScroll(ctx);
  stepStack(ctx);
  stepTransform(ctx);
  stepNavigation(ctx);
  stepModal(ctx);
  stepOwnership(ctx);

  console.log('✓ 屏幕上：三个色块 + 标题 + 两行说明 + 一行等宽数字');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
