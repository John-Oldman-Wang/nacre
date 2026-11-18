// 毛玻璃：UIVisualEffectView，和它显示的效果——UIBlurEffect（模糊）、
// UIVibrancyEffect（让模糊上面的内容更鲜明）、UIGlassEffect（iOS 26 的玻璃）、
// UIGlassContainerEffect（把几块玻璃合成一组）。
//
// 能自动验的是：对象建不建得出来、每个成员的默认值和读写、写错了抛什么。
// **屏幕上看起来怎样（糊不糊、玻璃的折射、鲜明效果）这里验不了**，只能看。

import { assert } from '../support.js';

/**
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string} needle
 */
function throws(label, fn, needle) {
  try {
    fn();
    assert(label, '没抛', '抛 ' + needle);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const ok = err instanceof TypeError && message.includes(needle);
    assert(label, ok ? needle : err.name + ': ' + message, needle);
  }
}

const BLUR_STYLES = /** @type {const} */ ([
  'extraLight', 'light', 'dark', 'regular', 'prominent',
  'systemUltraThinMaterial', 'systemThinMaterial', 'systemMaterial',
  'systemThickMaterial', 'systemChromeMaterial',
  'systemUltraThinMaterialLight', 'systemThinMaterialLight', 'systemMaterialLight',
  'systemThickMaterialLight', 'systemChromeMaterialLight',
  'systemUltraThinMaterialDark', 'systemThinMaterialDark', 'systemMaterialDark',
  'systemThickMaterialDark', 'systemChromeMaterialDark',
]);

const VIBRANCY_STYLES = /** @type {const} */ ([
  'label', 'secondaryLabel', 'tertiaryLabel', 'quaternaryLabel',
  'fill', 'secondaryFill', 'tertiaryFill', 'separator',
]);

/** @param {import("../main.js").StepContext} ctx */
export function stepEffects(ctx) {
  // 区块先建：它在瀑布里的位置由调用的先后决定
  const host = ctx.section('毛玻璃：模糊 + 鲜明、玻璃、带颜色的玻璃（底下是彩条）', 72);
  console.log('--- 毛玻璃：UIVisualEffectView 和效果 ---');

  // ===== 效果对象：四个类都不是 new 出来的 =====
  throws('UIVisualEffect 是基类，不能 new',
         // @ts-expect-error 构造函数不公开
         () => new UIVisualEffect(), 'Illegal constructor');
  throws('UIBlurEffect 不能 new，报错里指到工厂方法',
         // @ts-expect-error 构造函数不公开
         () => new UIBlurEffect(), 'UIBlurEffect.effectWithStyle');
  throws('UIVibrancyEffect 不能 new，报错里指到工厂方法',
         // @ts-expect-error 构造函数不公开
         () => new UIVibrancyEffect(), 'UIVibrancyEffect.effectForBlurEffect');
  throws('UIGlassEffect 不能 new，报错里指到工厂方法',
         // @ts-expect-error 构造函数不公开
         () => new UIGlassEffect(), 'UIGlassEffect.effectWithStyle');

  // ===== UIBlurEffect =====
  const blur = UIBlurEffect.effectWithStyle('systemMaterial');
  assert('模糊：工厂给的是 UIBlurEffect', blur instanceof UIBlurEffect, true);
  assert('它也是 UIVisualEffect', blur instanceof UIVisualEffect, true);
  assert('它也是 NSObject', blur instanceof NSObject, true);
  // 实测：同一种样式调两次，原生给的是两个对象（isEqual 相等、指针不同）
  assert('同一种样式调两次，得到两个对象',
         UIBlurEffect.effectWithStyle('systemMaterial') !== blur, true);

  let blurMade = 0;
  for (const style of BLUR_STYLES) {
    if (UIBlurEffect.effectWithStyle(style) instanceof UIBlurEffect) blurMade += 1;
  }
  assert('二十种模糊样式都建得出来', blurMade, 20);

  throws('不认识的模糊样式被拒，可选值列出来了',
         // @ts-expect-error 没有这种样式
         () => UIBlurEffect.effectWithStyle('frosted'), 'systemMaterial');
  // 头文件里有 UIBlurEffectStyleExtraDark，但标着 iOS 上不可用（只有 tvOS 有）
  throws('extraDark 只有 tvOS 有，这里不认',
         // @ts-expect-error iOS 上没有这个值
         () => UIBlurEffect.effectWithStyle('extraDark'), 'expected one of');
  throws('样式给数字被拒（枚举只认名字）',
         // @ts-expect-error 要的是名字
         () => UIBlurEffect.effectWithStyle(2), 'expected one of');
  throws('样式不给被拒',
         // @ts-expect-error 少了参数
         () => UIBlurEffect.effectWithStyle(), 'expected one of');

  // ===== UIVibrancyEffect =====
  const vibrancy = UIVibrancyEffect.effectForBlurEffect(blur);
  assert('鲜明：工厂给的是 UIVibrancyEffect', vibrancy instanceof UIVibrancyEffect, true);
  assert('它也是 UIVisualEffect', vibrancy instanceof UIVisualEffect, true);
  assert('它不是 UIBlurEffect', vibrancy instanceof UIBlurEffect, false);
  assert('调两次得到两个对象',
         UIVibrancyEffect.effectForBlurEffect(blur) !== vibrancy, true);

  let vibrancyMade = 0;
  for (const style of VIBRANCY_STYLES) {
    const made = UIVibrancyEffect.effectForBlurEffect(blur, { style });
    if (made instanceof UIVibrancyEffect) vibrancyMade += 1;
  }
  assert('八种鲜明样式都建得出来', vibrancyMade, 8);
  // options 的成员是 undefined 视为没带；整个 options 传 null 视为空对象
  assert('{ style: undefined } 等于没带',
         UIVibrancyEffect.effectForBlurEffect(blur, { style: undefined })
           instanceof UIVibrancyEffect, true);
  assert('options 传 {} 可以',
         UIVibrancyEffect.effectForBlurEffect(blur, {}) instanceof UIVibrancyEffect, true);
  assert('options 传 null 可以',
         // @ts-expect-error 类型上 options 不可空，运行时照 Web IDL 当成空对象
         UIVibrancyEffect.effectForBlurEffect(blur, null) instanceof UIVibrancyEffect, true);

  throws('不认识的鲜明样式被拒，可选值列出来了',
         // @ts-expect-error 没有这种样式
         () => UIVibrancyEffect.effectForBlurEffect(blur, { style: 'title' }), 'secondaryLabel');
  throws('第一个参数不给被拒',
         // @ts-expect-error 少了参数
         () => UIVibrancyEffect.effectForBlurEffect(), 'effectForBlurEffect needs a UIBlurEffect');
  throws('第一个参数是 null 被拒',
         // @ts-expect-error 不可空
         () => UIVibrancyEffect.effectForBlurEffect(null),
         'effectForBlurEffect needs a UIBlurEffect');
  throws('第一个参数是视图被拒',
         // @ts-expect-error 要的是模糊效果
         () => UIVibrancyEffect.effectForBlurEffect(new UIView()),
         'effectForBlurEffect needs a UIBlurEffect');
  throws('第一个参数是别的效果（不是模糊）被拒',
         // @ts-expect-error 要的是模糊效果
         () => UIVibrancyEffect.effectForBlurEffect(vibrancy),
         'effectForBlurEffect needs a UIBlurEffect');
  throws('第一个参数是样式名被拒（要的是效果对象）',
         // @ts-expect-error 要的是模糊效果
         () => UIVibrancyEffect.effectForBlurEffect('systemMaterial'),
         'effectForBlurEffect needs a UIBlurEffect');

  // ===== UIGlassEffect（iOS 26）=====
  const glass = UIGlassEffect.effectWithStyle('regular');
  assert('玻璃：工厂给的是 UIGlassEffect', glass instanceof UIGlassEffect, true);
  assert('它也是 UIVisualEffect', glass instanceof UIVisualEffect, true);
  assert('clear 也建得出来',
         UIGlassEffect.effectWithStyle('clear') instanceof UIGlassEffect, true);
  throws('不认识的玻璃样式被拒，可选值列出来了',
         // @ts-expect-error 没有这种样式
         () => UIGlassEffect.effectWithStyle('frosted'), 'clear');

  // 默认值是在模拟器上用原生小程序量的（iOS 27.2）
  assert('玻璃：isInteractive 默认 false', glass.isInteractive, false);
  assert('玻璃：tintColor 默认 null', glass.tintColor, null);

  glass.isInteractive = true;
  assert('isInteractive 写得进去', glass.isInteractive, true);
  // 布尔照 Web IDL：JS 的真假值
  // @ts-expect-error 类型上要布尔，运行时按真假值转
  glass.isInteractive = 0;
  assert('isInteractive = 0 得到 false', glass.isInteractive, false);
  // @ts-expect-error 同上
  glass.isInteractive = 'false';
  assert("isInteractive = 'false' 得到 true（非空字符串是真值）", glass.isInteractive, true);
  glass.isInteractive = false;

  glass.tintColor = '#FF2D55';
  assert('tintColor 写字符串，读回来是原样', glass.tintColor, '#FF2D55');
  glass.tintColor = UIColor.systemBlueColor;
  assert('tintColor 写颜色对象，读回来是它的名字', glass.tintColor, 'systemBlue');
  // 颜色写错不抛：打一条警告，保留旧值（和别处的颜色属性一致）
  glass.tintColor = 'no-such-color';
  assert('tintColor 写了不合法的颜色，保留旧值', glass.tintColor, 'systemBlue');
  glass.tintColor = null;
  assert('tintColor 可以清掉', glass.tintColor, null);

  // ===== UIGlassContainerEffect（iOS 26）=====
  const container = new UIGlassContainerEffect();
  assert('玻璃容器：new 得出来', container instanceof UIGlassContainerEffect, true);
  assert('它也是 UIVisualEffect', container instanceof UIVisualEffect, true);
  assert('玻璃容器：spacing 默认 0', container.spacing, 0);
  container.spacing = 24;
  assert('spacing 写得进去', container.spacing, 24);
  // @ts-expect-error 类型上要数，运行时按 Number() 转
  container.spacing = '12';
  assert("spacing = '12' 得到 12", container.spacing, 12);
  throws('spacing 转不出数被拒',
         // @ts-expect-error 要的是数
         () => { container.spacing = 'wide'; }, 'spacing must be a finite number');
  throws('spacing = undefined 被拒',
         // @ts-expect-error 要的是数
         () => { container.spacing = undefined; }, 'spacing must be a finite number');
  throws('spacing 是负数被拒', () => { container.spacing = -5; },
         'spacing must be a non-negative number');
  assert('被拒之后 spacing 还是原来的值', container.spacing, 12);

  // ===== UIVisualEffectView =====
  const plain = new UIVisualEffectView();
  assert('效果视图：new 得出来', plain instanceof UIVisualEffectView, true);
  assert('它是 UIView', plain instanceof UIView, true);
  assert('不给效果：effect 是 null', plain.effect, null);
  // UIView 那一面的几个默认值，量出来的。圆角要自己开 clipsToBounds
  assert('默认 backgroundColor 是 null', plain.backgroundColor, null);
  assert('默认不裁剪', plain.clipsToBounds, false);
  assert('默认接收触摸', plain.isUserInteractionEnabled, true);

  // ---- contentView ----
  const content = plain.contentView;
  assert('contentView 是 UIView', content instanceof UIView, true);
  assert('contentView 不是效果视图自己', /** @type {UIView} */ (content) !== plain, true);
  assert('contentView 读两次是同一个包装', plain.contentView === content, true);
  assert('contentView 的父视图是效果视图', content.superview === plain, true);
  throws('contentView 只读',
         // @ts-expect-error 只读属性
         () => { plain.contentView = new UIView(); }, 'contentView');

  plain.frame = new CGRect(0, 0, 200, 100);
  plain.layoutIfNeeded();
  assert('contentView 跟着效果视图的大小走',
         content.frame.width + '×' + content.frame.height, '200×100');

  // 内容加在 contentView 上
  const inner = new UILabel();
  content.addSubview(inner);
  assert('内容加到 contentView 上', content.subviews.length, 1);
  assert('加进去的视图，父视图是 contentView', inner.superview === content, true);

  // 最常见的坑：直接加到效果视图自己上面。UIKit 对这个是抛异常的，
  // 运行时在调用之前拦下来，报错里说该往哪加
  const stray = new UIView();
  throws('addSubview 直接加到效果视图上被拒',
         () => plain.addSubview(stray), 'add them to its contentView');
  throws('insertSubview { atIndex } 也被拒',
         () => plain.insertSubview(stray, { atIndex: 0 }),
         'add them to its contentView');
  throws('insertSubview { belowSubview } 也被拒',
         () => plain.insertSubview(stray, { belowSubview: content }),
         'add them to its contentView');
  throws('insertSubview { aboveSubview } 也被拒',
         () => plain.insertSubview(stray, { aboveSubview: content }),
         'add them to its contentView');
  assert('被拒的视图没有进任何树', stray.superview, null);
  assert('contentView 里的内容没受影响', content.subviews.length, 1);

  // ---- effect：读写 ----
  plain.effect = blur;
  assert('effect 写模糊，读回来是同一个对象', plain.effect === blur, true);
  assert('换效果之后 contentView 还是原来那个', plain.contentView === content, true);
  assert('换效果之后内容还在', content.subviews.length, 1);
  plain.effect = vibrancy;
  assert('effect 写鲜明，读回来是同一个对象', plain.effect === vibrancy, true);
  plain.effect = null;
  assert('effect 可以清掉', plain.effect, null);
  plain.effect = blur;
  // @ts-expect-error 类型上是 UIVisualEffect | null，运行时 undefined 当成没有
  plain.effect = undefined;
  assert('effect = undefined 也是清掉', plain.effect, null);

  plain.effect = blur;
  throws('effect 写视图被拒',
         // @ts-expect-error 要的是效果
         () => { plain.effect = new UIView(); }, 'effect needs a UIVisualEffect or null');
  throws('effect 写颜色对象被拒',
         // @ts-expect-error 要的是效果
         () => { plain.effect = UIColor.systemBlueColor; },
         'effect needs a UIVisualEffect or null');
  throws('effect 写样式名被拒（要的是效果对象）',
         // @ts-expect-error 要的是效果
         () => { plain.effect = 'systemMaterial'; }, 'effect needs a native object or null');
  assert('被拒之后 effect 还是原来那个', plain.effect === blur, true);

  // ---- 构造时给效果 ----
  const blurred = new UIVisualEffectView(blur);
  assert('new UIVisualEffectView(blur)：effect 就是它', blurred.effect === blur, true);
  assert('一个效果对象可以给多个视图用', plain.effect === blurred.effect, true);
  assert('new UIVisualEffectView(null)：effect 是 null', new UIVisualEffectView(null).effect, null);
  assert('new UIVisualEffectView(undefined)：effect 是 null',
         new UIVisualEffectView(undefined).effect, null);
  throws('构造时给视图被拒',
         // @ts-expect-error 要的是效果
         () => new UIVisualEffectView(new UIView()),
         'UIVisualEffectView needs a UIVisualEffect or null');
  throws('构造时给样式名被拒（要的是效果对象）',
         // @ts-expect-error 要的是效果
         () => new UIVisualEffectView('systemMaterial'),
         'UIVisualEffectView needs a UIVisualEffect or null');

  // ---- 玻璃：视图存的是一份副本 ----
  //
  // 实测：模糊和鲜明是不可变的，赋给视图再读回来是同一个对象。玻璃和玻璃
  // 容器带可写的属性，视图存的是**赋值那一刻的副本**，每次读 effect 给的
  // 又是一份新的副本。所以：
  //   - 读回来的不是写进去的那个对象，读两次也不是同一个
  //   - 赋值之后再改原来那个对象，视图不跟着变；要生效得重新赋一次
  const tinted = UIGlassEffect.effectWithStyle('regular');
  tinted.tintColor = '#34C759';
  tinted.isInteractive = true;
  const glassView = new UIVisualEffectView(tinted);
  const readBack = glassView.effect;
  assert('玻璃：读回来的是 UIGlassEffect', readBack instanceof UIGlassEffect, true);
  assert('玻璃：读回来的不是写进去的那个对象', readBack !== tinted, true);
  assert('玻璃：读两次也不是同一个对象', glassView.effect !== readBack, true);
  assert('副本带着赋值时的 tintColor',
         /** @type {UIGlassEffect} */ (readBack).tintColor, '#34C759');
  assert('副本带着赋值时的 isInteractive',
         /** @type {UIGlassEffect} */ (readBack).isInteractive, true);
  tinted.tintColor = '#FF9500';
  assert('赋值之后改原对象，视图里的不变',
         /** @type {UIGlassEffect} */ (glassView.effect).tintColor, '#34C759');
  /** @type {UIGlassEffect} */ (readBack).isInteractive = false;
  assert('改读回来的副本，视图里的也不变',
         /** @type {UIGlassEffect} */ (glassView.effect).isInteractive, true);
  glassView.effect = tinted;
  assert('重新赋一次才生效',
         /** @type {UIGlassEffect} */ (glassView.effect).tintColor, '#FF9500');

  const group = new UIGlassContainerEffect();
  group.spacing = 16;
  const groupView = new UIVisualEffectView(group);
  const groupBack = groupView.effect;
  assert('玻璃容器：读回来的是 UIGlassContainerEffect',
         groupBack instanceof UIGlassContainerEffect, true);
  assert('玻璃容器：读回来的也是副本', groupBack !== group, true);
  assert('副本带着赋值时的 spacing',
         /** @type {UIGlassContainerEffect} */ (groupBack).spacing, 16);

  // ===== 所有权：视图持有效果 =====
  //
  // JS 这边丢掉效果对象的引用之后，它的包装不能被回收——读回来要还是原来
  // 那个，挂在上面的 JS 状态要还在。这里**不自己逼 GC**（别的步骤在逼，
  // 再加一份压力会挤到它们），只放一个没人持有的效果当对照组：对照组被
  // 回收了，说明完整的 GC 跑过，这一组的结论才算数
  const keptByProperty = new UIVisualEffectView();
  let controlCollected = false;
  const registry = new FinalizationRegistry(() => { controlCollected = true; });
  /** @type {UIVisualEffectView} */
  let keptByConstructor;
  (() => {
    const viaProperty = UIBlurEffect.effectWithStyle('dark');
    /** @type {any} */ (viaProperty).probe = '挂在效果的包装上（属性写入）';
    keptByProperty.effect = viaProperty;
    const viaConstructor = UIBlurEffect.effectWithStyle('light');
    /** @type {any} */ (viaConstructor).probe = '挂在效果的包装上（构造时给的）';
    keptByConstructor = new UIVisualEffectView(viaConstructor);
    registry.register(UIBlurEffect.effectWithStyle('prominent'), 'control');
  })();
  let waited = 0;
  const checkOwnership = () => {
    // registry 要有人拿着，不然回调永远不来
    if (registry === null) return;
    if (!controlCollected) {
      waited += 1;
      if (waited < 45) { setTimeout(checkOwnership, 1000); return; }
      console.log('--- 毛玻璃：持有边 ---');
      console.log('  ! 对照组 45 秒里没被回收，GC 没跑到，这一组未验证');
      return;
    }
    console.log('--- 毛玻璃：持有边 ---');
    assert('对照组（没人持有的效果）被回收了', controlCollected, true);
    assert('属性写进去的效果：GC 后读回来还是原来那个包装',
           /** @type {any} */ (keptByProperty.effect).probe, '挂在效果的包装上（属性写入）');
    assert('构造时给的效果：GC 后读回来还是原来那个包装',
           /** @type {any} */ (keptByConstructor.effect).probe, '挂在效果的包装上（构造时给的）');
    console.log('--- 毛玻璃：以上断言跑完 ---');
  };
  setTimeout(checkOwnership, 8000);

  // ===== 屏幕上 =====
  //
  // 底下一排彩条，上面盖三块：模糊 + 鲜明的字、玻璃、带颜色的可交互玻璃。
  // 效果好不好看只能用眼睛看，这里只保证它们建出来了、放上去了
  const stripes = ['systemRed', 'systemOrange', 'systemYellow', 'systemGreen',
                   'systemTeal', 'systemBlue', 'systemIndigo', 'systemPurple', 'systemPink'];
  stripes.forEach((color, i) => {
    const stripe = new UIView();
    stripe.frame = new CGRect(16 + i * 38, 4, 38, 64);
    stripe.backgroundColor = color;
    host.addSubview(stripe);
  });

  /**
   * @param {number} index
   * @param {UIVisualEffect} effect
   * @returns {UIVisualEffectView}
   */
  const tile = (index, effect) => {
    const view = new UIVisualEffectView(effect);
    view.frame = new CGRect(24 + index * 112, 12, 104, 48);
    view.layer.cornerRadius = 12;
    view.clipsToBounds = true;
    host.addSubview(view);
    return view;
  };
  /**
   * @param {UIView} parent
   * @param {string} text
   */
  const caption = (parent, text) => {
    const label = new UILabel();
    label.frame = new CGRect(0, 0, 104, 48);
    label.text = text;
    label.textAlignment = 'center';
    label.font = UIFont.boldSystemFontOfSize(15);
    parent.addSubview(label);
    return label;
  };

  // 第一块：模糊，上面再套一层鲜明效果，字放在鲜明那一层的 contentView 里
  const material = UIBlurEffect.effectWithStyle('systemThinMaterial');
  const blurTile = tile(0, material);
  const vivid = new UIVisualEffectView(
    UIVibrancyEffect.effectForBlurEffect(material, { style: 'label' }));
  vivid.frame = new CGRect(0, 0, 104, 48);
  blurTile.contentView.addSubview(vivid);
  caption(vivid.contentView, '模糊');

  // 第二块：玻璃
  const glassTile = tile(1, UIGlassEffect.effectWithStyle('regular'));
  caption(glassTile.contentView, '玻璃');

  // 第三块：带颜色、可交互的玻璃（按住它会有反应，要用手试）
  const lively = UIGlassEffect.effectWithStyle('clear');
  lively.tintColor = 'rgba(255, 45, 85, 0.35)';
  lively.isInteractive = true;
  const livelyTile = tile(2, lively);
  caption(livelyTile.contentView, '带色玻璃');

  assert('三块效果视图都放上去了',
         host.subviews.filter((v) => v instanceof UIVisualEffectView).length, 3);
  assert('鲜明那一层在模糊的 contentView 里', vivid.superview === blurTile.contentView, true);
  console.log('  ✓ 屏幕上：一排彩条，上面三块圆角的效果——模糊（字是鲜明效果）、玻璃、' +
              '带粉色的玻璃。看起来对不对这里验不了');
}
