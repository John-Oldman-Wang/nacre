// @ts-nocheck —— 这个文件成批地喂不合法的输入（不带参数、给错类型），
// 每一处都标 @ts-expect-error 反而看不清在测什么。
//
// TextEncoder / TextDecoder / atob / btoa / structuredClone 的对照用例。和
// normalize-cases.js 一个做法：自包含的函数，返回 [标签, 取结果的函数]，验收拿它
// 在网页里和运行时里各跑一遍，逐条比对。
//
// webGlobalsCases 必须**自包含**：它会被 toString() 之后送进网页里执行，所以函数体
// 里不能用这个文件里别的东西。
//
// 结果一律先写成字符串再比。字节写成十六进制（'e4 bd a0'），字符串写成码元的
// 十六进制（'4f60 597d'）：落单的代理项从网页带不回来，而且 U+FFFD 和原字符
// 直接看是分不出来的。
//
// 标签的第一段是类别：
//   TE  TextEncoder.encode
//   EI  TextEncoder.encodeInto
//   TC  TextEncoder / TextDecoder 的构造、属性、标签
//   TD  TextDecoder.decode，一次给完
//   TX  TextDecoder.decode：逐个字节值扫
//   TS  TextDecoder.decode，分段给（stream）
//   B   btoa
//   A   atob
//   SC  structuredClone：克隆出来的形状
//   SE  structuredClone：不能克隆的、参数不对的
export function webGlobalsCases() {
  var out = [];
  var run = function (label, fn) { out.push([label, fn]); };
  var hex = function (bytes) {
    var parts = [];
    for (var i = 0; i < bytes.length; i++) parts.push((bytes[i] + 0x100).toString(16).slice(1));
    return parts.join(' ');
  };
  var units = function (s) {
    var parts = [];
    for (var i = 0; i < s.length; i++) parts.push(s.charCodeAt(i).toString(16));
    return parts.join(' ');
  };
  var u8 = function (list) { return new Uint8Array(list); };
  var fromHex = function (text) {
    if (text === '') return new Uint8Array(0);
    var parts = text.split(' ');
    var bytes = new Uint8Array(parts.length);
    for (var i = 0; i < parts.length; i++) bytes[i] = parseInt(parts[i], 16);
    return bytes;
  };
  var repeat = function (s, n) { var r = ''; for (var i = 0; i < n; i++) r += s; return r; };

  // ====================== TE：TextEncoder.encode ======================
  var strings = [
    '', 'abc', '\u0000', 'a\u0000b', '\u007f', '\u0080', 'é', '߿', 'ࠀ', '你好',
    '퟿', '', '﻿', '�', '￿', '😀', '𐀀', '􏿿',
    // 落单的代理项：各种位置
    '\ud800', '\udc00', '\udfff', '\udbff', 'a\ud800', '\ud800a', 'a\ud800b', 'a\udc00b',
    '\ud800\ud800', '\udc00\udc00', '\udc00\ud800', '\ud800𐀀', '𐀀\udc00',
    '\ud83d', '\ud83d😀', '\ude00\ud83d',
    'aé你😀', repeat('aé你😀', 300), repeat('x', 5000),
  ];
  for (var s = 0; s < strings.length; s++) {
    (function (text, index) {
      // 很长的那两条标签里不写内容，只写下标
      run('TE|str|' + (text.length > 40 ? 'long#' + index : units(text)), function () {
        var bytes = new TextEncoder().encode(text);
        return (bytes instanceof Uint8Array) + '|' + bytes.length + '|' +
               (bytes.length > 64 ? hex(bytes.subarray(0, 24)) + ' .. ' + hex(bytes.subarray(bytes.length - 24))
                                  : hex(bytes));
      });
    })(strings[s], s);
  }
  // 参数不是字符串时按字符串转换
  var odd = [
    ['undefined', function () { return undefined; }], ['null', function () { return null; }],
    ['number', function () { return 12.5; }], ['true', function () { return true; }],
    ['array', function () { return [1, 2]; }], ['object', function () { return {}; }],
    ['toString', function () { return { toString: function () { return 'ts'; } }; }],
    ['valueOf', function () { return { valueOf: function () { return 'vo'; }, toString: function () { return 'ts'; } }; }],
    ['bigint', function () { return BigInt(7); }],
    ['symbol', function () { return Symbol('s'); }],
    ['throws', function () { return { toString: function () { throw new RangeError('x'); } }; }],
  ];
  for (var o = 0; o < odd.length; o++) {
    (function (name, make) {
      run('TE|arg|' + name, function () { return hex(new TextEncoder().encode(make())); });
    })(odd[o][0], odd[o][1]);
  }
  run('TE|arg|missing', function () { return hex(new TextEncoder().encode()); });
  run('TE|result is a fresh array each time', function () {
    var enc = new TextEncoder();
    var a = enc.encode('ab'), b = enc.encode('ab');
    a[0] = 0;
    return (a !== b) + '|' + hex(b);
  });

  // ====================== EI：TextEncoder.encodeInto ======================
  // 目标数组先填满 aa，写完之后整段都列出来：没写到的地方必须还是 aa
  var intoStrings = ['', 'abc', 'éé', '你好', '😀', 'a😀b',
                     'aé你😀z', '\ud800', 'a\ud800b', '\udc00\ud800', '\ud83d', 'ab\ud83d'];
  for (var is = 0; is < intoStrings.length; is++) for (var cap = 0; cap <= 12; cap++) {
    (function (text, capacity) {
      run('EI|cap|' + units(text) + '|' + capacity, function () {
        var dest = new Uint8Array(capacity).fill(0xaa);
        var r = new TextEncoder().encodeInto(text, dest);
        return r.read + ',' + r.written + '|' + hex(dest);
      });
    })(intoStrings[is], cap);
  }
  run('EI|subarray: writes inside the view only', function () {
    var whole = new Uint8Array(12).fill(0xaa);
    var r = new TextEncoder().encodeInto('你好你', whole.subarray(3, 10));
    return r.read + ',' + r.written + '|' + hex(whole);
  });
  run('EI|view over a larger buffer with offset', function () {
    var buffer = new ArrayBuffer(16);
    new Uint8Array(buffer).fill(0xaa);
    var r = new TextEncoder().encodeInto('a😀', new Uint8Array(buffer, 5, 6));
    return r.read + ',' + r.written + '|' + hex(new Uint8Array(buffer));
  });
  run('EI|result shape', function () {
    var r = new TextEncoder().encodeInto('ab', new Uint8Array(4));
    return Object.keys(r).join(',') + '|' + (Object.getPrototypeOf(r) === Object.prototype) + '|' +
           typeof r.read + '|' + typeof r.written;
  });
  run('EI|source is converted to a string', function () {
    var dest = new Uint8Array(8).fill(0xaa);
    var r = new TextEncoder().encodeInto(1.5, dest);
    return r.read + ',' + r.written + '|' + hex(dest);
  });
  run('EI|long string, short destination', function () {
    var dest = new Uint8Array(100);
    var r = new TextEncoder().encodeInto(repeat('你😀', 400), dest);
    return r.read + ',' + r.written + '|' + hex(dest.subarray(90));
  });
  var badDest = [
    ['Uint8ClampedArray', function () { return new Uint8ClampedArray(4); }],
    ['Int8Array', function () { return new Int8Array(4); }],
    ['Uint16Array', function () { return new Uint16Array(4); }],
    ['DataView', function () { return new DataView(new ArrayBuffer(4)); }],
    ['ArrayBuffer', function () { return new ArrayBuffer(4); }],
    ['array', function () { return [0, 0, 0, 0]; }],
    ['string', function () { return 'abcd'; }],
    ['null', function () { return null; }],
    ['undefined', function () { return undefined; }],
    ['object', function () { return { length: 4 }; }],
  ];
  for (var bd = 0; bd < badDest.length; bd++) {
    (function (name, make) {
      run('EI|bad destination|' + name, function () {
        var r = new TextEncoder().encodeInto('ab', make());
        return r.read + ',' + r.written;
      });
    })(badDest[bd][0], badDest[bd][1]);
  }
  run('EI|one argument', function () { return new TextEncoder().encodeInto('ab'); });
  run('EI|no argument', function () { return new TextEncoder().encodeInto(); });

  // ====================== TC：构造、属性、标签 ======================
  run('TC|TextEncoder|typeof', function () { return typeof TextEncoder + '|' + typeof TextDecoder; });
  run('TC|TextEncoder|encoding', function () { return new TextEncoder().encoding; });
  run('TC|TextEncoder|ignores arguments', function () { return new TextEncoder('utf-16le').encoding; });
  run('TC|TextEncoder|without new', function () { return TextEncoder(); });
  run('TC|TextEncoder|encoding has no setter', function () {
    var d = Object.getOwnPropertyDescriptor(TextEncoder.prototype, 'encoding');
    return typeof d.get + '|' + typeof d.set;
  });
  run('TC|TextEncoder|toString tag', function () { return Object.prototype.toString.call(new TextEncoder()); });
  run('TC|TextEncoder|method on a foreign object', function () { return TextEncoder.prototype.encode.call({}, 'a'); });
  run('TC|TextEncoder|getter on a foreign object', function () {
    return Object.getOwnPropertyDescriptor(TextEncoder.prototype, 'encoding').get.call({});
  });
  run('TC|TextDecoder|defaults', function () {
    var d = new TextDecoder();
    return d.encoding + '|' + d.fatal + '|' + d.ignoreBOM;
  });
  run('TC|TextDecoder|without new', function () { return TextDecoder(); });
  run('TC|TextDecoder|no setters', function () {
    var names = ['encoding', 'fatal', 'ignoreBOM'], r = [];
    for (var i = 0; i < names.length; i++) {
      var d = Object.getOwnPropertyDescriptor(TextDecoder.prototype, names[i]);
      r.push(typeof d.get + '/' + typeof d.set);
    }
    return r.join('|');
  });
  run('TC|TextDecoder|toString tag', function () { return Object.prototype.toString.call(new TextDecoder()); });
  run('TC|TextDecoder|method on a foreign object', function () { return TextDecoder.prototype.decode.call({}); });
  run('TC|TextDecoder|getter on a foreign object', function () {
    return Object.getOwnPropertyDescriptor(TextDecoder.prototype, 'fatal').get.call({});
  });
  // UTF-8 的各种写法（标签不分大小写，首尾的 ASCII 空白去掉）
  var labels = ['utf-8', 'UTF-8', 'Utf-8', 'utf8', 'UTF8', 'unicode-1-1-utf-8', 'UNICODE-1-1-UTF-8',
                'unicode11utf8', 'unicode20utf8', 'x-unicode20utf8',
                ' utf-8', 'utf-8 ', '\t\n\f\r utf8 \r\f\n\t',
                // 不认的：空串、中间有空白、别的空白字符、拼错的
                '', ' ', 'utf 8', 'utf--8', 'utf-9', 'utf_8', 'utf', ' utf-8', 'utf-8 ', '\u000butf-8',
                'utf-8\u0000', 'utf-8x', 'null', 'undefined', 'not-an-encoding'];
  for (var l = 0; l < labels.length; l++) {
    (function (label) {
      run('TC|label|' + units(label), function () { return new TextDecoder(label).encoding; });
    })(labels[l]);
  }
  // 别的编码：网页认，我们只做 UTF-8（这一组不和网页比，断言抛 RangeError）
  var others = ['utf-16', 'utf-16le', 'utf-16be', 'latin1', 'iso-8859-1', 'ascii', 'windows-1252',
                'gbk', 'gb18030', 'big5', 'shift_jis', 'euc-jp', 'euc-kr', 'koi8-r', 'x-user-defined'];
  for (var ot = 0; ot < others.length; ot++) {
    (function (label) {
      run('TC|other encoding|' + label, function () { return new TextDecoder(label).encoding; });
    })(others[ot]);
  }
  run('TC|label|null value', function () { return new TextDecoder(null).encoding; });
  run('TC|label|undefined value', function () { return new TextDecoder(undefined).encoding; });
  run('TC|label|number', function () { return new TextDecoder(8).encoding; });
  run('TC|label|object with toString', function () {
    return new TextDecoder({ toString: function () { return 'UTF8'; } }).encoding;
  });
  run('TC|label|symbol', function () { return new TextDecoder(Symbol('utf-8')).encoding; });
  var truthy = [
    ['true', true], ['false', false], ['1', 1], ['0', 0], ['empty string', ''], ['string', 'false'],
    ['null', null], ['undefined', undefined], ['object', {}], ['NaN', NaN],
  ];
  for (var tr = 0; tr < truthy.length; tr++) {
    (function (name, value) {
      run('TC|options|fatal ' + name, function () { return new TextDecoder('utf-8', { fatal: value }).fatal; });
      run('TC|options|ignoreBOM ' + name, function () {
        return new TextDecoder('utf-8', { ignoreBOM: value }).ignoreBOM;
      });
    })(truthy[tr][0], truthy[tr][1]);
  }
  run('TC|options|null', function () { var d = new TextDecoder('utf-8', null); return d.fatal + '|' + d.ignoreBOM; });
  run('TC|options|undefined', function () { var d = new TextDecoder('utf-8', undefined); return d.fatal + '|' + d.ignoreBOM; });
  run('TC|options|both', function () {
    var d = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
    return d.fatal + '|' + d.ignoreBOM;
  });
  run('TC|options|a function is an object', function () {
    var f = function () {};
    f.fatal = true;
    return new TextDecoder('utf-8', f).fatal;
  });
  run('TC|options|number', function () { return new TextDecoder('utf-8', 5).fatal; });
  run('TC|options|string', function () { return new TextDecoder('utf-8', 'fatal').fatal; });
  run('TC|options|true', function () { return new TextDecoder('utf-8', true).fatal; });
  // 参数先全部转换完，再看标签认不认：所以这里是 options 的 TypeError，不是标签的 RangeError
  run('TC|options|bad options are reported before a bad label', function () { return new TextDecoder('nope', 5).fatal; });
  run('TC|options|members are read in order: fatal, then ignoreBOM', function () {
    var log = [];
    var options = {};
    Object.defineProperty(options, 'ignoreBOM', { get: function () { log.push('ignoreBOM'); return 1; } });
    Object.defineProperty(options, 'fatal', { get: function () { log.push('fatal'); return 0; } });
    var d = new TextDecoder('utf-8', options);
    return log.join(',') + '|' + d.fatal + '|' + d.ignoreBOM;
  });

  // ====================== TD：decode，一次给完 ======================
  var sequences = [
    // 合法的，含各个长度的边界
    '', '41', '00', '7f', '41 42 43', 'c2 80', 'df bf', 'c3 a9', 'e0 a0 80', 'e4 bd a0', 'ed 9f bf', 'ee 80 80',
    'ef bf bd', 'ef bf bf', 'f0 90 80 80', 'f0 9f 98 80', 'f4 8f bf bf', '41 c3 a9 e4 bd a0 f0 9f 98 80 5a',
    // 截断：序列没给完就结束了
    'c2', 'df', 'e0', 'e0 a0', 'e4', 'e4 bd', 'ed', 'ed 9f', 'ef', 'ef bf', 'f0', 'f0 90', 'f0 90 80',
    'f4', 'f4 8f', 'f4 8f bf', '41 e4 bd', '41 f0 9f 98',
    // 截断之后接别的
    'c2 41', 'e0 a0 41', 'e4 bd 41', 'f0 90 41', 'f0 90 80 41', 'e4 bd e4 bd a0', 'f0 9f 98 f0 9f 98 80',
    'c2 c3 a9', 'e4 c3 a9', 'f0 9f c3 a9', 'e4 bd f0 9f 98 80',
    // 过长编码（用更多的字节写一个小码点）
    'c0', 'c1', 'c0 80', 'c0 af', 'c1 bf', 'e0 80 80', 'e0 80 af', 'e0 9f bf', 'f0 80 80 80', 'f0 80 80 af',
    'f0 8f bf bf', 'f8 80 80 80 80', 'fc 80 80 80 80 80',
    // 代理项范围（U+D800–U+DFFF 不许出现在 UTF-8 里）
    'ed a0 80', 'ed af bf', 'ed b0 80', 'ed bf bf', 'ed a0 80 ed b0 80', 'ed a0', 'ed a0 41',
    // 超出 U+10FFFF，以及从来不合法的字节
    'f4 90 80 80', 'f4 bf bf bf', 'f5', 'f5 80 80 80', 'f7 bf bf bf', 'f8', 'f8 88 80 80 80', 'fb bf bf bf bf',
    'fc 84 80 80 80 80', 'fd bf bf bf bf bf', 'fe', 'ff', 'fe ff', 'ff fe', 'ff fe 41 00',
    // 落单的后续字节
    '80', 'bf', '80 80', '80 bf 80', '41 80 42', '41 bf', 'c3 a9 80', 'e4 bd a0 80 80', 'f0 9f 98 80 80',
    // 后续字节不在这个首字节允许的范围里
    'e0 80', 'e0 9f', 'e0 c0', 'ed c0', 'f0 80', 'f0 8f', 'f0 c0', 'f4 90', 'f4 c0', 'c2 7f', 'c2 c0',
    'e1 80 7f', 'e1 80 c0', 'f1 80 80 7f', 'f1 80 80 c0', 'e1 7f 80', 'f1 7f 80 80', 'f1 80 7f 80',
    // BOM
    'ef bb bf', 'ef bb bf 41', 'ef bb bf ef bb bf', 'ef bb bf ef bb bf 41', '41 ef bb bf', 'ef bb', 'ef bb 41',
    'ef bb bf c3', 'ef bb bf 80', '80 ef bb bf', 'c3 ef bb bf', 'ef bf be', 'ef bb bf e4 bd a0',
    // 混在一起
    '41 80 c3 a9 c0 af e4 bd f0 9f 98 80 ed a0 80 f5 42',
  ];
  var modes = [
    ['default', {}], ['fatal', { fatal: true }], ['ignoreBOM', { ignoreBOM: true }],
    ['fatal+ignoreBOM', { fatal: true, ignoreBOM: true }],
  ];
  for (var m = 0; m < modes.length; m++) for (var q = 0; q < sequences.length; q++) {
    (function (modeName, options, sequence) {
      run('TD|' + modeName + '|' + sequence, function () {
        return units(new TextDecoder('utf-8', options).decode(fromHex(sequence)));
      });
    })(modes[m][0], modes[m][1], sequences[q]);
  }
  // 输入的各种类型：读的必须是视图覆盖的那一段
  var payload = [0x41, 0xe4, 0xbd, 0xa0, 0xf0, 0x9f, 0x98, 0x80, 0x5a, 0xc3, 0xa9, 0x42];
  var inputs = [
    ['ArrayBuffer', function () { return u8(payload).buffer; }],
    ['empty ArrayBuffer', function () { return new ArrayBuffer(0); }],
    ['Uint8Array', function () { return u8(payload); }],
    ['subarray', function () { return u8(payload).subarray(1, 8); }],
    ['subarray cutting a character', function () { return u8(payload).subarray(2, 7); }],
    ['empty subarray', function () { return u8(payload).subarray(4, 4); }],
    ['Uint8Array over part of a buffer', function () { return new Uint8Array(u8(payload).buffer, 4, 4); }],
    ['Int8Array', function () { return new Int8Array(u8(payload).buffer); }],
    ['Uint8ClampedArray', function () { return new Uint8ClampedArray(u8(payload).buffer, 1, 3); }],
    ['Uint16Array', function () { return new Uint16Array(u8(payload).buffer, 4, 2); }],
    ['Uint32Array', function () { return new Uint32Array(u8(payload).buffer, 4, 1); }],
    ['Float64Array', function () { return new Float64Array(u8([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68]).buffer); }],
    ['BigInt64Array', function () { return new BigInt64Array(u8([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68]).buffer); }],
    ['DataView', function () { return new DataView(u8(payload).buffer); }],
    ['DataView with offset and length', function () { return new DataView(u8(payload).buffer, 1, 3); }],
    ['undefined', function () { return undefined; }],
  ];
  for (var inp = 0; inp < inputs.length; inp++) {
    (function (name, make) {
      run('TD|input|' + name, function () { return units(new TextDecoder().decode(make())); });
    })(inputs[inp][0], inputs[inp][1]);
  }
  run('TD|input|missing', function () { return units(new TextDecoder().decode()); });
  var badInputs = [
    ['string', function () { return 'abc'; }], ['number', function () { return 65; }],
    ['array', function () { return [65, 66]; }], ['object', function () { return {}; }],
    ['true', function () { return true; }],
    ['array-like', function () { return { length: 1, 0: 65 }; }],
  ];
  for (var bi = 0; bi < badInputs.length; bi++) {
    (function (name, make) {
      run('TD|bad input|' + name, function () { return units(new TextDecoder().decode(make())); });
    })(badInputs[bi][0], badInputs[bi][1]);
  }
  run('TD|options|null', function () { return units(new TextDecoder().decode(u8([0x41]), null)); });
  run('TD|options|undefined', function () { return units(new TextDecoder().decode(u8([0x41]), undefined)); });
  run('TD|options|number', function () { return units(new TextDecoder().decode(u8([0x41]), 5)); });
  run('TD|options|string', function () { return units(new TextDecoder().decode(u8([0x41]), 'stream')); });
  run('TD|the input is not modified', function () {
    var bytes = u8([0xef, 0xbb, 0xbf, 0x41, 0xff]);
    new TextDecoder().decode(bytes);
    return hex(bytes);
  });
  run('TD|decoder is reusable', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xef, 0xbb, 0xbf, 0x41]))) + '|' + units(d.decode(u8([0xef, 0xbb, 0xbf, 0x42]))) + '|' +
           units(d.decode(u8([0xe4]))) + '|' + units(d.decode(u8([0xbd, 0xa0])));
  });
  run('TD|fatal decoder is reusable after it threw', function () {
    var d = new TextDecoder('utf-8', { fatal: true });
    var first;
    try { d.decode(u8([0x41, 0xff])); first = 'no throw'; } catch (e) { first = e.name; }
    return first + '|' + units(d.decode(u8([0xef, 0xbb, 0xbf, 0xe4, 0xbd, 0xa0])));
  });
  run('TD|long input', function () {
    var chunk = [0x61, 0xc3, 0xa9, 0xe4, 0xbd, 0xa0, 0xf0, 0x9f, 0x98, 0x80, 0xff];
    var bytes = new Uint8Array(chunk.length * 2000);
    for (var i = 0; i < bytes.length; i++) bytes[i] = chunk[i % chunk.length];
    var text = new TextDecoder().decode(bytes);
    return text.length + '|' + units(text.slice(0, 12)) + '|' + units(text.slice(-6));
  });
  run('TD|round trip through TextEncoder', function () {
    var text = 'aé你😀\u0000￿';
    return units(new TextDecoder().decode(new TextEncoder().encode(text)));
  });

  // ====================== TX：逐个字节值扫 ======================
  // 一个字节、两个字节的全部组合，三个和四个字节的挑边界上的值
  run('TX|every single byte', function () {
    var r = [], d = new TextDecoder();
    for (var b = 0; b < 256; b++) r.push(units(d.decode(u8([b]))));
    return r.join(',');
  });
  run('TX|every single byte, fatal', function () {
    var r = '', d = new TextDecoder('utf-8', { fatal: true });
    for (var b = 0; b < 256; b++) { try { d.decode(u8([b])); r += '1'; } catch (e) { r += '0'; } }
    return r;
  });
  for (var lead = 0x80; lead < 0x100; lead += 4) {
    (function (from) {
      run('TX|two bytes|' + from.toString(16), function () {
        var r = [], d = new TextDecoder();
        for (var a = from; a < from + 4; a++) for (var b = 0; b < 256; b++) {
          // 压缩一下：只写码元的个数和最后一个码元
          var text = d.decode(u8([a, b]));
          r.push(text.length + ':' + text.charCodeAt(text.length - 1).toString(16));
        }
        return r.join(',');
      });
      run('TX|two bytes, fatal|' + from.toString(16), function () {
        var r = '', d = new TextDecoder('utf-8', { fatal: true });
        for (var a = from; a < from + 4; a++) for (var b = 0; b < 256; b++) {
          try { d.decode(u8([a, b])); r += '1'; } catch (e) { r += '0'; }
        }
        return r;
      });
    })(lead);
  }
  var edges = [0x00, 0x41, 0x7f, 0x80, 0x8f, 0x90, 0x9f, 0xa0, 0xbf, 0xc0, 0xc2, 0xe0, 0xf0, 0xff];
  var leads3 = [0xe0, 0xe1, 0xec, 0xed, 0xee, 0xef, 0xf0, 0xf1, 0xf3, 0xf4, 0xf5];
  for (var l3 = 0; l3 < leads3.length; l3++) {
    (function (first) {
      run('TX|three and four bytes|' + first.toString(16), function () {
        var r = [], d = new TextDecoder();
        for (var a = 0; a < edges.length; a++) for (var b = 0; b < edges.length; b++) {
          r.push(units(d.decode(u8([first, edges[a], edges[b]]))).replace(/fffd/g, '?'));
          for (var c = 0; c < edges.length; c++) {
            r.push(units(d.decode(u8([first, edges[a], edges[b], edges[c]]))).replace(/fffd/g, '?'));
          }
        }
        return r.join(',');
      });
    })(leads3[l3]);
  }

  // ====================== TS：decode，分段给 ======================
  // 同一串字节在每一个位置切成两段、每两个位置切成三段、一个字节一段，
  // 每一段的输出都列出来（不只是拼起来的结果）
  var streams = [
    '41 c3 a9 e4 bd a0 f0 9f 98 80 5a',
    'ef bb bf 41 e4 bd a0',
    'ef bb bf ef bb bf f0 9f 98 80',
    'f0 9f 98 80 f0 9f 98 80',
    '41 e4 bd',                       // 结尾截断
    'f0 9f 98',
    'e4 bd 41 f0 9f 41 c3',           // 中间截断
    'ed a0 80 f4 90 80 80 c0 af',     // 全是非法的
    'f0 90 80 ff e0 a0 80',
    'c3 28 a9 e4 28 bd a0',
  ];
  var streamModes = [['default', {}], ['ignoreBOM', { ignoreBOM: true }], ['fatal', { fatal: true }]];
  var feed = function (options, sequence, cuts) {
    var bytes = fromHex(sequence);
    var d = new TextDecoder('utf-8', options);
    var parts = [], from = 0;
    try {
      for (var i = 0; i < cuts.length; i++) {
        parts.push(units(d.decode(bytes.subarray(from, cuts[i]), { stream: true })));
        from = cuts[i];
      }
      parts.push(units(d.decode(bytes.subarray(from), { stream: true })));
      parts.push(units(d.decode()));
    } catch (e) {
      parts.push('throws ' + e.name);
    }
    return parts.join('/');
  };
  for (var sm = 0; sm < streamModes.length; sm++) for (var st = 0; st < streams.length; st++) {
    (function (modeName, options, sequence) {
      var count = sequence.split(' ').length;
      run('TS|' + modeName + '|two parts|' + sequence, function () {
        var r = [];
        for (var cut = 0; cut <= count; cut++) r.push(feed(options, sequence, [cut]));
        return r.join(';');
      });
      run('TS|' + modeName + '|three parts|' + sequence, function () {
        var r = [];
        for (var a = 0; a <= count; a++) for (var b = a; b <= count; b++) r.push(feed(options, sequence, [a, b]));
        return r.join(';');
      });
      run('TS|' + modeName + '|byte by byte|' + sequence, function () {
        var cuts = [];
        for (var i = 1; i < count; i++) cuts.push(i);
        return feed(options, sequence, cuts);
      });
    })(streamModes[sm][0], streamModes[sm][1], streams[st]);
  }
  run('TS|a call without stream flushes what is pending', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0x41, 0xe4, 0xbd]), { stream: true })) + '/' + units(d.decode(u8([0x42])));
  });
  run('TS|flushing completes a pending character', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xf0, 0x9f]), { stream: true })) + '/' + units(d.decode(u8([0x98, 0x80])));
  });
  run('TS|empty chunks keep what is pending', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xe4]), { stream: true })) + '/' + units(d.decode(undefined, { stream: true })) + '/' +
           units(d.decode(u8([]), { stream: true })) + '/' + units(d.decode(new ArrayBuffer(0), { stream: true })) + '/' +
           units(d.decode(u8([0xbd, 0xa0]), { stream: true })) + '/' + units(d.decode());
  });
  run('TS|after a flush the next stream strips its BOM again', function () {
    var d = new TextDecoder();
    var a = units(d.decode(u8([0xef, 0xbb, 0xbf, 0x41]), { stream: true })) + '/' + units(d.decode());
    var b = units(d.decode(u8([0xef, 0xbb, 0xbf, 0x42]), { stream: true })) + '/' + units(d.decode());
    return a + ';' + b;
  });
  run('TS|a BOM in a later chunk of the same stream is kept', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0x41]), { stream: true })) + '/' +
           units(d.decode(u8([0xef, 0xbb, 0xbf, 0x42]), { stream: true })) + '/' + units(d.decode());
  });
  run('TS|BOM split across three chunks', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xef]), { stream: true })) + '/' + units(d.decode(u8([0xbb]), { stream: true })) + '/' +
           units(d.decode(u8([0xbf, 0x41]), { stream: true })) + '/' + units(d.decode());
  });
  run('TS|an error first, then a BOM: the BOM is kept', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xff]), { stream: true })) + '/' +
           units(d.decode(u8([0xef, 0xbb, 0xbf]), { stream: true })) + '/' + units(d.decode());
  });
  run('TS|stream option is converted to a boolean', function () {
    var d = new TextDecoder();
    return units(d.decode(u8([0xe4]), { stream: 1 })) + '/' + units(d.decode(u8([0xbd]), { stream: 'yes' })) + '/' +
           units(d.decode(u8([0xa0]), { stream: 0 }));
  });
  run('TS|fatal: an incomplete tail throws only when flushed', function () {
    var d = new TextDecoder('utf-8', { fatal: true });
    var a = units(d.decode(u8([0x41, 0xe4, 0xbd]), { stream: true }));
    var b;
    try { b = units(d.decode()); } catch (e) { b = 'throws ' + e.name; }
    return a + '/' + b;
  });

  // ====================== B：btoa ======================
  var all = '';
  for (var c0 = 0; c0 < 256; c0++) all += String.fromCharCode(c0);
  var plain = ['', 'a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef', 'Hello, World!', '\u0000', '\u0000\u0000', '\u0000\u0000\u0000',
               'ÿ', 'ÿÿ', 'ÿÿÿ', 'é', 'ûÿþ', all, repeat(all, 20),
               // 超出 0xFF 的：抛
               'Ā', 'aĀ', '你', '😀', '\ud800', 'abc ', repeat('a', 1000) + 'Ā'];
  for (var p = 0; p < plain.length; p++) {
    (function (text, index) {
      run('B|str|' + (text.length > 40 ? 'long#' + index : units(text)), function () {
        var r = btoa(text);
        return r.length > 120 ? r.length + '|' + r.slice(0, 60) + '..' + r.slice(-60) : r;
      });
    })(plain[p], p);
  }
  for (var bo = 0; bo < odd.length; bo++) {
    (function (name, make) {
      run('B|arg|' + name, function () { return btoa(make()); });
    })(odd[bo][0], odd[bo][1]);
  }
  run('B|arg|missing', function () { return btoa(); });
  run('B|every byte value on its own', function () {
    var r = [];
    for (var i = 0; i < 256; i++) r.push(btoa(String.fromCharCode(i)));
    return r.join(',');
  });
  run('B|every pair of edge bytes', function () {
    var e = [0, 1, 0x3f, 0x40, 0x7f, 0x80, 0xfb, 0xfc, 0xfe, 0xff], r = [];
    for (var i = 0; i < e.length; i++) for (var j = 0; j < e.length; j++) for (var k = 0; k < e.length; k++) {
      r.push(btoa(String.fromCharCode(e[i], e[j], e[k])));
    }
    return r.join(',');
  });
  run('B|typeof and length', function () { return typeof btoa + '|' + btoa.length + '|' + typeof atob + '|' + atob.length; });

  // ====================== A：atob ======================
  var encoded = [
    '', 'YQ==', 'YQ=', 'YQ', 'YWI=', 'YWI', 'YWJj', 'YWJjZA==', 'YWJjZA=', 'YWJjZA', 'YWJjZGU=', 'YWJjZGVm',
    'AAAA', '////', '++++', '/+/+', 'AA==', 'AAA=', '/w==', '//8=',
    // 丢掉的那几位不是 0 也照常解
    'YR==', 'YS==', 'YZ==', 'Yf==', 'YWJ=', 'YWK=', 'YWL=', 'YR', 'YWJ',
    // ASCII 空白：先去掉再算长度
    ' YQ==', 'YQ== ', 'Y Q = =', 'YQ\t==', 'YQ\n==', 'YQ\f==', 'YQ\r==', ' Y\tW\nJ\fj\r ', '\t\n\f\r ', 'YQ = =', 'Y Q',
    'YWJj YWJj', 'YQ==\n', '\n\nYWJjZA\n\n', 'A A A A A', 'Y\n',
    // 不是 ASCII 空白的空白：不合法
    'YQ\u000b==', ' YQ==', 'YQ== ', 'YQ　==', '﻿YQ==',
    // 长度不对
    'Y', 'YWJjZ', 'A', 'AAAAA', 'YQ===', 'YQ====', 'Y===', 'Y==', 'Y=',
    // 等号放错地方
    '=', '==', '===', '====', '=YQ=', 'Y=Q=', 'YQ=a', 'YQ==YQ==', 'YWJj=', 'YWJj==', 'YWJjYQ==YQ==', 'YW=j', '=AAA',
    'AA=A', 'A=AA', 'AAAA====', 'AAA==', 'AA===',
    // 字母表之外的字符
    'YQ-_', 'Y_Q=', 'YW-j', 'YQ.=', 'YQ@=', 'YW Jj!', 'YWJj\u0000', '\u0000', 'aĀ==', '你好', 'YQ😀',
    'YWJjé', 'YQ%3D', '"YQ=="', 'YQ==,YQ==',
    // 完整的字母表
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    repeat('QUJD', 2000), repeat('QUJD\n', 500), repeat('QUJD', 500) + 'QQ==', repeat('QUJD', 500) + 'Q',
  ];
  for (var en = 0; en < encoded.length; en++) {
    (function (text, index) {
      run('A|str|' + (text.length > 70 ? 'long#' + index : units(text)), function () {
        var r = atob(text);
        return r.length > 80 ? r.length + '|' + units(r.slice(0, 20)) + '..' + units(r.slice(-20)) : units(r);
      });
    })(encoded[en], en);
  }
  for (var ao = 0; ao < odd.length; ao++) {
    (function (name, make) {
      run('A|arg|' + name, function () { return units(atob(make())); });
    })(odd[ao][0], odd[ao][1]);
  }
  run('A|arg|missing', function () { return atob(); });
  // 六个字符的所有四字符组合：字母、斜线、等号、空格、不在字母表里的
  var alphabet = ['A', '/', '=', ' ', 'z', '-'];
  for (var a0 = 0; a0 < alphabet.length; a0++) {
    (function (first) {
      run('A|every four-character combination starting with ' + units(first), function () {
        var r = [];
        for (var i = 0; i < 6; i++) for (var j = 0; j < 6; j++) for (var k = 0; k < 6; k++) {
          var text = first + alphabet[i] + alphabet[j] + alphabet[k];
          try { r.push(units(atob(text)).replace(/ /g, '.') || 'empty'); } catch (e) { r.push('!'); }
        }
        return r.join(',');
      });
    })(alphabet[a0]);
  }
  run('A|every combination of one to five characters from "A= "', function () {
    var chars = ['A', '=', ' '], r = [];
    var walk = function (prefix, depth) {
      if (depth > 0) { try { r.push(atob(prefix).length); } catch (e) { r.push('!'); } }
      if (depth === 5) return;
      for (var i = 0; i < chars.length; i++) walk(prefix + chars[i], depth + 1);
    };
    walk('', 0);
    return r.join('');
  });
  run('A|round trip of every byte value', function () { return units(atob(btoa(all))) === units(all); });
  run('A|the error is an Error', function () {
    try { atob('!'); return 'no throw'; } catch (e) { return (e instanceof Error) + '|' + e.name; }
  });
  run('B|the error is an Error', function () {
    try { btoa('Ā'); return 'no throw'; } catch (e) { return (e instanceof Error) + '|' + e.name; }
  });

  // ====================== SC：structuredClone 克隆出来的形状 ======================
  // 把一个值写成一串字符：类型、内容、原型是不是标准的那个、同一个对象出现第二次
  // 写成 @下标（环和共享都靠它看得出来）
  var errorTypes = [['Error', Error], ['EvalError', EvalError], ['RangeError', RangeError],
                    ['ReferenceError', ReferenceError], ['SyntaxError', SyntaxError],
                    ['TypeError', TypeError], ['URIError', URIError]];
  var describe = function (v, seen) {
    seen = seen || [];
    if (v === null) return 'null';
    var t = typeof v;
    if (t === 'undefined') return 'undefined';
    if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (t === 'string') return '"' + units(v) + '"';
    if (t === 'boolean') return String(v);
    if (t === 'bigint') return v + 'n';
    if (t !== 'object') return t;
    var at = seen.indexOf(v);
    if (at >= 0) return '@' + at;
    seen.push(v);
    var tag = Object.prototype.toString.call(v).slice(8, -1);
    var proto = Object.getPrototypeOf(v);
    var named = function (skipIndexes) {
      var keys = Object.keys(v), parts = [];
      for (var i = 0; i < keys.length; i++) {
        if (skipIndexes && String(keys[i] >>> 0) === keys[i]) continue;
        parts.push(keys[i] + ':' + describe(v[keys[i]], seen));
      }
      return parts.join(',');
    };
    if (Array.isArray(v)) {
      var items = [];
      for (var i = 0; i < v.length; i++) items.push(i in v ? describe(v[i], seen) : '<hole>');
      var extra = named(true);
      return '[' + items.join(',') + (extra ? ';' + extra : '') + ']' + (proto === Array.prototype ? '' : '^');
    }
    if (tag === 'Date') return 'Date(' + v.getTime() + ')' + (proto === Date.prototype ? '' : '^');
    if (tag === 'RegExp') return 'RegExp(' + v.source + ',' + v.flags + ',' + v.lastIndex + ')';
    if (tag === 'Map') {
      var entries = [];
      v.forEach(function (value, key) { entries.push(describe(key, seen) + '=>' + describe(value, seen)); });
      return 'Map{' + entries.join(',') + '}';
    }
    if (tag === 'Set') {
      var members = [];
      v.forEach(function (value) { members.push(describe(value, seen)); });
      return 'Set{' + members.join(',') + '}';
    }
    if (tag === 'ArrayBuffer') return 'ArrayBuffer(' + hex(new Uint8Array(v)) + ')';
    if (ArrayBuffer.isView(v)) {
      return tag + '(' + v.byteOffset + ',' + (tag === 'DataView' ? v.byteLength : v.length) + ',' +
             describe(v.buffer, seen) + ')';
    }
    if (tag === 'Error') {
      var kind = 'other';
      for (var e = 0; e < errorTypes.length; e++) if (proto === errorTypes[e][1].prototype) kind = errorTypes[e][0];
      return 'Error<' + kind + '>(' + v.name + ',' + v.message + ')';
    }
    if (tag === 'Boolean' || tag === 'Number' || tag === 'String' || tag === 'BigInt') {
      return 'Boxed' + tag + '(' + describe(v.valueOf(), seen) + ')';
    }
    return '{' + named(false) + '}' + (proto === Object.prototype ? '' : proto === null ? '^null' : '^other');
  };
  var cloneCase = function (name, make) {
    run('SC|' + name, function () {
      var original = make();
      var copy = structuredClone(original);
      var same = (typeof original === 'object' && original !== null) ? (copy === original ? ' SAME' : '') : '';
      return describe(copy) + same;
    });
  };
  cloneCase('undefined', function () { return undefined; });
  cloneCase('null', function () { return null; });
  cloneCase('true', function () { return true; });
  cloneCase('false', function () { return false; });
  cloneCase('zero', function () { return 0; });
  cloneCase('negative zero', function () { return -0; });
  cloneCase('NaN', function () { return NaN; });
  cloneCase('Infinity', function () { return -Infinity; });
  cloneCase('fraction', function () { return 1.5; });
  cloneCase('large integer', function () { return 9007199254740993; });
  cloneCase('string', function () { return 'aé你😀'; });
  cloneCase('empty string', function () { return ''; });
  cloneCase('string with a lone surrogate', function () { return 'a\ud800b'; });
  cloneCase('long string', function () { return repeat('你', 3).concat(repeat('a', 50)); });
  cloneCase('bigint', function () { return BigInt('12345678901234567890123'); });
  cloneCase('negative bigint', function () { return -BigInt('18446744073709551616'); });
  cloneCase('empty object', function () { return {}; });
  cloneCase('nested object', function () { return { a: 1, b: { c: [1, 2, { d: 'x' }], e: null, f: undefined } }; });
  cloneCase('key order', function () { return { b: 1, 2: 1, a: 1, 1: 1, '-1': 1, '01': 1 }; });
  cloneCase('array', function () { return [1, 'a', null, undefined, true, [2, [3]]]; });
  cloneCase('empty array', function () { return []; });
  cloneCase('sparse array', function () { var a = [1, , 3]; a.length = 6; return a; });
  cloneCase('array with only a length', function () { return new Array(4); });
  cloneCase('array with a named property', function () { var a = [1, 2]; a.note = 'x'; return a; });
  cloneCase('Date', function () { return new Date(1700000000123); });
  cloneCase('invalid Date', function () { return new Date(NaN); });
  cloneCase('RegExp', function () { var r = /a.b\/[c-d]+/gimsuy; r.lastIndex = 3; return r; });
  cloneCase('RegExp without flags', function () { return new RegExp('x'); });
  cloneCase('Map', function () { return new Map([[1, 'one'], ['k', { v: [1] }], [null, undefined], [NaN, -0]]); });
  cloneCase('Map with object keys', function () { var k = { id: 1 }; return new Map([[k, k], [[1], new Map([[k, 1]])]]); });
  cloneCase('Map keeps insertion order', function () { return new Map([['z', 1], ['a', 2], [3, 3], ['m', 4]]); });
  cloneCase('Set', function () { return new Set([3, 'a', null, undefined, NaN, { x: 1 }, [1]]); });
  cloneCase('empty Map and Set', function () { return [new Map(), new Set()]; });
  cloneCase('ArrayBuffer', function () { return u8([1, 2, 3, 250]).buffer; });
  cloneCase('empty ArrayBuffer', function () { return new ArrayBuffer(0); });
  var viewConstructors = {
    Int8Array: Int8Array, Uint8Array: Uint8Array, Uint8ClampedArray: Uint8ClampedArray, Int16Array: Int16Array,
    Uint16Array: Uint16Array, Int32Array: Int32Array, Uint32Array: Uint32Array, Float32Array: Float32Array,
    Float64Array: Float64Array, BigInt64Array: BigInt64Array, BigUint64Array: BigUint64Array,
  };
  var viewTypes = Object.keys(viewConstructors);
  for (var vt = 0; vt < viewTypes.length; vt++) {
    (function (typeName) {
      cloneCase(typeName, function () {
        var bytes = new Uint8Array(32);
        for (var i = 0; i < 32; i++) bytes[i] = i * 7 + 1;
        return new viewConstructors[typeName](bytes.buffer, 8, 2);
      });
    })(viewTypes[vt]);
  }
  cloneCase('DataView', function () { return new DataView(u8([9, 8, 7, 6, 5, 4]).buffer, 1, 3); });
  cloneCase('two views over one buffer share the cloned buffer', function () {
    var buffer = u8([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
    return { a: new Uint8Array(buffer, 0, 4), b: new Uint16Array(buffer, 4, 2), raw: buffer };
  });
  cloneCase('boxed primitives', function () {
    return [new Number(1.5), new String('s'), new Boolean(false), Object(BigInt(5))];
  });
  for (var et = 0; et < errorTypes.length; et++) {
    (function (name, Type) {
      cloneCase('error|' + name, function () { return new Type('message of ' + name); });
    })(errorTypes[et][0], errorTypes[et][1]);
  }
  cloneCase('error|empty message', function () { return new Error(); });
  cloneCase('error|custom name becomes Error', function () { var e = new Error('m'); e.name = 'MyError'; return e; });
  cloneCase('error|name set to another standard name', function () { var e = new Error('m'); e.name = 'RangeError'; return e; });
  cloneCase('error|inside an object', function () { return { failure: new TypeError('t'), list: [new RangeError('r')] }; });
  cloneCase('cycle|object refers to itself', function () { var o = { name: 'o' }; o.self = o; return o; });
  cloneCase('cycle|array contains itself', function () { var a = [1]; a.push(a); return a; });
  cloneCase('cycle|two objects refer to each other', function () {
    var a = { name: 'a' }, b = { name: 'b', a: a }; a.b = b; return a;
  });
  cloneCase('cycle|Map contains itself', function () { var m = new Map(); m.set('me', m); m.set(m, 1); return m; });
  cloneCase('cycle|Set contains itself', function () { var s = new Set(); s.add(s); return s; });
  cloneCase('cycle|deep', function () { var root = { level: 0 }; root.child = { level: 1, child: { level: 2, root: root } }; return root; });
  cloneCase('the same object twice stays one object', function () { var shared = { x: 1 }; return [shared, shared, { again: shared }]; });
  cloneCase('getters are read, the copy has plain values', function () {
    var o = { a: 1 };
    Object.defineProperty(o, 'computed', { enumerable: true, get: function () { return this.a + 1; } });
    return o;
  });
  cloneCase('non-enumerable properties are dropped', function () {
    var o = { kept: 1 };
    Object.defineProperty(o, 'hidden', { enumerable: false, value: 2 });
    return o;
  });
  cloneCase('symbol keys are dropped', function () { var o = { kept: 1 }; o[Symbol('s')] = 2; return o; });
  cloneCase('inherited properties are dropped', function () { var o = Object.create({ inherited: 1 }); o.own = 2; return o; });
  cloneCase('a class instance becomes a plain object', function () {
    function Point(x, y) { this.x = x; this.y = y; }
    Point.prototype.norm = function () { return 0; };
    return new Point(1, 2);
  });
  cloneCase('an object without a prototype becomes a plain object', function () {
    var o = Object.create(null); o.a = 1; return o;
  });
  run('SC|frozen object: the copy is not frozen', function () {
    var copy = structuredClone(Object.freeze({ a: 1 }));
    return Object.isFrozen(copy) + '|' + Object.isExtensible(copy);
  });
  run('SC|the copy is independent', function () {
    var original = { list: [1, 2], map: new Map([['k', { v: 1 }]]), bytes: u8([1, 2, 3]), when: new Date(5) };
    var copy = structuredClone(original);
    copy.list.push(3);
    copy.map.get('k').v = 2;
    copy.bytes[0] = 9;
    copy.when.setTime(6);
    return describe(original) + ' / ' + describe(copy) + ' / ' + (copy.list !== original.list) + (copy.bytes.buffer !== original.bytes.buffer);
  });
  run('SC|RegExp lastIndex of the original is untouched', function () {
    var r = /a/g; r.lastIndex = 2;
    var copy = structuredClone(r);
    return r.lastIndex + '|' + copy.lastIndex + '|' + copy.test('a');
  });
  run('SC|properties are read in order, getters once', function () {
    var log = [];
    var o = {};
    ['b', 'a', 'c'].forEach(function (key) {
      Object.defineProperty(o, key, { enumerable: true, get: function () { log.push(key); return key; } });
    });
    structuredClone(o);
    return log.join(',');
  });
  run('SC|large structure', function () {
    var rows = [];
    for (var i = 0; i < 2000; i++) rows.push({ id: i, name: 'row ' + i, tags: ['a', 'b'], at: new Date(i) });
    var copy = structuredClone({ rows: rows });
    return copy.rows.length + '|' + describe(copy.rows[1999]) + '|' + (copy.rows[0] !== rows[0]);
  });
  run('SC|deeply nested', function () {
    var root = {}, node = root;
    for (var i = 0; i < 500; i++) { node.next = {}; node = node.next; }
    var copy = structuredClone(root), depth = 0;
    while (copy.next) { copy = copy.next; depth++; }
    return depth;
  });
  // options：不给、空的、transfer 是空数组，都照常
  var fineOptions = [
    ['undefined', function () { return undefined; }], ['null', function () { return null; }],
    ['empty object', function () { return {}; }], ['empty transfer', function () { return { transfer: [] }; }],
    ['transfer undefined', function () { return { transfer: undefined }; }],
    ['unrelated keys', function () { return { deep: true }; }],
    ['empty Set as transfer', function () { return { transfer: new Set() }; }],
  ];
  for (var fo = 0; fo < fineOptions.length; fo++) {
    (function (name, make) {
      run('SC|options|' + name, function () { return describe(structuredClone({ a: [1] }, make())); });
    })(fineOptions[fo][0], fineOptions[fo][1]);
  }

  // ====================== SE：不能克隆的、参数不对的 ======================
  var uncloneable = [
    ['function', function () { return function named() {}; }],
    ['bound function', function () { return function () { return 1; }.bind(null); }],
    ['class', function () { return Map; }],
    ['symbol', function () { return Symbol('s'); }],
    ['registered symbol', function () { return Symbol.for('s'); }],
    ['object holding a function', function () { return { a: 1, f: function () {} }; }],
    ['array holding a symbol', function () { return [1, Symbol('s')]; }],
    ['Map holding a function as a key', function () { return new Map([[function () {}, 1]]); }],
    ['Set holding a function', function () { return new Set([function () {}]); }],
    ['nested deep', function () { return { a: { b: [{ c: new Map([['k', { f: function () {} }]]) }] } }; }],
    ['WeakMap', function () { return new WeakMap(); }],
    ['WeakSet', function () { return new WeakSet(); }],
    ['WeakRef', function () { return new WeakRef({}); }],
    ['Promise', function () { return Promise.resolve(1); }],
    ['detached ArrayBuffer', function () { var b = new ArrayBuffer(8); b.transfer(); return b; }],
    ['view over a detached ArrayBuffer', function () { var v = new Uint8Array(8); v.buffer.transfer(); return v; }],
    ['TextEncoder', function () { return new TextEncoder(); }],
    ['TextDecoder', function () { return new TextDecoder(); }],
    ['object holding a TextDecoder', function () { return { d: new TextDecoder() }; }],
  ];
  for (var un = 0; un < uncloneable.length; un++) {
    (function (name, make) {
      run('SE|' + name, function () { return describe(structuredClone(make())); });
    })(uncloneable[un][0], uncloneable[un][1]);
  }
  run('SE|a getter that throws: its own error comes out', function () {
    var o = {};
    Object.defineProperty(o, 'bad', { enumerable: true, get: function () { throw new RangeError('from getter'); } });
    try { structuredClone(o); return 'no throw'; } catch (e) { return e.name + '|' + e.message; }
  });
  run('SE|the error is an Error', function () {
    try { structuredClone(function () {}); return 'no throw'; } catch (e) { return (e instanceof Error) + '|' + e.name; }
  });
  run('SE|nothing is half-cloned when it throws', function () {
    var original = { list: [1, 2], f: function () {} };
    try { structuredClone(original); } catch (e) { return e.name + '|' + original.list.length + '|' + typeof original.f; }
    return 'no throw';
  });
  run('SE|no argument', function () { return describe(structuredClone()); });
  run('SE|options|number', function () { return describe(structuredClone(1, 5)); });
  run('SE|options|string', function () { return describe(structuredClone(1, 'transfer')); });
  run('SE|options|transfer is a number', function () { return describe(structuredClone(1, { transfer: 5 })); });
  run('SE|options|transfer is an object that cannot be iterated', function () { return describe(structuredClone(1, { transfer: {} })); });
  run('SE|options|transfer holds something that cannot be transferred', function () {
    return describe(structuredClone(1, { transfer: [{}] }));
  });
  // 网页上这两条是真的转移；我们还不支持 transfer（不和网页比，断言抛 DataCloneError）
  run('SE|transfer|an ArrayBuffer', function () {
    var buffer = new ArrayBuffer(8);
    return describe(structuredClone({ buffer: buffer }, { transfer: [buffer] }));
  });
  run('SE|transfer|an ArrayBuffer not in the value', function () {
    return describe(structuredClone(1, { transfer: [new ArrayBuffer(8)] }));
  });

  return out;
}

// 这几条不和网页比：网页有、我们明确不做的。断言它们按约定的方式拒绝。
/** @type {Record<string, string>} */
export const WEB_GLOBALS_OURS = {
  'SE|transfer|an ArrayBuffer': '抛 DataCloneError',
  'SE|transfer|an ArrayBuffer not in the value': '抛 DataCloneError',
};
for (const label of ['utf-16', 'utf-16le', 'utf-16be', 'latin1', 'iso-8859-1', 'ascii', 'windows-1252',
                     'gbk', 'gb18030', 'big5', 'shift_jis', 'euc-jp', 'euc-kr', 'koi8-r', 'x-user-defined']) {
  WEB_GLOBALS_OURS['TC|other encoding|' + label] = '抛 RangeError';
}
