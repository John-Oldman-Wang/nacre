import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 两个条状的视图：UIToolbar（工具条）和 UISearchBar（搜索框）。都是 UIView
// 的子类，不是控件。
//
// 这里的期望值都是动手前用原生探针量的（iPhone Air 模拟器，iOS 27.2，
// `simctl spawn` 的命令行程序：没有 UIApplication，视图不在窗口里）。
// 所以默认值、大小这些断言都对着**没放进窗口的**条做，和量的时候同一个状态。
// 量到的几条和头文件的注释或者直觉不一样的：
//   - 工具条的 items 没设过是 nil，JS 这边读到的是空数组
//   - 工具条自己想要的高：探针里量到 44，App 里是 48（合并后的验收跑出来的，
//     期望按 App 的改了）。别的数两种状态下一样
//   - 搜索框的 text 没设过是空串不是 null；写 null 读回空串
//   - 搜索框的 placeholder：null 和空串被 UIKit 当成同一个值，已经没有的
//     时候再写另一种不会变。prompt 没有这回事，写空串读回空串
//   - selectedScopeButtonIndex 超出范围的值照样存下来（写 7 读回 7），
//     头文件写的是 "ignored if out of range"
//   - scopeButtonTitles 写成空数组之后 selectedScopeButtonIndex 变成 -1
//   - 用代码改 text、改 selectedScopeButtonIndex 都不通知委托，所以没有事件
//   - 搜索框的委托回调全是它里面那几个控件的 target-action 转出来的：
//     输入框的 input → textDidChange，focus → 开始输入，
//     blur → 结束输入，return → 点了键盘上的搜索。
//     所以对 searchTextField 主动发这四个控件事件，就能不弹键盘把四个
//     事件走一遍。范围按钮、取消、书签、结果列表那四个在私有的子视图上，
//     从 JS 够不着，只能真实触摸
//
// 键盘设置那九个属性（keyboardType … textContentType）不是在模拟器上量的：
// 是在本机的 Mac Catalyst 程序里量的（macOS 27.2，没有 UIApplication，搜索框
// 不在窗口里）。量到的：
//   - 九个属性搜索框都收，系统把它们转给一份和 searchTextField 共用的设置，
//     所以写哪一边，另一边都读得到
//   - 默认值里有三个和新建的输入框不一样：returnKeyType 是 search，
//     enablesReturnKeyAutomatically 是 true，autocorrectionType 是 no。
//     这三个早先在模拟器上从 searchTextField 读到过，所以写成了断言；
//     其余六个只打印，不写死
//   - isSecureTextEntry 写得进去、读得回来

/**
 * @param {string} label
 * @param {() => void} fn
 * @param {string} needle 报错信息里应该有的一段
 */
function throws(label, fn, needle) {
  try {
    fn();
    console.log('  ✗ ' + label + ' = 没抛（期望抛 ' + needle + '）');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const passed = err instanceof TypeError && message.includes(needle);
    console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + message +
                (passed ? '' : '（期望 TypeError，信息里有 ' + needle + '）'));
  }
}

// 一组断言中途抛了（比如类还没接进来）只废这一组，不连累后面的
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

// 等一个条件成立。每 100ms 看一次，到点没等到就报未验证——不假装通过
// 也不假装失败（和输入框那一步同一个规矩）
/**
 * @param {string} what
 * @param {() => boolean} ready
 * @param {() => void} then
 * @param {number} [limitMs]
 */
function waitUntil(what, ready, then, limitMs = 6000) {
  const deadline = Date.now() + limitMs;
  const tick = () => {
    let ok = false;
    try { ok = ready(); } catch (err) {
      console.log('  ✗ 等「' + what + '」时抛了 = ' +
                  (err instanceof Error ? err.message : String(err)) + '（期望不抛）');
      return;
    }
    if (ok) { group(what, then); return; }
    if (Date.now() >= deadline) {
      console.log('  ! ' + limitMs / 1000 + ' 秒内没等到「' + what + '」，这一组未验证');
      return;
    }
    setTimeout(tick, 100);
  };
  setTimeout(tick, 0);
}

/** @param {CGSize} size */
const sizeText = (size) => size.width + '×' + size.height;

/** @param {import("../main.js").StepContext} ctx */
export function stepBars(ctx) {
  // 这一步要用焦点：把那一段做完的时刻作为 Promise 返回，排在后面的步骤等它
  // （见 main.js）
  /** @type {() => void} */
  let focusDone = () => {};
  /** @type {Promise<void>} */
  const focusFinished = new Promise((resolve) => { focusDone = resolve; });
  const { assert } = ctx;
  const host = ctx.section('工具条和搜索框：UIToolbar / UISearchBar', 220);

  // =====================================================================
  console.log('--- UIToolbar ---');

  group('工具条：默认值', () => {
    const bar = new UIToolbar();
    assert('是 UIView 的子类', bar instanceof UIView, true);
    assert('不是控件', bar instanceof UIControl, false);
    assert('默认没有项：items 是空数组', Array.isArray(bar.items) && bar.items.length === 0, true);
    assert('默认 barStyle', bar.barStyle, 'default');
    assert('默认半透明', bar.isTranslucent, true);
    assert('默认没有 barTintColor', bar.barTintColor, null);
    assert('tintColor 读出来永远有值', typeof bar.tintColor, 'string');
    assert('默认 frame 是 0×0', sizeText(bar.frame.size), '0×0');
    // 宽 -1 是「这个方向没有自己想要的大小」（UIViewNoIntrinsicMetric）。
    //
    // 高度有两个数，量的状态不同（都是 iPhone Air 模拟器，iOS 27.2，都是没放进
    // 窗口的工具条）：
    //   44  不带界面的命令行程序里（没有 UIApplication）。最初的期望是照它写的
    //   48  App 里。合并后的验收跑出来的，下面三条按它改
    // 探针里没有 UIApplication，量到的不一定是 App 里的数——这一条是又一个例子。
    // 搜索框的 64 / 98 / 111 两种状态下一样
    assert('自己想要的大小：宽不定，高 48', sizeText(bar.intrinsicContentSize), '-1×48');
    assert('sizeThatFits 给宽 390：390×48',
           sizeText(bar.sizeThatFits(new CGSize(390, 0))), '390×48');
    bar.frame = new CGRect(0, 0, 390, 20);
    assert('frame 的高写得进去', bar.frame.height, 20);
    bar.sizeToFit();
    assert('sizeToFit 之后高回到 48，宽不动', sizeText(bar.frame.size), '390×48');
  });

  group('工具条：items', () => {
    const bar = new UIToolbar();
    const a = new UIBarButtonItem({ title: 'A' });
    const space = UIBarButtonItem.flexibleSpace();
    const trash = UIBarButtonItem.systemItem('trash');
    bar.items = [a, space, trash];
    assert('写进去三个', bar.items.length, 3);
    assert('读回来是原来那几个包装，顺序不变',
           bar.items[0] === a && bar.items[1] === space && bar.items[2] === trash, true);
    assert('每次读是一个新数组', bar.items !== bar.items, true);
    // 读出来的数组是快照：改它不影响工具条
    bar.items.pop();
    assert('改读出来的数组不影响工具条', bar.items.length, 3);

    bar.items = [];
    assert('写空数组：清空', bar.items.length, 0);
    bar.items = [a];
    bar.items = null;
    assert('写 null：清空', bar.items.length, 0);

    assert('setItems 没有返回值', bar.setItems([trash, a], { animated: true }), undefined);
    assert('setItems 带动画：items 当场就是新的', bar.items.length, 2);
    assert('setItems：顺序照给的', bar.items[0] === trash && bar.items[1] === a, true);
    bar.setItems([a]);
    assert('setItems 不带 options', bar.items.length === 1 && bar.items[0] === a, true);
    bar.setItems([a, space], { animated: undefined });
    assert('animated 是 undefined 视为没带', bar.items.length, 2);
    bar.setItems(null);
    assert('setItems(null)：清空', bar.items.length, 0);

    // 实测：同一个项放两次，UIKit 照收
    bar.items = [a, a];
    assert('同一个项放两次：两个都在', bar.items.length, 2);
    // 实测：同一个项放进两个工具条，前一个工具条里的不会被拿走
    const other = new UIToolbar();
    other.items = [a];
    assert('同一个项放进第二个工具条', other.items.length, 1);
    assert('第一个工具条里的还在', bar.items.length, 2);

    // 照 Web IDL 的 sequence：任何可迭代的对象都收，不只是数组
    // @ts-expect-error 类型上要数组
    bar.items = new Set([a, trash]);
    assert('items 接受可迭代对象', bar.items.length, 2);

    throws('items 里有别的类的对象被拒', () => {
      // @ts-expect-error 只收 UIBarButtonItem
      bar.items = [a, new UIView()];
    }, 'UIBarButtonItem');
    throws('items 里有 null 被拒', () => {
      // @ts-expect-error 元素不能是 null
      bar.items = [a, null];
    }, 'UIBarButtonItem');
    throws('items 里有字符串被拒', () => {
      // @ts-expect-error 只收 UIBarButtonItem
      bar.items = ['save'];
    }, 'UIBarButtonItem');
    throws('items 给数字被拒', () => {
      // @ts-expect-error 要一个数组
      bar.items = 5;
    }, 'items');
    throws('setItems 里有别的类的对象被拒', () => {
      // @ts-expect-error 只收 UIBarButtonItem
      bar.setItems([new UIView()], { animated: false });
    }, 'UIBarButtonItem');
    throws('setItems 给数字被拒', () => {
      // @ts-expect-error 要一个数组
      bar.setItems(5);
    }, 'setItems');
    assert('被拒之后原来的项没动',
           bar.items.length === 2 && bar.items[0] === a && bar.items[1] === trash, true);
  });

  group('工具条：样式', () => {
    const bar = new UIToolbar();
    bar.barStyle = 'black';
    assert('barStyle 写得进去', bar.barStyle, 'black');
    // 实测：换 barStyle 不动 isTranslucent
    assert('换 barStyle 不动 isTranslucent', bar.isTranslucent, true);
    bar.barStyle = 'default';
    assert('换回 default', bar.barStyle, 'default');
    assert('不认识的 barStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      bar.barStyle = 'dark';
    }, () => bar.barStyle), ENUM_IGNORED);
    // 头文件里 iOS 13 起废弃的两个值不接
    for (const old of ['blackOpaque', 'blackTranslucent']) {
      assert('废弃的 barStyle ' + old + '：不抛、值不变', enumIgnored(() => {
        // @ts-expect-error 废弃的样式不接
        bar.barStyle = old;
      }, () => bar.barStyle), ENUM_IGNORED);
    }
    assert('barStyle 给数字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 样式是字符串
      bar.barStyle = 1;
    }, () => bar.barStyle), ENUM_IGNORED);
    assert('被拒之后原值没动', bar.barStyle, 'default');

    bar.isTranslucent = false;
    assert('isTranslucent 写得进去', bar.isTranslucent, false);
    // 照 Web IDL 转布尔：非空字符串是 true，0 是 false
    // @ts-expect-error 类型上要布尔，运行时照 Web IDL 转
    bar.isTranslucent = 'false';
    assert("'false' 转成 true", bar.isTranslucent, true);
    // @ts-expect-error 同上
    bar.isTranslucent = 0;
    assert('0 转成 false', bar.isTranslucent, false);
  });

  group('工具条：颜色', () => {
    const bar = new UIToolbar();
    const initialTint = bar.tintColor;
    bar.barTintColor = '#ff0000';
    assert('barTintColor 写得进去，读回原来的写法', bar.barTintColor, '#ff0000');
    bar.barTintColor = 'systemIndigo';
    assert('barTintColor 写颜色名', bar.barTintColor, 'systemIndigo');
    // 颜色写错不抛：打一条警告，保留旧值（和 backgroundColor 同一个规矩）
    bar.barTintColor = 'no-such-color';
    assert('不认识的颜色：保留旧值', bar.barTintColor, 'systemIndigo');
    // @ts-expect-error 颜色是字符串
    bar.barTintColor = 5;
    assert('颜色给数字：保留旧值', bar.barTintColor, 'systemIndigo');
    bar.barTintColor = null;
    assert('barTintColor 写 null：清掉', bar.barTintColor, null);

    bar.tintColor = 'systemGreen';
    assert('tintColor 写得进去', bar.tintColor, 'systemGreen');
    bar.tintColor = null;
    assert('tintColor 写 null：退回原来的颜色', bar.tintColor, initialTint);
  });

  // =====================================================================
  console.log('--- UISearchBar ---');

  group('搜索框：默认值', () => {
    const bar = new UISearchBar();
    assert('是 UIView 的子类', bar instanceof UIView, true);
    assert('不是控件', bar instanceof UIControl, false);
    assert('默认 text 是空串', bar.text, '');
    assert('默认没有 placeholder', bar.placeholder, null);
    assert('默认没有 prompt', bar.prompt, null);
    assert('默认 barStyle', bar.barStyle, 'default');
    assert('默认 searchBarStyle', bar.searchBarStyle, 'default');
    assert('默认半透明', bar.isTranslucent, true);
    assert('默认不显示取消按钮', bar.showsCancelButton, false);
    assert('默认不显示书签按钮', bar.showsBookmarkButton, false);
    assert('默认不显示结果列表按钮', bar.showsSearchResultsButton, false);
    assert('结果列表按钮默认没选中', bar.isSearchResultsButtonSelected, false);
    assert('默认没有范围按钮：空数组',
           Array.isArray(bar.scopeButtonTitles) && bar.scopeButtonTitles.length === 0, true);
    assert('默认选中的范围是 0', bar.selectedScopeButtonIndex, 0);
    assert('默认不显示范围条', bar.showsScopeBar, false);
    assert('默认可用', bar.isEnabled, true);
    assert('默认没有 barTintColor', bar.barTintColor, null);
    assert('tintColor 读出来永远有值', typeof bar.tintColor, 'string');
    assert('默认没有 inputAccessoryView', bar.inputAccessoryView, null);
    assert('不在窗口里：不是 first responder', bar.isFirstResponder, false);
    assert('默认 frame 是 0×0', sizeText(bar.frame.size), '0×0');
    assert('自己想要的大小：宽不定，高 64', sizeText(bar.intrinsicContentSize), '-1×64');
    assert('sizeThatFits 给宽 390：390×64',
           sizeText(bar.sizeThatFits(new CGSize(390, 0))), '390×64');
    bar.frame = new CGRect(0, 0, 390, 20);
    bar.sizeToFit();
    assert('sizeToFit 之后高是 64，宽不动', sizeText(bar.frame.size), '390×64');
  });

  group('搜索框：text / placeholder / prompt', () => {
    const bar = new UISearchBar();
    bar.text = 'hello';
    assert('text 写得进去', bar.text, 'hello');
    // 照 Web IDL 转字符串
    // @ts-expect-error 类型上要字符串
    bar.text = 5;
    assert('text 给数字：转成字符串', bar.text, '5');
    // @ts-expect-error text 不可空，null 给空串
    bar.text = null;
    assert('text 写 null：空串', bar.text, '');
    // @ts-expect-error 同上
    bar.text = undefined;
    assert('text 写 undefined：空串', bar.text, '');

    // 实测：UIKit 把 null 和空串当成同一个值（「没有 placeholder」）。当前已经
    // 没有的时候，再写另一种不会变——所以清掉之后读回来是 null 还是空串，
    // 看的是清掉它的那一次写的是哪一种
    bar.placeholder = '';
    assert('没设过时写空串：还是 null', bar.placeholder, null);
    bar.placeholder = 'Search';
    assert('placeholder 写得进去', bar.placeholder, 'Search');
    bar.placeholder = null;
    assert('写 null 清掉：读回 null', bar.placeholder, null);
    bar.placeholder = '';
    assert('已经是 null 时写空串：还是 null', bar.placeholder, null);
    bar.placeholder = 'again';
    bar.placeholder = '';
    assert('写空串清掉：读回空串', bar.placeholder, '');
    bar.placeholder = null;
    assert('已经是空串时写 null：还是空串', bar.placeholder, '');
    // @ts-expect-error 类型上要字符串
    bar.placeholder = 7;
    assert('placeholder 给数字：转成字符串', bar.placeholder, '7');

    bar.prompt = 'Pick a city';
    assert('prompt 写得进去', bar.prompt, 'Pick a city');
    // 有 prompt 的搜索框更高：上面多一行字
    assert('有 prompt 时自己想要的高是 98', bar.intrinsicContentSize.height, 98);
    // 实测：prompt 的空串不变成 null，但高度回去了
    bar.prompt = '';
    assert('prompt 写空串：读回空串', bar.prompt, '');
    assert('prompt 是空串时高回到 64', bar.intrinsicContentSize.height, 64);
    bar.prompt = null;
    assert('prompt 写 null', bar.prompt, null);
  });

  group('搜索框：searchTextField', () => {
    const bar = new UISearchBar();
    const field = bar.searchTextField;
    assert('searchTextField 是 UITextField', field instanceof UITextField, true);
    assert('读两次是同一个包装', bar.searchTextField === field, true);
    try {
      // @ts-expect-error searchTextField 只读
      bar.searchTextField = new UITextField();
      console.log('  ✗ searchTextField 只读 = 居然能写（期望抛 TypeError）');
    } catch (err) {
      assert('searchTextField 只读', err instanceof TypeError, true);
    }
    // 它就是搜索框里那个输入框：两边的 text 和 placeholder 是同一份
    bar.text = 'from bar';
    assert('bar.text 写的，输入框读得到', field.text, 'from bar');
    field.text = 'from field';
    assert('输入框写的，bar.text 读得到', bar.text, 'from field');
    bar.placeholder = 'City';
    assert('placeholder 也是同一份', field.placeholder, 'City');
    // 实测的默认值：键盘的回车键是「搜索」，没有内容时它是灰的；
    // 清空按钮一直显示
    assert('回车键默认是 search', field.returnKeyType, 'search');
    assert('没有内容时回车键是灰的', field.enablesReturnKeyAutomatically, true);
    assert('清空按钮一直显示', field.clearButtonMode, 'always');
    // 键盘的设置在它上面也写得进去。搜索框自己也有这九个属性，两边是同一份
    // （见下面「键盘设置」那几组）
    field.keyboardType = 'emailAddress';
    field.returnKeyType = 'go';
    assert('键盘类型写在输入框上', field.keyboardType, 'emailAddress');
    assert('回车键写在输入框上', field.returnKeyType, 'go');
  });

  group('搜索框：范围按钮', () => {
    const bar = new UISearchBar();
    bar.scopeButtonTitles = ['All', 'Mine', 'Shared'];
    assert('scopeButtonTitles 写得进去', bar.scopeButtonTitles.join(','), 'All,Mine,Shared');
    assert('每次读是一个新数组', bar.scopeButtonTitles !== bar.scopeButtonTitles, true);
    assert('写了标题，选中的还是 0', bar.selectedScopeButtonIndex, 0);
    // 实测：标题写了，范围条不会自己显示，高度不变
    assert('写了标题不会自己显示范围条', bar.showsScopeBar, false);
    assert('没显示范围条时高还是 64', bar.intrinsicContentSize.height, 64);

    bar.selectedScopeButtonIndex = 2;
    assert('selectedScopeButtonIndex 写得进去', bar.selectedScopeButtonIndex, 2);
    // @ts-expect-error 类型上要数，运行时照 Web IDL 转
    bar.selectedScopeButtonIndex = '1';
    assert("'1' 转成 1", bar.selectedScopeButtonIndex, 1);
    bar.selectedScopeButtonIndex = 1.7;
    assert('1.7 向零取整成 1', bar.selectedScopeButtonIndex, 1);
    throws('selectedScopeButtonIndex 给 NaN 被拒', () => {
      bar.selectedScopeButtonIndex = NaN;
    }, 'selectedScopeButtonIndex');
    throws('selectedScopeButtonIndex 给 undefined 被拒', () => {
      // @ts-expect-error 要一个数
      bar.selectedScopeButtonIndex = undefined;
    }, 'selectedScopeButtonIndex');
    assert('被拒之后原值没动', bar.selectedScopeButtonIndex, 1);
    // 实测：超出范围的值 UIKit 照样存下来，读回来就是它
    bar.selectedScopeButtonIndex = 7;
    assert('超出范围的 7：存下来了', bar.selectedScopeButtonIndex, 7);
    bar.selectedScopeButtonIndex = -1;
    assert('-1：存下来了', bar.selectedScopeButtonIndex, -1);
    bar.selectedScopeButtonIndex = 1;

    bar.showsScopeBar = true;
    assert('showsScopeBar 写得进去', bar.showsScopeBar, true);
    assert('显示范围条时自己想要的高是 111', bar.intrinsicContentSize.height, 111);
    assert('setShowsScopeBar 没有返回值',
           bar.setShowsScopeBar(false, { animated: true }), undefined);
    assert('setShowsScopeBar 带动画：属性当场就是新值', bar.showsScopeBar, false);
    bar.setShowsScopeBar(true);
    assert('setShowsScopeBar 不带 options', bar.showsScopeBar, true);
    bar.showsScopeBar = false;

    // 实测：换一组标题，选中的下标留着；只剩一个标题时变成 0；清空时变成 -1
    bar.scopeButtonTitles = ['X', 'Y'];
    assert('换成两个标题：选中的还是 1', bar.selectedScopeButtonIndex, 1);
    bar.scopeButtonTitles = ['Only'];
    assert('只剩一个标题：选中的变成 0', bar.selectedScopeButtonIndex, 0);
    bar.scopeButtonTitles = [];
    assert('写空数组：没有标题', bar.scopeButtonTitles.length, 0);
    assert('清空标题之后选中的是 -1', bar.selectedScopeButtonIndex, -1);
    bar.scopeButtonTitles = ['A', 'B'];
    bar.scopeButtonTitles = null;
    assert('写 null：没有标题', bar.scopeButtonTitles.length, 0);
    // 没有标题时显示范围条：属性是 true，但高度不变（没有东西可显示）
    bar.showsScopeBar = true;
    assert('没有标题时 showsScopeBar 也写得进去', bar.showsScopeBar, true);
    assert('没有标题时显示范围条：高还是 64', bar.intrinsicContentSize.height, 64);

    // 元素照 Web IDL 转字符串
    // @ts-expect-error 类型上要字符串数组
    bar.scopeButtonTitles = [1, 'two', null];
    assert('标题里的数字和 null 转成字符串', JSON.stringify(bar.scopeButtonTitles),
           '["1","two",""]');
    // @ts-expect-error 类型上要数组，运行时任何可迭代的对象都收
    bar.scopeButtonTitles = new Set(['p', 'q']);
    assert('接受可迭代对象', bar.scopeButtonTitles.join(','), 'p,q');
    throws('scopeButtonTitles 给数字被拒', () => {
      // @ts-expect-error 要一个数组
      bar.scopeButtonTitles = 5;
    }, 'scopeButtonTitles');
    throws('scopeButtonTitles 给字符串被拒', () => {
      // @ts-expect-error 要一个数组，不是一个字符串
      bar.scopeButtonTitles = 'All';
    }, 'scopeButtonTitles');
    assert('被拒之后原值没动', bar.scopeButtonTitles.join(','), 'p,q');
  });

  group('搜索框：按钮', () => {
    const bar = new UISearchBar();
    bar.showsCancelButton = true;
    assert('showsCancelButton 写得进去', bar.showsCancelButton, true);
    assert('setShowsCancelButton 没有返回值',
           bar.setShowsCancelButton(false, { animated: true }), undefined);
    assert('setShowsCancelButton 带动画：属性当场就是新值', bar.showsCancelButton, false);
    bar.setShowsCancelButton(true);
    assert('setShowsCancelButton 不带 options', bar.showsCancelButton, true);
    // @ts-expect-error 类型上要布尔，运行时照 Web IDL 转
    bar.setShowsCancelButton(0, { animated: 'yes' });
    assert('setShowsCancelButton(0)：转成 false', bar.showsCancelButton, false);

    bar.showsBookmarkButton = true;
    assert('showsBookmarkButton 写得进去', bar.showsBookmarkButton, true);
    bar.showsSearchResultsButton = true;
    assert('showsSearchResultsButton 写得进去', bar.showsSearchResultsButton, true);
    // 实测：两个按钮的开关互不影响（它们占同一个位置，画哪个是 UIKit 的事）
    assert('开结果列表按钮不会关掉书签按钮', bar.showsBookmarkButton, true);
    bar.isSearchResultsButtonSelected = true;
    assert('isSearchResultsButtonSelected 写得进去', bar.isSearchResultsButtonSelected, true);
    bar.showsSearchResultsButton = false;
    // 实测：关掉按钮，选中状态留着
    assert('关掉结果列表按钮，选中状态还在', bar.isSearchResultsButtonSelected, true);
    bar.showsBookmarkButton = false;
    assert('书签按钮关得掉', bar.showsBookmarkButton, false);
  });

  group('搜索框：样式和可用', () => {
    const bar = new UISearchBar();
    bar.searchBarStyle = 'minimal';
    assert('searchBarStyle 写得进去', bar.searchBarStyle, 'minimal');
    bar.searchBarStyle = 'prominent';
    assert('prominent', bar.searchBarStyle, 'prominent');
    assert('不认识的 searchBarStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      bar.searchBarStyle = 'compact';
    }, () => bar.searchBarStyle), ENUM_IGNORED);
    assert('searchBarStyle 给数字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 样式是字符串
      bar.searchBarStyle = 2;
    }, () => bar.searchBarStyle), ENUM_IGNORED);
    assert('被拒之后原值没动', bar.searchBarStyle, 'prominent');

    bar.barStyle = 'black';
    assert('barStyle 写得进去', bar.barStyle, 'black');
    assert('不认识的 barStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      bar.barStyle = 'blackTranslucent';
    }, () => bar.barStyle), ENUM_IGNORED);
    bar.isTranslucent = false;
    assert('isTranslucent 写得进去', bar.isTranslucent, false);

    bar.isEnabled = false;
    assert('isEnabled 写得进去', bar.isEnabled, false);
    // 实测：禁用之后，搜索框自己不收触摸，里面的输入框也跟着禁用
    assert('禁用之后不收触摸', bar.isUserInteractionEnabled, false);
    assert('里面的输入框跟着禁用', bar.searchTextField.isEnabled, false);
    bar.isEnabled = true;
    assert('恢复之后收触摸', bar.isUserInteractionEnabled, true);
    assert('里面的输入框跟着恢复', bar.searchTextField.isEnabled, true);
  });

  group('搜索框：颜色', () => {
    const bar = new UISearchBar();
    const initialTint = bar.tintColor;
    bar.barTintColor = 'rgb(10, 20, 30)';
    assert('barTintColor 写得进去，读回原来的写法', bar.barTintColor, 'rgb(10, 20, 30)');
    bar.barTintColor = 'not-a-color';
    assert('不认识的颜色：保留旧值', bar.barTintColor, 'rgb(10, 20, 30)');
    bar.barTintColor = null;
    assert('barTintColor 写 null：清掉', bar.barTintColor, null);
    bar.tintColor = 'systemOrange';
    assert('tintColor 写得进去', bar.tintColor, 'systemOrange');
    bar.tintColor = null;
    assert('tintColor 写 null：退回原来的颜色', bar.tintColor, initialTint);
  });

  group('搜索框：inputAccessoryView', () => {
    const bar = new UISearchBar();
    // 键盘上方那一条。最常见的就是放一个工具条
    const accessory = new UIToolbar();
    accessory.items = [UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('done')];
    bar.inputAccessoryView = accessory;
    assert('inputAccessoryView 写得进去，读回原来的包装', bar.inputAccessoryView === accessory, true);
    throws('inputAccessoryView 给颜色对象被拒', () => {
      // @ts-expect-error 要一个视图
      bar.inputAccessoryView = UIColor.redColor;
    }, 'inputAccessoryView');
    throws('inputAccessoryView 给数字被拒', () => {
      // @ts-expect-error 要一个视图
      bar.inputAccessoryView = 5;
    }, 'inputAccessoryView');
    assert('被拒之后原值没动', bar.inputAccessoryView === accessory, true);
    bar.inputAccessoryView = null;
    assert('写 null：清掉', bar.inputAccessoryView, null);
  });

  // =====================================================================
  // 键盘设置：和多行输入框上的是同一组九个属性，名字、取值、可空与否、写错
  // 时的行为都一样。搜索框和它里面的输入框用的是同一份设置（见文件开头），
  // 所以每个属性都两边各读一次
  /** @type {string[]} */
  const keyboardProps = ['keyboardType', 'returnKeyType', 'keyboardAppearance',
                         'enablesReturnKeyAutomatically', 'isSecureTextEntry',
                         'autocapitalizationType', 'autocorrectionType',
                         'spellCheckingType', 'textContentType'];

  group('搜索框：键盘设置的默认值', () => {
    const bar = new UISearchBar();
    /** @type {any} */
    const anyBar = bar;
    /** @type {any} */
    const anyField = bar.searchTextField;
    for (const key of keyboardProps) {
      assert('搜索框上有 ' + key, key in bar, true);
    }
    // 这三个在模拟器上量过（当时是从 searchTextField 上读的），和新建的
    // UITextField / UITextView 不一样
    assert('搜索框默认的回车键是 search', bar.returnKeyType, 'search');
    assert('搜索框默认没有内容时回车键是灰的', bar.enablesReturnKeyAutomatically, true);
    assert('搜索框默认不自动纠错', bar.autocorrectionType, 'no');
    // 其余六个最初只在 Mac Catalyst 上量过，所以先是打印出来不断言。合并验收时
    // 在 iPhone Air 模拟器（iOS 27.2）和真机（iPhone 14）上看到的都和当时的假设
    // 一样，改成了断言
    for (const [key, expected] of /** @type {[string, unknown][]} */ ([
      ['keyboardType', 'default'], ['keyboardAppearance', 'default'],
      ['isSecureTextEntry', false], ['autocapitalizationType', 'sentences'],
      ['spellCheckingType', 'default'], ['textContentType', null],
    ])) {
      assert('搜索框默认的 ' + key, anyBar[key], expected);
    }
    // 不管默认值是什么，两边读到的是同一份
    for (const key of keyboardProps) {
      assert('搜索框默认的 ' + key + ' 和 searchTextField 上的一样',
             anyBar[key], anyField[key]);
    }
  });

  group('搜索框：键盘设置的读写', () => {
    const bar = new UISearchBar();
    const field = bar.searchTextField;
    bar.keyboardType = 'emailAddress';
    assert('搜索框 keyboardType 写得进去', bar.keyboardType, 'emailAddress');
    assert('搜索框写的 keyboardType，输入框读得到', field.keyboardType, 'emailAddress');
    bar.returnKeyType = 'go';
    assert('搜索框 returnKeyType 写得进去', bar.returnKeyType, 'go');
    assert('搜索框写的 returnKeyType，输入框读得到', field.returnKeyType, 'go');
    bar.keyboardAppearance = 'light';
    assert('搜索框 keyboardAppearance 写得进去', bar.keyboardAppearance, 'light');
    assert('搜索框写的 keyboardAppearance，输入框读得到', field.keyboardAppearance, 'light');
    // 头文件里 Alert = Dark，一个数值两个名字：两个都写得进去，读出来是主名。
    // （这两条只在搜索框上读：UITextField 那一侧把这个数值读成哪个名字是它
    // 自己的事）
    bar.keyboardAppearance = 'dark';
    assert('搜索框 keyboardAppearance = dark 读回来是 dark', bar.keyboardAppearance, 'dark');
    bar.keyboardAppearance = 'alert';
    assert('搜索框上 alert 是 dark 的别名，读回来是 dark', bar.keyboardAppearance, 'dark');
    bar.keyboardAppearance = 'default';
    assert('搜索框 keyboardAppearance 换回 default', bar.keyboardAppearance, 'default');
    // 搜索框上它默认是 true，所以先写 false
    bar.enablesReturnKeyAutomatically = false;
    assert('搜索框 enablesReturnKeyAutomatically 写得进去',
           bar.enablesReturnKeyAutomatically, false);
    assert('搜索框写的 enablesReturnKeyAutomatically，输入框读得到',
           field.enablesReturnKeyAutomatically, false);
    bar.enablesReturnKeyAutomatically = true;
    assert('搜索框 enablesReturnKeyAutomatically 写回 true',
           bar.enablesReturnKeyAutomatically, true);
    bar.isSecureTextEntry = true;
    assert('搜索框 isSecureTextEntry 写得进去', bar.isSecureTextEntry, true);
    assert('搜索框写的 isSecureTextEntry，输入框读得到', field.isSecureTextEntry, true);
    bar.isSecureTextEntry = false;
    assert('搜索框 isSecureTextEntry 写回 false', bar.isSecureTextEntry, false);
    bar.autocapitalizationType = 'words';
    assert('搜索框 autocapitalizationType 写得进去', bar.autocapitalizationType, 'words');
    assert('搜索框写的 autocapitalizationType，输入框读得到',
           field.autocapitalizationType, 'words');
    bar.autocorrectionType = 'yes';
    assert('搜索框 autocorrectionType 写得进去', bar.autocorrectionType, 'yes');
    assert('搜索框写的 autocorrectionType，输入框读得到', field.autocorrectionType, 'yes');
    bar.spellCheckingType = 'no';
    assert('搜索框 spellCheckingType 写得进去', bar.spellCheckingType, 'no');
    assert('搜索框写的 spellCheckingType，输入框读得到', field.spellCheckingType, 'no');
    bar.textContentType = 'username';
    assert('搜索框 textContentType 写得进去', bar.textContentType, 'username');
    assert('搜索框写的 textContentType，输入框读得到', field.textContentType, 'username');
    bar.textContentType = null;
    assert('搜索框 textContentType 写 null：清掉', bar.textContentType, null);
    assert('搜索框清掉 textContentType，输入框上也没了', field.textContentType, null);

    // 反过来：写在输入框上的，搜索框读得到
    field.keyboardType = 'url';
    assert('输入框写的 keyboardType，搜索框读得到', bar.keyboardType, 'url');
    field.returnKeyType = 'search';
    assert('输入框写的 returnKeyType，搜索框读得到', bar.returnKeyType, 'search');
    field.autocapitalizationType = 'none';
    assert('输入框写的 autocapitalizationType，搜索框读得到',
           bar.autocapitalizationType, 'none');
    field.textContentType = 'emailAddress';
    assert('输入框写的 textContentType，搜索框读得到', bar.textContentType, 'emailAddress');

    // 布尔照 Web IDL 转：非空字符串是 true，0 和 null 是 false
    // @ts-expect-error 类型上要布尔，运行时照 Web IDL 转
    bar.isSecureTextEntry = 'false';
    assert("搜索框 isSecureTextEntry：'false' 转成 true", bar.isSecureTextEntry, true);
    // @ts-expect-error 同上
    bar.isSecureTextEntry = 0;
    assert('搜索框 isSecureTextEntry：0 转成 false', bar.isSecureTextEntry, false);
    // @ts-expect-error 同上
    bar.enablesReturnKeyAutomatically = null;
    assert('搜索框 enablesReturnKeyAutomatically：null 转成 false',
           bar.enablesReturnKeyAutomatically, false);
    // @ts-expect-error 同上
    bar.enablesReturnKeyAutomatically = 1;
    assert('搜索框 enablesReturnKeyAutomatically：1 转成 true',
           bar.enablesReturnKeyAutomatically, true);
  });

  group('搜索框：键盘设置写错', () => {
    const bar = new UISearchBar();
    /** @type {any} */
    const anyBar = bar;
    const field = bar.searchTextField;
    // 先都换到不是默认值的取值：这样「值不变」验的是写错之前的值
    bar.keyboardType = 'numberPad';
    bar.returnKeyType = 'done';
    bar.keyboardAppearance = 'light';
    bar.autocapitalizationType = 'allCharacters';
    bar.autocorrectionType = 'yes';
    bar.spellCheckingType = 'yes';
    bar.textContentType = 'oneTimeCode';
    for (const [key, bad] of /** @type {[string, unknown][]} */ ([
      ['keyboardType', 'numeric'], ['returnKeyType', 'enter'],
      ['keyboardAppearance', 'black'], ['autocapitalizationType', 'all'],
      ['autocorrectionType', 'off'], ['spellCheckingType', 'off'],
      ['textContentType', 'passwd'],
      // 不是字符串的也一样：不抛、值不变
      ['keyboardType', 4], ['returnKeyType', true], ['textContentType', 7],
      // 可空的只有 textContentType；别的写 null 是「不认识的值」
      ['keyboardType', null], ['autocorrectionType', null],
    ])) {
      assert('搜索框 ' + key + ' 写 ' + JSON.stringify(bad) + '：不抛、值不变',
             enumIgnored(() => { anyBar[key] = bad; }, () => anyBar[key]), ENUM_IGNORED);
    }
    assert('搜索框键盘设置写错之后原值没被动过',
           [bar.keyboardType, bar.returnKeyType, bar.keyboardAppearance,
            bar.autocapitalizationType, bar.autocorrectionType, bar.spellCheckingType,
            bar.textContentType].join(','),
           'numberPad,done,light,allCharacters,yes,yes,oneTimeCode');
    assert('搜索框键盘设置写错之后输入框上的值也没动',
           [field.keyboardType, field.returnKeyType, field.autocapitalizationType,
            field.textContentType].join(','),
           'numberPad,done,allCharacters,oneTimeCode');
  });

  // =====================================================================
  // 事件。搜索框的委托回调是它里面的控件转出来的，所以对 searchTextField
  // 主动发控件事件就能触发，不用弹键盘（探针里量的，见文件开头）。
  // 事件延后一轮派发，所以下面全是「等到了再断言」
  console.log('--- UISearchBar：事件 ---');
  /** @type {UISearchBarEventType[]} */
  const eventNames = ['focus', 'blur', 'input', 'search',
                      'cancel', 'bookmarkclick',
                      'resultslistclick', 'scopechange'];

  group('搜索框：事件名', () => {
    const bar = new UISearchBar();
    const noop = () => {};
    for (const type of eventNames) {
      bar.addEventListener(type, noop);
      bar.removeEventListener(type, noop);
    }
    assert('八个事件名都订得上、退得掉', true, true);
    bar.addEventListener('traitchange', noop);
    bar.removeEventListener('traitchange', noop);
    assert('traitchange 是继承来的，照常订得上', true, true);
    assert('不认识的事件名当自定义事件', customEventWorks(bar, 'not-a-real-event'), '收到一次');
    // 三个输入控件用同一套名字：focus / blur / input。改名之前搜索框上叫
    // editingbegin / editingend / textchange，旧名字不保留
    for (const old of ['editing' + 'begin', 'editing' + 'end', 'text' + 'change']) {
      assert('搜索框：旧的事件名 ' + old + ' 当自定义事件', customEventWorks(bar, old), '收到一次');
    }
    assert('控件的事件名在搜索框上当自定义事件（它不是控件）', customEventWorks(bar, 'touchupinside'), '收到一次');
    assert('大小写不一样就是另一个名字，当自定义事件', customEventWorks(bar, 'INPUT'), '收到一次');
    // 被拒的名字没有留在监听器表里：再订一次同样被拒
    assert('同一个不认识的名字再来一遍，还是当自定义事件', customEventWorks(bar, 'not-a-real-event'), '收到一次');
  });

  group('搜索框：用代码触发的四个事件', () => {
    const bar = new UISearchBar();
    const field = bar.searchTextField;
    /** @type {string[]} */
    const log = [];
    /** @type {Event[]} */
    const events = [];
    for (const type of eventNames) {
      bar.addEventListener(type, (e) => { log.push(type); events.push(e); });
    }
    // 用代码改 text 和 selectedScopeButtonIndex 不通知（实测委托不被调）
    bar.text = 'typed by code';
    bar.scopeButtonTitles = ['A', 'B'];
    bar.selectedScopeButtonIndex = 1;

    field.sendActionsForControlEvents(['focus']);
    field.sendActionsForControlEvents(['input']);
    field.sendActionsForControlEvents(['return']);
    field.sendActionsForControlEvents(['blur']);
    assert('事件延后一轮派发：发完当场还没收到', log.length, 0);

    waitUntil('搜索框：四个事件到齐', () => log.length >= 4, () => {
      assert('收到的事件和顺序', log.join(' → '),
             'focus → input → search → blur');
      assert('用代码改 text 和选中的范围没有派发事件', log.length, 4);
      assert('事件的 type', events[1].type, 'input');
      assert('事件的 target 是搜索框', events.every((e) => e.target === bar), true);
      assert('事件不可取消', events[0].cancelable, false);
      // 文字不带在事件上：收到事件时读 bar.text
      assert('input 不带文字，回头读 text', 'text' in events[1], false);
      assert('收到 input 时读得到 text', bar.text, 'typed by code');

      // 退订之后不再收到。用后一个事件当「已经派发到这里了」的标记
      const before = log.length;
      const stop = () => {};
      bar.addEventListener('input', stop);   // 多一个监听器，退掉它不该影响别人
      bar.removeEventListener('input', stop);
      /** @type {string[]} */
      const second = [];
      const onBegin = () => second.push('focus');
      const onChange = () => second.push('input');
      bar.addEventListener('focus', onBegin);
      bar.addEventListener('input', onChange);
      bar.removeEventListener('input', onChange);
      field.sendActionsForControlEvents(['input']);
      field.sendActionsForControlEvents(['focus']);
      waitUntil('搜索框：退订之后', () => second.length >= 1, () => {
        assert('退掉的那个监听器没再收到', second.join(','), 'focus');
        assert('没退的监听器照常收到', log.length, before + 2);
        console.log('  ! scopechange / cancel / bookmarkclick / ' +
                    'resultslistclick 用代码触发不了（按钮在私有的子视图上），' +
                    '未验证，要在屏幕上那个搜索框上真实点');
        console.log('--- UISearchBar：用代码触发的事件跑完 ---');
      });
    });
  });

  // =====================================================================
  // 所有权：工具条持有它的项，搜索框持有键盘上方那个视图和里面的输入框。
  // JS 这边丢掉引用之后，包装不能被回收——读回来要还是原来那个，挂在上面
  // 的 JS 状态要还在。这里**不自己逼 GC**（别的步骤在逼，再加一份压力会
  // 挤到它们），只放一个没人持有的对照组：它被回收了，说明完整的 GC 跑过
  group('持有边', () => {
    const keptToolbar = new UIToolbar();
    const keptToolbarViaMethod = new UIToolbar();
    const keptSearchBar = new UISearchBar();
    let controlCollected = false;
    const registry = new FinalizationRegistry(() => { controlCollected = true; });
    (() => {
      const viaProperty = new UIBarButtonItem({ title: 'P' });
      /** @type {any} */ (viaProperty).probe = '挂在项的包装上（items 写入）';
      keptToolbar.items = [viaProperty];
      const viaMethod = new UIBarButtonItem({ title: 'M' });
      /** @type {any} */ (viaMethod).probe = '挂在项的包装上（setItems）';
      keptToolbarViaMethod.setItems([viaMethod], { animated: false });
      const accessory = new UIView();
      /** @type {any} */ (accessory).probe = '挂在视图的包装上（inputAccessoryView）';
      keptSearchBar.inputAccessoryView = accessory;
      /** @type {any} */ (keptSearchBar.searchTextField).probe = '挂在输入框的包装上';
      registry.register(new UIBarButtonItem({ title: 'control' }), 'control');
    })();
    let waited = 0;
    const check = () => {
      // registry 要有人拿着，不然回调永远不来
      if (registry === null) return;
      if (!controlCollected) {
        waited += 1;
        if (waited < 45) { setTimeout(check, 1000); return; }
        console.log('--- 工具条和搜索框：持有边 ---');
        console.log('  ! 对照组 45 秒里没被回收，GC 没跑到，这一组未验证');
        return;
      }
      console.log('--- 工具条和搜索框：持有边 ---');
      group('持有边（GC 之后）', () => {
        assert('对照组（没人持有的项）被回收了', controlCollected, true);
        assert('items 写进去的项：GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptToolbar.items[0]).probe, '挂在项的包装上（items 写入）');
        assert('setItems 给的项：GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptToolbarViaMethod.items[0]).probe,
               '挂在项的包装上（setItems）');
        assert('inputAccessoryView：GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptSearchBar.inputAccessoryView).probe,
               '挂在视图的包装上（inputAccessoryView）');
        assert('searchTextField：GC 后读回来还是原来那个包装',
               /** @type {any} */ (keptSearchBar.searchTextField).probe, '挂在输入框的包装上');
      });
      console.log('--- 工具条和搜索框：持有边跑完 ---');
    };
    setTimeout(check, 8000);
  });

  // =====================================================================
  // 屏幕上：上面一条工具条（三个项），下面一个搜索框（带取消、书签和三个
  // 范围按钮）。样子只能用眼睛看；这里保证它们建出来了、排进去了
  console.log('--- 工具条和搜索框：屏幕上 ---');
  group('屏幕上', () => {
    const toolbar = new UIToolbar();
    toolbar.translatesAutoresizingMaskIntoConstraints = false;
    const add = UIBarButtonItem.systemItem('add');
    const share = new UIBarButtonItem({ title: '分享' });
    const trash = UIBarButtonItem.systemItem('trash');
    toolbar.items = [add, UIBarButtonItem.flexibleSpace(), share,
                     UIBarButtonItem.flexibleSpace(), trash];
    host.addSubview(toolbar);

    const search = new UISearchBar();
    search.translatesAutoresizingMaskIntoConstraints = false;
    search.placeholder = '搜一下（点这里弹键盘）';
    search.showsCancelButton = true;
    search.showsBookmarkButton = true;
    search.scopeButtonTitles = ['全部', '我的', '共享'];
    search.showsScopeBar = true;
    host.addSubview(search);

    NSLayoutConstraint.activateConstraints([
      toolbar.topAnchor.constraintEqualToAnchor(host.topAnchor),
      toolbar.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor),
      toolbar.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor),
      search.topAnchor.constraintEqualToAnchor(toolbar.bottomAnchor, { constant: 8 }),
      search.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor),
      search.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor),
    ]);
    host.layoutIfNeeded();
    // 没给高度约束：高度来自它们自己想要的大小
    assert('工具条横向铺满区块', toolbar.frame.width, host.bounds.width);
    assert('工具条的高是它自己想要的高', toolbar.frame.height,
           toolbar.intrinsicContentSize.height);
    assert('搜索框横向铺满区块', search.frame.width, host.bounds.width);
    assert('搜索框的高是它自己想要的高', search.frame.height,
           search.intrinsicContentSize.height);
    assert('搜索框排在工具条下面 8', search.frame.y,
           toolbar.frame.y + toolbar.frame.height + 8);
    assert('工具条的父视图是区块', toolbar.superview === host, true);

    // 留给真实触摸：点一下打一行
    add.addEventListener('click', () => {
      console.log('  ✓ 真实触摸：工具条上的「加」');
    });
    share.addEventListener('click', () => {
      console.log('  ✓ 真实触摸：工具条上的「分享」');
    });
    trash.addEventListener('click', () => {
      // 带动画地去掉自己，再点一次「加」放回来
      toolbar.setItems(toolbar.items.filter((item) => item !== trash), { animated: true });
      console.log('  ✓ 真实触摸：工具条上的「删」，带动画去掉了自己，还剩',
                  toolbar.items.length, '项');
    });
    /** @type {boolean} */
    let probing = false;
    for (const type of eventNames) {
      search.addEventListener(type, () => {
        if (probing) return;   // 下面自动聚焦那一段自己记，不算真实触摸
        if (type === 'input') {
          console.log('  ✓ 真实触摸：搜索框 input，text =', JSON.stringify(search.text));
        } else if (type === 'scopechange') {
          console.log('  ✓ 真实触摸：搜索框 scopechange，选中第',
                      search.selectedScopeButtonIndex, '个范围');
        } else {
          console.log('  ✓ 真实触摸：搜索框 ' + type);
        }
        // 点键盘上的搜索、点取消：收起键盘（系统自己收不收没量过）
        if (type === 'search' || type === 'cancel') {
          search.resignFirstResponder();
        }
      });
    }
    console.log('  ✓ 屏幕上：一条工具条（加、分享、删），下面一个带范围按钮的搜索框');

    // ---- 真的聚焦一次 ----
    // 焦点是从 UIResponder 继承来的。拿到焦点之后**同一轮里就交还**，键盘
    // 不会留在屏幕上，也不会和底部输入框那一步抢。拿不拿得到取决于时机
    // （转场中途 UIKit 会拒绝），所以拿「这次成没成」当条件，到点没成报未验证
    /** @type {string[]} */
    const focusLog = [];
    search.addEventListener('focus', () => focusLog.push('focus'));
    search.addEventListener('blur', () => focusLog.push('blur'));
    setTimeout(() => {
      /** @type {boolean | undefined} */
      let resigned;
      let wasFirst = false;
      let fieldWasFirst = false;
      waitUntil('搜索框拿到 first responder', () => {
        probing = true;
        if (!search.becomeFirstResponder()) { probing = false; return false; }
        wasFirst = search.isFirstResponder;
        fieldWasFirst = search.searchTextField.isFirstResponder;
        resigned = search.resignFirstResponder();
        return true;
      }, () => {
        console.log('--- UISearchBar：聚焦 ---');
        // 实测（探针里放进一个 key window）：搜索框和里面的输入框都报自己是
        assert('becomeFirstResponder 之后搜索框是 first responder', wasFirst, true);
        assert('里面的输入框也是', fieldWasFirst, true);
        assert('resignFirstResponder 返回 true', resigned, true);
        assert('交还之后不再是 first responder', search.isFirstResponder, false);
        waitUntil('搜索框：聚焦的两个事件', () => focusLog.length >= 2, () => {
          probing = false;
          assert('真的聚焦和交还：先 focus 再 blur',
                 focusLog.slice(0, 2).join(' → '), 'focus → blur');
          console.log('--- UISearchBar：聚焦跑完 ---');
          focusDone();
        });
        // 事件没等到也要把开关关掉，不然真实触摸的日志一直被吞
        setTimeout(() => { probing = false; }, 7000);
      });
      // 没拿到焦点、或者事件没等到：waitUntil 自己报了未验证，这里到点放行
      setTimeout(focusDone, 15000);
    }, 1500);
  });
  return focusFinished;
}
