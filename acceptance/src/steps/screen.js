// UIScreen 和 UIScreenMode：屏幕的大小、倍率、亮度、显示模式、录屏状态。
// 初稿是 bindgen 生成的（docs/internals/bindgen.md），之后是手写的。
//
// 拿屏幕的路只有一条：场景的 screen（UIScreen.mainScreen 在 iOS 26 废弃了，没接）。
// 屏幕上的数是在 iPhone Air 模拟器（iOS 27.2）上量的，断言尽量写成关系
// （像素 = 点 × 倍率），换一台设备也成立。

// 一组断言中途抛了只废这一组，不连累后面的
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

/**
 * 做一件该抛异常的事，把实际发生的写成一句话
 * @param {() => void} fn
 * @returns {string}
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name + ': ' + err.message : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepScreen(ctx) {
  const { assert } = ctx;
  console.log('--- UIScreen ---');

  group('从场景拿到屏幕', () => {
    const screen = ctx.scene.screen;
    assert('scene.screen 是 UIScreen', screen instanceof UIScreen, true);
    assert('scene.screen 读两次是同一个对象', ctx.scene.screen === screen, true);
    assert('scene.screen 写了抛 TypeError',
           thrown(() => { /** @type {any} */ (ctx.scene).screen = null; }).startsWith('TypeError'), true);
    assert('new UIScreen() 抛 TypeError',
           thrown(() => new (/** @type {any} */ (UIScreen))()).startsWith('TypeError'), true);
    assert('new UIScreenMode() 抛 TypeError',
           thrown(() => new (/** @type {any} */ (UIScreenMode))()).startsWith('TypeError'), true);
  });

  group('大小和倍率', () => {
    const screen = ctx.scene.screen;
    const { bounds, nativeBounds } = screen;
    // 量到的数打出来，文档里的数从这里来
    console.log('  这台设备：bounds ' + bounds.width + 'x' + bounds.height + ' pt，scale ' + screen.scale +
                '，nativeBounds ' + nativeBounds.width + 'x' + nativeBounds.height + '，nativeScale ' + screen.nativeScale +
                '，maximumFramesPerSecond ' + screen.maximumFramesPerSecond +
                '，calibratedLatency ' + screen.calibratedLatency + '，brightness ' + screen.brightness +
                '，EDR ' + screen.currentEDRHeadroom + ' / ' + screen.potentialEDRHeadroom +
                '，referenceDisplayModeStatus ' + screen.referenceDisplayModeStatus +
                '，availableModes ' + screen.availableModes.length +
                '，pixelAspectRatio ' + (screen.currentMode === null ? 'null' : screen.currentMode.pixelAspectRatio));
    assert('bounds 是 CGRect', bounds instanceof CGRect, true);
    assert('bounds 从原点开始', bounds.x === 0 && bounds.y === 0, true);
    assert('bounds 竖着放：高比宽大', bounds.height > bounds.width, true);
    assert('scale 是正数', screen.scale > 0, true);
    assert('scale 和外观特征的 displayScale 一样', screen.scale, ctx.scene.traitCollection.displayScale);
    assert('nativeScale 是正数', screen.nativeScale > 0, true);
    assert('nativeBounds 是 CGRect', nativeBounds instanceof CGRect, true);
    // nativeBounds 是物理屏幕的像素，永远按竖屏给；bounds 是点
    assert('nativeBounds 的宽 = bounds 的宽 × nativeScale',
           Math.round(nativeBounds.width), Math.round(bounds.width * screen.nativeScale));
    assert('nativeBounds 的高 = bounds 的高 × nativeScale',
           Math.round(nativeBounds.height), Math.round(bounds.height * screen.nativeScale));
    assert('bounds 写了抛 TypeError',
           thrown(() => { /** @type {any} */ (screen).bounds = new CGRect(0, 0, 1, 1); }).startsWith('TypeError'), true);
  });

  group('刷新率和延迟', () => {
    const screen = ctx.scene.screen;
    assert('maximumFramesPerSecond 是正整数',
           Number.isInteger(screen.maximumFramesPerSecond) && screen.maximumFramesPerSecond > 0, true);
    assert('calibratedLatency 是不小于 0 的数', screen.calibratedLatency >= 0, true);
  });

  group('亮度', () => {
    const screen = ctx.scene.screen;
    const before = screen.brightness;
    assert('brightness 在 0 到 1 之间', before >= 0 && before <= 1, true);
    assert('wantsSoftwareDimming 默认 false', screen.wantsSoftwareDimming, false);
    screen.wantsSoftwareDimming = true;
    assert('wantsSoftwareDimming 写 true', screen.wantsSoftwareDimming, true);
    screen.wantsSoftwareDimming = false;
    assert('brightness 写大于 1 抛 TypeError', thrown(() => { screen.brightness = 1.5; }),
           'TypeError: brightness must be between 0 and 1, got 1.5');
    assert('brightness 写负数抛 TypeError', thrown(() => { screen.brightness = -0.1; }),
           'TypeError: brightness must be between 0 and 1, got -0.1');
    assert('brightness 写不是数的抛 TypeError',
           thrown(() => { screen.brightness = /** @type {any} */ ('bright'); }).startsWith('TypeError'), true);
    assert('抛了之后亮度没变', screen.brightness, before);
  });

  group('显示模式', () => {
    const screen = ctx.scene.screen;
    const modes = screen.availableModes;
    assert('availableModes 是数组', Array.isArray(modes), true);
    assert('availableModes 至少有一个', modes.length >= 1, true);
    assert('availableModes 里都是 UIScreenMode', modes.every((m) => m instanceof UIScreenMode), true);
    const current = screen.currentMode;
    assert('currentMode 是 UIScreenMode', current instanceof UIScreenMode, true);
    assert('preferredMode 是 UIScreenMode', screen.preferredMode instanceof UIScreenMode, true);
    if (current !== null) {
      assert('mode 的 size 是 CGSize', current.size instanceof CGSize, true);
      // 显示模式的大小是像素
      assert('currentMode 的大小 = nativeBounds 的大小',
             current.size.width + 'x' + current.size.height,
             screen.nativeBounds.width + 'x' + screen.nativeBounds.height);
      assert('pixelAspectRatio 是正数', current.pixelAspectRatio > 0, true);
      assert('currentMode 写不是显示模式的值抛 TypeError',
             thrown(() => { screen.currentMode = /** @type {any} */ ('mode'); }).startsWith('TypeError'), true);
    }
  });

  group('别的', () => {
    const screen = ctx.scene.screen;
    assert('mirroredScreen 是 null（没有在镜像别的屏幕）', screen.mirroredScreen, null);
    assert('isCaptured 是 false（没在录屏）', screen.isCaptured, false);
    assert('referenceDisplayModeStatus 是四个值之一',
           ['notSupported', 'notEnabled', 'limited', 'enabled'].includes(screen.referenceDisplayModeStatus), true);
    assert('currentEDRHeadroom 是正数', screen.currentEDRHeadroom > 0, true);
    assert('potentialEDRHeadroom 不小于 currentEDRHeadroom',
           screen.potentialEDRHeadroom >= screen.currentEDRHeadroom, true);
    assert('traitCollection 是 UITraitCollection', screen.traitCollection instanceof UITraitCollection, true);
    assert('屏幕的 displayScale 和 scale 一样', screen.traitCollection.displayScale, screen.scale);
    const snapshot = screen.snapshotViewAfterScreenUpdates(false);
    assert('snapshotViewAfterScreenUpdates 返回视图', snapshot instanceof UIView, true);
  });

  group('事件', () => {
    const screen = ctx.scene.screen;
    const noop = () => {};
    for (const type of /** @type {const} */ (['brightnesschange', 'modechange', 'capturedchange', 'referencedisplaymodestatuschange'])) {
      assert('能监听 ' + type, thrown(() => screen.addEventListener(type, noop)), '没抛');
      assert('能取消监听 ' + type, thrown(() => screen.removeEventListener(type, noop)), '没抛');
    }
    assert('不认识的事件名当自定义事件', thrown(() => screen.addEventListener('mychange', noop)), '没抛');
  });
}
