/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
/// <reference types="@nacrejs/app-tracking-transparency" />
/// <reference types="@nacrejs/local-authentication" />
/// <reference types="@nacrejs/camera" />
/// <reference types="@nacrejs/photos" />
/// <reference types="@nacrejs/contacts" />
/// <reference types="@nacrejs/core-location" />
/// <reference types="@nacrejs/user-notifications" />
/// <reference types="@nacrejs/push" />
/// <reference types="@nacrejs/av-capture" />
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

import { assert, assertStats } from './support.js';
import { stepSubclass } from './steps/subclass.js';
import { stepStorage } from './steps/storage.js';
import { stepFileSystem } from './steps/filesystem.js';
import { stepBundle } from './steps/bundle.js';
import { stepKeychain } from './steps/keychain.js';
import { stepColor } from './steps/color.js';
import { stepTextField } from './steps/textfield.js';
import { stepWindow } from './steps/window.js';
import { stepImage } from './steps/image.js';
import { stepUrl } from './steps/url.js';
import { stepFetch } from './steps/fetch.js';
import { stepWebSocket } from './steps/websocket.js';
import { stepTimers } from './steps/timers.js';
import { stepPerformance } from './steps/performance.js';
import { stepIntlNumber } from './steps/intl-number.js';
import { comparisonsDone } from './steps/intl-compare.js';
import { stepIntlDate } from './steps/intl-date.js';
import { stepNormalize } from './steps/normalize.js';
import { stepCrypto } from './steps/crypto.js';
import { stepDevice } from './steps/device.js';
import { stepConversion } from './steps/conversion.js';
import { stepPasteboard } from './steps/pasteboard.js';
import { stepFeedback } from './steps/feedback.js';
import { stepAutolayout } from './steps/autolayout.js';  // 含 CALayer
import { stepControl } from './steps/control.js';
import { stepButton } from './steps/button.js';
import { stepScroll } from './steps/scroll.js';
import { stepStack } from './steps/stack.js';
import { stepTransform } from './steps/transform.js';
import { stepGradient } from './steps/gradient.js';
import { stepShapes } from './steps/shapes.js';
import { stepAnimation } from './steps/animation.js';
import { stepKeyframe } from './steps/keyframe.js';
import { stepAnimatedImage } from './steps/animated-image.js';
import { stepDisplayLink } from './steps/displaylink.js';
import { stepGesture } from './steps/gesture.js';
import { stepNavigation } from './steps/navigation.js';
import { stepModal } from './steps/modal.js';
import { stepOwnership } from './steps/ownership.js';
import { stepLifetime } from './steps/lifetime.js';
import { stepContainers } from './steps/containers.js';
import { stepTraits } from './steps/traits.js';
import { stepWebView } from './steps/webview.js';
import { stepWebAdditions } from './steps/web-additions.js';
import { stepValueControls } from './steps/value-controls.js';
import { stepIndicators } from './steps/indicators.js';
import { stepSystemControls } from './steps/system-controls.js';
import { stepViewAdditions } from './steps/view-additions.js';
import { stepNavigationAdditions } from './steps/navigation-additions.js';
import { stepLocale } from './steps/locale.js';
import { stepScreen } from './steps/screen.js';
import { stepKeyboard } from './steps/keyboard.js';
import { stepPageOverrides } from './steps/page-overrides.js';
import { stepMemoryPressure } from './steps/memory-pressure.js';
import { stepLayerTransform } from './steps/layer-transform.js';
import { stepMarkedText } from './steps/marked-text.js';
import { stepDragTarget } from './steps/drag-target.js';
import { stepGestureDelegate } from './steps/gesture-delegate.js';
import { stepNetwork } from './steps/network.js';
import { stepPush } from './steps/push.js';
import { stepAvCapture } from './steps/av-capture.js';
import { stepBarcodeDetector } from './steps/barcode-detector.js';
import { stepUpperLayer } from './steps/upper-layer.js';
import { stepAccessibility } from './steps/accessibility.js';
import { stepShadowPath } from './steps/shadow-path.js';
import { stepBackgroundTask } from './steps/background-task.js';
import { stepTextViewShould } from './steps/text-view-should.js';
import { stepGestures } from './steps/gestures.js';
import { stepAlerts } from './steps/alerts.js';
import { stepEffects } from './steps/effects.js';
import { stepTextView } from './steps/text-view.js';
import { stepBars } from './steps/bars.js';
import { stepInputEditing } from './steps/input-editing.js';
import { stepSyncCallbacks } from './steps/sync-callbacks.js';
import { stepCollection } from './steps/collection.js';
import { stepAttributedString } from './steps/attributed-string.js';
import { stepAppearance } from './steps/appearance.js';
import { stepAppTrackingTransparency } from './steps/app-tracking-transparency.js';
import { stepLocalAuthentication } from './steps/local-authentication.js';
import { stepCamera } from './steps/camera.js';
import { stepPhotos } from './steps/photos.js';
import { stepContacts } from './steps/contacts.js';
import { stepCoreLocation } from './steps/core-location.js';
import { stepUserNotifications } from './steps/user-notifications.js';
import { stepSemantics } from './steps/semantics.js';
import { stepEnumProperties } from './steps/enum-properties.js';
import { stepArgValues } from './steps/arg-values.js';
import { stepWebGlobals } from './steps/web-globals.js';
import { stepErrors } from './steps/errors.js';
import { stepOpenURL } from './steps/openurl.js';
import { stepFetchStream } from './steps/fetch-stream.js';
import { stepNativeModules } from './steps/native-modules.js';

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
 * @property {UIStackView} [systemPanel] 系统能力那个区块里的面板，各步往里加一排按钮
 * @property {import("./waterfall.js").Waterfall["section"]} section 新开一个区块，返回内容区
 * @property {UIStackView} column 装着所有区块的纵向排列容器，由 stepWindow 建
 * @property {Promise<void>} [webViewDone] 网页那一步的异步断言全部跑完时兑现
 * @property {Promise<void>} [quiet] 前面那些要等很久的检查都跑完时兑现，由最后一个这样的步骤给
 * @property {import("./waterfall.js").Waterfall["dock"]} dock 让瀑布的底边接在某个视图上面
 */

// sceneconnect 一共来了几次。这个 App 只有一个场景，所以只该来一次。
// iOS 26 上它来过两次：验收启动时会自动聚焦一个输入框，键盘弹出的那一刻
// 系统接入了一个放键盘窗口的内部场景，运行时把它也转了过来，整套验收
// 跑了两遍、互相踩存储
let sceneConnects = 0;

// 只跑哪几步。平时没有这个值，全部都跑。runner 带 --steps 时，打包器把
// globalThis.__NACRE_STEPS__ 这个写法整个换成一个字符串（esbuild 的 --define），
// 所以过滤是写在产物里的，不是运行时读来的——App 里没有读启动参数的接口。
// 建窗口那一步总是跑：别的步骤要它建的页面和区块
/** @type {string | undefined} */
const stepFilterText = /** @type {any} */ (globalThis).__NACRE_STEPS__;
const stepFilter = typeof stepFilterText === 'string' && stepFilterText !== ''
  ? stepFilterText.split(',') : null;
if (stepFilter !== null) console.log('只跑这几步：' + stepFilter.join('、') + '（外加建窗口那一步）');
// 离不开别的步骤的步骤。每个步骤单独跑过一遍（五十七个），只有这两处：
// 模态那一步有一条断言认定页面在导航控制器里，所有权那一步要用导航那一步
// 留下的导航控制器（没有就自己报未验证）。选了左边的，右边的跟着跑
/** @type {Record<string, string[]>} */
const STEP_NEEDS = {
  stepModal: ['stepNavigation'],
  stepOwnership: ['stepNavigation'],
};
const stepNeeded = stepFilter === null ? [] : stepFilter.flatMap((name) => STEP_NEEDS[name] ?? []);
if (stepNeeded.length > 0) console.log('它们依赖的也跑：' + [...new Set(stepNeeded)].join('、'));
/** @param {string} name */
const stepWanted = (name) => stepFilter === null || name === 'stepWindow' ||
                             stepFilter.includes(name) || stepNeeded.includes(name);

application.addEventListener('sceneconnect', (e) => {
  sceneConnects++;
  if (sceneConnects === 1) {
    setTimeout(() => {
      assert('sceneconnect 只来了一次（键盘的内部场景不算数）', sceneConnects, 1);
      assert('application.scenes 里也只有一个', application.scenes.length, 1);
    }, 6000);
  }
  // vc 要等 stepWindow 建出来，所以这里断言式地转一下型
  const ctx = /** @type {StepContext} */ ({ scene: e.scene, assert });

  // 每一步包一层：一步中途抛了，记一条失败，后面的步骤照常跑。
  // 以前不包：弹窗那一步抛过一次，排在它后面的毛玻璃、所有权、三张 Intl
  // 比对全都没跑，而失败数看起来只多了一条——少跑的断言是看不见的
  /** @type {string[]} */
  const stepNames = [];   // 登记过的全部步骤，跑没跑都记：用来查 --steps 里写错的名字
  let early = true;       // 还在最早那批（同步跑完的）步骤里
  let earlySteps = 0;     // 最早那批里实际跑了几步（不算建窗口）
  /** @template T @param {string} name @param {() => T} fn @returns {T | undefined} */
  const run = (name, fn) => {
    stepNames.push(name);
    if (!stepWanted(name)) return undefined;
    if (early && name !== 'stepWindow') earlySteps++;
    try {
      return fn();
    } catch (err) {
      console.log('  ✗ 步骤 ' + name + ' 中途抛了，它后面的断言没跑: ' +
                  (err instanceof Error ? err.message : String(err)));
      return undefined;
    }
  };

  // 顺序有意义：stepWindow 建出窗口和根页面，后面各步往它上面挂东西
  run('stepSubclass', () => stepSubclass());
  run('stepStorage', () => stepStorage());
  run('stepFileSystem', () => stepFileSystem());
  run('stepBundle', () => stepBundle());
  run('stepKeychain', () => stepKeychain());
  run('stepColor', () => stepColor(ctx));
  run('stepWindow', () => stepWindow(ctx));
  run('stepImage', () => stepImage(ctx));
  run('stepUrl', () => stepUrl(ctx));
  run('stepFetch', () => stepFetch(ctx));
  run('stepWebSocket', () => stepWebSocket(ctx));
  run('stepTimers', () => stepTimers(ctx));
  run('stepPerformance', () => stepPerformance(ctx));
  run('stepCrypto', () => stepCrypto(ctx));
  run('stepDevice', () => stepDevice(ctx));
  run('stepConversion', () => stepConversion(ctx));
  run('stepAutolayout', () => stepAutolayout(ctx));
  run('stepControl', () => stepControl(ctx));
  run('stepButton', () => stepButton(ctx));
  run('stepScroll', () => stepScroll(ctx));
  run('stepStack', () => stepStack(ctx));
  run('stepTextField', () => stepTextField(ctx));   // 要用 ctx.vc，必须排在 stepWindow 后面
  run('stepTransform', () => stepTransform(ctx));
  run('stepGradient', () => stepGradient(ctx));
  run('stepShapes', () => stepShapes(ctx));
  run('stepAnimation', () => stepAnimation(ctx));
  run('stepKeyframe', () => stepKeyframe(ctx));
  run('stepAnimatedImage', () => stepAnimatedImage(ctx));
  run('stepDisplayLink', () => stepDisplayLink(ctx));
  run('stepGesture', () => stepGesture(ctx));
  run('stepPasteboard', () => stepPasteboard(ctx));
  run('stepFeedback', () => stepFeedback(ctx));
  run('stepNavigation', () => stepNavigation(ctx));
  run('stepModal', () => stepModal(ctx));
  run('stepContainers', () => stepContainers(ctx));
  run('stepTraits', () => stepTraits(ctx));
  ctx.webViewDone = run('stepWebView', () => stepWebView(ctx));

  // 上面是最早就有的步骤，在这个回调里同步跑完。下面的不在这里同步跑，排到
  // 后面，**一步一个任务**，步骤之间让界面排一次版、让别的定时器跑。
  //
  // 原因是量出来的：所有步骤挤在这一个回调里同步跑完，接到第二批类的时候
  // 同步部分到了 8 秒（光弹窗那一步就 2.1 秒），而前面的步骤设的「等界面
  // 上屏」「等第一帧」那类期限是 6 到 8 秒——回调还没返回、界面一次都没
  // 排过，期限就耗完了，原有的断言时过时不过。现在上面那一段的时长不再随
  // 接进来的类增长。
  //
  // 接一组类时往这个数组里加一行。顺序就是执行的先后
  //
  // 步骤有异步的部分、而且用到同一时刻只能有一个的东西（呈现模态页、焦点）时，
  // 把「全部做完」作为 Promise 返回，下一步等它兑现再开始。弹窗那一步就是：
  // 它真的呈现一次再关掉，没等它做完，后面生命周期那一步就去呈现自己的页面，
  // 两边抢同一个位置——实测撞过
  /** @type {[string, () => unknown][]} */
  const later = [
    ['stepValueControls', () => stepValueControls(ctx)],
    ['stepIndicators', () => stepIndicators(ctx)],
    ['stepSystemControls', () => stepSystemControls(ctx)],
    ['stepViewAdditions', () => stepViewAdditions(ctx)],
    ['stepNavigationAdditions', () => stepNavigationAdditions(ctx)],
    ['stepLocale', () => stepLocale(ctx)],
    ['stepScreen', () => stepScreen(ctx)],
    ['stepGestures', () => stepGestures(ctx)],
    ['stepAlerts', () => stepAlerts(ctx)],
    ['stepEffects', () => stepEffects(ctx)],
    ['stepTextView', () => stepTextView(ctx)],
    ['stepBars', () => stepBars(ctx)],
    ['stepInputEditing', () => stepInputEditing(ctx)],
    ['stepSyncCallbacks', () => stepSyncCallbacks(ctx)],
    ['stepCollection', () => stepCollection(ctx)],
    ['stepAttributedString', () => stepAttributedString(ctx)],
    // 这一步会呈现全屏的模态页，把整个屏幕盖住。网页那一步的异步断言这时
    // 可能还没跑完，而被盖住的网页不再更新，所以等它
    ['stepAppearance', () => Promise.resolve(ctx.webViewDone).then(() => stepAppearance(ctx))],
    ['stepAppTrackingTransparency', () => stepAppTrackingTransparency(ctx)],
    ['stepLocalAuthentication', () => stepLocalAuthentication(ctx)],
    ['stepCamera', () => stepCamera(ctx)],
    ['stepPhotos', () => stepPhotos(ctx)],
    ['stepContacts', () => stepContacts(ctx)],
    ['stepCoreLocation', () => stepCoreLocation(ctx)],
    ['stepUserNotifications', () => stepUserNotifications(ctx)],
    ['stepSemantics', () => stepSemantics(ctx)],
    ['stepEnumProperties', () => stepEnumProperties(ctx)],
    ['stepArgValues', () => stepArgValues(ctx)],
    ['stepWebGlobals', () => stepWebGlobals(ctx)],
    ['stepErrors', () => stepErrors(ctx)],
    ['stepOpenURL', () => stepOpenURL(ctx)],
    ['stepFetchStream', () => stepFetchStream(ctx)],
    ['stepNativeModules', () => stepNativeModules(ctx)],
    ['stepWebAdditions', () => stepWebAdditions(ctx)],
    ['stepKeyboard', () => stepKeyboard(ctx)],
    ['stepPageOverrides', () => stepPageOverrides(ctx)],
    ['stepMemoryPressure', () => stepMemoryPressure(ctx)],
    ['stepLayerTransform', () => stepLayerTransform(ctx)],
    // 这三步会全屏弹出自己的页面，把网页盖住；被盖住的网页不再更新，所以和
    // 「出现和消失」那一步一样，等网页那一步的异步断言跑完再开始
    ['stepMarkedText', () => Promise.resolve(ctx.webViewDone).then(() => stepMarkedText(ctx))],
    ['stepDragTarget', () => Promise.resolve(ctx.webViewDone).then(() => stepDragTarget(ctx))],
    ['stepGestureDelegate', () => Promise.resolve(ctx.webViewDone).then(() => stepGestureDelegate(ctx))],
    ['stepNetwork', () => stepNetwork(ctx)],
    ['stepPush', () => stepPush(ctx)],
    ['stepAvCapture', () => stepAvCapture(ctx)],
    ['stepBarcodeDetector', () => stepBarcodeDetector(ctx)],
    ['stepUpperLayer', () => stepUpperLayer(ctx)],
    ['stepAccessibility', () => stepAccessibility(ctx)],
    ['stepShadowPath', () => stepShadowPath(ctx)],
    ['stepBackgroundTask', () => stepBackgroundTask(ctx)],
    // 会全屏弹出自己的页面，和上面那三步一样等网页那一步跑完
    ['stepTextViewShould', () => Promise.resolve(ctx.webViewDone).then(() => stepTextViewShould(ctx))],
  ];
  // 收尾的几步排在最后，先后和原来一样。结尾三张和网页的比对各有几万条，要在
  // 主线程上跑十几秒：它们等生命周期那一步的 GC 检查结束、并且主线程闲下来
  // 再开始（见 intl-compare.js），免得挤掉前面那些对时序敏感的断言
  later.push(
    ['stepOwnership', () => stepOwnership(ctx)],
    ['stepLifetime', () => { ctx.quiet = stepLifetime(ctx); }],
    ['stepIntlNumber', () => stepIntlNumber(ctx)],
    ['stepIntlDate', () => stepIntlDate(ctx)],
    ['stepNormalize', () => stepNormalize(ctx)],
  );
  // 全部跑完之后打一行结束标记。外面的 runner（scripts/verify.mjs）等的就是它：
  // 等到了才数结果，期限内没等到算失败——以前是靠「很久没有新的 ✓」猜的。
  //
  // 「跑完」分两层。排队的步骤、网页那一步、所有权那几组、三张比对，都把
  // 「做完了」交了出来，等它们。最早那批步骤的异步部分没有交（三十多步，
  // 各等各的），所以再加一条：连续 5 秒没有新的断言。它们的期限最长 10 秒，
  // 而排队的步骤要跑几分钟，到这里早就过了
  const finish = () => {
    let seen = assertStats().asserts;
    let calm = 0;
    const tick = () => {
      const now = assertStats().asserts;
      calm = now === seen ? calm + 1 : 0;
      seen = now;
      if (calm < 5) { setTimeout(tick, 1000); return; }
      console.log('[acceptance] done ' + JSON.stringify(
        stepFilter === null ? assertStats() : { ...assertStats(), steps: stepFilter }));
    };
    Promise.allSettled([ctx.webViewDone, ctx.quiet, comparisonsDone()])
      .then(() => { setTimeout(tick, 1000); });
  };
  early = false;
  // --steps 里有哪个名字不是步骤：记一条失败。runner 自己也会先查一遍，这里是底线
  if (stepFilter !== null) {
    const all = [...stepNames, ...later.map(([name]) => name)];
    for (const name of stepFilter) {
      if (!all.includes(name)) console.log('  ✗ 没有这个步骤：' + name);
    }
  }
  const runLater = (/** @type {number} */ index) => {
    if (index >= later.length) { finish(); return; }
    const pending = /** @type {any} */ (run(later[index][0], later[index][1]));
    const next = () => { setTimeout(() => runLater(index + 1), 0); };
    if (pending !== undefined && pending !== null && typeof pending.then === 'function') {
      // async 的步骤中途抛了，Promise 被拒绝：和同步的步骤一样记一条失败。
      // 原来这里是 then(next, next)，拒绝被吞掉，那一步后面的断言没跑也看不出来
      pending.then(next, (/** @type {unknown} */ err) => {
        console.log('  ✗ 步骤 ' + later[index][0] + ' 中途抛了，它后面的断言没跑: ' +
                    (err instanceof Error ? err.message : String(err)));
        next();
      });
    } else {
      next();
    }
  };
  // 等最早那些步骤自己的异步部分做完再开始。它们有的在等焦点、等第一帧，
  // 有的要求这段时间主线程是闲的（文件读写那条「写入期间定时器照常跑」）；
  // 后面的步骤一开始同步干活、抢焦点，这些断言就不成立了——实测撞过。
  // 那些步骤设的期限最长是 10 秒，到那时它们要么等到了、要么自己报了未验证
  const EARLY_STEPS_SETTLE_MS = 10000;
  // 最早那批一步都没跑（只选了排队的步骤）时不用等
  setTimeout(() => runLater(0), earlySteps > 0 ? EARLY_STEPS_SETTLE_MS : 0);

  console.log('✓ 屏幕上：一个纵向滚动的瀑布，每一步一个区块，带小标题；输入框那张卡片贴在底部');
});

application.addEventListener('scenedisconnect', (e) => {
  console.log('✓ 收到 scenedisconnect, scene =', e.scene instanceof UIWindowScene);
});

console.log('--- 以下故意抛出未捕获异常，main.js 会被标记为 failed，这是预期的 ---');
throw new Error('故意抛的未捕获异常');
