# 复制和粘贴文字

这一篇讲怎么用 [`UIPasteboard`](../api/ui-pasteboard.md) 做「复制」和「粘贴」：把文字放进系统剪贴板，读出用户复制的文字，以及怎样读才不惊扰用户。每个属性的细节在 [`UIPasteboard`](../api/ui-pasteboard.md) 的参考页。

## 推荐的做法

- **只在用户做了「复制」时写剪贴板。** 剪贴板是用户的，里面可能有他刚复制的内容。不要在启动时或后台自动写。
- **只在用户明确要粘贴时读 [`string`](../api/ui-pasteboard/string.md)。** 比如用户点了 App 里的「粘贴」按钮。内容来自别的 App 时读它会弹出系统提示，并且用户回应之前界面不动（见[读取时的系统提示](../api/ui-pasteboard.md#读取时的系统提示)）。用户点了按钮，这个提示是他预期之内的，界面停住的那几秒他正在看提示。
- **不要在启动时、回到前台时或定时器里读 `string`。** 那样用户一打开 App 就看到「是否允许粘贴」的提示，而且在他回应之前整个界面不动。
- **想知道「有没有可粘贴的文字」，读 [`hasStrings`](../api/ui-pasteboard/hasstrings.md)。** 它只查询，不取内容，不会有提示。用它决定「粘贴」按钮是否可点。
- **想知道「内容变了没有」，比较 [`changeCount`](../api/ui-pasteboard/changecount.md)。** 它同样不取内容。

## 第一个例子

从空白 App 开始，放一个「复制」按钮和一个「粘贴」按钮。

```js
/** @type {UIPasteboard} */
const pasteboard = UIPasteboard.generalPasteboard;

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const copy = UIButton.buttonWithType('system');
  copy.setTitle('复制订单号', { forState: ['normal'] });
  copy.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(copy);
  copy.addEventListener('click', () => {
    pasteboard.string = '20261112-0042';
    console.log('已复制');
  });

  const paste = UIButton.buttonWithType('system');
  paste.setTitle('粘贴', { forState: ['normal'] });
  paste.frame = new CGRect(40, 180, 200, 44);
  page.view.addSubview(paste);
  paste.addEventListener('click', () => {
    if (!pasteboard.hasStrings) {
      console.log('剪贴板里没有文字');
      return;
    }
    const text = pasteboard.string; // 可能弹出系统提示，等用户回应后才返回
    if (text !== null) {
      console.log('粘贴：' + text);
    }
  });
});
```

**效果**

- 屏幕左上方出现两个文字按钮「复制订单号」和「粘贴」。
- 点「复制订单号」，控制台输出 `已复制`。切到别的 App 粘贴，出现 `20261112-0042`。**切到别的 App 粘贴未在模拟器验证。**
- 剪贴板里没有文字时点「粘贴」，输出 `剪贴板里没有文字`，不读内容，不会有提示。
- 有文字时点「粘贴」，读出来并输出；内容来自别的 App 时，系统先弹出提示。

读 `hasStrings` 之后仍然要判断 `string` 是不是 `null`：两次读之间内容可能变了。

这段代码没有作为一个整体在模拟器运行过。「写进去再读出来是同一段文字」在验收用例里核对过。

下面各节沿用这里的 `pasteboard`。

## 清空剪贴板

```js
pasteboard.string = null;
console.log(pasteboard.string, pasteboard.hasStrings);
```

**结果**：剪贴板被清空，控制台输出 `null false`。

清空的是整个系统剪贴板，包括用户在别的 App 里复制的内容。

## 用户离开 App 期间内容变了没有

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

这段代码只读 `changeCount`，不会有系统提示。发现变了之后不要接着读 `string`，否则用户一回到 App 就看到提示。适合的做法是让「粘贴」按钮变成可点，等用户自己点。

## 自己的代码改了剪贴板时得到通知

App 自己写 `string` 之后，剪贴板上派发 [`change`](../api/ui-pasteboard/change-event.md) 事件：

```js
pasteboard.addEventListener('change', () => {
  console.log('变了，现在的计数是 ' + pasteboard.changeCount);
});

pasteboard.string = '新的内容';
```

**结果**：输出两行 `变了，现在的计数是 …`，两行里的数相同。一次写入派发两次事件，所以回调里的操作要能重复执行。

## 参见

- [`UIPasteboard`](../api/ui-pasteboard.md)
- [`UIButton`](../api/ui-button.md)：例子里的按钮
- [`application`](../api/application.md)：`active` 事件
