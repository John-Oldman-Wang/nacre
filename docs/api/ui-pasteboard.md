---
type: reference
native: UIPasteboard
status: partial
---

# `UIPasteboard`

`UIPasteboard` 是系统剪贴板。用它把一段文字放进剪贴板（复制），或者读出剪贴板里的文字（粘贴）。

它相当于浏览器里的 `navigator.clipboard`。有三点不同：

- **读和写都是同步的。** 直接读写 `string` 属性，没有 Promise。
- **不能创建。** 整个系统共用一个，从 `UIPasteboard.generalPasteboard` 取。
- **现在只能读写文字。** 图片、网址、颜色还不行。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个按钮。点它，把一个订单号放进剪贴板。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 取得系统剪贴板
  const pasteboard = UIPasteboard.generalPasteboard;

  // 2. 一个按钮
  const button = UIButton.buttonWithType('system');
  button.setTitle('复制订单号', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  // 3. 点击时把文字写进剪贴板
  button.addEventListener('touchUpInside', () => {
    pasteboard.string = '20261112-0042';
    console.log('已复制');
  });
});
```

**效果**：

- 屏幕左上方出现一个文字按钮「复制订单号」。
- 点它，控制台输出 `已复制`。
- 切到别的 App（比如备忘录），长按输入区域选「粘贴」，出现 `20261112-0042`。

这段代码没有作为一个整体在模拟器运行过。「写进去再读出来是同一段文字」在验收用例里核对过；切到别的 App 粘贴这一步**未验证**。

## 常见用法

以下例子都沿用上面的 `pasteboard`。

### 读出剪贴板里的文字

```js
const text = pasteboard.string;
if (text !== null) {
  console.log('剪贴板里是：' + text);
}
```

**效果**：剪贴板里有文字时输出它。没有文字时（空的，或者里面是图片）`text` 是 `null`，什么都不输出。

> **注意**：读 `string` 是真的去取内容。内容是用户在别的 App 里复制的时，系统会先弹出一个提示，让用户决定是否允许这个 App 粘贴。**用户回应之前，这一行代码不会返回，整个界面停住不动。** 真机上实测，这一次读取用了 6.6 秒才返回。所以只在用户明确要粘贴时读它（比如点了「粘贴」按钮），不要在启动时或定时读。
>
> 读自己写进去的内容不会有提示，立刻返回。

### 只判断有没有文字，不取内容

```js
if (pasteboard.hasStrings) {
  console.log('可以粘贴');
}
```

**效果**：剪贴板里有文字时输出 `可以粘贴`。这个判断不取内容，不会引出系统提示。适合用来决定「粘贴」按钮是否可点。

### 清空剪贴板

```js
pasteboard.string = null;
console.log(pasteboard.hasStrings);
```

**效果**：剪贴板被清空，控制台输出 `false`。

### 知道剪贴板的内容变了

`changeCount` 是一个计数，剪贴板的内容每变一次它就变大。先记下一个值，之后再读，不一样就说明内容变过。

```js
let seen = pasteboard.changeCount;

application.addEventListener('active', () => {
  if (pasteboard.changeCount !== seen) {
    seen = pasteboard.changeCount;
    console.log('剪贴板的内容变了');
  }
});
```

**效果**：用户切到别的 App 复制了东西再切回来，输出 `剪贴板的内容变了`。

真机上核对过：在别的 App 里复制之后回来，`changeCount` 从 24 变成了 25，这期间没有收到 `change` 事件。

读 `changeCount` 不取内容，不会引出系统提示。

App 在前台时内容变了，会派发 `change` 事件：

```js
pasteboard.addEventListener('change', () => {
  console.log('变了，现在的计数是 ' + pasteboard.changeCount);
});
```

**效果**：自己的代码写了 `string` 之后，输出一行 `变了，现在的计数是 …`。一次写入可能输出不止一行，见[事件](#事件)。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIPasteboard
```

### 取得

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `UIPasteboard.generalPasteboard` | `UIPasteboard` | 类上的只读属性。整个系统共用的剪贴板。每次读得到同一个对象 |

- `new UIPasteboard()` 抛 `TypeError: Illegal constructor: UIPasteboard is created by the runtime, not by new`

### 属性

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `string` | 字符串或 `null` | 是 | 是 | 剪贴板里的文字。没有文字时读到 `null`。写入一段文字会替换掉剪贴板里原有的全部内容。写 `null` 会清空剪贴板（实测） |
| `hasStrings` | 布尔 | 是 | 否 | `true`：剪贴板里有文字。`false`：没有。只是查询，不取内容 |
| `changeCount` | 数 | 是 | 否 | 内容变化的计数，单位是次。只增不减。它的具体数值没有意义，只用来和之前读到的值比较 |

- 自己的代码造成的变化通过 [`change` 事件](#事件)得知。别的 App 造成的变化没有事件，回到前台后比较 `changeCount`。
- **出错**：给 `string` 写的不是字符串也不是 `null`：`TypeError: string must be a string or null`

### 事件

| 事件名 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `change` | 剪贴板的内容变了 | `Event`，没有额外的字段。新的内容从 `string` 读 |

- 自己的代码写 `string` 会派发这个事件（实测）。
- **一次修改派发了两次。** 模拟器上连续写入两次收到 4 次 `change`，真机上写入一次收到 2 次。所以不要用收到事件的次数来计数，要知道变了几次读 `changeCount`。
- **别的 App 修改剪贴板时不派发这个事件**（真机实测）。要知道 App 在后台期间内容有没有变，回到前台后比较 `changeCount`。
- 事件不能取消。
- **出错**：事件名不是 `change`：`TypeError: addEventListener has no value "paste"; expected one of: change`

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `UIPasteboard.generalPasteboard` | `UIPasteboard.generalPasteboard` |
| `pasteboard.string = @"文字"` | `pasteboard.string = '文字'` |
| `NSString *text = pasteboard.string` | `const text = pasteboard.string` |
| `pasteboard.hasStrings` | `pasteboard.hasStrings` |
| `pasteboard.changeCount` | `pasteboard.changeCount` |
| 监听 `UIPasteboardChangedNotification` | `pasteboard.addEventListener('change', …)` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 复制和粘贴图片、网址、颜色 | `image`、`URL`、`color`，以及 `hasImages` 等 | 未实现 |
| 一次放多条内容 | `strings`、`items` | 未实现 |
| 让复制的内容过一段时间自动失效，或者只在本机有效 | `setItems:options:` 的 `expirationDate`、`localOnly` | 未实现 |
| App 自己专用的剪贴板 | `pasteboardWithName:create:`、`pasteboardWithUniqueName` | 未实现 |
| 不取内容，只判断剪贴板里是不是网址或数字 | `detectPatternsForPatterns:completionHandler:` | 未实现 |
| 用系统自带的「粘贴」按钮，免去系统提示 | `UIPasteControl` | 未实现 |

## 参见

- [`UIButton`](ui-button.md)：例子里触发复制的按钮
- [`application`](application.md)：`active` 事件，App 回到前台时检查 `changeCount`
