// Web 标准的五个全局：TextEncoder、TextDecoder、atob、btoa、structuredClone。
//
// V8 只实现语言本身，这几样要运行时自己补。很多 npm 包一引入就调它们。
// 这一步分两段：固定期望值的断言（每个成员的正常用法、每一种出错情况、每一条
// 明确不支持的），以及同一张用例表在这台设备的网页里和运行时里各跑一遍、逐条比对。
import { intlRunCase } from './intl-number-cases.js';
import { webGlobalsCases, WEB_GLOBALS_OURS } from './web-globals-cases.js';
import { compareWithWebPage } from './intl-compare.js';

// 字节写成十六进制（'e4 bd a0'），字符串写成码元的十六进制（'4f60 597d'）：
// U+FFFD、BOM、落单的代理项直接看是分不出来的
const hex = (/** @type {ArrayLike<number>} */ bytes) =>
  Array.from(bytes, (b) => (b + 0x100).toString(16).slice(1)).join(' ');
const units = (/** @type {string} */ s) =>
  Array.from({ length: s.length }, (_, i) => s.charCodeAt(i).toString(16)).join(' ');
const bytes = (/** @type {number[]} */ ...list) => new Uint8Array(list);

/** @param {import("../main.js").StepContext} ctx */
export function stepWebGlobals(ctx) {
  const { assert } = ctx;
  const host = ctx.section('TextEncoder / TextDecoder / atob / btoa / structuredClone：和网页逐条比对', 44);
  console.log('  --- Web 标准的五个全局：TextEncoder、TextDecoder、atob、btoa、structuredClone ---');

  const status = new UILabel();
  status.frame = new CGRect(16, 8, 340, 28);
  status.font = UIFont.systemFontOfSize(13);
  status.textColor = 'secondaryLabel';
  status.text = '还没开始比对';
  host.addSubview(status);

  // 期望值是标准定的（WHATWG Encoding、HTML 的 forgiving-base64 和结构化克隆），不随系统变。
  // 抛异常的写成「抛 <name>」。
  const literal = (/** @type {string} */ label, /** @type {() => unknown} */ fn,
                   /** @type {string} */ expected) => assert(label, intlRunCase(fn), expected);
  // 抛出来的那个错：名字、是不是 Error、信息里有没有某个词
  const failure = (/** @type {() => unknown} */ fn) => {
    try { fn(); } catch (e) { return /** @type {Error} */ (e); }
    return new Error('(did not throw)');
  };

  // =====================================================================
  // 1. TextEncoder
  console.log('  --- TextEncoder ---');
  const encoder = new TextEncoder();
  literal('TextEncoder 和 TextDecoder 都是函数', () => typeof TextEncoder + ' ' + typeof TextDecoder, 'function function');
  literal('TextEncoder 的 encoding 是 utf-8', () => encoder.encoding, 'utf-8');
  // @ts-expect-error encoding 只读
  literal('TextEncoder 的 encoding 只读，写它抛 TypeError', () => { encoder.encoding = 'utf-16'; }, '抛 TypeError');
  // @ts-expect-error 类不能不带 new 调用
  literal('TextEncoder 不带 new 调用抛 TypeError', () => TextEncoder(), '抛 TypeError');
  literal('TextEncoder 的 toString 标签', () => Object.prototype.toString.call(encoder), '[object TextEncoder]');
  literal('encode：ASCII 一个字符一个字节', () => hex(encoder.encode('abc')), '61 62 63');
  literal('encode：带重音的字母两个字节', () => hex(encoder.encode('é')), 'c3 a9');
  literal('encode：汉字三个字节', () => hex(encoder.encode('你好')), 'e4 bd a0 e5 a5 bd');
  literal('encode：表情四个字节', () => hex(encoder.encode('😀')), 'f0 9f 98 80');
  literal('encode：空字符照常编码', () => hex(encoder.encode('a\u0000b')), '61 00 62');
  literal('encode 返回的是 Uint8Array', () => encoder.encode('a') instanceof Uint8Array, 'true');
  literal('encode 每次返回一个新的数组', () => encoder.encode('a') !== encoder.encode('a'), 'true');
  literal('encode 不给参数是空的', () => encoder.encode().length, '0');
  literal('encode(undefined) 也是空的', () => encoder.encode(undefined).length, '0');
  // @ts-expect-error 参数要的是字符串
  literal('encode(null) 按字符串转成 "null"', () => hex(encoder.encode(null)), '6e 75 6c 6c');
  // @ts-expect-error 参数要的是字符串
  literal('encode 给数字，按字符串转', () => hex(encoder.encode(12.5)), '31 32 2e 35');
  // @ts-expect-error 参数要的是字符串
  literal('encode 给 Symbol 抛 TypeError', () => encoder.encode(Symbol('s')), '抛 TypeError');
  literal('encode：落单的高位代理项换成 U+FFFD 的三个字节', () => hex(encoder.encode('\ud800')), 'ef bf bd');
  literal('encode：落单的低位代理项也换成 U+FFFD', () => hex(encoder.encode('\udc00')), 'ef bf bd');
  literal('encode：夹在中间的落单代理项，两边照常',
          () => hex(encoder.encode('a\ud800b')), '61 ef bf bd 62');
  literal('encode：顺序反了的一对代理项是两个落单的',
          () => hex(encoder.encode('\ude00\ud83d')), 'ef bf bd ef bf bd');
  literal('encode：很长的字符串', () => encoder.encode('a你😀'.repeat(5000)).length, '40000');

  const into = (/** @type {string} */ text, /** @type {number} */ capacity) => {
    const dest = new Uint8Array(capacity).fill(0xaa);
    const r = encoder.encodeInto(text, dest);
    return r.read + ',' + r.written + '|' + hex(dest);
  };
  literal('encodeInto：放得下，read 是码元数、written 是字节数', () => into('a你', 6), '2,4|61 e4 bd a0 aa aa');
  literal('encodeInto：放不下时不写半个字', () => into('你好', 5), '1,3|e4 bd a0 aa aa');
  literal('encodeInto：表情要四个字节，只有三个字节的空位时一个都不写', () => into('😀', 3), '0,0|aa aa aa');
  literal('encodeInto：表情算两个码元', () => into('a😀b', 6), '4,6|61 f0 9f 98 80 62');
  literal('encodeInto：容量是 0', () => into('abc', 0), '0,0|');
  literal('encodeInto：空串', () => into('', 2), '0,0|aa aa');
  literal('encodeInto：落单的代理项写成 U+FFFD', () => into('a\ud800', 4), '2,4|61 ef bf bd');
  literal('encodeInto：只写在子视图覆盖的那一段', () => {
    const whole = new Uint8Array(8).fill(0xaa);
    const r = encoder.encodeInto('你好', whole.subarray(2, 6));
    return r.read + ',' + r.written + '|' + hex(whole);
  }, '1,3|aa aa e4 bd a0 aa aa aa');
  literal('encodeInto 返回的对象只有 read 和 written',
          () => Object.keys(encoder.encodeInto('a', new Uint8Array(1))).join(','), 'read,written');
  // @ts-expect-error 目标必须是 Uint8Array
  literal('encodeInto 的目标是 Uint8ClampedArray：抛 TypeError', () => encoder.encodeInto('a', new Uint8ClampedArray(4)), '抛 TypeError');
  // @ts-expect-error 目标必须是 Uint8Array
  literal('encodeInto 的目标是 ArrayBuffer：抛 TypeError', () => encoder.encodeInto('a', new ArrayBuffer(4)), '抛 TypeError');
  // @ts-expect-error 目标必须是 Uint8Array
  literal('encodeInto 的目标是 DataView：抛 TypeError', () => encoder.encodeInto('a', new DataView(new ArrayBuffer(4))), '抛 TypeError');
  // @ts-expect-error 目标必须是 Uint8Array
  literal('encodeInto 的目标是普通数组：抛 TypeError', () => encoder.encodeInto('a', [0, 0]), '抛 TypeError');
  // @ts-expect-error 少了目标
  literal('encodeInto 不给目标：抛 TypeError', () => encoder.encodeInto('a'), '抛 TypeError');
  literal('encode 在别的对象上调用：抛 TypeError', () => TextEncoder.prototype.encode.call({}, 'a'), '抛 TypeError');

  // =====================================================================
  // 2. TextDecoder：构造
  console.log('  --- TextDecoder ---');
  const decoder = new TextDecoder();
  literal('TextDecoder 的默认值', () => decoder.encoding + ' ' + decoder.fatal + ' ' + decoder.ignoreBOM, 'utf-8 false false');
  // @ts-expect-error 类不能不带 new 调用
  literal('TextDecoder 不带 new 调用抛 TypeError', () => TextDecoder(), '抛 TypeError');
  literal('TextDecoder 的 toString 标签', () => Object.prototype.toString.call(decoder), '[object TextDecoder]');
  // @ts-expect-error fatal 只读
  literal('TextDecoder 的 fatal 只读，写它抛 TypeError', () => { decoder.fatal = true; }, '抛 TypeError');
  // @ts-expect-error ignoreBOM 只读
  literal('TextDecoder 的 ignoreBOM 只读，写它抛 TypeError', () => { decoder.ignoreBOM = true; }, '抛 TypeError');
  // @ts-expect-error encoding 只读
  literal('TextDecoder 的 encoding 只读，写它抛 TypeError', () => { decoder.encoding = 'gbk'; }, '抛 TypeError');
  for (const label of ['utf-8', 'utf8', 'unicode-1-1-utf-8', 'UTF-8', 'Utf8', '  utf-8\n', '\tUTF8 ']) {
    literal('标签 ' + JSON.stringify(label) + ' 认成 utf-8', () => new TextDecoder(label).encoding, 'utf-8');
  }
  for (const label of ['utf-16le', 'utf-16', 'gbk', 'latin1', 'ascii', 'shift_jis', '', 'utf 8', 'nope']) {
    literal('标签 ' + JSON.stringify(label) + ' 抛 RangeError', () => new TextDecoder(label), '抛 RangeError');
  }
  {
    const error = failure(() => new TextDecoder('gbk'));
    assert('不支持的编码：报错里写了它的名字', error.message.includes('gbk'), true);
    assert('不支持的编码：报错里列出了支持的', error.message.includes('utf-8'), true);
  }
  // @ts-expect-error 标签要的是字符串
  literal('标签给 null：按字符串转成 "null"，不认，抛 RangeError', () => new TextDecoder(null), '抛 RangeError');
  literal('标签给 undefined：用默认的 utf-8', () => new TextDecoder(undefined).encoding, 'utf-8');
  literal('fatal 和 ignoreBOM 都给 true',
          () => { const d = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }); return d.fatal + ' ' + d.ignoreBOM; },
          'true true');
  // @ts-expect-error 选项要的是布尔
  literal('fatal 按布尔转换：1 是 true', () => new TextDecoder('utf-8', { fatal: 1 }).fatal, 'true');
  // @ts-expect-error 选项要的是布尔
  literal('fatal 按布尔转换：字符串 "false" 是 true', () => new TextDecoder('utf-8', { fatal: 'false' }).fatal, 'true');
  // @ts-expect-error 选项要的是布尔
  literal('ignoreBOM 按布尔转换：0 是 false', () => new TextDecoder('utf-8', { ignoreBOM: 0 }).ignoreBOM, 'false');
  literal('fatal 给 undefined 视为没带', () => new TextDecoder('utf-8', { fatal: undefined }).fatal, 'false');
  // @ts-expect-error options 不能是 null（类型上），运行时视为空对象
  literal('构造的 options 给 null 视为空对象', () => new TextDecoder('utf-8', null).fatal, 'false');
  // @ts-expect-error options 要的是对象
  literal('构造的 options 给数字：抛 TypeError', () => new TextDecoder('utf-8', 5), '抛 TypeError');

  // =====================================================================
  // 3. TextDecoder.decode：输入的各种类型
  const sample = bytes(0x41, 0xe4, 0xbd, 0xa0, 0xf0, 0x9f, 0x98, 0x80, 0x5a);   // A你😀Z
  literal('decode：Uint8Array', () => decoder.decode(sample), 'A你😀Z');
  literal('decode：ArrayBuffer', () => decoder.decode(sample.buffer), 'A你😀Z');
  literal('decode：DataView', () => decoder.decode(new DataView(sample.buffer)), 'A你😀Z');
  literal('decode：带偏移的子视图只读它覆盖的那一段', () => decoder.decode(sample.subarray(1, 8)), '你😀');
  literal('decode：DataView 带偏移和长度', () => decoder.decode(new DataView(sample.buffer, 1, 3)), '你');
  literal('decode：建在缓冲区中间的 Uint8Array', () => decoder.decode(new Uint8Array(sample.buffer, 4, 4)), '😀');
  literal('decode：Uint16Array 按它底下的字节读',
          () => decoder.decode(new Uint16Array(bytes(0x61, 0x62, 0x63, 0x64).buffer)), 'abcd');
  literal('decode：Int8Array', () => decoder.decode(new Int8Array(sample.buffer)), 'A你😀Z');
  literal('decode 不给参数是空串', () => decoder.decode().length, '0');
  literal('decode(undefined) 也是空串', () => decoder.decode(undefined).length, '0');
  literal('decode：空的数组', () => decoder.decode(new Uint8Array(0)).length, '0');
  // @ts-expect-error 输入要的是缓冲区或者视图
  literal('decode 给字符串：抛 TypeError', () => decoder.decode('abc'), '抛 TypeError');
  // @ts-expect-error 输入要的是缓冲区或者视图
  literal('decode 给数字：抛 TypeError', () => decoder.decode(65), '抛 TypeError');
  // @ts-expect-error 输入要的是缓冲区或者视图
  literal('decode 给普通数组：抛 TypeError', () => decoder.decode([65, 66]), '抛 TypeError');
  // @ts-expect-error 输入要的是缓冲区或者视图
  literal('decode 给 null：抛 TypeError', () => decoder.decode(null), '抛 TypeError');
  // @ts-expect-error options 要的是对象
  literal('decode 的 options 给数字：抛 TypeError', () => decoder.decode(sample, 5), '抛 TypeError');
  // @ts-expect-error options 不能是 null（类型上），运行时视为空对象
  literal('decode 的 options 给 null 视为空对象', () => decoder.decode(sample, null), 'A你😀Z');
  literal('decode 在别的对象上调用：抛 TypeError', () => TextDecoder.prototype.decode.call({}), '抛 TypeError');
  if (typeof SharedArrayBuffer === 'function') {
    literal('decode：SharedArrayBuffer 和建在它上面的视图', () => {
      const shared = new SharedArrayBuffer(4);
      new Uint8Array(shared).set([0x61, 0x62, 0x63, 0x64]);
      return decoder.decode(shared) + ' ' + decoder.decode(new Uint8Array(shared, 1, 2));
    }, 'abcd bc');
  } else {
    console.log('  ! 这个运行时没有 SharedArrayBuffer，那一条未验证');
  }
  literal('decode 不改输入', () => { const b = bytes(0xef, 0xbb, 0xbf, 0x41, 0xff); decoder.decode(b); return hex(b); },
          'ef bb bf 41 ff');

  // =====================================================================
  // 4. TextDecoder.decode：非法的字节序列换成 U+FFFD，换几个照 WHATWG 的算法
  const decoded = (/** @type {number[]} */ ...list) => units(decoder.decode(bytes(...list)));
  literal('从来不合法的字节 ff：一个 U+FFFD', () => decoded(0xff), 'fffd');
  literal('落单的后续字节 80：一个 U+FFFD', () => decoded(0x41, 0x80, 0x42), '41 fffd 42');
  literal('三字节的序列只给了两个就结束：一个 U+FFFD（最大有效前缀算一个）', () => decoded(0xe4, 0xbd), 'fffd');
  literal('四字节的序列只给了三个就结束：一个 U+FFFD', () => decoded(0xf0, 0x9f, 0x98), 'fffd');
  literal('截断之后接 ASCII：一个 U+FFFD，后面的字符照常', () => decoded(0xe4, 0xbd, 0x41), 'fffd 41');
  literal('截断之后接另一个完整的字：那个字照常', () => decoded(0xe4, 0xbd, 0xe4, 0xbd, 0xa0), 'fffd 4f60');
  literal('过长编码 c0 af：两个 U+FFFD（c0 从来不合法）', () => decoded(0xc0, 0xaf), 'fffd fffd');
  literal('过长编码 e0 80 af：三个 U+FFFD', () => decoded(0xe0, 0x80, 0xaf), 'fffd fffd fffd');
  literal('过长编码 f0 80 80 80：四个 U+FFFD', () => decoded(0xf0, 0x80, 0x80, 0x80), 'fffd fffd fffd fffd');
  literal('代理项范围 ed a0 80：三个 U+FFFD', () => decoded(0xed, 0xa0, 0x80), 'fffd fffd fffd');
  literal('代理项范围之前的 ed 9f bf 合法', () => decoded(0xed, 0x9f, 0xbf), 'd7ff');
  literal('超出 U+10FFFF 的 f4 90 80 80：四个 U+FFFD', () => decoded(0xf4, 0x90, 0x80, 0x80), 'fffd fffd fffd fffd');
  literal('最大的码点 f4 8f bf bf 合法', () => decoded(0xf4, 0x8f, 0xbf, 0xbf), 'dbff dfff');
  literal('f5 开头的：每个字节一个 U+FFFD', () => decoded(0xf5, 0x80, 0x80, 0x80), 'fffd fffd fffd fffd');
  literal('首字节后面接首字节：前一个算一个 U+FFFD', () => decoded(0xc2, 0xc3, 0xa9), 'fffd e9');
  literal('各个长度的边界都合法',
          () => decoded(0x7f, 0xc2, 0x80, 0xdf, 0xbf, 0xe0, 0xa0, 0x80, 0xef, 0xbf, 0xbf, 0xf0, 0x90, 0x80, 0x80),
          '7f 80 7ff 800 ffff d800 dc00');

  const strict = new TextDecoder('utf-8', { fatal: true });
  literal('fatal：合法的输入照常解', () => strict.decode(sample), 'A你😀Z');
  literal('fatal：非法的字节抛 TypeError', () => strict.decode(bytes(0x41, 0xff)), '抛 TypeError');
  literal('fatal：结尾截断抛 TypeError', () => strict.decode(bytes(0xe4, 0xbd)), '抛 TypeError');
  literal('fatal：过长编码抛 TypeError', () => strict.decode(bytes(0xc0, 0xaf)), '抛 TypeError');
  literal('fatal：代理项范围抛 TypeError', () => strict.decode(bytes(0xed, 0xa0, 0x80)), '抛 TypeError');
  literal('fatal：抛过之后同一个解码器还能用', () => strict.decode(bytes(0xe4, 0xbd, 0xa0)), '你');
  assert('fatal 抛的是 TypeError 的实例', failure(() => strict.decode(bytes(0xff))) instanceof TypeError, true);

  // BOM
  literal('开头的 BOM 默认去掉', () => decoded(0xef, 0xbb, 0xbf, 0x41), '41');
  literal('只有 BOM：空串', () => decoded(0xef, 0xbb, 0xbf), '');
  literal('两个 BOM：只去掉第一个', () => decoded(0xef, 0xbb, 0xbf, 0xef, 0xbb, 0xbf, 0x41), 'feff 41');
  literal('不在开头的 BOM 留着', () => decoded(0x41, 0xef, 0xbb, 0xbf), '41 feff');
  literal('ignoreBOM 为真：开头的 BOM 留着',
          () => units(new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes(0xef, 0xbb, 0xbf, 0x41))), 'feff 41');
  literal('fatal 不影响去 BOM', () => units(strict.decode(bytes(0xef, 0xbb, 0xbf, 0x41))), '41');
  literal('同一个解码器解两次：每次都去 BOM',
          () => decoded(0xef, 0xbb, 0xbf, 0x41) + '|' + decoded(0xef, 0xbb, 0xbf, 0x42), '41|42');

  // 分段
  literal('stream：一个字切成两段，第一段不出字、第二段出', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0xe4, 0xbd), { stream: true })) + '/' + units(d.decode(bytes(0xa0), { stream: true }));
  }, '/4f60');
  literal('stream：表情一个字节一段', () => {
    const d = new TextDecoder();
    return [0xf0, 0x9f, 0x98, 0x80].map((b) => units(d.decode(bytes(b), { stream: true }))).join('/') + '/' + units(d.decode());
  }, '///d83d de00/');
  literal('stream：最后不带 stream 调一次，没凑齐的冲成一个 U+FFFD', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0x41, 0xe4, 0xbd), { stream: true })) + '/' + units(d.decode());
  }, '41/fffd');
  literal('stream：不带 stream 的那次带着数据，接在没凑齐的后面', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0xe4, 0xbd), { stream: true })) + '/' + units(d.decode(bytes(0xa0, 0x41)));
  }, '/4f60 41');
  literal('stream：没凑齐的后面接不上，一个 U+FFFD 再照常', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0xe4, 0xbd), { stream: true })) + '/' + units(d.decode(bytes(0x41), { stream: true }));
  }, '/fffd 41');
  literal('stream：BOM 切在两段里也去掉', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0xef, 0xbb), { stream: true })) + '/' + units(d.decode(bytes(0xbf, 0x41), { stream: true }));
  }, '/41');
  literal('stream：同一个流后面几段里的 BOM 留着', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0x41), { stream: true })) + '/' + units(d.decode(bytes(0xef, 0xbb, 0xbf), { stream: true }));
  }, '41/feff');
  literal('stream：冲完之后是新的一个流，BOM 又去掉', () => {
    const d = new TextDecoder();
    d.decode(bytes(0xef, 0xbb, 0xbf, 0x41), { stream: true });
    d.decode();
    return units(d.decode(bytes(0xef, 0xbb, 0xbf, 0x42)));
  }, '42');
  literal('stream：空的一段不动没凑齐的', () => {
    const d = new TextDecoder();
    return units(d.decode(bytes(0xe4), { stream: true })) + '/' + units(d.decode(undefined, { stream: true })) + '/' +
           units(d.decode(bytes(0xbd, 0xa0), { stream: true }));
  }, '//4f60');
  literal('stream：在每一个位置切开，拼起来都等于一次解完', () => {
    const all = bytes(0xef, 0xbb, 0xbf, 0x41, 0xc3, 0xa9, 0xe4, 0xbd, 0xa0, 0xff, 0xf0, 0x9f, 0x98, 0x80, 0xe4, 0xbd);
    const whole = new TextDecoder().decode(all);
    let different = 0;
    for (let cut = 0; cut <= all.length; cut++) {
      const d = new TextDecoder();
      const text = d.decode(all.subarray(0, cut), { stream: true }) + d.decode(all.subarray(cut), { stream: true }) + d.decode();
      if (text !== whole) different++;
    }
    return units(whole) + '|' + different;
  }, '41 e9 4f60 fffd d83d de00 fffd|0');
  literal('fatal + stream：结尾没凑齐的，到冲的那一次才抛', () => {
    const d = new TextDecoder('utf-8', { fatal: true });
    const first = units(d.decode(bytes(0x41, 0xe4, 0xbd), { stream: true }));
    return first + '/' + intlRunCase(() => d.decode());
  }, '41/抛 TypeError');
  // @ts-expect-error 选项要的是布尔
  literal('stream 按布尔转换', () => { const d = new TextDecoder(); return units(d.decode(bytes(0xe4), { stream: 1 })); }, '');
  literal('编码再解码，原样回来', () => units(decoder.decode(encoder.encode('aé你😀\u0000￿'))), '61 e9 4f60 d83d de00 0 ffff');

  // =====================================================================
  // 5. btoa / atob
  console.log('  --- btoa / atob ---');
  literal('btoa 和 atob 都是函数', () => typeof btoa + ' ' + typeof atob, 'function function');
  literal('btoa：三个字节正好四个字符', () => btoa('abc'), 'YWJj');
  literal('btoa：一个字节补两个等号', () => btoa('a'), 'YQ==');
  literal('btoa：两个字节补一个等号', () => btoa('ab'), 'YWI=');
  literal('btoa：空串', () => btoa('').length, '0');
  literal('btoa：0 到 255 的字符都能编', () => btoa('\u0000ÿûï'), 'AP/77w==');
  literal('btoa：用到 + 和 / 的那两个值', () => btoa('ûÿþ'), '+//+');
  // @ts-expect-error 参数要的是字符串
  literal('btoa(null) 按字符串转成 "null"', () => btoa(null), 'bnVsbA==');
  // @ts-expect-error 参数要的是字符串
  literal('btoa 给数字，按字符串转', () => btoa(12.5), 'MTIuNQ==');
  literal('btoa：有超过 0xFF 的字符，抛 InvalidCharacterError', () => btoa('你好'), '抛 InvalidCharacterError');
  literal('btoa：刚好超过的 U+0100 也抛', () => btoa('aĀ'), '抛 InvalidCharacterError');
  literal('btoa：表情抛 InvalidCharacterError', () => btoa('😀'), '抛 InvalidCharacterError');
  // @ts-expect-error 少了参数
  literal('btoa 不给参数：抛 TypeError', () => btoa(), '抛 TypeError');
  // @ts-expect-error 参数要的是字符串
  literal('btoa 给 Symbol：抛 TypeError', () => btoa(Symbol('s')), '抛 TypeError');
  {
    const error = failure(() => btoa('你'));
    assert('btoa 抛的是 Error 的实例', error instanceof Error, true);
    assert('btoa 抛的错 name 是 InvalidCharacterError', error.name, 'InvalidCharacterError');
    assert('btoa 抛的是 DOMException，code 5', error instanceof DOMException && error.code, 5);
  }
  const decodedBase64 = (/** @type {string} */ text) => units(atob(text));
  literal('atob：四个字符三个字节', () => atob('YWJj'), 'abc');
  literal('atob：带补位', () => atob('YQ==') + atob('YWI='), 'aab');
  literal('atob：不带补位也行', () => atob('YQ') + atob('YWI'), 'aab');
  literal('atob：空串', () => atob('').length, '0');
  literal('atob：返回的字符串每个字符是一个字节', () => decodedBase64('AP/77w=='), '0 ff fb ef');
  literal('atob：ASCII 空白先去掉（空格、制表、换行、换页、回车）', () => atob(' Y\tW\nJ\fj\r '), 'abc');
  literal('atob：空白夹在补位中间也行', () => atob('YQ = ='), 'a');
  literal('atob：只有空白是空串', () => atob(' \n\t').length, '0');
  literal('atob：丢掉的那几位不是 0 也照常解', () => atob('YR==') + atob('YWJ='), 'aab');
  literal('atob：长度除以 4 余 1，抛 InvalidCharacterError', () => atob('Y'), '抛 InvalidCharacterError');
  literal('atob：五个字符也是余 1', () => atob('YWJjZ'), '抛 InvalidCharacterError');
  literal('atob：补位只给一个等号、总长不是 4 的倍数，抛', () => atob('YQ='), '抛 InvalidCharacterError');
  literal('atob：三个等号，抛', () => atob('YQ==='), '抛 InvalidCharacterError');
  literal('atob：等号在中间，抛', () => atob('Y=Q='), '抛 InvalidCharacterError');
  literal('atob：两段拼起来中间有补位，抛', () => atob('YQ==YQ=='), '抛 InvalidCharacterError');
  literal('atob：字母表之外的字符，抛', () => atob('YQ!='), '抛 InvalidCharacterError');
  literal('atob：URL 安全的那两个字符（- 和 _）不认，抛', () => atob('YQ-_'), '抛 InvalidCharacterError');
  literal('atob：不间断空格不算空白，抛', () => atob(' YQ=='), '抛 InvalidCharacterError');
  literal('atob：纵向制表符不算空白，抛', () => atob('YQ\u000b=='), '抛 InvalidCharacterError');
  literal('atob：汉字，抛', () => atob('你好'), '抛 InvalidCharacterError');
  // @ts-expect-error 参数要的是字符串
  literal('atob(null) 按字符串转成 "null"，正好是合法的四个字符', () => decodedBase64(null), '9e e9 65');
  // @ts-expect-error 少了参数
  literal('atob 不给参数：抛 TypeError', () => atob(), '抛 TypeError');
  {
    const error = failure(() => atob('!'));
    assert('atob 抛的是 Error 的实例', error instanceof Error, true);
    assert('atob 抛的错 name 是 InvalidCharacterError', error.name, 'InvalidCharacterError');
    assert('atob 抛的是 DOMException', error instanceof DOMException, true);
  }
  literal('0 到 255 每个字节值编了再解，原样回来', () => {
    let all = '';
    for (let i = 0; i < 256; i++) all += String.fromCharCode(i);
    return atob(btoa(all)) === all;
  }, 'true');
  literal('汉字要先编成 UTF-8 再 btoa，解的时候反过来', () => {
    const utf8 = encoder.encode('你好，世界');
    const base64 = btoa(String.fromCharCode(...utf8));
    const back = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return base64 + ' ' + decoder.decode(back);
  }, '5L2g5aW977yM5LiW55WM 你好，世界');

  // =====================================================================
  // 6. structuredClone
  console.log('  --- structuredClone ---');
  literal('structuredClone 是个函数', () => typeof structuredClone, 'function');
  literal('克隆基本类型：原样', () => [structuredClone(1.5), structuredClone('你'), structuredClone(true),
                                       structuredClone(null), structuredClone(undefined)].map(String).join(' '),
          '1.5 你 true null undefined');
  literal('克隆 -0 和 NaN', () => Object.is(structuredClone(-0), -0) + ' ' + Number.isNaN(structuredClone(NaN)), 'true true');
  literal('克隆 BigInt', () => String(structuredClone(12345678901234567890123n)), '12345678901234567890123');
  literal('克隆带落单代理项的字符串', () => units(structuredClone('a\ud800b')), '61 d800 62');
  {
    const original = { name: 'a', list: [1, 2, { deep: true }], nothing: null, missing: undefined };
    const copy = structuredClone(original);
    assert('克隆普通对象：是另一个对象', copy !== original, true);
    assert('克隆普通对象：里面的数组也是另一个', copy.list !== original.list, true);
    assert('克隆普通对象：内容一样', JSON.stringify(copy), JSON.stringify(original));
    assert('克隆普通对象：值是 undefined 的键还在', 'missing' in copy, true);
    copy.list.push(3);
    assert('改克隆出来的，原来的不变', original.list.length, 3);
    assert('克隆出来的对象，原型是 Object.prototype', Object.getPrototypeOf(copy) === Object.prototype, true);
  }
  literal('克隆稀疏数组：洞还是洞，长度不变', () => {
    const sparse = [1, , 3];
    sparse.length = 5;
    const copy = structuredClone(sparse);
    return copy.length + ' ' + (1 in copy) + ' ' + (2 in copy) + ' ' + copy[2] + ' ' + Array.isArray(copy);
  }, '5 false true 3 true');
  literal('克隆 Date：是 Date，时间一样，不是同一个', () => {
    const when = new Date(1700000000123);
    const copy = structuredClone(when);
    return (copy instanceof Date) + ' ' + copy.getTime() + ' ' + (copy !== when);
  }, 'true 1700000000123 true');
  literal('克隆不合法的 Date', () => Number.isNaN(structuredClone(new Date(NaN)).getTime()), 'true');
  literal('克隆 RegExp：源和标志都在，lastIndex 归零', () => {
    const pattern = /a.b/gi;
    pattern.lastIndex = 2;
    const copy = structuredClone(pattern);
    return (copy instanceof RegExp) + ' ' + copy.source + ' ' + copy.flags + ' ' + copy.lastIndex;
  }, 'true a.b gi 0');
  literal('克隆 Map：键可以是对象，顺序不变', () => {
    const key = { id: 1 };
    const copy = structuredClone(new Map(/** @type {[unknown, unknown][]} */ ([['z', 1], [key, [2]], ['a', 3]])));
    const keys = Array.from(copy.keys());
    return (copy instanceof Map) + ' ' + copy.size + ' ' + keys[0] + ' ' + JSON.stringify(keys[1]) + ' ' +
           (keys[1] !== key) + ' ' + JSON.stringify(copy.get(keys[1])) + ' ' + keys[2];
  }, 'true 3 z {"id":1} true [2] a');
  literal('克隆 Set', () => {
    const copy = structuredClone(new Set([3, 'a', null]));
    return (copy instanceof Set) + ' ' + Array.from(copy).join(',');
  }, 'true 3,a,');
  literal('克隆 ArrayBuffer：字节拷了一份', () => {
    const original = bytes(1, 2, 3);
    const copy = structuredClone(original.buffer);
    new Uint8Array(copy)[0] = 9;
    return (copy instanceof ArrayBuffer) + ' ' + hex(new Uint8Array(copy)) + ' ' + hex(original);
  }, 'true 09 02 03 01 02 03');
  literal('克隆带偏移的类型数组：偏移和长度都在，整个缓冲区一起拷', () => {
    const view = new Uint16Array(bytes(1, 2, 3, 4, 5, 6, 7, 8).buffer, 2, 2);
    const copy = structuredClone(view);
    return (copy instanceof Uint16Array) + ' ' + copy.byteOffset + ' ' + copy.length + ' ' + copy.buffer.byteLength + ' ' +
           hex(new Uint8Array(copy.buffer)) + ' ' + (copy.buffer !== view.buffer);
  }, 'true 2 2 8 01 02 03 04 05 06 07 08 true');
  // 名字里不靠数字区分（基线把数字统一换成 #）
  const viewTypes = /** @type {const} */ ([
    [Int8Array, '八位有符号整数'], [Uint8Array, '八位无符号整数'], [Uint8ClampedArray, '八位无符号整数（截断的那种）'],
    [Int16Array, '十六位有符号整数'], [Int32Array, '三十二位有符号整数'], [Uint32Array, '三十二位无符号整数'],
    [Float32Array, '三十二位浮点数'], [Float64Array, '六十四位浮点数'],
    [BigInt64Array, '六十四位有符号整数'], [BigUint64Array, '六十四位无符号整数'],
  ]);
  for (const [Type, what] of viewTypes) {
    literal('克隆' + what + '的类型数组：类型和字节都对', () => {
      const copy = structuredClone(new Type(bytes(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16).buffer));
      return (copy instanceof Type) + ' ' + hex(new Uint8Array(copy.buffer));
    }, 'true 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10');
  }
  literal('克隆 DataView', () => {
    const copy = structuredClone(new DataView(bytes(9, 8, 7, 6).buffer, 1, 2));
    return (copy instanceof DataView) + ' ' + copy.byteOffset + ' ' + copy.byteLength + ' ' + copy.getUint8(0);
  }, 'true 1 2 8');
  literal('两个视图建在同一个缓冲区上：克隆之后还是同一个', () => {
    const buffer = new ArrayBuffer(8);
    const copy = structuredClone({ a: new Uint8Array(buffer), b: new Uint16Array(buffer), raw: buffer });
    return (copy.a.buffer === copy.b.buffer) + ' ' + (copy.raw === copy.a.buffer) + ' ' + (copy.raw !== buffer);
  }, 'true true true');
  for (const Type of [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError]) {
    literal('克隆 ' + Type.name + '：还是这个类，信息在', () => {
      const copy = structuredClone(new Type('message'));
      return (copy instanceof Type) + ' ' + (Object.getPrototypeOf(copy) === Type.prototype) + ' ' + copy.name + ' ' + copy.message;
    }, 'true true ' + Type.name + ' message');
  }
  literal('克隆 name 改过的 Error：name 变回 Error，自己加的字段不带', () => {
    const original = /** @type {Error & { code?: number }} */ (new Error('m'));
    original.name = 'MyError';
    original.code = 7;
    const copy = structuredClone(original);
    return copy.name + ' ' + copy.message + ' ' + ('code' in copy);
  }, 'Error m false');
  literal('克隆 Error：cause 和 stack 带着', () => {
    const original = new RangeError('outer', { cause: { reason: 'inner' } });
    const copy = structuredClone(original);
    return JSON.stringify(copy.cause) + ' ' + (copy.stack === original.stack);
  }, '{"reason":"inner"} true');
  literal('克隆包装成对象的基本类型', () => {
    const copy = structuredClone([new Number(1.5), new String('s'), new Boolean(false)]);
    return copy.map((v) => typeof v + ':' + v.valueOf()).join(' ');
  }, 'object:1.5 object:s object:false');
  literal('循环引用：对象指向自己，克隆之后指向克隆出来的那个', () => {
    const original = /** @type {{ name: string, self?: unknown }} */ ({ name: 'o' });
    original.self = original;
    const copy = structuredClone(original);
    return (copy.self === copy) + ' ' + (copy !== original) + ' ' + (copy.self !== original);
  }, 'true true true');
  literal('循环引用：数组里放着自己', () => {
    const original = /** @type {unknown[]} */ ([1]);
    original.push(original);
    const copy = structuredClone(original);
    return (copy[1] === copy) + ' ' + copy.length;
  }, 'true 2');
  literal('循环引用：两个对象互相指', () => {
    const a = /** @type {{ b?: { a: unknown } }} */ ({});
    a.b = { a };
    const copy = structuredClone(a);
    return copy.b !== undefined && copy.b.a === copy;
  }, 'true');
  literal('循环引用：Map 和 Set 里放着自己', () => {
    const map = new Map();
    map.set('me', map);
    const set = new Set();
    set.add(set);
    const copy = structuredClone({ map, set });
    return (copy.map.get('me') === copy.map) + ' ' + copy.set.has(copy.set);
  }, 'true true');
  literal('同一个对象出现两次：克隆之后还是同一个', () => {
    const shared = { x: 1 };
    const copy = structuredClone([shared, shared]);
    return (copy[0] === copy[1]) + ' ' + (copy[0] !== shared);
  }, 'true true');
  literal('取值器被读一次，克隆出来的是普通的值', () => {
    let reads = 0;
    const original = { get computed() { reads++; return 42; } };
    const copy = structuredClone(original);
    const descriptor = Object.getOwnPropertyDescriptor(copy, 'computed');
    return reads + ' ' + copy.computed + ' ' + (descriptor !== undefined && 'value' in descriptor);
  }, '1 42 true');
  literal('不可枚举的、Symbol 做键的、继承来的属性都不带', () => {
    const original = Object.create({ inherited: 1 });
    original.own = 2;
    original[Symbol('s')] = 3;
    Object.defineProperty(original, 'hidden', { value: 4, enumerable: false });
    const copy = structuredClone(original);
    return Object.keys(copy).join(',') + ' ' + Object.getOwnPropertySymbols(copy).length + ' ' + ('hidden' in copy) + ' ' + ('inherited' in copy);
  }, 'own 0 false false');
  literal('自己写的类的实例：克隆出来是普通对象，方法没了', () => {
    class Point { constructor() { this.x = 1; this.y = 2; } norm() { return 0; } }
    const copy = structuredClone(new Point());
    return JSON.stringify(copy) + ' ' + (copy instanceof Point) + ' ' + (Object.getPrototypeOf(copy) === Object.prototype);
  }, '{"x":1,"y":2} false true');
  literal('大一点的结构：两千个对象', () => {
    const rows = Array.from({ length: 2000 }, (_, i) => ({ id: i, tags: ['a', 'b'], at: new Date(i) }));
    const copy = structuredClone(rows);
    return copy.length + ' ' + copy[1999].id + ' ' + copy[1999].at.getTime() + ' ' + (copy[0] !== rows[0]);
  }, '2000 1999 1999 true');

  // 不能克隆的：抛 name 是 DataCloneError 的 Error
  literal('克隆函数：抛 DataCloneError', () => structuredClone(() => {}), '抛 DataCloneError');
  literal('克隆 Symbol：抛 DataCloneError', () => structuredClone(Symbol('s')), '抛 DataCloneError');
  literal('对象里有函数：抛 DataCloneError', () => structuredClone({ a: 1, f() {} }), '抛 DataCloneError');
  literal('数组里有 Symbol：抛 DataCloneError', () => structuredClone([Symbol('s')]), '抛 DataCloneError');
  literal('克隆 WeakMap：抛 DataCloneError', () => structuredClone(new WeakMap()), '抛 DataCloneError');
  literal('克隆 WeakSet：抛 DataCloneError', () => structuredClone(new WeakSet()), '抛 DataCloneError');
  literal('克隆 WeakRef：抛 DataCloneError', () => structuredClone(new WeakRef({})), '抛 DataCloneError');
  literal('克隆 Promise：抛 DataCloneError', () => structuredClone(Promise.resolve(1)), '抛 DataCloneError');
  literal('克隆 Proxy：抛 DataCloneError', () => structuredClone(new Proxy({}, {})), '抛 DataCloneError');
  literal('克隆已经转移走的 ArrayBuffer：抛 DataCloneError', () => {
    const buffer = new ArrayBuffer(8);
    buffer.transfer();
    return structuredClone(buffer);
  }, '抛 DataCloneError');
  if (typeof SharedArrayBuffer === 'function') {
    literal('克隆 SharedArrayBuffer：抛 DataCloneError（还不支持）',
            () => structuredClone(new SharedArrayBuffer(4)), '抛 DataCloneError');
  }
  literal('取值器自己抛的错原样出来，不改成 DataCloneError',
          () => structuredClone({ get bad() { throw new RangeError('from getter'); } }), '抛 RangeError');
  {
    const error = failure(() => structuredClone(() => {}));
    assert('DataCloneError 是 Error 的实例', error instanceof Error, true);
    assert('DataCloneError 的 name', error.name, 'DataCloneError');
    assert('DataCloneError 是 DOMException', error instanceof DOMException, true);
    assert('DataCloneError 的信息里说了不能克隆', error.message.includes('could not be cloned'), true);
  }
  // 运行时自己的对象：原生对象的包装、结构体、事件、网络那几个类
  literal('克隆原生对象的包装（UIView）：抛 DataCloneError', () => structuredClone(new UIView()), '抛 DataCloneError');
  literal('对象里有原生对象的包装：抛 DataCloneError', () => structuredClone({ view: new UILabel() }), '抛 DataCloneError');
  literal('克隆 UIColor：抛 DataCloneError', () => structuredClone(UIColor.redColor), '抛 DataCloneError');
  literal('克隆 Blob：抛 DataCloneError', () => structuredClone(new Blob(['abc'])), '抛 DataCloneError');
  literal('克隆 application：抛 DataCloneError', () => structuredClone(application), '抛 DataCloneError');
  literal('克隆 EventTarget：抛 DataCloneError', () => structuredClone(new EventTarget()), '抛 DataCloneError');
  literal('克隆 Event：抛 DataCloneError', () => structuredClone(new Event('x')), '抛 DataCloneError');
  literal('克隆 AbortController：抛 DataCloneError', () => structuredClone(new AbortController()), '抛 DataCloneError');
  literal('克隆 URL：抛 DataCloneError', () => structuredClone(new URL('https://example.com/')), '抛 DataCloneError');
  literal('克隆 URLSearchParams：抛 DataCloneError', () => structuredClone(new URLSearchParams('a=1')), '抛 DataCloneError');
  literal('克隆 Headers：抛 DataCloneError', () => structuredClone(new Headers()), '抛 DataCloneError');
  literal('克隆 Response：抛 DataCloneError', () => structuredClone(new Response('x')), '抛 DataCloneError');
  literal('克隆结构体（CGRect）：抛 DataCloneError', () => structuredClone(new CGRect(0, 0, 1, 1)), '抛 DataCloneError');
  literal('克隆 TextEncoder：抛 DataCloneError', () => structuredClone(new TextEncoder()), '抛 DataCloneError');
  literal('克隆 TextDecoder：抛 DataCloneError', () => structuredClone(new TextDecoder()), '抛 DataCloneError');
  assert('克隆原生对象的包装：报错里写了类名',
         failure(() => structuredClone(new UIView())).message.includes('UIView'), true);

  // options
  literal('options 给空对象：照常', () => structuredClone(1, {}), '1');
  literal('options.transfer 给空数组：照常', () => structuredClone(1, { transfer: [] }), '1');
  literal('options 给 undefined：照常', () => structuredClone(1, undefined), '1');
  // @ts-expect-error options 不能是 null（类型上），运行时视为空对象
  literal('options 给 null：照常', () => structuredClone(1, null), '1');
  // @ts-expect-error transfer 还不支持，类型上只许空数组
  literal('options.transfer 给了 ArrayBuffer：抛 DataCloneError（还不支持）', () => structuredClone(1, { transfer: [new ArrayBuffer(8)] }),
          '抛 DataCloneError');
  assert('transfer 的报错里写明了是 transfer 还不支持',
         // @ts-expect-error transfer 还不支持，类型上只许空数组
         failure(() => structuredClone(1, { transfer: [new ArrayBuffer(8)] })).message.includes('transfer'), true);
  literal('transfer 没成，那个 ArrayBuffer 还能用', () => {
    const buffer = new ArrayBuffer(8);
    // @ts-expect-error transfer 还不支持，类型上只许空数组
    try { structuredClone(buffer, { transfer: [buffer] }); } catch { /* 预期会抛 */ }
    return buffer.byteLength + ' ' + buffer.detached;
  }, '8 false');
  // @ts-expect-error options 要的是对象
  literal('options 给数字：抛 TypeError', () => structuredClone(1, 5), '抛 TypeError');
  // @ts-expect-error transfer 要的是数组
  literal('options.transfer 给数字：抛 TypeError', () => structuredClone(1, { transfer: 5 }), '抛 TypeError');
  // @ts-expect-error 少了参数
  literal('structuredClone 不给参数：抛 TypeError', () => structuredClone(), '抛 TypeError');

  // =====================================================================
  // 7. 和网页逐条比对
  //
  // 这张表只有一千多条，跑得快，但照样排在生命周期那一步的 GC 检查后面：
  // 那些检查靠的是「这段时间里没人大量分配」。这一步排在生命周期前面，
  // ctx.quiet 这时还没有，所以等它出现再等它兑现。
  // 等它出现有个期限：生命周期那一步万一中途抛了，ctx.quiet 永远不会有，
  // 不设期限的话这张比对永远不开始，入口等不到「全部跑完」
  const QUIET_DEADLINE_MS = 120000;
  const waitingSince = performance.now();
  const afterLifetime = new Promise((/** @type {(value?: void) => void} */ resolve) => {
    const wait = () => {
      if (ctx.quiet === undefined) {
        if (performance.now() - waitingSince > QUIET_DEADLINE_MS) { resolve(); return; }
        setTimeout(wait, 250);
        return;
      }
      Promise.resolve(ctx.quiet).then(() => resolve(), () => resolve());
    };
    wait();
  });
  compareWithWebPage({
    after: afterLifetime,
    assert, host, status, name: 'Web 标准的五个全局', casesFn: webGlobalsCases,
    classify(label) {
      const kind = label.split('|')[0];
      const key = 'Web 全局和网页一致：' +
        (kind === 'TE' ? 'TextEncoder.encode'
         : kind === 'EI' ? 'TextEncoder.encodeInto'
         : kind === 'TC' ? 'TextEncoder 和 TextDecoder 的构造、属性、标签'
         : kind === 'TD' ? 'TextDecoder.decode 一次给完'
         : kind === 'TX' ? 'TextDecoder.decode 逐个字节值扫'
         : kind === 'TS' ? 'TextDecoder.decode 分段给'
         : kind === 'B' ? 'btoa'
         : kind === 'A' ? 'atob'
         : kind === 'SC' ? 'structuredClone 克隆出来的形状'
         : 'structuredClone 不能克隆的和参数不对的');
      return label in WEB_GLOBALS_OURS ? { key, expected: WEB_GLOBALS_OURS[label] } : { key };
    },
  });
}
