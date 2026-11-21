// 无障碍：读屏（VoiceOver）要的标签、提示、值和特征，挂在 UIView 上。
//
// UIKit 里它们是 NSObject 的非正式协议 UIAccessibility，任何对象都有；我们只
// 挂在 UIView 上，界面上能被读屏读到的只有视图。
//
// 读屏真的怎么念要开着 VoiceOver 听，自动跑的验收只验读写、默认值和写错的处理。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {readonly string[]} traits */
function sorted(traits) {
  return [...traits].sort().join(',');
}

/** @param {import("../main.js").StepContext} ctx */
export function stepAccessibility(ctx) {
  const { assert } = ctx;
  console.log('--- 无障碍 ---');
  const view = new UIView();
  const label = new UILabel();
  const button = UIButton.buttonWithType('system');

  // ---- 默认 ----
  assert('无障碍：UIView 默认不是读屏元素', view.isAccessibilityElement, false);
  // 系统控件的这几个默认值由系统现算，跟着读屏开没开、在不在窗口里变，不是运行时
  // 定的，只打印。iPhone 14（iOS 27.2）上量到：不在窗口里的 UILabel、UIButton
  // 不管读屏开没开都是 false
  console.log('  · 实测：不在窗口里的 UILabel / UIButton 的 isAccessibilityElement = ' +
              label.isAccessibilityElement + ' / ' + button.isAccessibilityElement);
  assert('无障碍：accessibilityLabel 默认 null', view.accessibilityLabel, null);
  assert('无障碍：accessibilityHint 默认 null', view.accessibilityHint, null);
  assert('无障碍：accessibilityValue 默认 null', view.accessibilityValue, null);
  assert('无障碍：accessibilityIdentifier 默认 null', view.accessibilityIdentifier, null);
  assert('无障碍：UIView 的 accessibilityTraits 默认空数组',
         Array.isArray(view.accessibilityTraits) && view.accessibilityTraits.length === 0, true);
  assert('无障碍：UIButton 的特征里有 button', button.accessibilityTraits.includes('button'), true);
  assert('无障碍：UILabel 的特征里有 staticText', label.accessibilityTraits.includes('staticText'), true);
  assert('无障碍：accessibilityElementsHidden 默认 false', view.accessibilityElementsHidden, false);
  assert('无障碍：accessibilityViewIsModal 默认 false', view.accessibilityViewIsModal, false);
  assert('无障碍：shouldGroupAccessibilityChildren 默认 false', view.shouldGroupAccessibilityChildren, false);
  // 同上：读屏开着时是它的文字，关着时是 null（iPhone 14，iOS 27.2 两种都量过）
  label.text = '余额';
  console.log('  · 实测：UILabel 没设标签时 accessibilityLabel = ' + JSON.stringify(label.accessibilityLabel) +
              '（读屏开着时是它的文字，关着时是 null）');

  // ---- 读写 ----
  view.isAccessibilityElement = true;
  assert('无障碍：isAccessibilityElement 写进去读回来', view.isAccessibilityElement, true);
  view.isAccessibilityElement = /** @type {any} */ (0);
  assert('无障碍：isAccessibilityElement 按 Boolean() 转', view.isAccessibilityElement, false);

  view.accessibilityLabel = '关闭';
  assert('无障碍：accessibilityLabel 写进去读回来', view.accessibilityLabel, '关闭');
  view.accessibilityLabel = /** @type {any} */ (5);
  assert('无障碍：accessibilityLabel 按 String() 转', view.accessibilityLabel, '5');
  view.accessibilityLabel = null;
  assert('无障碍：accessibilityLabel 写 null 清掉', view.accessibilityLabel, null);
  view.accessibilityLabel = 'x';
  view.accessibilityLabel = /** @type {any} */ (undefined);
  assert('无障碍：accessibilityLabel 写 undefined 也是清掉', view.accessibilityLabel, null);
  label.accessibilityLabel = '账户余额';
  assert('无障碍：UILabel 设了标签就用设的，不用文字', label.accessibilityLabel, '账户余额');

  view.accessibilityHint = '双击关闭这个页面';
  assert('无障碍：accessibilityHint 写进去读回来', view.accessibilityHint, '双击关闭这个页面');
  view.accessibilityHint = null;
  assert('无障碍：accessibilityHint 写 null 清掉', view.accessibilityHint, null);

  view.accessibilityValue = '50%';
  assert('无障碍：accessibilityValue 写进去读回来', view.accessibilityValue, '50%');
  view.accessibilityValue = null;
  assert('无障碍：accessibilityValue 写 null 清掉', view.accessibilityValue, null);

  view.accessibilityIdentifier = 'close-button';
  assert('无障碍：accessibilityIdentifier 写进去读回来', view.accessibilityIdentifier, 'close-button');
  view.accessibilityIdentifier = null;
  assert('无障碍：accessibilityIdentifier 写 null 清掉', view.accessibilityIdentifier, null);

  view.accessibilityElementsHidden = true;
  assert('无障碍：accessibilityElementsHidden 写进去读回来', view.accessibilityElementsHidden, true);
  view.accessibilityViewIsModal = true;
  assert('无障碍：accessibilityViewIsModal 写进去读回来', view.accessibilityViewIsModal, true);
  view.shouldGroupAccessibilityChildren = /** @type {any} */ ('false');
  assert('无障碍：shouldGroupAccessibilityChildren 按 Boolean() 转（"false" 是 true）',
         view.shouldGroupAccessibilityChildren, true);

  // ---- 特征 ----
  view.accessibilityTraits = ['button', 'selected'];
  assert('无障碍：accessibilityTraits 写两个读回两个', sorted(view.accessibilityTraits), 'button,selected');
  view.accessibilityTraits = [];
  assert('无障碍：accessibilityTraits 写空数组清掉', view.accessibilityTraits.length, 0);
  /** @type {UIAccessibilityTraits[]} */
  const all = ['button', 'link', 'header', 'searchField', 'image', 'selected', 'playsSound',
    'keyboardKey', 'staticText', 'summaryElement', 'notEnabled', 'updatesFrequently',
    'startsMediaSession', 'adjustable', 'allowsDirectInteraction', 'causesPageTurn', 'tabBar',
    'toggleButton', 'supportsZoom'];
  const wrong = all.filter((name) => {
    view.accessibilityTraits = [name];
    return view.accessibilityTraits.join(',') !== name;
  });
  assert('无障碍：19 个特征逐个写进去都原样读回来', wrong.join(','), '');
  view.accessibilityTraits = all;
  assert('无障碍：19 个特征一起写进去读回 19 个', view.accessibilityTraits.length, 19);
  view.accessibilityTraits = ['header'];
  // @ts-expect-error 故意写错名字
  view.accessibilityTraits = ['header', 'heading'];
  assert('无障碍：有一个名字不认识，整次赋值不生效（警告，不抛）', view.accessibilityTraits.join(','), 'header');
  assert('无障碍：accessibilityTraits 写的不是数组抛',
         thrown(() => { view.accessibilityTraits = /** @type {any} */ ('button'); }), 'TypeError');
  button.accessibilityTraits = ['header'];
  assert('无障碍：按钮改成 header，读回来只有 header', button.accessibilityTraits.join(','), 'header');

  // ---- 只挂在视图上 ----
  assert('无障碍：不是视图的对象上没有这些属性',
         'accessibilityLabel' in new NSAttributedString('x'), false);
}
