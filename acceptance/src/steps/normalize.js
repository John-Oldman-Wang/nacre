// String.prototype.normalize：把字符串换成 Unicode 的四种规范形式之一。
//
// 预编译的 V8 不带 ICU，它自己的 normalize 把字符串原样返回、不报错。这一步验的是
// 运行时换上去的那一个：同一组用例在这台设备的网页里和运行时里各跑一遍，逐条比对。
import { intlRunCase } from './intl-number-cases.js';
import { normalizeCases } from './normalize-cases.js';
import { compareWithWebPage } from './intl-compare.js';

const hex = (/** @type {string} */ s) =>
  Array.from({ length: s.length }, (_, i) => s.charCodeAt(i).toString(16)).join(' ');

/** @param {import("../main.js").StepContext} ctx */
export function stepNormalize(ctx) {
  const { assert } = ctx;
  const host = ctx.section('String.prototype.normalize：和网页逐条比对', 44);
  console.log('  --- String.prototype.normalize ---');

  const status = new UILabel();
  status.frame = new CGRect(16, 8, 340, 28);
  status.font = UIFont.systemFontOfSize(13);
  status.textColor = 'secondaryLabel';
  status.text = '还没开始比对';
  host.addSubview(status);

  // ===== 1. 不用网页也能验的：固定的期望值 =====
  // 期望值是 Unicode 标准定的（UAX #15），不随系统变。写成码元的十六进制。
  const literal = (/** @type {string} */ label, /** @type {() => unknown} */ fn,
                   /** @type {string} */ expected) => assert(label, intlRunCase(fn), expected);
  literal('NFD 把 é 拆成 e + 组合记号', () => hex('é'.normalize('NFD')), '65 301');
  literal('不传形式是 NFC：e + 组合记号合成 é', () => hex('é'.normalize()), 'e9');
  literal('拆开之后长度变了', () => 'é'.normalize('NFD').length, '2');
  literal('两种写法规范化之后相等', () => 'café'.normalize() === 'café'.normalize(), 'true');
  literal('NFC 不动连字 ﬁ', () => hex('ﬁ'.normalize('NFC')), 'fb01');
  literal('NFKC 把连字 ﬁ 拆成 f、i', () => hex('ﬁ'.normalize('NFKC')), '66 69');
  literal('NFKD 把带圈的 ① 换成 1', () => hex('①'.normalize('NFKD')), '31');
  literal('NFKC 把半角片假名换成全角', () => hex('ｱ'.normalize('NFKC')), '30a2');
  literal('NFC 把假名和浊点合成一个字', () => hex('が'.normalize('NFC')), '304c');
  literal('NFC 把埃的符号换成字母 Å', () => hex('Å'.normalize('NFC')), 'c5');
  literal('NFD 把谚文音节拆成三个字母', () => hex('한'.normalize('NFD')), '1112 1161 11ab');
  literal('NFC 把三个谚文字母拼成音节', () => hex('한'.normalize('NFC')), 'd55c');
  literal('组合记号按规定的次序重排', () => hex('q̣̇'.normalize('NFC')), '71 323 307');
  literal('兼容汉字换成统一的那个字', () => hex('豈'.normalize('NFC')), '8c48');
  literal('不许合成的字拆开之后不再合回去', () => hex('क़'.normalize('NFC')), '915 93c');
  // UAX #15 里的那个例子：四种形式各不相同
  literal('ẛ̣ 的 NFC', () => hex('ẛ̣'.normalize('NFC')), '1e9b 323');
  literal('ẛ̣ 的 NFD', () => hex('ẛ̣'.normalize('NFD')), '17f 323 307');
  literal('ẛ̣ 的 NFKC', () => hex('ẛ̣'.normalize('NFKC')), '1e69');
  literal('ẛ̣ 的 NFKD', () => hex('ẛ̣'.normalize('NFKD')), '73 323 307');
  literal('表情（基本平面之外的字）原样', () => hex('😀'.normalize('NFKD')), 'd83d de00');
  literal('落单的代理项留着，两边照常合成', () => hex('é\ud800é'.normalize('NFC')), 'e9 d800 e9');
  literal('空字符留着，两边照常合成', () => hex('é\u0000é'.normalize('NFC')), 'e9 0 e9');
  literal('纯 ASCII 原样返回', () => 'hello'.normalize('NFKD'), 'hello');
  literal('空串', () => ''.normalize('NFD').length, '0');
  // 形式的类型在 TypeScript 自带的定义里就是 string，写错了类型检查不报，只有运行时抛
  literal('不认识的形式抛 RangeError', () => 'a'.normalize('NFX'), '抛 RangeError');
  literal('形式分大小写', () => 'a'.normalize('nfc'), '抛 RangeError');
  literal('this 是 null 抛 TypeError', () => String.prototype.normalize.call(null), '抛 TypeError');
  literal('this 不是字符串时先转成字符串', () => String.prototype.normalize.call(123, 'NFD'), '123');
  // 数字和日期那两步的入口还在
  literal('Intl.NumberFormat 没被这一步弄坏', () => new Intl.NumberFormat('de-DE').format(1234.5), '1.234,5');

  // ===== 2. 和网页逐条比对 =====
  compareWithWebPage({
    after: ctx.quiet,
    assert, host, status, name: 'String.prototype.normalize', casesFn: normalizeCases,
    classify(label) {
      const parts = label.split('|');
      const kind = parts[0];
      return {
        key: 'normalize 和网页一致：' +
          (kind === 'W' ? '挑出来的词 ' + parts[1]
           : kind === 'S' ? '逐个码位扫 ' + parts[1]
           : kind === 'C' ? '基字 + 组合记号 ' + parts[1]
           : kind === 'H' ? '谚文字母和音节'
           : kind === 'X' ? '落单的代理项、空字符、很长的字符串'
           : '参数和 this 不合法时'),
      };
    },
  });
}
