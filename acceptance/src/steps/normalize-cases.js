// @ts-nocheck —— 这个文件成批地喂不合法的输入，每一处都标 @ts-expect-error 反而看不清在测什么。
//
// String.prototype.normalize 的对照用例。和 intl-number-cases.js 一个做法：自包含的函数，返回
// [标签, 取结果的函数]，验收拿它在网页里和运行时里各跑一遍，逐条比对。
//
// 结果一律写成码元的十六进制（'65 301'），不直接比字符串：规范化前后的字符串
// 看上去一模一样，而且落单的代理项从网页带不回来。
//
// 标签的第一段是类别：
//   W  挑出来的词：形式 | 词
//   S  逐个码位扫：形式 | 这一段的起点（每段 256 个码位，只列规范化后变了的）
//   C  基字 + 组合记号：形式 | 基字（一个记号的、两个记号的都扫）
//   H  谚文字母拼成音节：形式
//   X  别的：落单的代理项、空字符、很长的字符串
//   E  参数和 this 不合法时该怎样
export function normalizeCases() {
  var out = [];
  var run = function (label, fn) { out.push([label, fn]); };
  var hex = function (s) {
    var units = [];
    for (var i = 0; i < s.length; i++) units.push(s.charCodeAt(i).toString(16));
    return units.join(' ');
  };
  var forms = ['NFC', 'NFD', 'NFKC', 'NFKD'];

  // ---------- W：挑出来的词 ----------
  var words = [
    '', 'abc', 'e\u0301', '\u00e9', 'A\u030a', '\u00c5', '\u212b', '\u2126', '\u03a9',
    '\ufb01', '\ufb03', '\u2460', '\u00bd', '\u00b2', '\u2122', '\u00a0', '\u2002', '\u2026',
    '\ud55c', '\u1112\u1161\u11ab', '\ud558\u11ab', '\uff71', '\uff76\uff9e', '\u304b\u3099', '\u304c', '\u30f4',
    '\u01c6', '\u3300', '\u33a5', '\u2163', '\ufdfa', '\u0958', '\u0915\u093c', '\u0622', '\u0627\u0653',
    '\u0e33', '\u0f73', '\u0f71\u0f72', '\u0ccb', '\u1e9b\u0323', '\u1e0b\u0323', 'q\u0307\u0323', 'q\u0323\u0307',
    'a\u0315\u0300\u05ae\u0062', 'A\u0323\u030a', '\u1ea0\u030a', '\u03b1\u0313\u0301\u0345', '\u1f84',
    '\u0344', '\u0340', '\uf900', '\ufa0e', '\ufb1d', '\ufb2a', '\ud83d\ude00', '\ud834\udd5e',
    '\ud834\udd57\ud834\udd65', '\ud87e\udc00', '\ud835\udc00', 'Vi\u1ec7t Nam', 'Vie\u0323\u0302t Nam',
    'cafe\u0301 \uff21\uff22\uff23 \u2460\u2461 \ufb01n', '\u4e2d\u6587', '\u1100\u1161\u1100\u1161\u11a8',
  ];
  var wordForms = [undefined].concat(forms);
  for (var f = 0; f < wordForms.length; f++) for (var w = 0; w < words.length; w++) {
    (function (form, word) {
      run('W|' + String(form) + '|' + hex(word), function () { return hex(word.normalize(form)); });
    })(wordForms[f], words[w]);
  }

  // ---------- S：逐个码位扫 ----------
  // 基本平面全部（含代理项那一段，它们是落单的）、第 1 平面全部、第 2 平面里
  // 兼容汉字那一段。每段 256 个码位，只把规范化后变了的列出来
  var spans = [[0x0000, 0x20000], [0x2f800, 0x2fb00]];
  for (var sf = 0; sf < forms.length; sf++) for (var sp = 0; sp < spans.length; sp++) {
    for (var start = spans[sp][0]; start < spans[sp][1]; start += 256) {
      (function (form, from) {
        run('S|' + form + '|' + from.toString(16), function () {
          var changed = [];
          for (var cp = from; cp < from + 256; cp++) {
            var s = String.fromCodePoint(cp);
            var r = s.normalize(form);
            if (r !== s) changed.push(cp.toString(16) + '=' + hex(r));
          }
          return changed.join(';');
        });
      })(forms[sf], start);
    }
  }

  // ---------- C：基字 + 组合记号 ----------
  // 合成表验的是这一组：基字后面跟一个记号（0300–036F 全部，加两个假名的浊点），
  // 以及跟两个记号（挑 17 个常用的两两组合，验重排和接着合成）
  var bases = 'AEIOUYCDGHKLNRSTWZaeiouycdghklnrstwz' +
              '\u0391\u0395\u0397\u0399\u039f\u03a5\u03a9\u03b1\u03b5\u03b7\u03b9\u03bf\u03c5\u03c9' +
              '\u0410\u0415\u0418\u041e\u0423\u0430\u0435\u0438\u043e\u0443\u0456' +
              '\u304b\u3055\u305f\u306f\u30a6\u30cf\u30ef\u0627\u0915';
  var pairMarks = [0x300, 0x301, 0x302, 0x303, 0x304, 0x306, 0x307, 0x308, 0x309, 0x30a, 0x30b, 0x30c,
                   0x31b, 0x323, 0x327, 0x328, 0x345];
  for (var cf = 0; cf < forms.length; cf++) for (var b = 0; b < bases.length; b++) {
    (function (form, base) {
      run('C|' + form + '|' + hex(base), function () {
        var results = [];
        for (var m = 0x300; m <= 0x36f; m++) results.push(hex((base + String.fromCharCode(m)).normalize(form)));
        results.push(hex((base + '\u3099').normalize(form)));
        results.push(hex((base + '\u309a').normalize(form)));
        for (var i = 0; i < pairMarks.length; i++) for (var j = 0; j < pairMarks.length; j++) {
          results.push(hex((base + String.fromCharCode(pairMarks[i], pairMarks[j])).normalize(form)));
        }
        return results.join(';');
      });
    })(forms[cf], bases[b]);
  }

  // ---------- H：谚文 ----------
  for (var hf = 0; hf < forms.length; hf++) {
    (function (form) {
      run('H|' + form + '|初声 + 中声 + 终声', function () {
        var results = [];
        for (var l = 0x1100; l <= 0x1112; l += 3) for (var v = 0x1161; v <= 0x1175; v += 4) {
          results.push(hex(String.fromCharCode(l, v).normalize(form)));
          for (var t = 0x11a7; t <= 0x11c3; t += 4) results.push(hex(String.fromCharCode(l, v, t).normalize(form)));
        }
        return results.join(';');
      });
      run('H|' + form + '|音节 + 终声、音节拆开', function () {
        var results = [];
        for (var s = 0xac00; s <= 0xd7a3; s += 97) {
          results.push(hex(String.fromCharCode(s).normalize(form)));
          results.push(hex(String.fromCharCode(s, 0x11a8).normalize(form)));
        }
        return results.join(';');
      });
    })(forms[hf]);
  }

  // ---------- X：别的 ----------
  var odd = [
    ['落单的高位代理项', '\ud800'],
    ['落单的低位代理项', '\udc00'],
    ['落单的代理项夹在中间，两边照常合成', 'e\u0301\ud800e\u0301'],
    ['落单的低位代理项后面跟组合记号', '\udc00\u0301e\u0301'],
    ['落单的高位代理项紧挨着一个表情', '\ud83d\ud83d\ude00e\u0301'],
    ['顺序反了的一对代理项', '\ude00\ud83de\u0301'],
    ['空字符夹在中间', 'e\u0301\u0000e\u0301'],
    ['只有一个空字符', '\u0000'],
    ['换行、制表符、引号、反斜杠', 'e\u0301\n\t"\\e\u0301'],
    ['行分隔符和段分隔符', 'e\u0301\u2028\u2029e\u0301'],
    ['字节顺序标记', '\ufeffe\u0301'],
    ['非字符 FFFE、FFFF', '\ufffee\u0301\uffff'],
    ['替换字符本身', '\ufffde\u0301'],
  ];
  for (var xf = 0; xf < forms.length; xf++) for (var o = 0; o < odd.length; o++) {
    (function (form, name, text) {
      run('X|' + form + '|' + name, function () { return hex(text.normalize(form)); });
    })(forms[xf], odd[o][0], odd[o][1]);
  }
  for (var lf = 0; lf < forms.length; lf++) {
    (function (form) {
      run('X|' + form + '|很长：5000 个 e + 组合记号', function () {
        var r = new Array(5001).join('e\u0301').normalize(form);
        return [r.length, hex(r.slice(0, 3)), hex(r.slice(-3))];
      });
      run('X|' + form + '|很长：一个基字后面 300 个组合记号', function () {
        var r = ('a' + new Array(151).join('\u0307\u0323')).normalize(form);
        return [r.length, hex(r.slice(0, 4)), hex(r.slice(-4))];
      });
      run('X|' + form + '|很长：每隔一段夹一个落单的代理项', function () {
        var r = new Array(501).join('e\u0301\ud800\ufb01').normalize(form);
        return [r.length, hex(r.slice(0, 6)), hex(r.slice(-6))];
      });
      run('X|' + form + '|纯 ASCII 原样返回', function () {
        var s = 'The quick brown fox, 0123456789 ~!@#';
        return [s.normalize(form) === s, s.normalize(form).length];
      });
    })(forms[lf]);
  }

  // ---------- E：参数和 this ----------
  var normalize = String.prototype.normalize;
  run('E|不认识的形式', function () { return 'a'.normalize('NFX'); });
  run('E|形式分大小写', function () { return 'a'.normalize('nfc'); });
  run('E|形式是空串', function () { return 'a'.normalize(''); });
  run('E|形式是 null', function () { return 'a'.normalize(null); });
  run('E|形式是数', function () { return 'a'.normalize(1); });
  run('E|形式前后有空格', function () { return 'a'.normalize(' NFC'); });
  run('E|形式是 Symbol', function () { return 'a'.normalize(Symbol('NFC')); });
  run('E|不认识的形式，字符串是空的也抛', function () { return ''.normalize('NFX'); });
  run('E|不认识的形式，纯 ASCII 也抛', function () { return 'abc'.normalize('NFX'); });
  run('E|形式是带 toString 的对象', function () {
    return hex('\u00e9'.normalize({ toString: function () { return 'NFD'; } }));
  });
  run('E|形式的 toString 抛了，原样抛出来', function () {
    return 'a'.normalize({ toString: function () { throw new SyntaxError('x'); } });
  });
  run('E|形式是 undefined 等于 NFC', function () { return hex('e\u0301'.normalize(undefined)); });
  run('E|this 是 null', function () { return normalize.call(null); });
  run('E|this 是 undefined', function () { return normalize.call(undefined); });
  run('E|this 是 null，形式也不合法：先报 this', function () { return normalize.call(null, 'NFX'); });
  run('E|this 是数', function () { return normalize.call(123, 'NFD'); });
  run('E|this 是布尔', function () { return normalize.call(true); });
  run('E|this 是 String 对象', function () { return hex(normalize.call(new String('e\u0301'))); });
  run('E|this 是带 toString 的对象', function () {
    return hex(normalize.call({ toString: function () { return 'e\u0301'; } }));
  });
  run('E|this 是 Symbol', function () { return normalize.call(Symbol('a')); });
  run('E|先转 this，再转形式', function () {
    var order = [];
    normalize.call({ toString: function () { order.push('this'); return 'a'; } },
                   { toString: function () { order.push('form'); return 'NFC'; } });
    return order;
  });
  run('E|返回的是字符串不是对象', function () { return typeof normalize.call(new String('e\u0301')); });
  run('E|length 和 name', function () { return [normalize.length, normalize.name]; });
  run('E|属性的三个标志', function () {
    var d = Object.getOwnPropertyDescriptor(String.prototype, 'normalize');
    return [d.writable, d.enumerable, d.configurable, typeof d.get];
  });
  run('E|不能当构造函数', function () { return new normalize(); });
  run('E|没有 prototype 属性', function () { return Object.prototype.hasOwnProperty.call(normalize, 'prototype'); });
  run('E|多余的参数被忽略', function () { return hex('\u00e9'.normalize('NFD', 'NFC')); });

  return out;
}
