// 富文本：NSAttributedString / NSMutableAttributedString、段落样式、阴影、
// 附件，以及显示富文本的那几处（UILabel、UITextField、UITextView、UIButton）。
//
// 写这一步的对话只编译、不跑 App；期望值是合并之后的验收反过来校的。
// 第一遍验收（iPhone Air 模拟器，iOS 27.2，Debug）267 条里 3 条不过，都是
// 对 UIKit 行为的假设错了，已经按实测改掉：
//   - 标签上先写 attributedText 再写 text，原来的样式留着（输入框和文本
//     视图会换掉）
//   - 按钮的 attributedTitleForState() 对没单独设过的状态给 normal 的那个，
//     写 null 去掉之后读到的也是回到 normal 的
// 还没有事实依据的地方不断言，只把读到的值打出来，日志里搜
// [attributed-string probe]。
//
// 期望原来有三种来头：
//   - 富文本自己这一层（副本的类、按段遍历的范围、换文字时沿用谁的属性、
//     默认值、量尺寸的选项）是用一个不带界面的小程序在 macOS 27.2 上量的。
//     这几个类在 UIFoundation 里，macOS 和 iOS 共用，但 iOS 上没有另外量过
//   - 头文件和 Apple 文档写明的，照常断言
//   - 四种视图上的行为（和 text 互相覆盖、空的时候读出来是什么）量不了，
//     当时标了「要验证的假设」；第一遍验收之后，成立的改成了「验收里成立」，
//     不成立的三条按实测改了
//
// 能自动验的是：对象建不建得出来、每个成员的读写、写错了抛什么、几个使用
// 点的读写互相覆盖。**屏幕上看起来怎样（颜色、下划线、图片、行距）只能看**，
// 区块里摆了五行供人核对。

import { assert, enumIgnored, ENUM_IGNORED } from '../support.js';

/**
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string} needle 报错信息里应该有的一段
 */
function throws(label, fn, needle) {
  try {
    fn();
    assert(label, '没抛', '抛 ' + needle);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const ok = err instanceof TypeError && message.includes(needle);
    assert(label, ok ? needle : (err instanceof Error ? err.name : '?') + ': ' + message, needle);
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
    assert(name + ' 这一组跑完了', '中断：' + message, '跑完');
  }
}

// 还没有事实依据、只把读到的值打出来的地方。日志里搜 [attributed-string probe]
/**
 * @param {string} what
 * @param {unknown} value
 */
function probe(what, value) {
  console.log('  [attributed-string probe] ' + what + '：' + String(value));
}

/** @param {NSRange} r */
const rangeText = (r) => r.location + '+' + r.length;

/** @param {import("../main.js").StepContext} ctx */
export function stepAttributedString(ctx) {
  // 区块先建：它在瀑布里的位置由调用的先后决定
  const host = ctx.section('富文本：颜色字号、下划线和删除线、图片附件、段落样式、按钮', 222);
  console.log('--- 富文本：NSAttributedString 一组 ---');

  const font17 = UIFont.systemFontOfSize(17);
  const bold20 = UIFont.boldSystemFontOfSize(20);

  // ===== 构造、string、length =====
  group('构造', () => {
    const empty = new NSAttributedString();
    assert('不给参数：空的富文本', empty.string, '');
    assert('它的长度是 0', empty.length, 0);
    assert('是 NSAttributedString', empty instanceof NSAttributedString, true);
    assert('也是 NSObject', empty instanceof NSObject, true);
    assert('不可改的那个不是 NSMutableAttributedString',
           empty instanceof NSMutableAttributedString, false);

    const plain = new NSAttributedString('你好 Nacre');
    assert('只给文字：string 读得回来', plain.string, '你好 Nacre');
    assert('length 是 UTF-16 码元数', plain.length, 8);
    assert('表情占两个码元', new NSAttributedString('a😀').length, 3);
    assert('没给属性：这一处一个属性都没有',
           Object.keys(plain.attributesAtIndex(0)).length, 0);

    // @ts-expect-error 数字不是字符串，按字符串转
    assert('文字按字符串转：5 是 "5"', new NSAttributedString(5).string, '5');
    // @ts-expect-error null 是空串
    assert('文字给 null 是空串', new NSAttributedString(null).string, '');
    assert('属性给 null 等于没给', new NSAttributedString('a', null).length, 1);

    const styled = new NSAttributedString('重要', { font: bold20, foregroundColor: '#ff3b30' });
    const copy = new NSAttributedString(styled);
    assert('照另一个抄一份：内容相同', copy.isEqualToAttributedString(styled), true);
    assert('抄出来的文字', copy.string, '重要');

    const mutable = new NSMutableAttributedString('可改', { kern: 2 });
    assert('可改的也是 NSAttributedString', mutable instanceof NSAttributedString, true);
    assert('可改的是 NSMutableAttributedString', mutable instanceof NSMutableAttributedString, true);
    assert('可改的：string', mutable.string, '可改');
    assert('可改的：构造时给的属性在', mutable.attributesAtIndex(0).kern, 2);
    assert('可改的不给参数：空的', new NSMutableAttributedString().length, 0);
    assert('可改的照不可改的抄一份',
           new NSMutableAttributedString(styled).isEqualToAttributedString(styled), true);

    throws('不能继承',
           () => { class Mine extends NSAttributedString {} return new Mine('x'); },
           'Illegal constructor');
    throws('string 是只读的',
           // @ts-expect-error 只读
           () => { plain.string = 'x'; }, 'string');
    throws('length 是只读的',
           // @ts-expect-error 只读
           () => { plain.length = 3; }, 'length');
  });

  // ===== 每一种属性：写进去、读出来 =====
  group('属性的读写', () => {
    const style = new NSMutableParagraphStyle();
    style.alignment = 'center';
    style.lineSpacing = 6;
    const shadow = new NSShadow();
    shadow.shadowOffset = new CGSize(1, 2);
    shadow.shadowBlurRadius = 3;
    shadow.shadowColor = '#00000080';
    const attachment = new NSTextAttachment();

    const text = new NSAttributedString('abc', {
      font: bold20,
      paragraphStyle: style,
      foregroundColor: '#ff3b30',
      backgroundColor: 'systemYellow',
      ligature: 0,
      kern: 1.5,
      tracking: 0.5,
      strikethroughStyle: ['single'],
      underlineStyle: ['double', 'patternDash', 'byWord'],
      strokeColor: 'rgba(0, 0, 255, 0.5)',
      strokeWidth: -3,
      shadow,
      attachment,
      link: 'https://example.com/a?b=1',
      baselineOffset: 4,
      underlineColor: 'systemBlue',
      strikethroughColor: UIColor.systemGreenColor,
    });
    const got = text.attributesAtIndex(1);
    assert('十七个属性都读得回来', Object.keys(got).sort().join(','),
           ['attachment', 'backgroundColor', 'baselineOffset', 'font', 'foregroundColor',
            'kern', 'ligature', 'link', 'paragraphStyle', 'shadow', 'strikethroughColor',
            'strikethroughStyle', 'strokeColor', 'strokeWidth', 'tracking',
            'underlineColor', 'underlineStyle'].join(','));
    assert('font：读回来是写进去的那个对象', got.font, bold20);
    assert('foregroundColor：写的字符串原样读回', got.foregroundColor, '#ff3b30');
    assert('backgroundColor：语义色读回短名', got.backgroundColor, 'systemYellow');
    assert('strokeColor：带透明度的写法原样读回', got.strokeColor, 'rgba(0, 0, 255, 0.5)');
    assert('underlineColor', got.underlineColor, 'systemBlue');
    assert('strikethroughColor：写的是 UIColor，读出来是字符串',
           got.strikethroughColor, 'systemGreen');
    assert('ligature', got.ligature, 0);
    assert('kern', got.kern, 1.5);
    assert('tracking', got.tracking, 0.5);
    assert('strokeWidth', got.strokeWidth, -3);
    assert('baselineOffset', got.baselineOffset, 4);
    assert('link：字符串进、字符串出', got.link, 'https://example.com/a?b=1');
    assert('strikethroughStyle', (got.strikethroughStyle || []).join(','), 'single');
    assert('underlineStyle：线型、虚线、byWord 的顺序',
           (got.underlineStyle || []).join(','), 'double,patternDash,byWord');
    assert('attachment：读回来是写进去的那个对象', got.attachment, attachment);

    // 段落样式和阴影放进去的是副本
    const gotStyle = got.paragraphStyle;
    assert('paragraphStyle：读出来是 NSParagraphStyle', gotStyle instanceof NSParagraphStyle, true);
    assert('它不是写进去的那个对象（放进去的是副本）', gotStyle !== style, true);
    assert('副本不可改', gotStyle instanceof NSMutableParagraphStyle, false);
    assert('副本的 alignment', gotStyle ? gotStyle.alignment : '没有', 'center');
    assert('副本的 lineSpacing', gotStyle ? gotStyle.lineSpacing : -1, 6);
    style.lineSpacing = 20;
    const again = text.attributesAtIndex(1).paragraphStyle;
    assert('之后再改原来的样式，富文本里的不变', again ? again.lineSpacing : -1, 6);

    const gotShadow = got.shadow;
    assert('shadow：读出来是 NSShadow', gotShadow instanceof NSShadow, true);
    assert('它不是写进去的那个对象', gotShadow !== shadow, true);
    assert('副本的 shadowBlurRadius', gotShadow ? gotShadow.shadowBlurRadius : -1, 3);
    assert('副本的 shadowOffset',
           gotShadow ? gotShadow.shadowOffset.width + ',' + gotShadow.shadowOffset.height : '',
           '1,2');
    shadow.shadowBlurRadius = 9;
    const shadowAgain = text.attributesAtIndex(1).shadow;
    assert('之后再改原来的阴影，富文本里的不变',
           shadowAgain ? shadowAgain.shadowBlurRadius : -1, 3);

    // attribute()：单个属性
    assert('attribute()：有的给值', text.attribute('kern', { atIndex: 0 }), 1.5);
    assert('attribute()：对象属性给对象', text.attribute('font', { atIndex: 2 }), bold20);
    assert('attribute()：没有的给 null',
           new NSAttributedString('a').attribute('kern', { atIndex: 0 }), null);

    // 下划线的各种取值
    /** @param {NSUnderlineStyle[]} names */
    const roundTrip = (names) => {
      const s = new NSAttributedString('a', { underlineStyle: names });
      return (s.attributesAtIndex(0).underlineStyle || ['没有这个键']).join(',');
    };
    assert('下划线 single', roundTrip(['single']), 'single');
    assert('下划线 thick', roundTrip(['thick']), 'thick');
    assert('下划线 double 读回来还是 double，不拆成两个', roundTrip(['double']), 'double');
    assert('下划线 single + patternDot', roundTrip(['single', 'patternDot']), 'single,patternDot');
    assert('下划线 thick + patternDashDot', roundTrip(['patternDashDot', 'thick']),
           'thick,patternDashDot');
    assert('下划线 single + patternDashDotDot + byWord',
           roundTrip(['byWord', 'patternDashDotDot', 'single']),
           'single,patternDashDotDot,byWord');
    assert('下划线给空数组：键在，值是空数组', roundTrip([]), '');

    // 转换：数按 Web IDL 转
    // @ts-expect-error 字符串按数转
    assert('kern 给 "2"：按数转', new NSAttributedString('a', { kern: '2' }).attributesAtIndex(0).kern, 2);
    assert('值是 undefined 的键视为没带',
           Object.keys(new NSAttributedString('a', { kern: undefined, font: font17 })
             .attributesAtIndex(0)).join(','), 'font');
    assert('link 给 URL 对象：读出来是它的地址',
           new NSAttributedString('a', { link: new URL('https://example.com/x') })
             .attributesAtIndex(0).link, 'https://example.com/x');
  });

  // ===== 属性写错 =====
  group('属性写错', () => {
    throws('不认识的键：抛，并列出能用的键',
           // @ts-expect-error 没有这个键（英式拼法）
           () => new NSAttributedString('a', { foregroundColour: 'red' }), 'foregroundColor');
    throws('font 给字符串',
           // @ts-expect-error 要 UIFont
           () => new NSAttributedString('a', { font: 'Helvetica' }), 'UIFont');
    throws('font 给 null',
           // @ts-expect-error 要 UIFont
           () => new NSAttributedString('a', { font: null }), 'UIFont');
    throws('paragraphStyle 给普通对象',
           // @ts-expect-error 要 NSParagraphStyle
           () => new NSAttributedString('a', { paragraphStyle: { alignment: 'center' } }),
           'NSParagraphStyle');
    throws('shadow 给颜色',
           // @ts-expect-error 要 NSShadow
           () => new NSAttributedString('a', { shadow: UIColor.redColor }), 'NSShadow');
    throws('attachment 给图片',
           // @ts-expect-error 要 NSTextAttachment
           () => new NSAttributedString('a', { attachment: UIImage.systemImageNamed('star') }),
           'NSTextAttachment');
    throws('kern 给转不成数的字符串',
           // @ts-expect-error 要数
           () => new NSAttributedString('a', { kern: 'wide' }), 'kern');
    throws('underlineStyle 给字符串而不是数组',
           // @ts-expect-error 要数组
           () => new NSAttributedString('a', { underlineStyle: 'single' }), 'array');
    throws('underlineStyle 里有不认识的名字：列出能用的',
           // @ts-expect-error 没有这个取值
           () => new NSAttributedString('a', { underlineStyle: ['wavy'] }), 'patternDash');
    throws('颜色给 null',
           // @ts-expect-error 颜色属性没有「空」这个值
           () => new NSAttributedString('a', { foregroundColor: null }), 'foregroundColor');
    throws('属性给的不是对象',
           // @ts-expect-error 要对象
           () => new NSAttributedString('a', 'bold'), 'attributes');

    // 颜色写错不抛：警告，这个键不生效，别的键照常
    const half = new NSAttributedString('a', { foregroundColor: 'notacolor', kern: 1 });
    assert('颜色写错不抛，这个键不生效，别的键照常',
           Object.keys(half.attributesAtIndex(0)).join(','), 'kern');
  });

  // ===== 下标和范围 =====
  group('下标和范围', () => {
    const text = new NSAttributedString('abc', { kern: 1 });
    throws('attributesAtIndex 越界', () => text.attributesAtIndex(3), 'out of bounds');
    throws('attributesAtIndex 给负数', () => text.attributesAtIndex(-1), 'attributesAtIndex');
    throws('空的富文本上取属性', () => new NSAttributedString().attributesAtIndex(0),
           'out of bounds');
    throws('attribute() 没给 atIndex',
           // @ts-expect-error 少了 atIndex
           () => text.attribute('kern'), 'atIndex');
    throws('attribute() 的名字不认识',
           // @ts-expect-error 没有这个键
           () => text.attribute('colour', { atIndex: 0 }), 'foregroundColor');
    throws('attributedSubstringFromRange 越界',
           () => text.attributedSubstringFromRange(new NSRange(2, 5)), 'out of bounds');
    throws('范围给的不是对象',
           // @ts-expect-error 要 NSRange
           () => text.attributedSubstringFromRange(1), 'location');

    const sub = text.attributedSubstringFromRange({ location: 1, length: 2 });
    assert('取子串：收普通对象写的范围', sub.string, 'bc');
    assert('取子串：属性跟着走', sub.attributesAtIndex(0).kern, 1);
    assert('取子串：长度 0 的范围给空的', text.attributedSubstringFromRange(new NSRange(3, 0)).length, 0);

    assert('isEqualToAttributedString：内容相同',
           text.isEqualToAttributedString(new NSAttributedString('abc', { kern: 1 })), true);
    assert('文字相同、属性不同：不相等',
           text.isEqualToAttributedString(new NSAttributedString('abc', { kern: 2 })), false);
    throws('isEqualToAttributedString 给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => text.isEqualToAttributedString('abc'), 'NSAttributedString');
  });

  // ===== 可改的富文本 =====
  group('可改的富文本', () => {
    const text = new NSMutableAttributedString('合计 ¥128.00');
    text.addAttribute('foregroundColor', { value: '#ff3b30', range: new NSRange(3, 7) });
    assert('addAttribute：范围里有了', text.attributesAtIndex(3).foregroundColor, '#ff3b30');
    assert('范围外没有', text.attributesAtIndex(0).foregroundColor, undefined);

    text.addAttributes({ font: bold20, kern: 1 }, { range: new NSRange(3, 7) });
    assert('addAttributes：原来的属性还在',
           Object.keys(text.attributesAtIndex(4)).sort().join(','), 'font,foregroundColor,kern');

    // 按属性相同的连续一段遍历
    /** @type {string[]} */
    const runs = [];
    text.enumerateAttributesInRange(new NSRange(0, text.length), (attributes, range) => {
      runs.push(rangeText(range) + ':' + Object.keys(attributes).sort().join('|'));
    });
    assert('enumerateAttributesInRange：两段', runs.join(' '),
           '0+3: 3+7:font|foregroundColor|kern');
    /** @type {string[]} */
    const part = [];
    let allRanges = true;
    text.enumerateAttributesInRange(new NSRange(2, 3), (attributes, range) => {
      part.push(rangeText(range));
      if (!(range instanceof NSRange)) allRanges = false;
    });
    assert('回调拿到的范围是 NSRange', allRanges, true);
    assert('只遍历一部分：范围不超出给的那一段', part.join(' '), '2+1 3+2');
    let calls = 0;
    text.enumerateAttributesInRange(new NSRange(0, 0), () => { calls += 1; });
    assert('长度 0 的范围：回调不调', calls, 0);
    throws('enumerateAttributesInRange 越界',
           () => text.enumerateAttributesInRange(new NSRange(0, 99), () => {}), 'out of bounds');
    throws('enumerateAttributesInRange 没给回调',
           // @ts-expect-error 少了回调
           () => text.enumerateAttributesInRange(new NSRange(0, 1)), 'function');
    let thrown = '';
    try {
      text.enumerateAttributesInRange(new NSRange(0, 10), () => { throw new Error('回调里抛的'); });
    } catch (err) {
      thrown = err instanceof Error ? err.message : String(err);
    }
    assert('回调里抛的异常原样传出来', thrown, '回调里抛的');

    text.removeAttribute('kern', { range: new NSRange(3, 7) });
    assert('removeAttribute：去掉了', text.attributesAtIndex(3).kern, undefined);
    text.removeAttribute('shadow', { range: new NSRange(0, 3) });
    assert('removeAttribute：本来没有也不报错', text.length, 10);

    text.setAttributes({ underlineStyle: ['single'] }, { range: new NSRange(3, 7) });
    assert('setAttributes：整个换掉，原来的不在了',
           Object.keys(text.attributesAtIndex(3)).join(','), 'underlineStyle');
    text.setAttributes(null, { range: new NSRange(3, 7) });
    assert('setAttributes(null)：清空这一段的属性',
           Object.keys(text.attributesAtIndex(3)).length, 0);

    // 改文字
    const edit = new NSMutableAttributedString('abc', { kern: 3 });
    edit.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
    assert('replaceCharactersInRange withString', edit.string, 'aXYZc');
    // 来自头文件：新文字沿用被换掉那一段第一个字符的属性
    assert('换进来的文字沿用原来的属性', edit.attributesAtIndex(2).kern, 3);
    edit.replaceCharactersInRange(new NSRange(0, 1), {
      withAttributedString: new NSAttributedString('Q', { kern: 7 }),
    });
    assert('replaceCharactersInRange withAttributedString', edit.string, 'QXYZc');
    assert('换进来的富文本带着自己的属性', edit.attributesAtIndex(0).kern, 7);
    edit.appendAttributedString(new NSAttributedString('!', { baselineOffset: 2 }));
    assert('appendAttributedString', edit.string, 'QXYZc!');
    assert('接上的那一段的属性', edit.attributesAtIndex(5).baselineOffset, 2);
    edit.insertAttributedString(new NSAttributedString('>>'), { atIndex: 0 });
    assert('insertAttributedString', edit.string, '>>QXYZc!');
    edit.insertAttributedString(new NSAttributedString('<<'), { atIndex: edit.length });
    assert('insertAttributedString：atIndex 等于长度是接在末尾', edit.string, '>>QXYZc!<<');
    edit.deleteCharactersInRange(new NSRange(0, 2));
    assert('deleteCharactersInRange', edit.string, 'QXYZc!<<');
    edit.setAttributedString(new NSAttributedString('全换了', { kern: 9 }));
    assert('setAttributedString：文字', edit.string, '全换了');
    assert('setAttributedString：属性', edit.attributesAtIndex(0).kern, 9);

    // 副本
    const frozen = edit.copy();
    assert('copy()：不可改', frozen instanceof NSMutableAttributedString, false);
    assert('copy()：内容相同', frozen.isEqualToAttributedString(edit), true);
    const thawed = frozen.mutableCopy();
    assert('mutableCopy()：可改', thawed instanceof NSMutableAttributedString, true);
    thawed.deleteCharactersInRange(new NSRange(0, 1));
    assert('改副本不影响原来的', frozen.string, '全换了');
    assert('副本自己变了', thawed.string, '换了');

    // 写错
    throws('addAttribute 没给 range',
           // @ts-expect-error 少了 range
           () => text.addAttribute('kern', { value: 1 }), 'range');
    throws('addAttribute 没给 value',
           // @ts-expect-error 少了 value
           () => text.addAttribute('kern', { range: new NSRange(0, 1) }), 'value');
    throws('addAttribute 的名字不认识',
           // @ts-expect-error 没有这个键
           () => text.addAttribute('colour', { value: 'red', range: new NSRange(0, 1) }),
           'foregroundColor');
    throws('addAttribute 越界',
           () => text.addAttribute('kern', { value: 1, range: new NSRange(8, 9) }),
           'out of bounds');
    throws('removeAttribute 的名字不认识',
           // @ts-expect-error 没有这个键
           () => text.removeAttribute('colour', { range: new NSRange(0, 1) }), 'foregroundColor');
    throws('setAttributes 没给 range',
           // @ts-expect-error 少了 range
           () => text.setAttributes({ kern: 1 }), 'range');
    throws('replaceCharactersInRange 两种都没给',
           // @ts-expect-error 要 withString 或 withAttributedString
           () => text.replaceCharactersInRange(new NSRange(0, 1), {}), 'withString');
    throws('replaceCharactersInRange 越界',
           () => text.replaceCharactersInRange(new NSRange(9, 5), { withString: 'x' }),
           'out of bounds');
    throws('appendAttributedString 给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => text.appendAttributedString('尾巴'), 'NSAttributedString');
    throws('insertAttributedString 没给 atIndex',
           // @ts-expect-error 少了 atIndex
           () => text.insertAttributedString(new NSAttributedString('x')), 'atIndex');
    throws('insertAttributedString 越界',
           () => text.insertAttributedString(new NSAttributedString('x'), { atIndex: 99 }),
           'out of bounds');
    throws('deleteCharactersInRange 越界',
           () => text.deleteCharactersInRange(new NSRange(0, 99)), 'out of bounds');
    throws('setAttributedString 给 null',
           // @ts-expect-error 要 NSAttributedString
           () => text.setAttributedString(null), 'NSAttributedString');
    assert('不可改的那个没有 addAttribute',
           typeof (/** @type {any} */ (new NSAttributedString('a'))).addAttribute, 'undefined');
  });

  // ===== 段落样式 =====
  group('段落样式', () => {
    const base = new NSParagraphStyle();
    // 默认值来自头文件
    assert('默认 alignment', base.alignment, 'natural');
    assert('默认 lineSpacing', base.lineSpacing, 0);
    assert('默认 paragraphSpacing', base.paragraphSpacing, 0);
    assert('默认 paragraphSpacingBefore', base.paragraphSpacingBefore, 0);
    assert('默认 firstLineHeadIndent', base.firstLineHeadIndent, 0);
    assert('默认 headIndent', base.headIndent, 0);
    assert('默认 tailIndent', base.tailIndent, 0);
    assert('默认 lineBreakMode', base.lineBreakMode, 'byWordWrapping');
    assert('默认 minimumLineHeight', base.minimumLineHeight, 0);
    assert('默认 maximumLineHeight', base.maximumLineHeight, 0);
    assert('默认 lineHeightMultiple', base.lineHeightMultiple, 0);
    assert('默认 baseWritingDirection', base.baseWritingDirection, 'natural');
    assert('默认 hyphenationFactor', base.hyphenationFactor, 0);
    // 要验证的假设：头文件说默认是 false，macOS 上量到的是 true。这里只断言
    // 它是布尔，把读到的值打出来
    probe('默认 allowsDefaultTighteningForTruncation', base.allowsDefaultTighteningForTruncation);
    assert('默认 allowsDefaultTighteningForTruncation 是布尔',
           typeof base.allowsDefaultTighteningForTruncation, 'boolean');
    assert('默认 defaultTabInterval', base.defaultTabInterval, 0);
    assert('defaultParagraphStyle 是 NSParagraphStyle',
           NSParagraphStyle.defaultParagraphStyle instanceof NSParagraphStyle, true);
    assert('defaultParagraphStyle 的 alignment',
           NSParagraphStyle.defaultParagraphStyle.alignment, 'natural');
    throws('不可改的段落样式：写属性抛',
           // @ts-expect-error 只读
           () => { base.alignment = 'center'; }, 'alignment');

    const style = new NSMutableParagraphStyle();
    assert('可改的是 NSParagraphStyle', style instanceof NSParagraphStyle, true);
    style.alignment = 'right';
    assert('alignment 读写', style.alignment, 'right');
    style.lineSpacing = 4;
    assert('lineSpacing 读写', style.lineSpacing, 4);
    style.paragraphSpacing = 8;
    assert('paragraphSpacing 读写', style.paragraphSpacing, 8);
    style.paragraphSpacingBefore = 2;
    assert('paragraphSpacingBefore 读写', style.paragraphSpacingBefore, 2);
    style.firstLineHeadIndent = 20;
    assert('firstLineHeadIndent 读写', style.firstLineHeadIndent, 20);
    style.headIndent = 10;
    assert('headIndent 读写', style.headIndent, 10);
    style.tailIndent = -16;
    assert('tailIndent 读写（负数是从右边量）', style.tailIndent, -16);
    style.lineBreakMode = 'byTruncatingTail';
    assert('lineBreakMode 读写', style.lineBreakMode, 'byTruncatingTail');
    style.minimumLineHeight = 22;
    assert('minimumLineHeight 读写', style.minimumLineHeight, 22);
    style.maximumLineHeight = 30;
    assert('maximumLineHeight 读写', style.maximumLineHeight, 30);
    style.lineHeightMultiple = 1.5;
    assert('lineHeightMultiple 读写', style.lineHeightMultiple, 1.5);
    style.baseWritingDirection = 'rightToLeft';
    assert('baseWritingDirection 读写', style.baseWritingDirection, 'rightToLeft');
    style.hyphenationFactor = 0.5;
    assert('hyphenationFactor 读写', style.hyphenationFactor, 0.5);
    style.defaultTabInterval = 28;
    assert('defaultTabInterval 读写', style.defaultTabInterval, 28);
    style.allowsDefaultTighteningForTruncation = true;
    assert('allowsDefaultTighteningForTruncation 写 true',
           style.allowsDefaultTighteningForTruncation, true);
    style.allowsDefaultTighteningForTruncation = false;
    assert('allowsDefaultTighteningForTruncation 写 false',
           style.allowsDefaultTighteningForTruncation, false);

    // @ts-expect-error 字符串按数转
    style.lineSpacing = '5';
    assert('lineSpacing 给 "5"：按数转', style.lineSpacing, 5);
    assert('alignment 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个取值
      style.alignment = 'middle';
    }, () => style.alignment), ENUM_IGNORED);
    assert('lineBreakMode 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个取值
      style.lineBreakMode = 'clip';
    }, () => style.lineBreakMode), ENUM_IGNORED);
    assert('baseWritingDirection 写错：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个取值
      style.baseWritingDirection = 'rtl';
    }, () => style.baseWritingDirection), ENUM_IGNORED);
    throws('lineSpacing 给转不成数的',
           // @ts-expect-error 要数
           () => { style.lineSpacing = 'wide'; }, 'lineSpacing');
    throws('lineSpacing 给负数',
           () => { style.lineSpacing = -1; }, 'non-negative');
    throws('hyphenationFactor 超出 0 到 1',
           () => { style.hyphenationFactor = 2; }, 'between 0 and 1');

    const frozen = style.copy();
    assert('段落样式 copy()：不可改', frozen instanceof NSMutableParagraphStyle, false);
    assert('copy()：值相同', frozen.headIndent, 10);
    const thawed = base.mutableCopy();
    assert('段落样式 mutableCopy()：可改', thawed instanceof NSMutableParagraphStyle, true);
    thawed.setParagraphStyle(style);
    assert('setParagraphStyle：全部抄过来', thawed.alignment + ',' + thawed.tailIndent, 'right,-16');
    throws('setParagraphStyle 给普通对象',
           // @ts-expect-error 要 NSParagraphStyle
           () => thawed.setParagraphStyle({ alignment: 'left' }), 'NSParagraphStyle');
  });

  // ===== 阴影和附件 =====
  group('阴影和附件', () => {
    const shadow = new NSShadow();
    assert('默认 shadowOffset', shadow.shadowOffset.width + ',' + shadow.shadowOffset.height, '0,0');
    assert('shadowOffset 是 CGSize', shadow.shadowOffset instanceof CGSize, true);
    assert('默认 shadowBlurRadius', shadow.shadowBlurRadius, 0);
    // 要验证的假设：头文件说默认颜色是三分之一不透明的黑色，读出来的写法没量过
    probe('默认 shadowColor', shadow.shadowColor);
    assert('默认 shadowColor 是一个字符串', typeof shadow.shadowColor, 'string');
    shadow.shadowOffset = { width: 2, height: 3 };
    assert('shadowOffset 读写（收普通对象）',
           shadow.shadowOffset.width + ',' + shadow.shadowOffset.height, '2,3');
    shadow.shadowBlurRadius = 4;
    assert('shadowBlurRadius 读写', shadow.shadowBlurRadius, 4);
    shadow.shadowColor = '#336699';
    assert('shadowColor 读写', shadow.shadowColor, '#336699');
    shadow.shadowColor = 'notacolor';
    assert('shadowColor 写错：不抛，保留原值', shadow.shadowColor, '#336699');
    shadow.shadowColor = null;
    assert('shadowColor 写 null', shadow.shadowColor, null);
    throws('shadowBlurRadius 给负数', () => { shadow.shadowBlurRadius = -1; }, 'non-negative');
    throws('shadowOffset 缺字段',
           // @ts-expect-error 少了 height
           () => { shadow.shadowOffset = { width: 1 }; }, 'height');

    const star = UIImage.systemImageNamed('star.fill');
    if (star === null) throw new Error('系统里没有 star.fill 这个图标');
    const blank = new NSTextAttachment();
    assert('new NSTextAttachment()：没有图片', blank.image, null);
    assert('默认 bounds 全是 0',
           [blank.bounds.x, blank.bounds.y, blank.bounds.width, blank.bounds.height].join(','),
           '0,0,0,0');
    assert('bounds 是 CGRect', blank.bounds instanceof CGRect, true);
    blank.image = star;
    assert('image 读写：读回来是同一个对象', blank.image, star);
    blank.bounds = new CGRect(0, -3, 18, 18);
    assert('bounds 读写',
           [blank.bounds.x, blank.bounds.y, blank.bounds.width, blank.bounds.height].join(','),
           '0,-3,18,18');
    blank.image = null;
    assert('image 写 null', blank.image, null);
    throws('image 给字符串',
           // @ts-expect-error 要 UIImage
           () => { blank.image = 'star.fill'; }, 'image');

    const attachment = NSTextAttachment.textAttachmentWithImage(star);
    assert('textAttachmentWithImage：是 NSTextAttachment',
           attachment instanceof NSTextAttachment, true);
    assert('它的 image 是给的那张', attachment.image, star);
    throws('textAttachmentWithImage 给 null',
           // @ts-expect-error 要 UIImage
           () => NSTextAttachment.textAttachmentWithImage(null), 'UIImage');

    const one = NSAttributedString.attributedStringWithAttachment(attachment);
    assert('attributedStringWithAttachment：长度 1', one.length, 1);
    assert('占位字符是 U+FFFC', one.string, '￼');
    assert('这个字符上的 attachment 就是给的那个', one.attributesAtIndex(0).attachment, attachment);
    assert('containsAttachmentsInRange：有', one.containsAttachmentsInRange(new NSRange(0, 1)), true);
    assert('containsAttachmentsInRange：没有',
           new NSAttributedString('abc').containsAttachmentsInRange(new NSRange(0, 3)), false);
    const withFont = NSAttributedString.attributedStringWithAttachment(attachment, {
      attributes: { font: font17 },
    });
    assert('attributedStringWithAttachment 带属性',
           Object.keys(withFont.attributesAtIndex(0)).sort().join(','), 'attachment,font');
    throws('attributedStringWithAttachment 给图片',
           // @ts-expect-error 要 NSTextAttachment
           () => NSAttributedString.attributedStringWithAttachment(star), 'NSTextAttachment');
  });

  // ===== 量尺寸 =====
  group('量尺寸', () => {
    const small = new NSAttributedString('Hello', { font: UIFont.systemFontOfSize(12) });
    const big = new NSAttributedString('Hello', { font: UIFont.systemFontOfSize(24) });
    const a = small.size();
    const b = big.size();
    assert('size() 给的是 CGSize', a instanceof CGSize, true);
    assert('有宽有高', a.width > 0 && a.height > 0, true);
    assert('字号大的量出来更宽更高', b.width > a.width && b.height > a.height, true);
    assert('空的富文本宽是 0', new NSAttributedString().size().width, 0);

    const long = new NSAttributedString(
      '这是一段很长的文字，一行放不下，要折成好几行才能排完。'.repeat(3), { font: font17 });
    const oneLine = long.size();
    const wrapped = long.boundingRectWithSize(new CGSize(200, Number.MAX_VALUE),
                                              { options: ['usesLineFragmentOrigin'] });
    assert('boundingRectWithSize 给的是 CGRect', wrapped instanceof CGRect, true);
    assert('限宽 200：宽不超过 200', wrapped.width > 0 && wrapped.width <= 200, true);
    assert('折行之后比一行高', wrapped.height > oneLine.height * 2, true);
    const leading = long.boundingRectWithSize(
      { width: 200, height: Number.MAX_VALUE },
      { options: ['usesLineFragmentOrigin', 'usesFontLeading'] });
    assert('收普通对象写的大小，选项可以给多个', leading.height >= wrapped.height, true);
    // macOS 上量到的：不带 usesLineFragmentOrigin 时按一行算，宽被限到给的宽
    const single = long.boundingRectWithSize(new CGSize(200, Number.MAX_VALUE));
    assert('不给 options：按一行算，高度和 size() 差不多',
           single.height < oneLine.height * 2, true);
    throws('boundingRectWithSize 的选项写错：列出能用的',
           // @ts-expect-error 没有这个取值
           () => long.boundingRectWithSize(new CGSize(200, 100), { options: ['multiline'] }),
           'usesLineFragmentOrigin');
    throws('options 给字符串而不是数组',
           // @ts-expect-error 要数组
           () => long.boundingRectWithSize(new CGSize(200, 100), { options: 'usesFontLeading' }),
           'array');
    throws('boundingRectWithSize 没给大小',
           // @ts-expect-error 少了 size
           () => long.boundingRectWithSize(), 'width');
  });

  // ===== UILabel =====
  group('UILabel.attributedText', () => {
    const label = new UILabel();
    // 第一遍验收里成立：没有内容的标签读出来是 null
    assert('没有内容时是 null', label.attributedText, null);

    const text = new NSMutableAttributedString('带样式', {
      foregroundColor: '#34c759', underlineStyle: ['single'],
    });
    label.attributedText = text;
    assert('标签：写了 attributedText，text 读出来是其中的文字', label.text, '带样式');
    const got = label.attributedText;
    assert('读回来是 NSAttributedString', got instanceof NSAttributedString, true);
    assert('标签：读回来的不可改', got instanceof NSMutableAttributedString, false);
    assert('标签：读回来的文字', got ? got.string : null, '带样式');
    assert('读回来的下划线还在',
           got ? (got.attributesAtIndex(0).underlineStyle || []).join(',') : '', 'single');
    assert('读回来的颜色还在', got ? got.attributesAtIndex(0).foregroundColor : '', '#34c759');

    // 标签拿走的是赋值那一刻的内容
    text.replaceCharactersInRange(new NSRange(0, 1), { withString: '不' });
    assert('之后再改富文本，标签上的不变', label.text, '带样式');

    // 实测（iPhone Air，iOS 27.2）：标签上再写 text，文字换了，原来富文本的
    // 样式**留着**——和输入框、文本视图不一样，那两个会把样式换掉
    label.text = '纯文字';
    const after = label.attributedText;
    assert('标签：再写 text：attributedText 的文字跟着变', after ? after.string : null, '纯文字');
    assert('标签：再写 text，原来的下划线还留着',
           after ? (after.attributesAtIndex(0).underlineStyle || []).join(',') : 'null', 'single');

    label.attributedText = text;
    label.attributedText = null;
    assert('标签：写 null：清空', label.attributedText, null);
    assert('写 null 之后 text 是 null', label.text, null);
    // 还没量过：清成 null 之后再写 text，样式是不是就没了。只把读到的打出来，
    // 量到之后改成断言
    label.text = '清过之后';
    // 类型检查按上面那次赋值把这个属性收窄成了 null，而写 text 会改它，所以转一下
    const cleared = /** @type {NSAttributedString | null} */ (label.attributedText);
    probe('标签先写 attributedText = null 再写 text，读回来的下划线',
          cleared === null ? 'attributedText 是 null'
            : JSON.stringify(cleared.attributesAtIndex(0).underlineStyle || '没有这个键'));

    throws('标签：给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => { label.attributedText = '纯文字'; }, 'attributedText');
    throws('给别的原生对象',
           // @ts-expect-error 要 NSAttributedString
           () => { label.attributedText = UIColor.redColor; }, 'NSAttributedString');
  });

  // ===== UITextField =====
  group('UITextField.attributedText / attributedPlaceholder', () => {
    const field = new UITextField();
    // 还不知道是哪一种：没输过内容时是 null，还是一个长度为 0 的富文本。
    // 两种都收，读到的打在 probe 那一行
    const initial = field.attributedText;
    probe('空输入框的 attributedText',
          initial === null ? 'null' : '长度 ' + initial.length + ' 的富文本');
    assert('空输入框：null 或者长度 0', initial === null || initial.length === 0, true);
    // 第一遍验收里成立：没设过占位文字时是 null
    assert('没设过 attributedPlaceholder 是 null', field.attributedPlaceholder, null);

    field.attributedText = new NSAttributedString('13800138000', { kern: 2, font: font17 });
    assert('输入框：写了 attributedText，text 读出来是其中的文字', field.text, '13800138000');
    const got = field.attributedText;
    assert('输入框：读回来的文字', got ? got.string : null, '13800138000');
    assert('读回来的 kern 还在', got ? got.attributesAtIndex(0).kern : -1, 2);
    field.text = '改了';
    const after = field.attributedText;
    assert('输入框：再写 text：attributedText 的文字跟着变', after ? after.string : null, '改了');
    // 还没量过：输入框上再写 text，原来的 kern 留不留（标签留着，文本视图不留）
    probe('输入框再写 text 之后，读回来的 kern',
          after === null ? 'attributedText 是 null' : String(after.attributesAtIndex(0).kern));

    field.attributedPlaceholder = new NSAttributedString('请输入手机号', {
      foregroundColor: 'systemOrange',
    });
    assert('写了 attributedPlaceholder，placeholder 读出来是其中的文字',
           field.placeholder, '请输入手机号');
    const hint = field.attributedPlaceholder;
    assert('占位文字读回来的颜色', hint ? hint.attributesAtIndex(0).foregroundColor : '',
           'systemOrange');
    field.placeholder = '换一句';
    const hintAfter = field.attributedPlaceholder;
    assert('再写 placeholder：attributedPlaceholder 的文字跟着变',
           hintAfter ? hintAfter.string : null, '换一句');
    field.attributedPlaceholder = null;
    assert('attributedPlaceholder 写 null', field.attributedPlaceholder, null);
    throws('attributedPlaceholder 给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => { field.attributedPlaceholder = '提示'; }, 'attributedPlaceholder');
  });

  // ===== UITextView =====
  group('UITextView.attributedText', () => {
    const view = new UITextView();
    // 还不知道是哪一种，同上
    const initial = view.attributedText;
    probe('空文本视图的 attributedText',
          initial === null ? 'null' : '长度 ' + initial.length + ' 的富文本');
    assert('空文本视图：null 或者长度 0', initial === null || initial.length === 0, true);

    const text = new NSMutableAttributedString('第一段\n第二段', { font: font17 });
    text.addAttribute('backgroundColor', { value: 'systemYellow', range: new NSRange(0, 3) });
    view.attributedText = text;
    assert('文本视图：写了 attributedText，text 读出来是其中的文字', view.text, '第一段\n第二段');
    const got = view.attributedText;
    assert('文本视图：读回来的不可改', got instanceof NSMutableAttributedString, false);
    assert('读回来的底色还在', got ? got.attributesAtIndex(0).backgroundColor : '', 'systemYellow');
    assert('范围外没有底色', got ? got.attributesAtIndex(4).backgroundColor : '', undefined);
    view.text = '纯文字';
    const after = view.attributedText;
    assert('文本视图：再写 text：attributedText 的文字跟着变', after ? after.string : null, '纯文字');
    assert('再写 text：底色没了', after ? after.attributesAtIndex(0).backgroundColor : '', undefined);
    view.attributedText = null;
    assert('文本视图：写 null：清空', view.text, '');
    throws('文本视图：给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => { view.attributedText = '纯文字'; }, 'attributedText');
  });

  // ===== UIButton =====
  group('UIButton 按状态的富文本标题', () => {
    const button = UIButton.buttonWithType('system');
    assert('没设过：attributedTitleForState 是 null', button.attributedTitleForState('normal'), null);
    assert('没设过：currentAttributedTitle 是 null', button.currentAttributedTitle, null);

    const normal = new NSAttributedString('提交', { font: bold20, foregroundColor: 'systemBlue' });
    const pressed = new NSAttributedString('提交', { font: bold20, foregroundColor: 'systemGray' });
    button.setAttributedTitle(normal, { forState: ['normal'] });
    button.setAttributedTitle(pressed, { forState: ['highlighted'] });
    const gotNormal = button.attributedTitleForState('normal');
    const gotPressed = button.attributedTitleForState('highlighted');
    assert('normal 的读回来内容相同',
           gotNormal !== null && gotNormal.isEqualToAttributedString(normal), true);
    assert('highlighted 的读回来内容相同',
           gotPressed !== null && gotPressed.isEqualToAttributedString(pressed), true);
    // 实测：没单独设过的状态读到的是 normal 的那个，和 titleForState() 一样
    const gotDisabled = button.attributedTitleForState('disabled');
    assert('没单独设的状态读到的是 normal 的那个',
           gotDisabled !== null && gotDisabled.isEqualToAttributedString(normal), true);
    const current = button.currentAttributedTitle;
    assert('currentAttributedTitle 是 normal 的那个',
           current !== null && current.isEqualToAttributedString(normal), true);
    // 第一遍验收里成立：设了富文本标题，没设过纯文字标题时 titleForState 还是 null
    assert('titleForState 不受影响', button.titleForState('normal'), null);

    button.setAttributedTitle(null, { forState: ['highlighted'] });
    const gotCleared = button.attributedTitleForState('highlighted');
    assert('写 null：去掉这个状态的，读到的回到 normal 的那个',
           gotCleared !== null && gotCleared.isEqualToAttributedString(normal), true);

    throws('setAttributedTitle 没给 forState',
           // @ts-expect-error 少了 forState
           () => button.setAttributedTitle(normal), 'forState');
    throws('setAttributedTitle 的状态写错',
           // @ts-expect-error 没有这个状态
           () => button.setAttributedTitle(normal, { forState: ['pressed'] }), 'highlighted');
    throws('setAttributedTitle 给字符串',
           // @ts-expect-error 要 NSAttributedString
           () => button.setAttributedTitle('提交', { forState: ['normal'] }), 'NSAttributedString');
    throws('attributedTitleForState 的状态写错',
           // @ts-expect-error 没有这个状态
           () => button.attributedTitleForState('pressed'), 'highlighted');
    throws('currentAttributedTitle 是只读的',
           // @ts-expect-error 只读
           () => { button.currentAttributedTitle = normal; }, 'currentAttributedTitle');
  });

  // ===== 屏幕上看得见的五行 =====
  group('界面', () => {
    const column = new UIStackView();
    column.axis = 'vertical';
    column.spacing = 8;
    column.alignment = 'leading';
    column.translatesAutoresizingMaskIntoConstraints = false;
    host.addSubview(column);
    NSLayoutConstraint.activateConstraints([
      column.topAnchor.constraintEqualToAnchor(host.topAnchor),
      column.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
      column.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    ]);

    // 1. 一行里几种颜色和字号，原价带删除线
    const price = new NSMutableAttributedString('到手价 ', {
      font: UIFont.systemFontOfSize(15), foregroundColor: 'label',
    });
    price.appendAttributedString(new NSAttributedString('¥128', {
      font: UIFont.boldSystemFontOfSize(26), foregroundColor: 'systemRed',
    }));
    price.appendAttributedString(new NSAttributedString('  ¥199', {
      font: UIFont.systemFontOfSize(13), foregroundColor: 'secondaryLabel',
      strikethroughStyle: ['single'],
    }));
    const priceLabel = new UILabel();
    priceLabel.attributedText = price;
    column.addArrangedSubview(priceLabel);

    // 2. 下划线：实线、双线、虚线、带颜色的
    //
    // 两处是照原生探针量到的事实摆的（见实现原理「下划线在屏幕上的样子」）：
    // - 标签只有固有高度（17 pt 的字是 20.33 pt）时，双线靠下的那一条画在范围
    //   外面，看不见。所以给这个标签一个更高的高度
    // - 虚线的一划大约一个汉字宽，两个字下面只有两划，一眼看去像实线。所以
    //   虚线那一段写长一点
    const lines = new NSMutableAttributedString('实线 双线 虚线虚线虚线 红色粗线', { font: font17 });
    lines.addAttribute('underlineStyle', { value: ['single'], range: new NSRange(0, 2) });
    lines.addAttribute('underlineStyle', { value: ['double'], range: new NSRange(3, 2) });
    lines.addAttribute('underlineStyle',
                       { value: ['single', 'patternDash'], range: new NSRange(6, 6) });
    lines.addAttributes({ underlineStyle: ['thick'], underlineColor: 'systemRed' },
                        { range: new NSRange(13, 4) });
    const linesLabel = new UILabel();
    linesLabel.attributedText = lines;
    column.addArrangedSubview(linesLabel);
    NSLayoutConstraint.activateConstraints([linesLabel.heightAnchor.constraintEqualToConstant(28)]);

    // 3. 图片附件：文字中间一颗星
    const star = UIImage.systemImageNamed('star.fill');
    if (star === null) throw new Error('系统里没有 star.fill 这个图标');
    const attachment = NSTextAttachment.textAttachmentWithImage(star);
    attachment.bounds = new CGRect(0, -3, 18, 18);
    const rated = new NSMutableAttributedString('评分 ', { font: font17 });
    rated.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
    rated.appendAttributedString(new NSAttributedString(' 4.8，字距拉开的字', {
      font: font17, kern: 3,
    }));
    const ratedLabel = new UILabel();
    ratedLabel.attributedText = rated;
    column.addArrangedSubview(ratedLabel);

    // 4. 段落样式：居中、行距 8、带阴影
    const style = new NSMutableParagraphStyle();
    style.alignment = 'center';
    style.lineSpacing = 8;
    const shadow = new NSShadow();
    shadow.shadowOffset = new CGSize(0, 1);
    shadow.shadowBlurRadius = 2;
    shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';
    const paragraph = new NSAttributedString('居中的两行，行距 8\n第二行，带一点阴影', {
      font: font17, paragraphStyle: style, shadow, backgroundColor: 'secondarySystemBackground',
    });
    const paragraphLabel = new UILabel();
    paragraphLabel.numberOfLines = 0;
    paragraphLabel.attributedText = paragraph;
    column.addArrangedSubview(paragraphLabel);
    paragraphLabel.widthAnchor.constraintEqualToAnchor(column.widthAnchor).isActive = true;

    // 5. 按钮：富文本标题，空心字
    const button = UIButton.buttonWithType('system');
    button.setAttributedTitle(new NSAttributedString('空心字的按钮', {
      font: UIFont.boldSystemFontOfSize(22), strokeWidth: 3, strokeColor: 'systemIndigo',
    }), { forState: ['normal'] });
    column.addArrangedSubview(button);

    assert('界面上放了五行', column.arrangedSubviews.length, 5);
    console.log('✓ 屏幕上（要人看）：① 「到手价」黑色小字、「¥128」红色大字、「¥199」灰色带删除线；' +
                '② 四段下划线依次是实线、双线、虚线、红色粗线；③ 「评分」后面一颗星，后半句字距拉开；' +
                '④ 两行居中、行距明显、浅灰底、有阴影；⑤ 一个空心字的按钮');
  });
}
