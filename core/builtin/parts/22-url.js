// URL / URLSearchParams / Headers
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define, has, native } = ctx;

  const kReparse = Symbol('url.reparse');

  // ---------- URL ----------
  //
  // 解析用 NSURLComponents（见 ParseURL）。它遵循 RFC 3986，和 WHATWG URL
  // 有几处实测出来的差异，在这一层补齐：host 小写化、默认端口移除、点段
  // 规范化。补不了的（IDN 转 punycode）记在文档里。
  //
  // 没有 base 这一条不是偷懒：我们不通过 HTTP 加载 JS，没有 location，
  // 相对 URL 无依可循，编一个 base 出来只会错得更隐蔽。

  // 规范化（小写化、默认端口、点段）全在原生层做完了，这里只解码。
  // 搬下去的理由有两条：原生的 standardizedURL 比在 JS 里写循环快，
  // 而且更对——手写版本很容易把 '//double' 吞成 '/double'。
  function parseURLParts(input, base) {
    const json = native.parseURL(String(input), base === undefined ? '' : String(base));
    return json === undefined ? null : JSON.parse(json);
  }

  function serializeURL(p) {
    let out = p.protocol + '//';
    if (p.username) {
      out += p.username;
      if (p.password) out += ':' + p.password;
      out += '@';
    }
    return out + p.host + p.pathname + p.search + p.hash;
  }

  const kParts = Symbol('url.parts');
  const kParams = Symbol('url.searchParams');

  const URL = define(globalThis, 'URL', class URL {
    constructor(url, base) {
      const p = parseURLParts(url, base);
      if (p === null) {
        throw new TypeError(
          base === undefined
            ? 'Invalid URL: ' + JSON.stringify(String(url)) +
              '. Without a base it must be absolute: this runtime does not load over HTTP, so there is no location'
            : 'Invalid URL: ' + JSON.stringify(String(url)) +
              '（base ' + JSON.stringify(String(base)) + '）');
      }
      this[kParts] = p;
      this[kParams] = null;   // 用到才建，建了就和 search 双向绑定
    }
    // 改任何一部分都重新拼再重新解析，保证规范化结果一致
    [kReparse](patch) {
      const p = Object.assign({}, this[kParts], patch);
      const 再解析 = parseURLParts(serializeURL(p));
      if (再解析 !== null) this[kParts] = 再解析;
    }
    get href() { return serializeURL(this[kParts]); }
    set href(v) {
      const p = parseURLParts(v);
      if (p === null) throw new TypeError('Invalid URL: ' + JSON.stringify(String(v)));
      this[kParts] = p;
      if (this[kParams]) syncParams(this[kParams], p.search);
    }
    get origin() { return this[kParts].origin; }
    get protocol() { return this[kParts].protocol; }
    set protocol(v) {
      const t = String(v);
      this[kReparse]({ protocol: t.endsWith(':') ? t : t + ':' });
    }
    get username() { return this[kParts].username; }
    set username(v) { this[kReparse]({ username: String(v) }); }
    get password() { return this[kParts].password; }
    set password(v) { this[kReparse]({ password: String(v) }); }
    get host() { return this[kParts].host; }
    set host(v) { this[kReparse]({ host: String(v) }); }
    get hostname() { return this[kParts].hostname; }
    set hostname(v) {
      const p = this[kParts];
      this[kReparse]({ host: p.port ? String(v) + ':' + p.port : String(v) });
    }
    get port() { return this[kParts].port; }
    set port(v) {
      const t = String(v);
      this[kReparse]({ host: t ? this[kParts].hostname + ':' + t : this[kParts].hostname });
    }
    get pathname() { return this[kParts].pathname; }
    set pathname(v) {
      const t = String(v);
      this[kReparse]({ pathname: t.startsWith('/') ? t : '/' + t });
    }
    get search() { return this[kParts].search; }
    set search(v) {
      const t = String(v);
      this[kParts].search = t === '' || t === '?' ? '' : (t.startsWith('?') ? t : '?' + t);
      if (this[kParams]) syncParams(this[kParams], this[kParts].search);
    }
    get searchParams() {
      if (!this[kParams]) {
        this[kParams] = new URLSearchParams(this[kParts].search);
        this[kParams][kOwnerURL] = this;
      }
      return this[kParams];
    }
    get hash() { return this[kParts].hash; }
    set hash(v) {
      const t = String(v);
      this[kParts].hash = t === '' || t === '#' ? '' : (t.startsWith('#') ? t : '#' + t);
    }
    toString() { return this.href; }
    toJSON() { return this.href; }
    // 不抛的解析，省掉 try/catch。WHATWG 后加的，很好用
    static canParse(url, base) { return parseURLParts(url, base) !== null; }
    static parse(url, base) {
      const p = parseURLParts(url, base);
      if (p === null) return null;
      const u = Object.create(URL.prototype);
      u[kParts] = p;
      u[kParams] = null;
      return u;
    }
  });

  // ---------- URLSearchParams ----------
  //
  // 纯 JS：它就是一个有序的键值对列表加 application/x-www-form-urlencoded
  // 的编解码规则，不需要原生。注意这套编码和 URL 其余部分不同——空格是 '+'。

  const kPairs = Symbol('params.pairs');
  const kOwnerURL = Symbol('params.owner');

  function encodeFormComponent(text) {
    return encodeURIComponent(text)
      .replace(/%20/g, '+')
      .replace(/[!'()~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  }
  function decodeFormComponent(text) {
    try { return decodeURIComponent(text.replace(/\+/g, ' ')); }
    catch { return text; }   // 坏的百分号编码原样返回，和浏览器一致
  }
  function parsePairs(init) {
    const out = [];
    let text = String(init);
    if (text.startsWith('?')) text = text.slice(1);
    if (text === '') return out;
    for (const part of text.split('&')) {
      if (part === '') continue;
      const i = part.indexOf('=');
      if (i < 0) out.push([decodeFormComponent(part), '']);
      else out.push([decodeFormComponent(part.slice(0, i)), decodeFormComponent(part.slice(i + 1))]);
    }
    return out;
  }
  // 参数变了就把宿主 URL 的 search 同步过去（WHATWG 要求双向绑定）
  function flushParams(params) {
    const url = params[kOwnerURL];
    if (!url) return;
    const text = params.toString();
    url[kParts].search = text === '' ? '' : '?' + text;
  }
  function syncParams(params, search) {
    params[kPairs] = parsePairs(search);
  }

  const URLSearchParams = define(globalThis, 'URLSearchParams',
    class URLSearchParams {
      constructor(init) {
        this[kOwnerURL] = null;
        if (init === undefined || init === null) { this[kPairs] = []; return; }
        if (typeof init === 'string') { this[kPairs] = parsePairs(init); return; }
        if (init instanceof URLSearchParams) {
          this[kPairs] = init[kPairs].map((pair) => [pair[0], pair[1]]);
          return;
        }
        if (Array.isArray(init)) {
          this[kPairs] = init.map((pair) => {
            if (!Array.isArray(pair) || pair.length !== 2) {
              throw new TypeError('URLSearchParams in array form needs every entry to be [name, value]');
            }
            return [String(pair[0]), String(pair[1])];
          });
          return;
        }
        this[kPairs] = Object.entries(init).map(([k, v]) => [String(k), String(v)]);
      }
      get size() { return this[kPairs].length; }
      append(name, value) {
        this[kPairs].push([String(name), String(value)]);
        flushParams(this);
      }
      delete(name, value) {
        const n = String(name);
        const hasValue = value !== undefined;
        const v = hasValue ? String(value) : null;
        this[kPairs] = this[kPairs].filter(
          (pair) => !(pair[0] === n && (!hasValue || pair[1] === v)));
        flushParams(this);
      }
      get(name) {
        const n = String(name);
        for (const pair of this[kPairs]) if (pair[0] === n) return pair[1];
        return null;
      }
      getAll(name) {
        const n = String(name);
        return this[kPairs].filter((pair) => pair[0] === n).map((pair) => pair[1]);
      }
      has(name, value) {
        const n = String(name);
        const hasValue = value !== undefined;
        const v = hasValue ? String(value) : null;
        return this[kPairs].some(
          (pair) => pair[0] === n && (!hasValue || pair[1] === v));
      }
      // set 的语义：替换第一个同名的，删掉其余同名的，位置保持
      set(name, value) {
        const n = String(name);
        const v = String(value);
        let placed = false;
        const out = [];
        for (const pair of this[kPairs]) {
          if (pair[0] !== n) { out.push(pair); continue; }
          if (placed) continue;
          out.push([n, v]);
          placed = true;
        }
        if (!placed) out.push([n, v]);
        this[kPairs] = out;
        flushParams(this);
      }
      sort() {
        // 按名字排，同名之间保持原有顺序（规范要求稳定）
        this[kPairs] = this[kPairs]
          .map((pair, i) => [pair, i])
          .sort((a, b) => (a[0][0] < b[0][0] ? -1 : a[0][0] > b[0][0] ? 1 : a[1] - b[1]))
          .map(([pair]) => pair);
        flushParams(this);
      }
      forEach(callback, thisArg) {
        for (const [k, v] of this[kPairs].slice()) callback.call(thisArg, v, k, this);
      }
      *keys() { for (const pair of this[kPairs].slice()) yield pair[0]; }
      *values() { for (const pair of this[kPairs].slice()) yield pair[1]; }
      *entries() { for (const pair of this[kPairs].slice()) yield [pair[0], pair[1]]; }
      [Symbol.iterator]() { return this.entries(); }
      toString() {
        return this[kPairs]
          .map(([k, v]) => encodeFormComponent(k) + '=' + encodeFormComponent(v))
          .join('&');
      }
    });

  // ---------- Headers ----------
  //
  // 纯 JS。名字大小写不敏感（内部一律存小写），同名多值用 ', ' 合并，
  // Set-Cookie 例外——它不能合并，所以单独用 getSetCookie() 取数组。
  //
  // 不做 forbidden header 检查：浏览器禁止 JS 设 Host / Cookie / Origin，
  // 那是防不受信任的页面伪造请求。按[原则 8]，我们的 JS 和原生代码同等
  // 地位，没有要防的对象，拦下来只会挡住正当用途。

  const kHeaderMap = Symbol('headers.map');   // 小写名 -> [值, 值, ...]

  function normalizeHeaderName(name) {
    const n = String(name);
    // HTTP 的 token 规则：这些字符不允许出现在首部名里
    if (n === '' || /[^!#$%&'*+\-.^_`|~0-9A-Za-z]/.test(n)) {
      throw new TypeError('Invalid header name: ' + JSON.stringify(n));
    }
    return n.toLowerCase();
  }
  function normalizeHeaderValue(value) {
    // 首尾的空白要去掉；中间的 NUL / CR / LF 会撕裂报文，必须拒绝
    const v = String(value).replace(/^[\t\n\r ]+|[\t\n\r ]+$/g, '');
    if (/[\0\r\n]/.test(v)) {
      throw new TypeError('Header value cannot contain NUL, CR or LF');
    }
    return v;
  }

  define(globalThis, 'Headers', class Headers {
    constructor(init) {
      this[kHeaderMap] = new Map();
      if (init === undefined || init === null) return;
      if (init instanceof Headers) {
        for (const [k, list] of init[kHeaderMap]) this[kHeaderMap].set(k, list.slice());
        return;
      }
      const 条目 = Array.isArray(init) ? init : Object.entries(init);
      for (const pair of 条目) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new TypeError('Headers in array form needs every entry to be [name, value]');
        }
        this.append(pair[0], pair[1]);
      }
    }
    append(name, value) {
      const k = normalizeHeaderName(name);
      const v = normalizeHeaderValue(value);
      const list = this[kHeaderMap].get(k);
      if (list) list.push(v); else this[kHeaderMap].set(k, [v]);
    }
    set(name, value) {
      this[kHeaderMap].set(normalizeHeaderName(name), [normalizeHeaderValue(value)]);
    }
    delete(name) { this[kHeaderMap].delete(normalizeHeaderName(name)); }
    has(name) { return this[kHeaderMap].has(normalizeHeaderName(name)); }
    // 多值合并成一个串，这是 Web 的语义；要拿原始的多值只有 Set-Cookie 有
    get(name) {
      const list = this[kHeaderMap].get(normalizeHeaderName(name));
      return list ? list.join(', ') : null;
    }
    getSetCookie() { return (this[kHeaderMap].get('set-cookie') || []).slice(); }
    // 迭代按名字排序，而且 Set-Cookie 不合并——规范特地这么定的
    *entries() {
      for (const k of Array.from(this[kHeaderMap].keys()).sort()) {
        const list = this[kHeaderMap].get(k);
        if (k === 'set-cookie') { for (const v of list) yield [k, v]; }
        else yield [k, list.join(', ')];
      }
    }
    *keys() { for (const [k] of this.entries()) yield k; }
    *values() { for (const [, v] of this.entries()) yield v; }
    [Symbol.iterator]() { return this.entries(); }
    forEach(callback, thisArg) {
      for (const [k, v] of this.entries()) callback.call(thisArg, v, k, this);
    }
  });

  // ---------- Blob ----------
  //
  // 字节在原生的 NSData 里，JS 侧只拿一个句柄。复用的就是 UIView / UIColor
  // 那套包装机制——Chrome 为了同样的事要跨进程传 UUID，我们同进程直接持指针。
  //
  // 对视频切片这类场景的意义：fetch 一个切片拿到 Blob，交给播放器，
  // 字节从头到尾不进 V8 堆。


  // 这个 part 对外提供的东西
  Object.assign(ctx, { URL, URLSearchParams });
})
