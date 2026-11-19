---
type: reference
native: "-[WKWebView initWithFrame:configuration:]"
---

# `WebView()` 构造函数

**`WebView()`** 构造函数创建一个显示网页的视图，以及它里面的那张网页 [`webContents`](webcontents.md)。新建的网页是空白的，要调 [`loadURL()`](../web-contents/loadurl.md) 或 [`loadFile()`](../web-contents/loadfile.md) 才有内容。

## 语法

```
new WebView()
new WebView({ webPreferences })
```

### 参数

**`options`**

对象，可以不传。传 `null` 或 `undefined` 和不传相同。

**`options.webPreferences`**

对象，可以不传。下面两个成员都只能在这里指定，创建之后不能改。

**`options.webPreferences.partition`**

字符串，网页的数据用哪个[存储分区](../web-view.md#存储分区)。默认是空串，表示默认的那一份。

| 写法 | 数据存在哪 | App 退出之后 |
| --- | --- | --- |
| 不写，或者空串 | 默认的那一份 | 还在 |
| `'persist:名字'` | 名字对应的那一份，同名的网页共用 | 还在 |
| `'名字'` | 名字对应的那一份，只在内存里 | 没了 |

**`options.webPreferences.preload`**

字符串，[预加载脚本](../web-view.md#预加载脚本)的路径。相对路径从 App 包的根开始，`/` 开头的是绝对路径。App 包是安装到设备上的那个目录，里面是 App 的程序和打包进去的资源文件。不写就没有预加载脚本，网页里没有消息通道。

脚本在创建的这一刻就被读出来并检查语法，所以文件读不到、有语法错时，构造函数当场抛。

### 返回值

新建的 `WebView`。宽高是 0 pt，要用 `frame` 或约束给它大小。

### 异常

**`TypeError`**

- `preload` 是空串：`preload: the path is empty`。
- `preload` 指向的文件读不到：`preload: cannot read JS/web/preload.js as UTF-8 text`，路径是传进来的那个。
- 用 `class X extends WebView` 定义了子类，再 `new X()`：`Illegal constructor: X extends WebView, but subclassing native classes is not supported yet`。`WebView` 不能被继承。

**`SyntaxError`**

预加载脚本有语法错：`preload JS/web/preload.js: …`，后面是具体的语法错误。

预加载脚本运行时抛的异常不在这里报，见 [`preload-error`](../web-contents/preload-error-event.md) 事件。

## 示例

### 默认分区的网页

```js
const web = new WebView();
web.frame = new CGRect(0, 0, 390, 600);
web.webContents.loadURL('https://example.com/');
```

**效果**：得到一个 390 × 600 pt 的视图，加进界面后显示 example.com。

### 指定分区和预加载脚本

```js
const web = new WebView({
  webPreferences: { partition: 'persist:shop', preload: 'JS/web/preload.js' },
});
```

**效果**：网页的 cookie 和 `localStorage` 存在 `persist:shop` 这一份里，和别的分区隔开。每张网页加载时先执行 `JS/web/preload.js`。

## 和 Electron 的差别

对应 Electron 的 `new WebContentsView({ webPreferences })`。`webPreferences` 只支持 `partition` 和 `preload` 两项。`preload` 的相对路径从 App 包开始算；预加载脚本和网页不隔离，相当于 `contextIsolation: false`。

对应的 iOS 原生写法是 `[[WKWebView alloc] initWithFrame:configuration:]`：`partition` 对应 `configuration.websiteDataStore`，`preload` 对应一段在文档开始时注入、只进主文档的 `WKUserScript`。

## 参见

- [存储分区](../web-view.md#存储分区)
- [预加载脚本](../web-view.md#预加载脚本)
- [`session`](../session.md)：读写分区里的 cookie
