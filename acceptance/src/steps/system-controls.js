// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 系统自带的取色控件 UIColorWell。它的绑定初稿是 bindgen 照头文件生成的，之后是手写的。
//
// 前半是初稿带的读写往返（每个属性读出来类型对、写回原值不变）；后半是手写的：
// 默认值是 2026-11-18 在 iPhone Air 模拟器（iOS 27.2）上量的，不是照头文件的注释写的。

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
 * 做一件该抛 TypeError 的事，把实际发生的写成一句话
 * @param {() => void} fn
 * @returns {string}
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/**
 * 颜色写错：不抛，警告一条，值不变
 * @param {() => void} write
 * @param {() => unknown} read
 * @returns {string}
 */
function colorIgnored(write, read) {
  const before = String(read());
  let warnings = 0;
  const original = console.warn;
  console.warn = () => { warnings += 1; };
  try {
    write();
  } catch (err) {
    return '抛了 ' + (err instanceof Error ? err.name : String(err));
  } finally {
    console.warn = original;
  }
  return (String(read()) === before ? '值不变' : '值变了') + '，警告 ' + warnings + ' 条';
}

/** @param {import("../main.js").StepContext} ctx */
export function stepSystemControls(ctx) {
  const { assert } = ctx;
  console.log('--- 取色控件：属性的读写往返 ---');

  group('UIColorWell', () => {
    const o = new UIColorWell();
    assert('UIColorWell.title 读出来是字符串或 null', o.title === null || typeof o.title === 'string', true);
    {
      const before = o.title;
      o.title = before;
      assert('UIColorWell.title 写回原值，读到的不变', o.title, before);
    }
    assert('UIColorWell.supportsAlpha 读出来是布尔', typeof o.supportsAlpha, 'boolean');
    {
      const before = o.supportsAlpha;
      o.supportsAlpha = before;
      assert('UIColorWell.supportsAlpha 写回原值，读到的不变', o.supportsAlpha, before);
    }
    assert('UIColorWell.selectedColor 读出来是颜色的字符串或 null', o.selectedColor === null || typeof o.selectedColor === 'string', true);
    {
      const before = o.selectedColor;
      o.selectedColor = before;
      assert('UIColorWell.selectedColor 写回原值，读到的不变', o.selectedColor, before);
    }
    assert('UIColorWell.supportsEyedropper 读出来是布尔', typeof o.supportsEyedropper, 'boolean');
    {
      const before = o.supportsEyedropper;
      o.supportsEyedropper = before;
      assert('UIColorWell.supportsEyedropper 写回原值，读到的不变', o.supportsEyedropper, before);
    }
    assert('UIColorWell.maximumLinearExposure 读出来是数', typeof o.maximumLinearExposure, 'number');
    {
      const before = o.maximumLinearExposure;
      o.maximumLinearExposure = before;
      assert('UIColorWell.maximumLinearExposure 写回原值，读到的不变', o.maximumLinearExposure, before);
    }
  });

  // ---- 下面是手写的：参数转换、写错时的反应、默认值、放到屏幕上、事件 ----
  const host = ctx.section('取色的控件：UIColorWell（点它取色）', 60);

  console.log('--- UIColorWell ---');

  group('颜色井：是什么', () => {
    const well = new UIColorWell();
    assert('是控件', well instanceof UIControl, true);
    assert('也是视图', well instanceof UIView, true);
    // 父类 UIControl 的成员在这个子类上照常能用
    well.isEnabled = false;
    assert('父类手写的 isEnabled 写得进去', well.isEnabled, false);
    well.alpha = 0.5;
    assert('父类手写的 alpha 写得进去', well.alpha, 0.5);
  });

  group('颜色井：布尔', () => {
    const well = new UIColorWell();
    assert('supportsAlpha 读出来是布尔', typeof well.supportsAlpha, 'boolean');
    well.supportsAlpha = false;
    assert('supportsAlpha 写 false', well.supportsAlpha, false);
    well.supportsAlpha = true;
    assert('supportsAlpha 写 true', well.supportsAlpha, true);
    // 布尔照 Web IDL：JS 的真假值
    well.supportsAlpha = /** @type {any} */ (0);
    assert('supportsAlpha 写 0 得到 false', well.supportsAlpha, false);
    well.supportsEyedropper = false;
    assert('supportsEyedropper 写 false', well.supportsEyedropper, false);
  });

  group('颜色井：数', () => {
    const well = new UIColorWell();
    assert('maximumLinearExposure 读出来是数', typeof well.maximumLinearExposure, 'number');
    well.maximumLinearExposure = 2;
    assert('maximumLinearExposure 写 2', well.maximumLinearExposure, 2);
    well.maximumLinearExposure = /** @type {any} */ ('4');
    assert("maximumLinearExposure 写 '4' 得到 4", well.maximumLinearExposure, 4);
    assert('maximumLinearExposure 写不是数的抛 TypeError',
           thrown(() => { well.maximumLinearExposure = /** @type {any} */ ('abc'); }), 'TypeError');
    assert('抛了之后值没变', well.maximumLinearExposure, 4);
  });

  group('颜色井：字符串', () => {
    const well = new UIColorWell();
    well.title = '选个颜色';
    assert('title 写得进去', well.title, '选个颜色');
    well.title = /** @type {any} */ (5);
    assert("title 写 5 得到 '5'", well.title, '5');
    well.title = null;
    assert('title 写 null 得到 null', well.title, null);
  });

  group('颜色井：颜色', () => {
    const well = new UIColorWell();
    well.selectedColor = '#ff0000';
    assert('selectedColor 写色值，原样读回', well.selectedColor, '#ff0000');
    well.selectedColor = 'systemBlue';
    assert('selectedColor 写颜色名，原样读回', well.selectedColor, 'systemBlue');
    assert('selectedColor 写错', colorIgnored(() => { well.selectedColor = 'nope'; },
                                             () => well.selectedColor), '值不变，警告 1 条');
    well.selectedColor = null;
    assert('selectedColor 写 null 得到 null', well.selectedColor, null);
  });

  // 默认值：2026-11-18 在 iPhone Air 模拟器（iOS 27.2）上量的，不是照头文件的注释写的。
  // 它们和「写进去能读回来」互相独立：读的那条通道接错了属性的话，这里会对不上
  group('默认值', () => {
    const well = new UIColorWell();
    assert('颜色井默认没有标题', well.title, null);
    assert('颜色井默认可以调透明度', well.supportsAlpha, true);
    assert('颜色井默认没有选中的颜色', well.selectedColor, null);
    assert('颜色井默认可以用取色器', well.supportsEyedropper, true);
    assert('颜色井默认的 maximumLinearExposure 是 0', well.maximumLinearExposure, 0);
  });

  // 放一个到屏幕上：点它，系统弹出取色的面板
  group('放到屏幕上', () => {
    const well = new UIColorWell();
    well.title = '选个颜色';
    well.selectedColor = 'systemOrange';
    well.translatesAutoresizingMaskIntoConstraints = false;
    host.addSubview(well);
    NSLayoutConstraint.activateConstraints([
      well.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
      well.topAnchor.constraintEqualToAnchor(host.topAnchor, { constant: 8 }),
      well.widthAnchor.constraintEqualToConstant(44),
      well.heightAnchor.constraintEqualToConstant(44),
    ]);
    host.layoutIfNeeded();
    assert('在区块里', well.superview === host, true);
    assert('排出来宽 44', well.frame.width, 44);
  });

  // 事件：这个类自己一行订阅的代码都没有，change 是父类 UIControl 上现成的那一套。
  // 主动触发一次，证明这个子类接上了它。事件延后一轮才到，所以这一段是异步的
  return new Promise((resolve) => {
    const well = new UIColorWell();
    host.addSubview(well);
    let changes = 0;
    /** @type {unknown} */
    let target = null;
    well.addEventListener('change', (event) => { changes += 1; target = event.target; });
    well.selectedColor = '#00ff00';
    setTimeout(() => {
      assert('程序改 selectedColor 不派发 change', changes, 0);
      well.sendActionsForControlEvents(['change']);
      /** @param {number} left */
      const wait = (left) => {
        if (changes === 0 && left > 0) { setTimeout(() => wait(left - 1), 20); return; }
        assert('主动触发的 change 收到一次', changes, 1);
        assert('事件的 target 是这个颜色井', target === well, true);
        well.removeFromSuperview();
        resolve(undefined);
      };
      wait(100);
    }, 100);
  });
}
