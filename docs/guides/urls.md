# 拼接和解析网址

这一篇讲怎么用 [`URL`](../api/url.md) 拼出和拆开地址，用 [`URLSearchParams`](../api/url-search-params.md) 改查询参数，用 [`Headers`](../api/headers.md) 准备请求头。这三个类都不涉及网络，拼好的地址和请求头交给 [`fetch()`](../api/fetch.md) 发出去。

## 推荐的做法

- **把服务器的根地址定义成一个常量，相对地址都用它作第二个参数。** App 的 JS 从本地加载，没有「当前页面的地址」，`new URL('/x')` 和 `fetch('/api')` 都会失败。要写成 `new URL('/x', api)`、`fetch(new URL('/api', api))`。原因见[地址必须是完整的](../api/url.md#地址必须是完整的)。
- **改查询参数用 [`url.searchParams`](../api/url/searchparams.md)，不要自己拼字符串。** `searchParams` 负责编码，值里有空格、`&`、`=`、中文时不会破坏地址的结构。直接给 [`url.search`](../api/url/search.md) 赋值时，内容原样写入，不做编码。
- **地址来自用户输入或服务器返回、不确定是否合法时，用 [`URL.canParse()`](../api/url/canparse.md) 或 [`URL.parse()`](../api/url/parse.md)。** 它们不抛异常。
- **请求头用 `Headers` 或普通对象都可以。** 需要按名字读、判断有没有、追加同名值时用 `Headers`，它不区分大小写；只是一次性传给 `fetch()` 时，写普通对象更短。

## 第一个例子

下面的代码拼出一个带查询参数的接口地址，再准备一组请求头。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 解析一个完整的地址
const url = new URL('https://api.example.com/v1/items?page=2');

// 2. 改一个查询参数，再加一个
url.searchParams.set('page', '3');
url.searchParams.append('q', '中 文');
console.log(url.href);

// 3. 单独读某个部分
console.log(url.hostname, url.pathname);

// 4. 准备请求头。名字不区分大小写
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
console.log(headers.get('content-type'));
```

**结果**：控制台输出三行。

- `https://api.example.com/v1/items?page=3&q=%E4%B8%AD+%E6%96%87`
- `api.example.com /v1/items`
- `application/json`

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

下面每一节的代码各自新建变量，不沿用这里的。

## 拆开一个地址

```js
const parts = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
console.log(parts.protocol);   // https:
console.log(parts.username);   // u
console.log(parts.host);       // example.com
console.log(parts.port);       // 空字符串
console.log(parts.pathname);   // /a/c
console.log(parts.search);     // ?x=1&y=2
console.log(parts.hash);       // #f
console.log(parts.origin);     // https://example.com
console.log(parts.href);       // https://u:p@example.com/a/c?x=1&y=2#f
```

**结果**：每行输出注释里的内容。`protocol` 带结尾的冒号，`search` 带开头的问号，`hash` 带开头的井号。主机转成了小写，默认端口 443 被省略，路径里的 `..` 被化简，见[地址会被整理成统一的写法](../api/url.md#地址会被整理成统一的写法)。

## 从一个起点解析相对地址

```js
const api = 'https://api.example.com/v1/';
console.log(new URL('items', api).href);
console.log(new URL('/x', 'https://a.com').href);
console.log(new URL('../y', 'https://a.com/a/b/c').pathname);
```

**结果**：输出 `https://api.example.com/v1/items`、`https://a.com/x` 和 `/a/y`。

## 判断一串文本是不是合法地址

```js
console.log(URL.canParse('/x'));
console.log(URL.canParse('https://a.com/x'));

const parsed = URL.parse('https://a.com/x');
if (parsed) {
  console.log(parsed.pathname);
}
```

**结果**：依次输出 `false`、`true`、`/x`。`URL.parse()` 解析不了时返回 `null`，所以用之前先判空。

## 改地址的某个部分

```js
const page = new URL('https://a.com/p');
page.pathname = 'q';
page.hash = 'top';
console.log(page.href);
```

**结果**：输出 `https://a.com/q#top`。给 `pathname` 赋值时开头的 `/` 可以省略，给 `hash` 赋值时 `#` 可以省略，给 `search` 赋值时 `?` 可以省略，会自动补上。

给 `protocol`、`username`、`password`、`host`、`hostname`、`port`、`pathname` 赋值后，整个地址重新解析一遍。新值让地址不合法时，这次赋值不生效，地址保持原样，不抛异常。

## 给查询参数的值编码

```js
const search = new URL('https://api.example.com/search');
search.searchParams.set('q', '中 文');
console.log(search.href);
```

**结果**：输出 `https://api.example.com/search?q=%E4%B8%AD+%E6%96%87`。空格编码成 `+`，中文按 UTF-8 编码，见[编码规则](../api/url-search-params.md#编码规则)。

## 读同名的多个查询参数

```js
const repeated = new URLSearchParams('a=1&b=2&a=3');
console.log(repeated.get('a'));
console.log(repeated.getAll('a'));
console.log(repeated.size);
```

**结果**：依次输出 `1`、`['1', '3']`、`3`。`get()` 只返回第一个，要全部用 `getAll()`。

## 替换、追加、删除查询参数

```js
const edits = new URLSearchParams('a=1&b=2&a=3');
edits.set('a', '9');
console.log(edits.toString());

edits.append('c', '中 文');
console.log(edits.toString());

edits.delete('a');
console.log(edits.toString());
```

**结果**：依次输出 `a=9&b=2`、`a=9&b=2&c=%E4%B8%AD+%E6%96%87`、`b=2&c=%E4%B8%AD+%E6%96%87`。

`set()` 把第一个同名参数换成新值，删掉其余同名的，位置不变。没有同名参数时加在末尾。

## 地址和它的查询参数互相同步

```js
const synced = new URL('https://a.com/?k=1');
synced.searchParams.append('k2', 'v2');
console.log(synced.search);

synced.search = '?z=9';
console.log(synced.searchParams.get('z'));
```

**结果**：输出 `?k=1&k2=v2` 和 `9`。改 `searchParams`，`search` 和 `href` 跟着变；改 `search` 或 `href`，`searchParams` 跟着变。

## 追加同名的请求头

```js
const accept = new Headers();
accept.append('Accept', 'a');
accept.append('accept', 'b');
console.log(accept.get('ACCEPT'));
```

**结果**：输出 `a, b`。同名的多个值读出来时用 `, ` 连成一个字符串。要覆盖而不是追加，用 [`set()`](../api/headers/set.md)。

## 读多条 `Set-Cookie`

```js
const cookies = new Headers();
cookies.append('Set-Cookie', 'x=1');
cookies.append('Set-Cookie', 'y=2');
console.log(cookies.getSetCookie());
```

**结果**：输出 `['x=1', 'y=2']`。`Set-Cookie` 的值里本身可能有逗号，不能连成一个字符串，所以用 [`getSetCookie()`](../api/headers/getsetcookie.md) 取数组。

## 遍历全部请求头

```js
const all = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
for (const [name, value] of all) {
  console.log(name, value);
}
```

**结果**：输出 `accept a` 和 `content-type application/json`。名字都是小写，按名字的字母顺序排列，和加入的先后无关。`Set-Cookie` 有几条就出现几次。

## 参见

- [`URL`](../api/url.md)：地址的各个部分
- [`URLSearchParams`](../api/url-search-params.md)：查询参数的读写
- [`Headers`](../api/headers.md)：请求头和响应头
- [`fetch()`](../api/fetch.md)：把拼好的地址和请求头发出去
