---
type: reference
native: UIPasteboard
status: partial
---

# `UIPasteboard`

**`UIPasteboard`** 表示系统剪贴板。App 把一段文字写进去，用户就能在任何 App 里粘贴它；用户在别的 App 里复制的文字，App 也能从它读出来。

系统剪贴板只有一个，所有 App 共用。它由系统提供，从 `UIPasteboard.generalPasteboard` 取，不能用 `new` 创建。每次读 `UIPasteboard.generalPasteboard` 得到的是同一个对象。

读和写都通过 `string` 属性，是同步的：赋值的那一行执行完，文字已经在剪贴板里；读的那一行返回时，拿到的就是内容。现在只能读写文字，图片、网址、颜色还不能，见[还不能做的](#还不能做的)。

## 写入

给 `string` 赋值就是复制。写入会替换剪贴板里原有的内容。写入不需要用户同意，也没有系统提示。

写 `null` 清空剪贴板：之后 `string` 读到 `null`，`hasStrings` 是 `false`。写的值不是字符串时按 `String()` 转换，比如写 `42` 得到 `'42'`；`undefined` 和 `null` 一样是清空。写入不会抛异常。

剪贴板是用户的，里面可能有他刚复制的内容。所以只在用户做了「复制」这个动作时写它，不要在启动时或后台自动写。

## 读取会弹出系统提示，并且停住界面

读 `string` 时，如果剪贴板里的内容是用户在**别的 App** 里复制的，系统会先弹出一个提示，让用户决定是否允许这个 App 粘贴。**用户回应之前，读 `string` 的那一行不返回。** 这段时间里 App 的代码不执行：定时器不触发，事件回调不执行，界面不响应。

在真机（iPhone 14）上实测过一次：读别的 App 复制的内容，这一行用了 6613 毫秒才返回。这个时长就是用户看到提示到点下按钮的时间，它取决于用户，没有上限。

提示出现的条件和已知的范围：

| 情况 | 会不会有提示 |
| --- | --- |
| 读 `string`，内容是别的 App 复制的 | 会（真机实测） |
| 读 `string`，内容是这个 App 自己写进去的 | 不会。**未在真机验证**，来自 iOS 的规则；模拟器上读自己写的内容立刻返回 |
| 读 `hasStrings` | 不会 |
| 读 `changeCount` | 不会 |
| 写 `string` | 不会 |

用户在提示里选了不允许时 `string` 读到什么，**未在模拟器验证**。模拟器上是否出现这个提示，**未在模拟器验证**。

## 推荐的做法

**只在用户明确要粘贴时读 `string`。** 比如用户点了 App 里的「粘贴」按钮。这时弹出系统提示是用户预期之内的，界面停住的那几秒他正在看提示。

**不要在启动时、回到前台时或定时器里读 `string`。** 那样用户一打开 App 就看到「是否允许粘贴」的提示，而且在他回应之前整个界面不动。

**想知道「有没有可粘贴的文字」，读 `hasStrings`。** 它只查询，不取内容，不会有提示。用它决定「粘贴」按钮是否可点。

**想知道「内容变了没有」，比较 `changeCount`。** 它同样不取内容。记下一个值，回到前台时再读，不同就说明内容变过。

```js
const pasteboard = UIPasteboard.generalPasteboard;

/** 用户点了「粘贴」按钮时调用 */
function onPasteTapped() {
  if (!pasteboard.hasStrings) {
    console.log('剪贴板里没有文字');
    return;
  }
  const text = pasteboard.string;   // 可能弹出系统提示，等用户回应后才返回
  if (text !== null) {
    console.log('粘贴：' + text);
  }
}
```

**结果**：剪贴板里没有文字时输出 `剪贴板里没有文字`，不读内容，不会有提示。有文字时读出来并输出；内容来自别的 App 时，系统先弹出提示。

读 `hasStrings` 之后仍然要判断 `string` 是不是 `null`：两次读之间内容可能变了。

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
  button.addEventListener('primaryActionTriggered', () => {
    pasteboard.string = '20261112-0042';
    console.log('已复制');
  });
});
```

**效果**：

- 屏幕左上方出现一个文字按钮「复制订单号」。
- 点它，控制台输出 `已复制`。
- 切到别的 App（比如备忘录），长按输入区域选「粘贴」，出现 `20261112-0042`。

这段代码没有作为一个整体在模拟器运行过。「写进去再读出来是同一段文字」在验收用例里核对过；切到别的 App 粘贴这一步**未在模拟器验证**。

## 常见用法

以下例子都沿用上面的 `pasteboard`。

### 读出剪贴板里的文字

```js
const text = pasteboard.string;
if (text !== null) {
  console.log('剪贴板里是：' + text);
}
```

**结果**：剪贴板里有文字时输出它。剪贴板是空的时 `text` 是 `null`，什么都不输出。剪贴板里只有图片时读到 `null`，**未在模拟器验证**。

> **注意**：内容来自别的 App 时，这一行会弹出系统提示，用户回应之前不返回，见[读取会弹出系统提示，并且停住界面](#读取会弹出系统提示并且停住界面)。把它放在用户点「粘贴」按钮的回调里。

### 只判断有没有文字，不取内容

```js
if (pasteboard.hasStrings) {
  console.log('可以粘贴');
}
```

**结果**：剪贴板里有文字时输出 `可以粘贴`。这个判断不取内容，不会有系统提示。

### 清空剪贴板

```js
pasteboard.string = null;
console.log(pasteboard.string, pasteboard.hasStrings);
```

**结果**：剪贴板被清空，控制台输出 `null false`。

清空的是整个系统剪贴板，包括用户在别的 App 里复制的内容。

### 用户离开 App 期间内容变了没有

别的 App 修改剪贴板时，这个 App 收不到任何事件。要知道用户离开期间内容有没有变，在回到前台时比较 `changeCount`：

```js
let seen = pasteboard.changeCount;

application.addEventListener('active', () => {
  if (pasteboard.changeCount !== seen) {
    seen = pasteboard.changeCount;
    console.log('剪贴板的内容变了');
  }
});
```

**结果**：用户切到别的 App 复制了东西再切回来，输出 `剪贴板的内容变了`。

真机上核对过：在别的 App 里复制之后回来，`changeCount` 从 24 变成了 25，这期间没有收到 `change` 事件。

这段代码只读 `changeCount`，不会有系统提示。发现变了之后不要接着读 `string`，否则用户一回到 App 就看到提示。

### 自己的代码改了剪贴板时得到通知

App 自己写 `string` 之后，剪贴板上派发 `change` 事件：

```js
pasteboard.addEventListener('change', () => {
  console.log('变了，现在的计数是 ' + pasteboard.changeCount);
});

pasteboard.string = '新的内容';
```

**结果**：输出两行 `变了，现在的计数是 …`，两行里的数相同。一次写入派发两次事件，见[事件](#事件)。

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
| `string` | 字符串或 `null` | 是 | 是 | 剪贴板里的文字。没有文字时读到 `null`。读它可能弹出系统提示并停住界面，见[上文](#读取会弹出系统提示并且停住界面)。写入一段文字替换原有的内容。写 `null` 清空剪贴板 |
| `hasStrings` | 布尔 | 是 | 否 | `true`：剪贴板里有文字。`false`：没有。只查询，不取内容，没有系统提示 |
| `changeCount` | 数 | 是 | 否 | 内容变化的计数，单位是次。内容每变一次它变大。它的具体数值没有意义，只用来和之前读到的值比较。只查询，没有系统提示 |

- 三个属性的变化怎么得知：自己的代码造成的变化派发 [`change` 事件](#事件)。别的 App 造成的变化没有事件，回到前台后比较 `changeCount`。
- 给 `string` 写的不是字符串时按 `String()` 转换，比如写 `42` 得到 `'42'`。写 `undefined` 和写 `null` 一样是清空。
- 给 `hasStrings`、`changeCount` 赋值抛 `TypeError`。
- 写 `string` 之后 `changeCount` 变大。写 `null` 也算一次变化。

### 事件

| 事件名 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `change` | 这个 App 自己修改了剪贴板的内容 | `Event`，没有额外的字段。新的内容从 `string` 读，计数从 `changeCount` 读 |

- **一次写入派发两次。** 真机上写入一次收到 2 次 `change`；模拟器上连续写入两次收到 4 次。所以不要用收到事件的次数来计数，要知道变了几次读 `changeCount`。回调里的操作要能重复执行。
- **回调不是在写入的那一行同步执行，而是稍后执行。** 连续写两次时，四次回调里读到的 `changeCount` 是同一个值：回调执行时两次写入都已经完成。
- **别的 App 修改剪贴板时不派发**（真机实测）。App 在后台期间内容有没有变，回到前台后比较 `changeCount`。
- 事件不能取消。
- 只有添加了监听器才会派发。用 `removeEventListener()` 移除。
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

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `await navigator.clipboard.writeText('文字')` | `pasteboard.string = '文字'`，同步 |
| `await navigator.clipboard.readText()` | `pasteboard.string`，同步，可能停住界面等用户回应 |
| 没有对应 | `pasteboard.hasStrings`、`pasteboard.changeCount` |

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
- [运行时怎么工作](how-it-works.md)：为什么一行代码不返回时整个界面不动
