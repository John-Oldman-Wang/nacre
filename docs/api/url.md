# `URL` / `URLSearchParams` / `Headers`

WHATWG 的三个类，签名和浏览器一致。但 `URL` 和浏览器有**五处实测出来的差异**，见下。

```js
const u = new URL('https://api.example.com/v1/items?page=2');
u.searchParams.set('page', '3');
u.href;                      // https://api.example.com/v1/items?page=3

const h = new Headers({ 'Content-Type': 'application/json' });
h.get('content-type');       // 大小写不敏感
```

## 最要紧的差异：没有 base

```js
new URL('/x')                      // TypeError
new URL('/x', 'https://a.com')     // 可以
```

浏览器里 `new URL('/x')` 能跑，是因为有当前文档的 base URL。这个运行时**不通过 HTTP 加载 JS**（[加载模型](../project.md#3-ios-技术选型已确定)），没有 `location`，**编不出一个 base 来**。

这不是没实现，是没有事实依据。按[原则 7](../project.md#原则)，运行时不替 JS 编造不存在的事实。

> 类型系统看不出这一条——`new URL(string)` 在类型上完全合法，它是运行时才抛。

## 和浏览器的已知差异

拿同一批 URL 在 Chrome 和这里对撞得到的：

| 情况 | 浏览器 | Nacre | 说明 |
| --- | --- | --- | --- |
| `new URL('/x')` | TypeError | TypeError | 一致（但原因不同：浏览器是因为给的 base 不合法，我们是根本没有 base） |
| `HTTP://EXAMPLE.COM` | `example.com` | `example.com` | 已补齐 |
| `https://a.com:443` | 端口省掉 | 端口省掉 | 已补齐 |
| `/a/b/../c` | `/a/c` | `/a/c` | 已补齐 |
| `https://a.com\evil.com` | `//evil.com` | **解析失败** | **有意的差异**，见下 |
| `https://例え.jp` | `xn--r8jz45g.jp` | `%E4%BE%8B%E3%81%88.jp` | **未补齐**，见下 |

### 反斜杠：我们拒绝，这是有意的

WHATWG 规定特殊 scheme 下 `\` 等同于 `/`，是为了迁就 Windows 的路径习惯。后果是 `https://a.com\evil.com` 会被解析成跳转到 `evil.com`——这是真实存在过的钓鱼手法。

`NSURL` 直接拒绝这种串，我们跟着拒绝。**比 WHATWG 更安全，而且 App 里不存在"用户粘贴 Windows 路径"的场景。**

### IDN 没转 punycode

`https://例え.jp` 在浏览器里 hostname 是 `xn--r8jz45g.jp`，我们给的是 percent-encoded 形式。

**暂时不补**，因为 `NSURLSession` 发请求时系统自己会处理 IDN——也就是说请求能发对，只是 `hostname` 读出来的形状不同。真要补需要一套 punycode 实现。记在这里，等有人被咬到再说。

## `URLSearchParams`

纯 JS 实现——它就是一个有序键值对列表加 `application/x-www-form-urlencoded` 的编解码规则，没有原生对应物可映射。

注意这套编码和 URL 其余部分**不同**：空格编码成 `+` 而不是 `%20`。

```js
const q = new URLSearchParams('a=1&b=2&a=3');
q.get('a');        // '1'  —— 取第一个
q.getAll('a');     // ['1', '3']
q.set('a', '9');   // 替换第一个、删掉其余同名的，位置保持
q.toString();      // 'a=9&b=2'
```

和宿主 `URL` **双向绑定**：

```js
const u = new URL('https://a.com/?k=1');
u.searchParams.append('k2', 'v2');
u.search;          // '?k=1&k2=v2'
u.search = '?z=9';
u.searchParams.get('z');   // '9'
```

## `Headers`

名字大小写不敏感（内部一律存小写），同名多值用 `', '` 合并。`Set-Cookie` 是例外——它不能合并，用 `getSetCookie()` 取数组。

迭代按名字排序，这是规范要求的。

```js
const h = new Headers();
h.append('Accept', 'a');
h.append('accept', 'b');
h.get('ACCEPT');           // 'a, b'
h.append('Set-Cookie', 'x=1');
h.append('Set-Cookie', 'y=2');
h.getSetCookie();          // ['x=1', 'y=2']
```

## 还没做

- `fetch` / `Request` / `Response`（下一步）
- IDN 转 punycode
- URL 解析的交付方式优化（直接构造 JS 对象，省掉 JSON 往返）

## 和原生的对照

`URL` / `URLSearchParams` / `Headers` 是 WHATWG 的接口，不是 ObjC API 的映射。原生侧用 `NSURLComponents` 解析，差异见上。

| WHATWG | Nacre |
| --- | --- |
| `new URL(input, base)` | 一样，但**没有 base 时必须是绝对 URL** |
| `url.searchParams` | 一样 |
| `new Headers(init)` | 一样，但不做 forbidden header 检查 |

---

实现原理见[实现说明](../internals/network.md)。

← 返回 [API 文档](README.md)
