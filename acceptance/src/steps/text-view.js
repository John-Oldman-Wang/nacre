import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 多行输入：UITextView、它的 NSTextContainer，和表示选区的结构体 NSRange。
//
// 这里的期望值都是动手前用原生探针在 iPhone Air 模拟器（iOS 27.2）上量的。
// 探针分两种状态，下面哪条用的是哪种都写明了：
//   「不带窗口」  只建一个 UITextView，不放进任何窗口
//   「带窗口」    放进一个 UIWindow（探针里没有 UIApplication）
//
// 量到的几条和直觉不一样的：
//   - 代码写 text 不发「文字变了」的通知；insertText / deleteBackward 发，
//     连 insertText('') 也发
//   - isEditable 为 false 时 insertText / deleteBackward 照样改得动
//   - 关掉 isSelectable 会连带把 isEditable 关掉；打开 isEditable 会连带
//     把 isSelectable 打开
//   - selectedRange 越界不抛：位置超了停在末尾，长度超了变成 0
//   - 写 text 之后光标在末尾
//   - 关掉滚动之后它有固有大小；放进窗口、用约束定位时高度跟着文字走

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

// 等一个条件成立，每 100 ms 看一次。到点没等到时调 missed——由调用方决定
// 那算失败（事件是自己触发的，该来）还是未验证（取决于窗口什么时候落定）
/**
 * @param {() => boolean} ready
 * @param {() => void} then
 * @param {() => void} missed
 * @param {number} [limitMs]
 */
function waitUntil(ready, then, missed, limitMs = 6000) {
  const deadline = Date.now() + limitMs;
  const tick = () => {
    if (ready()) { then(); return; }
    if (Date.now() >= deadline) { missed(); return; }
    setTimeout(tick, 100);
  };
  setTimeout(tick, 0);
}

/** @param {NSRange} r */
const show = (r) => '(' + r.location + ', ' + r.length + ')';

/** @param {import("../main.js").StepContext} ctx */
export function stepTextView(ctx) {
  // 这一步要用焦点（同一时刻只有一个 first responder）：把那一段做完的时刻作为
  // Promise 返回，排在后面的步骤等它（见 main.js）。原来没交，后面的步骤拿到
  // 焦点之后被这里抢走过
  /** @type {() => void} */
  let focusDone = () => {};
  /** @type {Promise<void>} */
  const focusFinished = new Promise((resolve) => { focusDone = resolve; });
  const { assert } = ctx;
  const host = ctx.section('多行输入：UITextView（点上面那块打字；下面那块跟着内容长高）', 250);
  console.log('--- UITextView ---');

  // =====================================================================
  group('默认值', () => {
    const tv = new UITextView();
    assert('是 UIScrollView 的子类', tv instanceof UIScrollView, true);
    assert('也是 UIView', tv instanceof UIView, true);
    assert('不是控件', tv instanceof UIControl, false);
    assert('默认文字是空串不是 null', tv.text, '');
    assert('默认 hasText 为假', tv.hasText, false);
    assert('默认字体是 null', tv.font, null);
    assert('默认文字颜色是 label', tv.textColor, 'label');
    assert('默认对齐 natural', tv.textAlignment, 'natural');
    assert('默认内边距是上下各 8',
           String(tv.textContainerInset), 'UIEdgeInsets(8, 0, 8, 0)');
    assert('内边距读出来是 UIEdgeInsets', tv.textContainerInset instanceof UIEdgeInsets, true);
    assert('默认可编辑', tv.isEditable, true);
    assert('默认可选中', tv.isSelectable, true);
    assert('默认可滚动（继承来的）', tv.isScrollEnabled, true);
    assert('默认选区 (0, 0)', show(tv.selectedRange), '(0, 0)');
    assert('选区读出来是 NSRange', tv.selectedRange instanceof NSRange, true);
    assert('默认底色 systemBackground', tv.backgroundColor, 'systemBackground');
    assert('默认 frame 宽 0', tv.frame.width, 0);
    assert('默认 frame 高 0', tv.frame.height, 0);
    assert('还没上屏时不是 first responder', tv.isFirstResponder, false);
    // 键盘那一组
    assert('默认键盘', tv.keyboardType, 'default');
    assert('默认回车键', tv.returnKeyType, 'default');
    assert('默认键盘外观', tv.keyboardAppearance, 'default');
    assert('默认回车键不自动变灰', tv.enablesReturnKeyAutomatically, false);
    assert('默认不遮点', tv.isSecureTextEntry, false);
    assert('默认句首大写', tv.autocapitalizationType, 'sentences');
    assert('默认自动纠错', tv.autocorrectionType, 'default');
    assert('默认拼写检查', tv.spellCheckingType, 'default');
    assert('默认没配内容类型', tv.textContentType, null);
    assert('默认拖动时不收键盘', tv.keyboardDismissMode, 'none');
  });

  // =====================================================================
  group('内容：text / hasText', () => {
    const tv = new UITextView();
    tv.text = '第一行\n第二行';
    assert('文字写得进去，换行留着', tv.text, '第一行\n第二行');
    assert('有内容时 hasText 为真', tv.hasText, true);
    // 量到的：写 text 之后光标在末尾
    assert('写 text 之后光标在末尾', show(tv.selectedRange), '(7, 0)');
    // 不可空的字符串：null 和 undefined 给空串（project.md 原则 13）
    // @ts-expect-error 类型上是 string
    tv.text = null;
    assert('写 null 得到空串', tv.text, '');
    tv.text = 'x';
    // @ts-expect-error 类型上是 string
    tv.text = undefined;
    assert('写 undefined 得到空串', tv.text, '');
    assert('清空之后 hasText 为假', tv.hasText, false);
    // @ts-expect-error 类型上是 string
    tv.text = 5;
    assert('写数字按 String() 转', tv.text, '5');
    throws('hasText 只读',
           // @ts-expect-error 只读
           () => { tv.hasText = true; }, 'hasText');
  });

  group('内容：insertText / deleteBackward', () => {
    const tv = new UITextView();
    tv.text = 'hello';
    tv.insertText(' world');
    assert('insertText 插在光标处（写 text 之后光标在末尾）', tv.text, 'hello world');
    assert('插完光标在插入的内容后面', show(tv.selectedRange), '(11, 0)');
    tv.selectedRange = new NSRange(0, 0);
    tv.insertText('>');
    assert('光标挪到开头再插', tv.text, '>hello world');
    tv.deleteBackward();
    assert('deleteBackward 删光标前面那一个', tv.text, 'hello world');
    tv.deleteBackward();
    assert('光标在开头时 deleteBackward 什么都不删', tv.text, 'hello world');
    tv.selectedRange = new NSRange(0, 5);
    tv.insertText('HEY');
    assert('有选区时 insertText 换掉选中的', tv.text, 'HEY world');
    assert('换完选区收成光标', show(tv.selectedRange), '(3, 0)');
    tv.selectedRange = new NSRange(1, 2);
    tv.deleteBackward();
    assert('有选区时 deleteBackward 删掉选中的', tv.text, 'H world');
    // @ts-expect-error 类型上是 string
    tv.insertText(7);
    assert('insertText 的参数按 String() 转', tv.text, 'H7 world');
    // @ts-expect-error 类型上是 string
    tv.insertText(null);
    assert('insertText(null) 插的是空串', tv.text, 'H7 world');
  });

  // =====================================================================
  group('外观：font / textColor / textAlignment / textContainerInset', () => {
    const tv = new UITextView();
    const font = UIFont.systemFontOfSize(17);
    tv.font = font;
    assert('字体写得进去，读回来是同一个对象', tv.font === font, true);
    tv.font = null;
    assert('字体能写回 null', tv.font, null);
    throws('字体给字符串被拒',
           // @ts-expect-error 要的是 UIFont
           () => { tv.font = 'Helvetica'; }, 'font');
    throws('字体给别的原生对象被拒',
           // @ts-expect-error 要的是 UIFont
           () => { tv.font = UIColor.redColor; }, 'UIFont');
    assert('写错之后字体没被动过', tv.font, null);

    tv.textColor = '#333333';
    assert('文字颜色是字符串，原样读回来', tv.textColor, '#333333');
    // 颜色的规矩：不认识的串打一条警告，保留旧值，不抛
    tv.textColor = 'no-such-color';
    assert('不认识的颜色串不改旧值', tv.textColor, '#333333');
    tv.textColor = null;
    assert('文字颜色能写成 null', tv.textColor, null);

    tv.textAlignment = 'center';
    assert('对齐写得进去', tv.textAlignment, 'center');
    assert('对齐写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个值
      tv.textAlignment = 'middle';
    }, () => tv.textAlignment), ENUM_IGNORED);

    tv.textContainerInset = new UIEdgeInsets(1, 2, 3, 4);
    assert('内边距写得进去', String(tv.textContainerInset), 'UIEdgeInsets(1, 2, 3, 4)');
    tv.textContainerInset = { top: 12, left: 8, bottom: 12, right: 8 };
    assert('内边距也收普通对象', String(tv.textContainerInset), 'UIEdgeInsets(12, 8, 12, 8)');
    throws('内边距缺字段被拒',
           // @ts-expect-error 缺 right
           () => { tv.textContainerInset = { top: 1, left: 2, bottom: 3 }; }, 'right');
  });

  // =====================================================================
  group('textContainer', () => {
    const tv = new UITextView();
    const box = tv.textContainer;
    assert('textContainer 是 NSTextContainer', box instanceof NSTextContainer, true);
    assert('它是 NSObject，不是视图', box instanceof NSObject && !(box instanceof UIView), true);
    assert('读两次是同一个对象', tv.textContainer === box, true);
    throws('textContainer 只读',
           // @ts-expect-error 只读
           () => { tv.textContainer = box; }, 'textContainer');
    throws('NSTextContainer 不能 new',
           // @ts-expect-error 构造函数不公开
           () => new NSTextContainer(), 'Illegal constructor');

    assert('默认左右各缩进 5 pt', box.lineFragmentPadding, 5);
    box.lineFragmentPadding = 0;
    assert('lineFragmentPadding 写得进去', box.lineFragmentPadding, 0);
    // @ts-expect-error 类型上是 number
    box.lineFragmentPadding = '2.5';
    assert('像数的字符串按数转', box.lineFragmentPadding, 2.5);
    throws('lineFragmentPadding 给不出有限数被拒',
           () => { box.lineFragmentPadding = NaN; }, 'finite number');
    box.lineFragmentPadding = 5;

    assert('默认不限行数', box.maximumNumberOfLines, 0);
    box.maximumNumberOfLines = 2;
    assert('maximumNumberOfLines 写得进去', box.maximumNumberOfLines, 2);
    box.maximumNumberOfLines = 3.9;
    assert('小数向零取整', box.maximumNumberOfLines, 3);
    throws('负的行数被拒',
           () => { box.maximumNumberOfLines = -1; }, 'non-negative');
    throws('行数给 undefined 被拒',
           // @ts-expect-error 类型上是 number
           () => { box.maximumNumberOfLines = undefined; }, 'finite number');
    assert('写错之后行数没被动过', box.maximumNumberOfLines, 3);

    assert('默认按词折行', box.lineBreakMode, 'byWordWrapping');
    box.lineBreakMode = 'byTruncatingTail';
    assert('lineBreakMode 写得进去', box.lineBreakMode, 'byTruncatingTail');
    assert('lineBreakMode 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个值
      box.lineBreakMode = 'ellipsis';
    }, () => box.lineBreakMode), ENUM_IGNORED);

    // 行数上限真的起作用：同样六行字，限两行之后它自己想要的高度变小。
    // 量的时候不带窗口：不限是 138，限两行是 56.67
    const sized = new UITextView();
    sized.font = UIFont.systemFontOfSize(17);
    sized.text = 'one\ntwo\nthree\nfour\nfive\nsix';
    const all = sized.sizeThatFits(new CGSize(200, 10000)).height;
    sized.textContainer.maximumNumberOfLines = 2;
    const two = sized.sizeThatFits(new CGSize(200, 10000)).height;
    assert('六行字不限行数时想要的高度（17 pt 的字）', Math.round(all), 138);
    assert('限两行之后想要的高度变小', two < all, true);
  });

  // =====================================================================
  group('行为：isEditable / isSelectable', () => {
    const tv = new UITextView();
    tv.text = '0123456789';
    tv.selectedRange = new NSRange(4, 0);
    tv.isEditable = false;
    assert('isEditable 写得进去', tv.isEditable, false);
    assert('只关编辑，选中还开着', tv.isSelectable, true);
    // 量到的：isEditable 管的是用户能不能改，代码照样改得动
    tv.insertText('Z');
    assert('isEditable 为假时 insertText 照样改得动', tv.text, '0123Z456789');
    tv.deleteBackward();
    assert('deleteBackward 也是', tv.text, '0123456789');

    tv.isEditable = true;
    tv.isSelectable = false;
    assert('isSelectable 写得进去', tv.isSelectable, false);
    // 量到的：系统自己连带改的
    assert('关掉选中会连带关掉编辑', tv.isEditable, false);
    tv.isSelectable = true;
    assert('再打开选中，编辑不会自己回来', tv.isEditable, false);
    tv.isSelectable = false;
    tv.isEditable = true;
    assert('打开编辑会连带打开选中', tv.isSelectable, true);
    // 布尔照 Web IDL 转
    // @ts-expect-error 类型上是 boolean
    tv.isEditable = 0;
    assert('isEditable = 0 是 false', tv.isEditable, false);
    // @ts-expect-error 类型上是 boolean
    tv.isEditable = 'false';
    assert("isEditable = 'false' 是 true（非空字符串）", tv.isEditable, true);
  });

  // =====================================================================
  group('NSRange 结构体', () => {
    const r = new NSRange(1, 2);
    assert('location', r.location, 1);
    assert('length', r.length, 2);
    assert('toString', String(r), 'NSRange(1, 2)');
    assert('过 JSON 是两个字段', JSON.stringify(r), '{"location":1,"length":2}');
    throws('字段只读：写 location 抛',
           // @ts-expect-error 只读
           () => { r.location = 5; }, 'read-only');
    throws('字段只读：写 length 抛',
           // @ts-expect-error 只读
           () => { r.length = 5; }, 'read-only');
    throws('不能往上加字段',
           () => { /** @type {any} */ (r).extra = 1; }, 'extra');
    assert('写不进去，值没变', show(r), '(1, 2)');
    // @ts-expect-error 类型上两个参数都要给
    assert('不给参数是 (0, 0)', show(new NSRange()), '(0, 0)');
    assert('小数向零取整', show(new NSRange(1.9, 2.2)), '(1, 2)');
    // @ts-expect-error 类型上是 number
    assert('像数的字符串按数转', show(new NSRange('3', '4')), '(3, 4)');
    throws('负的 location 被拒', () => new NSRange(-1, 0), 'non-negative');
    throws('负的 length 被拒', () => new NSRange(0, -1), 'non-negative');
    throws('转不出有限数被拒',
           // @ts-expect-error 类型上是 number
           () => new NSRange('abc', 0), 'finite number');
  });

  group('选区：selectedRange', () => {
    const tv = new UITextView();
    tv.text = '0123456789';
    tv.selectedRange = new NSRange(3, 4);
    assert('选区写得进去', show(tv.selectedRange), '(3, 4)');
    tv.selectedRange = { location: 1, length: 2 };
    assert('也收普通对象', show(tv.selectedRange), '(1, 2)');
    // @ts-expect-error 类型上是 number
    tv.selectedRange = { location: '2.7', length: 1.2 };
    assert('字段按整数转（向零取整）', show(tv.selectedRange), '(2, 1)');
    // 量到的（不带窗口）：越界不抛。位置超了停在末尾，长度超了变成 0
    tv.selectedRange = new NSRange(100, 5);
    assert('位置越界：停在末尾', show(tv.selectedRange), '(10, 0)');
    tv.selectedRange = new NSRange(2, 100);
    assert('长度越界：位置留着，长度变成 0', show(tv.selectedRange), '(2, 0)');
    // 原生的范围是 64 位无符号数，位置加长度溢出时 UIKit 会抛异常（探针里
    // 进程直接没了）。运行时把两个数各自收到 2^53 以内，不让它溢出
    tv.selectedRange = { location: 8, length: 2 ** 64 };
    assert('大到溢出的长度不崩', tv.selectedRange.location, 8);
    tv.selectedRange = { location: 1e300, length: 0 };
    assert('大到溢出的位置不崩，停在末尾', show(tv.selectedRange), '(10, 0)');

    throws('缺字段被拒',
           // @ts-expect-error 缺 length
           () => { tv.selectedRange = { location: 1 }; }, 'length');
    throws('不是对象被拒',
           // @ts-expect-error 要的是 NSRange
           () => { tv.selectedRange = 3; }, 'selectedRange');
    throws('null 被拒',
           // @ts-expect-error 要的是 NSRange
           () => { tv.selectedRange = null; }, 'selectedRange');
    throws('负的 location 被拒',
           () => { tv.selectedRange = { location: -1, length: 0 }; }, 'non-negative');
    throws('负的 length 被拒',
           () => { tv.selectedRange = { location: 0, length: -2 }; }, 'non-negative');
    assert('写错之后选区没被动过', show(tv.selectedRange), '(10, 0)');

    // 单位是 UTF-16 码元，和 JS 字符串的下标一致：一个表情占两个
    tv.text = 'a😀b';
    assert('一个表情在 JS 里长度是 2', tv.text.length, 4);
    tv.selectedRange = new NSRange(1, 2);
    const sel = tv.selectedRange;
    assert('(1, 2) 正好盖住那个表情',
           tv.text.slice(sel.location, sel.location + sel.length), '😀');
    tv.insertText('!');
    assert('换掉之后', tv.text, 'a!b');
  });

  group('选区：scrollRangeToVisible', () => {
    // 量的时候不带窗口：给一个 200×60 的 frame、40 行字，滚到末尾之后
    // contentOffset.y 从 0 变成 788
    const tv = new UITextView();
    tv.frame = new CGRect(0, 0, 200, 60);
    tv.font = UIFont.systemFontOfSize(17);
    let lines = '';
    for (let i = 0; i < 40; i++) lines += 'line ' + i + '\n';
    tv.text = lines;
    tv.layoutIfNeeded();
    assert('一开始在顶上', tv.contentOffset.y, 0);
    tv.scrollRangeToVisible(new NSRange(tv.text.length - 5, 5));
    tv.layoutIfNeeded();
    assert('滚到末尾那一段之后往下走了', tv.contentOffset.y > 100, true);
    tv.scrollRangeToVisible({ location: 0, length: 0 });
    tv.layoutIfNeeded();
    console.log('  · 再滚回开头，contentOffset.y = ' + tv.contentOffset.y +
                '（探针里量到它不往回走，这一条只打印）');
    // 量到的：越界不抛，也不动
    const before = tv.contentOffset.y;
    tv.scrollRangeToVisible(new NSRange(100000, 5));
    assert('范围越界不抛，位置不动', tv.contentOffset.y, before);
    throws('不给参数被拒',
           // @ts-expect-error 少了参数
           () => tv.scrollRangeToVisible(), 'scrollRangeToVisible');
    throws('负的 location 被拒',
           () => tv.scrollRangeToVisible({ location: -1, length: 0 }), 'non-negative');
  });

  // =====================================================================
  group('键盘：九个属性', () => {
    const tv = new UITextView();
    tv.keyboardType = 'emailAddress';
    assert('keyboardType', tv.keyboardType, 'emailAddress');
    tv.returnKeyType = 'send';
    assert('returnKeyType', tv.returnKeyType, 'send');
    tv.keyboardAppearance = 'light';
    assert('keyboardAppearance', tv.keyboardAppearance, 'light');
    // 头文件里 Alert = Dark，一个数值两个名字：两个都写得进去，读出来是主名
    tv.keyboardAppearance = 'dark';
    assert('keyboardAppearance = dark 读回来是 dark', tv.keyboardAppearance, 'dark');
    tv.keyboardAppearance = 'alert';
    assert('alert 是 dark 的别名，读回来是 dark', tv.keyboardAppearance, 'dark');
    tv.enablesReturnKeyAutomatically = true;
    assert('enablesReturnKeyAutomatically', tv.enablesReturnKeyAutomatically, true);
    tv.isSecureTextEntry = true;
    assert('isSecureTextEntry', tv.isSecureTextEntry, true);
    tv.isSecureTextEntry = false;
    tv.autocapitalizationType = 'none';
    assert('autocapitalizationType', tv.autocapitalizationType, 'none');
    tv.autocorrectionType = 'no';
    assert('autocorrectionType', tv.autocorrectionType, 'no');
    tv.spellCheckingType = 'no';
    assert('spellCheckingType', tv.spellCheckingType, 'no');
    tv.textContentType = 'username';
    assert('textContentType', tv.textContentType, 'username');
    tv.textContentType = null;
    assert('textContentType 能清掉', tv.textContentType, null);

    for (const [key, bad] of /** @type {[string, string][]} */ ([
      ['keyboardType', 'numeric'], ['returnKeyType', 'enter'],
      ['keyboardAppearance', 'black'], ['autocapitalizationType', 'all'],
      ['autocorrectionType', 'off'], ['spellCheckingType', 'off'],
      ['textContentType', 'passwd'],
    ])) {
      assert(key + ' 写错：不抛、值不变', enumIgnored(() => {
        /** @type {any} */ (tv)[key] = bad;
      }, () => /** @type {any} */ (tv)[key]), ENUM_IGNORED);
    }
    assert('写错之后原值没被动过', tv.keyboardType, 'emailAddress');
  });

  group('键盘：keyboardDismissMode', () => {
    const tv = new UITextView();
    for (const mode of /** @type {UIScrollViewKeyboardDismissMode[]} */ (
           ['onDrag', 'interactive', 'onDragWithAccessory', 'interactiveWithAccessory',
            'none'])) {
      tv.keyboardDismissMode = mode;
      assert('keyboardDismissMode = ' + mode, tv.keyboardDismissMode, mode);
    }
    assert('keyboardDismissMode 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个值
      tv.keyboardDismissMode = 'drag';
    }, () => tv.keyboardDismissMode), ENUM_IGNORED);
    // 这个属性定义在 UIScrollView 上，文本视图靠继承得到（原来只定义在
    // UITextView 上）。滚动视图自己的用例在 scroll.js
    assert('普通的滚动视图上也有 keyboardDismissMode',
           'keyboardDismissMode' in new UIScrollView(), true);
    assert('文本视图上写的，按滚动视图的取值器读是同一个值', (() => {
      tv.keyboardDismissMode = 'interactive';
      const descriptor = Object.getOwnPropertyDescriptor(UIScrollView.prototype,
                                                         'keyboardDismissMode');
      return descriptor && descriptor.get ? descriptor.get.call(tv) : '没有取值器';
    })(), 'interactive');
  });

  // 键盘上方的工具条。形状照搜索框和单行输入框的同名属性；这一组是先按判断
  // 写的，没有在模拟器上跑过。键盘弹出来之后的那一半在 input-editing.js
  group('键盘：inputAccessoryView', () => {
    const tv = new UITextView();
    assert('多行输入：默认没有 inputAccessoryView', tv.inputAccessoryView, null);
    const toolbar = new UIToolbar();
    toolbar.items = [UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('done')];
    tv.inputAccessoryView = toolbar;
    assert('多行输入：inputAccessoryView 写得进去，读回原来的包装',
           tv.inputAccessoryView === toolbar, true);
    throws('多行输入：inputAccessoryView 给别的原生对象被拒',
           // @ts-expect-error 要一个视图
           () => { tv.inputAccessoryView = UIFont.systemFontOfSize(12); },
           'inputAccessoryView needs a UIView or null');
    throws('多行输入：inputAccessoryView 给数字被拒',
           // @ts-expect-error 要一个视图
           () => { tv.inputAccessoryView = 5; },
           'inputAccessoryView needs a native object or null, got 5');
    assert('多行输入：inputAccessoryView 被拒之后原值没动',
           tv.inputAccessoryView === toolbar, true);
    // 一个工具条给一个单行的、一个多行的：两边各自持有
    const field = new UITextField();
    field.inputAccessoryView = toolbar;
    assert('多行输入：同一个视图可以同时给单行和多行输入框',
           field.inputAccessoryView === toolbar && tv.inputAccessoryView === toolbar, true);
    tv.inputAccessoryView = null;
    assert('多行输入：inputAccessoryView 写 null：去掉', tv.inputAccessoryView, null);
    assert('多行输入：去掉之后，单行输入框的那一个还在', field.inputAccessoryView === toolbar, true);
  });

  // =====================================================================
  // 事件。原生事件延后一轮派发，所以下面都是「触发 → 等它到 → 再断言」
  console.log('--- UITextView：事件 ---');

  group('事件：订阅', () => {
    const tv = new UITextView();
    const noop = () => {};
    for (const type of /** @type {const} */ (['focus', 'blur', 'input'])) {
      tv.addEventListener(type, noop);
      tv.removeEventListener(type, noop);
    }
    assert('三个事件名订得上也退得掉', true, true);
    // 滚动视图的八个事件和外观变化照常能订
    for (const type of /** @type {const} */ (
           ['scroll', 'dragbegin', 'dragend', 'deceleratebegin', 'decelerateend',
            'scrollanimationend', 'scrolltotop', 'adjustedcontentinsetchange',
            'traitchange'])) {
      tv.addEventListener(type, noop);
      tv.removeEventListener(type, noop);
    }
    assert('滚动视图的八个事件和 traitchange 照常订得上', true, true);
    assert('不认识的事件名当自定义事件', customEventWorks(tv, 'not-a-real-event'), '收到一次');
    // 三个输入控件用同一套名字：focus / blur / input。改名之前多行输入框上叫
    // editingbegin / editingend / textchange，旧名字不保留
    for (const old of ['editing' + 'begin', 'editing' + 'end', 'text' + 'change']) {
      assert('多行输入框：旧的事件名 ' + old + ' 当自定义事件', customEventWorks(tv, old), '收到一次');
    }
    assert('同一个不认识的名字再来一遍，还是当自定义事件', customEventWorks(tv, 'not-a-real-event'), '收到一次');
    throws('@ 开头的名字是运行时保留的', () => tv.addEventListener('@x', noop), 'reserved');
    // 这里原来拿 selectionchange 当「不认识的事件名」的例子，看报错里列了哪些
    // 名字。不认识的名字早就不抛了，selectionchange 现在也是真的事件，它的
    // 用例在这一步的最后
  });

  group('事件：input', () => {
    const tv = new UITextView();
    let changes = 0;
    /** @type {unknown} */
    let lastTarget = null;
    let lastType = '';
    /** @param {Event} e */
    const onChange = (e) => { changes++; lastTarget = e.target; lastType = e.type; };
    tv.addEventListener('input', onChange);
    // 先写 text（不该派发），再 insertText（该派发）。事件按先后排队，
    // 所以等到 insertText 那一个的时候，前面要是有也早该到了
    tv.text = 'abc';
    tv.insertText('d');
    assert('事件不是同步派发的：刚触发完还是 0', changes, 0);
    waitUntil(() => changes >= 1, () => {
      console.log('--- UITextView：input ---');
      assert('insertText 派发 input，写 text 不派发：一共 1 次', changes, 1);
      assert('event.target 是这个文本视图', lastTarget === tv, true);
      assert('event.type', lastType, 'input');
      assert('这时文字已经是改过的', tv.text, 'abcd');
      tv.deleteBackward();
      waitUntil(() => changes >= 2, () => {
        assert('deleteBackward 也派发 input', changes, 2);
        // 量到的：光标在开头时 deleteBackward 什么都不删，也不发通知；
        // 而 insertText('') 什么都没插，却发
        tv.selectedRange = new NSRange(0, 0);
        tv.deleteBackward();
        tv.insertText('');
        waitUntil(() => changes >= 3, () => {
          assert("开头的 deleteBackward 不派发，insertText('') 派发：到 3 次", changes, 3);
          tv.removeEventListener('input', onChange);
          tv.insertText('x');
          // 再挂一个别的监听器当「这一轮已经过去了」的信号
          let later = 0;
          tv.addEventListener('input', () => { later++; });
          tv.insertText('y');
          waitUntil(() => later >= 1, () => {
            assert('removeEventListener 之后收不到了', changes, 3);
            console.log('--- UITextView：input 跑完 ---');
          }, () => assert('重新订阅之后的 input', '没等到', '1 次'));
        }, () => assert("insertText('') 的 input", '没等到', '第 3 次'));
      }, () => assert('deleteBackward 的 input', '没等到', '第 2 次'));
    }, () => assert('insertText 的 input', '没等到', '1 次'));
  });

  // 滚动事件照常能用：文本视图的委托槽位和滚动视图是同一个，文字事件走的是
  // 通知，没有去占它
  group('事件：滚动事件和文字事件互不妨碍', () => {
    const tv = new UITextView();
    tv.frame = new CGRect(0, 0, 200, 60);
    tv.font = UIFont.systemFontOfSize(17);
    let lines = '';
    for (let i = 0; i < 40; i++) lines += 'line ' + i + '\n';
    tv.text = lines;
    tv.layoutIfNeeded();
    let scrolls = 0;
    let changes = 0;
    const onScroll = () => { scrolls++; };
    const onChange = () => { changes++; };
    // 文字事件先订、滚动事件后订，两种都要到
    tv.addEventListener('input', onChange);
    tv.addEventListener('scroll', onScroll);
    tv.contentOffset = new CGPoint(0, 40);
    tv.insertText('!');
    waitUntil(() => scrolls >= 1 && changes >= 1, () => {
      console.log('--- UITextView：滚动事件 ---');
      assert('文本视图上收得到 scroll', scrolls >= 1, true);
      assert('同时也收得到 input', changes, 1);
      // 退掉文字事件，滚动事件不受影响
      tv.removeEventListener('input', onChange);
      const seen = scrolls;
      tv.contentOffset = new CGPoint(0, 80);
      waitUntil(() => scrolls > seen, () => {
        assert('退掉 input 之后 scroll 还在', scrolls > seen, true);
        // 反过来：退掉滚动事件，文字事件不受影响
        tv.removeEventListener('scroll', onScroll);
        tv.addEventListener('input', onChange);
        const quiet = scrolls;
        tv.contentOffset = new CGPoint(0, 120);
        tv.insertText('?');
        waitUntil(() => changes >= 2, () => {
          assert('退掉 scroll 之后 input 还在', changes, 2);
          assert('退掉之后收不到 scroll', scrolls, quiet);
          console.log('--- UITextView：滚动事件跑完 ---');
        }, () => assert('退掉 scroll 之后的 input', '没等到', '第 2 次'));
      }, () => assert('退掉 input 之后的 scroll', '没等到', '又一次'));
    }, () => assert('scroll 和 input',
                    'scroll ' + scrolls + ' 次，input ' + changes + ' 次', '各至少 1 次'));
  });

  // =====================================================================
  // 屏幕上：上面一块能滚的编辑区，下面一块不滚、跟着内容长高的
  /** @type {UITextView | undefined} */
  let editor;
  /** @type {UITextView | undefined} */
  let grower;
  group('屏幕上', () => {
    const safe = host.safeAreaLayoutGuide;

    const edit = new UITextView();
    edit.translatesAutoresizingMaskIntoConstraints = false;
    edit.font = UIFont.systemFontOfSize(16);
    edit.backgroundColor = 'secondarySystemBackground';
    edit.layer.cornerRadius = 10;
    edit.textContainerInset = { top: 10, left: 8, bottom: 10, right: 8 };
    // 多行输入里回车是换行，收键盘靠拖动
    edit.keyboardDismissMode = 'onDrag';
    edit.text = '多行输入。点这里打字，回车换行；\n内容超过这一块的高度就能滚，\n往下拖一下收键盘。\n第四行\n第五行\n第六行';
    host.addSubview(edit);

    // 占位文字：UITextView 自己没有，叠一个 UILabel，在 input 里显隐
    const grow = new UITextView();
    grow.translatesAutoresizingMaskIntoConstraints = false;
    grow.font = UIFont.systemFontOfSize(17);
    grow.isScrollEnabled = false;
    grow.backgroundColor = 'tertiarySystemBackground';
    grow.layer.cornerRadius = 10;
    grow.layer.borderWidth = 1;
    grow.layer.borderColor = 'separator';
    grow.text = 'one\ntwo\nthree';
    host.addSubview(grow);

    const placeholder = new UILabel();
    placeholder.translatesAutoresizingMaskIntoConstraints = false;
    placeholder.text = '写点什么…';
    placeholder.font = grow.font;
    placeholder.textColor = 'placeholderText';
    placeholder.isHidden = grow.hasText;
    grow.addSubview(placeholder);
    grow.addEventListener('input', () => { placeholder.isHidden = grow.hasText; });

    NSLayoutConstraint.activateConstraints([
      edit.topAnchor.constraintEqualToAnchor(safe.topAnchor),
      edit.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
      edit.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
      edit.heightAnchor.constraintEqualToConstant(96),
      // 不给高度：关掉滚动之后它自己知道要多高
      grow.topAnchor.constraintEqualToAnchor(edit.bottomAnchor, { constant: 12 }),
      grow.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
      grow.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
      // 文字从内边距 8 + 行内缩进 5 的地方开始，占位文字对上去
      placeholder.topAnchor.constraintEqualToAnchor(grow.topAnchor, { constant: 8 }),
      placeholder.leadingAnchor.constraintEqualToAnchor(grow.leadingAnchor, { constant: 5 }),
    ]);
    host.layoutIfNeeded();

    // 固有大小。量的时候带窗口和不带窗口都是这个数：17 pt 的字三行，
    // 3 × 20.33 的行高 + 上下各 8 的内边距 = 77
    assert('能滚的那块没有固有大小（-1 表示没有）', edit.intrinsicContentSize.height, -1);
    assert('关掉滚动之后有固有大小：三行 17 pt 的字高 77',
           Math.round(grow.intrinsicContentSize.height), 77);

    // 真实触摸时的日志（自动跑的验收里不会出现）
    edit.addEventListener('focus', () => console.log('  · [UITextView] focus'));
    edit.addEventListener('blur', () => console.log('  · [UITextView] blur'));
    edit.addEventListener('input', () => {
      console.log('  · [UITextView] input，现在 ' + edit.text.length + ' 个码元，选区 ' +
                  show(edit.selectedRange));
    });
    editor = edit;
    grower = grow;
  });

  // ---- 高度跟不跟文字 ----
  // 探针里量到的和窗口有关：不带窗口时改了文字、重新排一遍，高度还是 77；
  // 带窗口时写 text 和 insertText 都跟（五行 117.67，六行 138，空的 36.33）。
  // 这一步执行的那一刻区块还不在窗口里，也不一定有宽度（区块宽 0 时这块
  // 排出来高 20，不是 77），所以凡是看 frame 的都等它进了窗口再量
  const grow = grower;
  const fixed = editor;
  if (grow !== undefined && fixed !== undefined) {
    waitUntil(() => grow.window !== null, () => {
      console.log('--- UITextView：高度跟着文字 ---');
      host.layoutIfNeeded();
      assert('编辑区的高是约束给的 96', fixed.frame.height, 96);
      assert('没给高度约束，三行字排出来就是 77', Math.round(grow.frame.height), 77);
      grow.text = 'one\ntwo\nthree\nfour\nfive';
      host.layoutIfNeeded();
      assert('写 text 改成五行，高度跟着变成 118', Math.round(grow.frame.height), 118);
      grow.insertText('\nsix');
      host.layoutIfNeeded();
      assert('insertText 加到六行，高度跟着变成 138', Math.round(grow.frame.height), 138);
      grow.text = '';
      host.layoutIfNeeded();
      assert('清空之后剩一行的高度 36', Math.round(grow.frame.height), 36);
      console.log('--- UITextView：高度跟着文字跑完 ---');
    }, () => console.log('  ! 30 秒里区块没进窗口，「高度跟着文字」这一组未验证'), 30000);
  }

  // ---- 聚焦和失焦 ----
  // 转场中途 UIKit 会拒绝（见 textfield.js 里记的那几次），所以拿「这次成没成」
  // 当条件。拿到之后立刻做完、交还，不让键盘留在屏幕上。
  //
  // 不等别的输入框空闲：原来等过，条件是「底部那张卡片里的输入框都不是 first
  // responder」。实测那个条件在这一步开始时不成立，而且一直不成立——底部的
  // 输入框交还焦点之后，到这一步之前又成了 first responder（时间上对得上
  // 模态呈现那一步关掉模态页；是不是它没有单独验）。以前能过，是因为后面
  // 搜索框那一步同时在跑、把焦点抢走了。现在步骤是排着队的（见 main.js），
  // 这一步开始时没有别的步骤在用焦点，直接拿
  const edit = editor;
  if (edit !== undefined) {
    let begins = 0;
    let ends = 0;
    edit.addEventListener('focus', () => { begins++; });
    edit.addEventListener('blur', () => { ends++; });
    const unverified = (/** @type {string} */ what) =>
      console.log('  ! 没等到「' + what + '」，聚焦和失焦这一组未验证');

    waitUntil(() => edit.becomeFirstResponder(), () => {
      console.log('--- UITextView：聚焦和失焦 ---');
      assert('成了 first responder', edit.isFirstResponder, true);
      waitUntil(() => begins >= 1, () => {
        assert('聚焦派发 focus', begins, 1);
        const gave = edit.resignFirstResponder();
        assert('resignFirstResponder 返回 true', gave, true);
        assert('交还之后不再是 first responder', edit.isFirstResponder, false);
        waitUntil(() => ends >= 1, () => {
          assert('失焦派发 blur', ends, 1);
          // 再等一拍，看有没有多出来的
          setTimeout(() => {
            assert('聚焦和失焦各只派发了一次', begins + ' / ' + ends, '1 / 1');
            console.log('  ✓ 屏幕上：一块灰底的多行输入，点它弹键盘、能打字能换行、往下拖收键盘；' +
                        '下面一块带边框的，打字时跟着内容长高，清空时出现灰色的占位文字（肉眼看）');
            console.log('--- UITextView：以上异步断言跑完 ---');
            // 原有的断言跑完了，焦点还归这一步：接着验订着 selectionchange 时
            // 聚焦和失焦照不照常，做完才交出去
            selectionWhileEditing(edit, () => begins, () => ends, focusDone);
          }, 300);
        }, () => { assert('blur', '没等到', '1 次'); focusDone(); });
      }, () => { assert('focus', '没等到', '1 次'); focusDone(); });
    }, () => { unverified('拿到 first responder'); focusDone(); }, 30000);
  }

  // ---- 所有权：文本视图持有它的 textContainer 和字体 ----
  // JS 这边不留引用，GC 之后读回来要还是原来那个包装。这里不自己逼 GC
  // （别的步骤在逼），只放一个没人持有的文本视图当对照：它被回收了，说明
  // 完整的 GC 跑过，这一组的结论才算数
  group('所有权', () => {
    const kept = new UITextView();
    let controlCollected = false;
    const registry = new FinalizationRegistry(() => { controlCollected = true; });
    (() => {
      /** @type {any} */ (kept.textContainer).probe = '挂在 textContainer 的包装上';
      // 13.5 这个字号别处没用过，免得包装被别人拿着
      const font = UIFont.systemFontOfSize(13.5);
      /** @type {any} */ (font).probe = '挂在字体的包装上';
      kept.font = font;
      registry.register(new UITextView(), 'control');
    })();
    let waited = 0;
    const check = () => {
      // registry 要有人拿着，不然回调永远不来
      if (registry === null) return;
      if (!controlCollected) {
        waited += 1;
        if (waited < 45) { setTimeout(check, 1000); return; }
        console.log('--- UITextView：持有边 ---');
        console.log('  ! 对照组 45 秒里没被回收，GC 没跑到，这一组未验证');
        return;
      }
      console.log('--- UITextView：持有边 ---');
      assert('对照组（没人持有的文本视图）被回收了', controlCollected, true);
      assert('textContainer：GC 后读回来还是原来那个包装',
             /** @type {any} */ (kept.textContainer).probe, '挂在 textContainer 的包装上');
      assert('字体：GC 后读回来还是原来那个包装',
             /** @type {any} */ (kept.font).probe, '挂在字体的包装上');
      console.log('--- UITextView：持有边跑完 ---');
    };
    setTimeout(check, 8000);
  });

  // =====================================================================
  // 选区变化的事件：selectionchange。
  //
  // 用例是先按判断写的（写的时候不许跑模拟器）。合并后的验收（iPhone Air，
  // iOS 27.2，Debug）跑过一遍，这一段的断言都过了，下面标「实测」的是那一遍
  // 验到的。
  //
  // 它走的是委托方法 textViewDidChangeSelection:，而文本视图的委托槽位和滚动
  // 事件是同一个（核心的滚动委托也在里面），所以除了事件本身，还要盯着滚动
  // 事件和原有的三个文字事件不受影响
  group('事件：selectionchange', () => {
    const tv = new UITextView();
    tv.text = '0123456789';
    assert('选区事件：selectionchange 订得上也退得掉', (() => {
      const noop = () => {};
      try {
        tv.addEventListener('selectionchange', noop);
        tv.removeEventListener('selectionchange', noop);
        return '没有抛';
      } catch (err) { return '抛了：' + (err instanceof Error ? err.message : String(err)); }
    })(), '没有抛');

    let changes = 0;
    /** @type {unknown} */
    let lastTarget = null;
    let lastType = '';
    let lastCancelable = true;
    let seen = '';
    /** @param {Event} e */
    const onSelection = (e) => {
      changes++;
      lastTarget = e.target;
      lastType = e.type;
      lastCancelable = e.cancelable;
      seen = show(tv.selectedRange);
    };
    // 内容摆好之后才订：写 text 引起的选区变化不混进计数里
    tv.addEventListener('selectionchange', onSelection);
    tv.selectedRange = new NSRange(2, 3);
    assert('选区事件：事件不是同步派发的：刚写完还是 0', changes, 0);
    // 实测：代码写选区和用户动光标一样，系统都会告诉委托；不在窗口里、不是
    // first responder 的文本视图也一样
    waitUntil(() => changes >= 1, () => {
      console.log('--- UITextView：selectionchange ---');
      assert('选区事件：代码写 selectedRange 派发 selectionchange', changes >= 1, true);
      assert('选区事件：event.target 是这个文本视图', lastTarget === tv, true);
      assert('选区事件：event.type', lastType, 'selectionchange');
      assert('选区事件：不可取消', lastCancelable, false);
      assert('选区事件：监听器里读 selectedRange 就是现在的选区', seen, '(2, 3)');
      // 实测：insertText 把选中的换掉、光标挪到后面，选区也变了，也派发
      const before = changes;
      tv.insertText('x');
      waitUntil(() => changes > before, () => {
        assert('选区事件：insertText 挪了光标，也派发', changes > before, true);
        assert('选区事件：这时读到的是挪过之后的光标', seen, '(3, 0)');
        // 退掉之后收不到。拿 input 当标记：它和 selectionchange 按先后排在同一条
        // 队列里，它到了，前面要是有 selectionchange 也早该到了
        tv.removeEventListener('selectionchange', onSelection);
        const quiet = changes;
        let marks = 0;
        tv.addEventListener('input', () => { marks++; });
        tv.selectedRange = new NSRange(0, 1);
        tv.insertText('y');
        waitUntil(() => marks >= 1, () => {
          assert('选区事件：removeEventListener 之后收不到了', changes, quiet);
          console.log('--- UITextView：selectionchange 跑完 ---');
        }, () => assert('选区事件：当标记的 input', '没等到', '1 次'));
      }, () => assert('选区事件：insertText 之后的 selectionchange', '没等到', '又一次'));
    }, () => assert('选区事件：代码写 selectedRange 之后的 selectionchange', '没等到', '至少 1 次'));
  });

  group('事件：selectionchange 和滚动事件、文字事件互不妨碍', () => {
    const tv = new UITextView();
    tv.frame = new CGRect(0, 0, 200, 60);
    tv.font = UIFont.systemFontOfSize(17);
    let lines = '';
    for (let i = 0; i < 40; i++) lines += 'line ' + i + '\n';
    tv.text = lines;
    tv.layoutIfNeeded();
    let scrolls = 0;
    let inputs = 0;
    let selections = 0;
    const onScroll = () => { scrolls++; };
    const onInput = () => { inputs++; };
    const onSelection = () => { selections++; };
    // 滚动事件先订（委托槽位里先有核心的滚动委托），选区事件后订，三种都要到
    tv.addEventListener('scroll', onScroll);
    tv.addEventListener('input', onInput);
    tv.addEventListener('selectionchange', onSelection);
    tv.contentOffset = new CGPoint(0, 40);
    tv.selectedRange = new NSRange(1, 1);
    tv.insertText('!');
    waitUntil(() => scrolls >= 1 && inputs >= 1 && selections >= 1, () => {
      console.log('--- UITextView：selectionchange 和别的事件 ---');
      assert('选区事件：三种一起订着：收得到 scroll', scrolls >= 1, true);
      assert('选区事件：三种一起订着：收得到 input', inputs >= 1, true);
      assert('选区事件：三种一起订着：收得到 selectionchange', selections >= 1, true);
      // 退掉选区事件：槽位里还剩滚动委托，滚动事件和文字事件都还在
      tv.removeEventListener('selectionchange', onSelection);
      const scrolled = scrolls;
      const typed = inputs;
      const quiet = selections;
      tv.contentOffset = new CGPoint(0, 80);
      tv.selectedRange = new NSRange(2, 1);
      tv.insertText('?');
      waitUntil(() => scrolls > scrolled && inputs > typed, () => {
        assert('选区事件：退掉 selectionchange 之后 scroll 还在', scrolls > scrolled, true);
        assert('选区事件：退掉 selectionchange 之后 input 还在', inputs > typed, true);
        assert('选区事件：退掉之后收不到 selectionchange', selections, quiet);
        // 反过来：选区事件订回来，退掉滚动事件，槽位里只剩选区的委托
        tv.addEventListener('selectionchange', onSelection);
        tv.removeEventListener('scroll', onScroll);
        const still = scrolls;
        const typedAgain = inputs;
        const selected = selections;
        tv.contentOffset = new CGPoint(0, 120);
        tv.selectedRange = new NSRange(0, 2);
        tv.insertText('#');
        waitUntil(() => selections > selected && inputs > typedAgain, () => {
          assert('选区事件：退掉 scroll 之后 selectionchange 还在', selections > selected, true);
          assert('选区事件：退掉 scroll 之后 input 还在', inputs > typedAgain, true);
          assert('选区事件：退掉之后收不到 scroll', scrolls, still);
          console.log('--- UITextView：selectionchange 和别的事件跑完 ---');
        }, () => assert('选区事件：退掉 scroll 之后的 selectionchange 和 input',
                        'selectionchange ' + (selections - selected) + ' 次，input ' +
                        (inputs - typedAgain) + ' 次', '各至少 1 次'));
      }, () => assert('选区事件：退掉 selectionchange 之后的 scroll 和 input',
                      'scroll ' + (scrolls - scrolled) + ' 次，input ' + (inputs - typed) + ' 次',
                      '各至少 1 次'));
    }, () => assert('选区事件：scroll、input 和 selectionchange',
                    'scroll ' + scrolls + ' 次，input ' + inputs + ' 次，selectionchange ' +
                    selections + ' 次', '各至少 1 次'));
  });

  // 订着 selectionchange（委托槽位里有选区的委托）时，聚焦和失焦照常各派发
  // 一次。接在原有的聚焦那一串后面跑，那时焦点还归这一步
  /**
   * @param {UITextView} view 屏幕上那块编辑区
   * @param {() => number} begins 到现在收到了几次 focus
   * @param {() => number} ends 到现在收到了几次 blur
   * @param {() => void} done
   */
  function selectionWhileEditing(view, begins, ends, done) {
    let selections = 0;
    const onSelection = () => { selections++; };
    const finish = () => {
      view.removeEventListener('selectionchange', onSelection);
      if (view.isFirstResponder) view.resignFirstResponder();
      done();
    };
    const beganBefore = begins();
    const endedBefore = ends();
    view.addEventListener('selectionchange', onSelection);
    waitUntil(() => view.becomeFirstResponder(), () => {
      console.log('--- UITextView：订着 selectionchange 时聚焦和失焦 ---');
      waitUntil(() => begins() > beganBefore, () => {
        assert('选区事件：订着 selectionchange 时聚焦照常派发 focus', begins() - beganBefore, 1);
        const before = selections;
        view.selectedRange = new NSRange(1, 2);
        // 实测：在窗口里、正在编辑时，代码写选区同样派发
        waitUntil(() => selections > before, () => {
          assert('选区事件：正在编辑时代码写 selectedRange 派发 selectionchange', selections > before, true);
          assert('选区事件：选区写进去了', show(view.selectedRange), '(1, 2)');
          view.resignFirstResponder();
          waitUntil(() => ends() > endedBefore, () => {
            assert('选区事件：订着 selectionchange 时失焦照常派发 blur', ends() - endedBefore, 1);
            console.log('--- UITextView：订着 selectionchange 时聚焦和失焦跑完 ---');
            finish();
          }, () => { assert('选区事件：订着 selectionchange 时的 blur', '没等到', '1 次'); finish(); });
        }, () => {
          assert('选区事件：正在编辑时代码写 selectedRange 之后的 selectionchange', '没等到', '至少 1 次');
          finish();
        });
      }, () => { assert('选区事件：订着 selectionchange 时的 focus', '没等到', '1 次'); finish(); });
    }, () => {
      console.log('  ! 没等到「再拿到一次 first responder」，订着 selectionchange 时聚焦和失焦这一组未验证');
      finish();
    });
  }

  return focusFinished;
}
