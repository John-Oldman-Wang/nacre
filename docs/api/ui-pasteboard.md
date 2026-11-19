---
type: reference
native: UIPasteboard
status: partial
---

# `UIPasteboard`

**`UIPasteboard`** 表示系统剪贴板。App 把一段文字写进去，用户就能在任何 App 里粘贴它；用户在别的 App 里复制的文字，App 也能从它读出来。

系统剪贴板只有一个，所有 App 共用。它由系统提供，从 [`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md) 取。

读和写都通过 [`string`](ui-pasteboard/string.md) 属性，是同步的：赋值的那一行执行完，文字已经在剪贴板里；读的那一行返回时，拿到的就是内容。现在只能读写文字，图片、网址、颜色还不能，见[还不能做的](#还不能做的)。

**继承关系**：`EventTarget` → `NSObject` → `UIPasteboard`

复制、粘贴按钮怎么写才不惊扰用户，见指南[复制和粘贴文字](../guides/clipboard.md)。

## 构造函数

不能用 `new` 创建。`new UIPasteboard()` 抛 `TypeError: Illegal constructor: UIPasteboard is created by the runtime, not by new`。实例从 [`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md) 取。

## 静态属性

[`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md) <small>只读</small>

整个系统共用的剪贴板。每次读得到同一个对象。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`string`](ui-pasteboard/string.md) | 剪贴板里的文字。读它可能弹出[系统提示](#读取时的系统提示)，写入替换原有的内容 |
| [`hasStrings`](ui-pasteboard/hasstrings.md) <small>只读</small> | 剪贴板里有没有文字。只查询，没有系统提示 |
| [`changeCount`](ui-pasteboard/changecount.md) <small>只读</small> | 内容变化的计数。只查询，没有系统提示 |

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-pasteboard/change-event.md) | 这个 App 自己修改了剪贴板的内容。别的 App 修改时不派发 |

## 读取时的系统提示

读 [`string`](ui-pasteboard/string.md) 时，如果剪贴板里的内容是用户在**别的 App** 里复制的，系统会先弹出一个提示，让用户决定是否允许这个 App 粘贴。**用户回应之前，读 `string` 的那一行不返回。** 这段时间里 App 的代码不执行：定时器不触发，事件回调不执行，界面不响应。

在真机（iPhone 14）上实测过一次：读别的 App 复制的内容，这一行用了 6613 毫秒才返回。这个时长就是用户看到提示到点下按钮的时间，它取决于用户，没有上限。

| 情况 | 会不会有提示 |
| --- | --- |
| 读 `string`，内容是别的 App 复制的 | 会（真机实测） |
| 读 `string`，内容是这个 App 自己写进去的 | 不会。**未在真机验证**，来自 iOS 的规则；模拟器上读自己写的内容立刻返回 |
| 读 `hasStrings` | 不会 |
| 读 `changeCount` | 不会 |
| 写 `string` | 不会 |

用户在提示里选了不允许时 `string` 读到什么，**未在模拟器验证**。模拟器上是否出现这个提示，**未在模拟器验证**。

所以只在用户明确要粘贴时读 `string`，见指南里的[推荐的做法](../guides/clipboard.md#推荐的做法)。

## 示例

下面的代码从空白 App 开始，在屏幕上放一个按钮。点它，把一个订单号放进剪贴板。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const pasteboard = UIPasteboard.generalPasteboard;

  const button = UIButton.buttonWithType('system');
  button.setTitle('复制订单号', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    pasteboard.string = '20261112-0042';
    console.log('已复制');
  });
});
```

**效果**

- 屏幕左上方出现一个文字按钮「复制订单号」。
- 点它，控制台输出 `已复制`。
- 切到别的 App（比如备忘录），长按输入区域选「粘贴」，出现 `20261112-0042`。

这段代码没有作为一个整体在模拟器运行过。「写进去再读出来是同一段文字」在验收用例里核对过；切到别的 App 粘贴这一步**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIPasteboard.generalPasteboard` | `UIPasteboard.generalPasteboard` |
| `pasteboard.string = @"文字"` | `pasteboard.string = '文字'` |
| `NSString *text = pasteboard.string` | `const text = pasteboard.string` |
| `pasteboard.hasStrings` | `pasteboard.hasStrings` |
| `pasteboard.changeCount` | `pasteboard.changeCount` |
| 监听 `UIPasteboardChangedNotification` | `pasteboard.addEventListener('change', …)` |

与浏览器的对照：

| 浏览器 | Nacre |
| --- | --- |
| `await navigator.clipboard.writeText('文字')` | `pasteboard.string = '文字'`，同步 |
| `await navigator.clipboard.readText()` | `pasteboard.string`，同步，可能停住界面等用户回应 |
| 没有对应 | `pasteboard.hasStrings`、`pasteboard.changeCount` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 复制和粘贴图片、网址、颜色 | `image`、`URL`、`color`，以及 `hasImages` 等 |
| 一次放多条内容 | `strings`、`items` |
| 让复制的内容过一段时间自动失效，或者只在本机有效 | `setItems:options:` 的 `expirationDate`、`localOnly` |
| App 自己专用的剪贴板 | `pasteboardWithName:create:`、`pasteboardWithUniqueName` |
| 不取内容，只判断剪贴板里是不是网址或数字 | `detectPatternsForPatterns:completionHandler:` |
| 用系统自带的「粘贴」按钮，免去系统提示 | `UIPasteControl` |

## 参见

- [复制和粘贴文字](../guides/clipboard.md)：粘贴按钮、清空、得知内容变了
- [`UIButton`](ui-button.md)：例子里触发复制的按钮
- [`application`](application.md)：`active` 事件，App 回到前台时检查 `changeCount`
- [运行时怎么工作](how-it-works.md)：为什么一行代码不返回时整个界面不动
