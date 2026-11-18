---
type: reference
native: UIAlertController
status: partial
---

# `UIAlertController` 和 `UIAlertAction`

**`UIAlertController`** 表示一个系统弹窗：一段标题、一段说明文字，加上若干个按钮。弹窗盖在当前界面上面，用户点了其中一个按钮之后它才消失。弹窗有两种样式，创建时选定：

- **提示框**（`'alert'`）：出现在屏幕中间。用来告诉用户一件事，或者让用户做一个决定。可以带输入框。
- **底部菜单**（`'actionSheet'`）：从屏幕底部升起来。用来让用户在几个操作里选一个。

**`UIAlertAction`** 表示弹窗上的一个按钮。按钮有标题和样式，用户点了它，它派发 `click` 事件。

`UIAlertController` 是一个[页面](ui-view-controller.md)。它没有自己的「显示」方法，用页面的 [`presentViewController()`](ui-view-controller.md#presentviewcontroller) 弹出来。弹窗的外观由系统决定，App 只提供文字和按钮。

> **注意**：创建、属性的读写和报错在模拟器（iPhone Air，iOS 27.2）的验收里验过。屏幕上的样子、点按钮之后发生的事，要有人真的点一下才验得到，都**未在模拟器验证**。

## 弹窗什么时候关，事件什么时候来

用户点弹窗上的任何一个按钮，系统都会把弹窗关掉。App 不能让某个按钮「点了不关」。

被点的那个按钮派发一次 `click`。事件在弹窗关掉之后派发，**未在模拟器验证**。其余的按钮什么都不派发。

- **没有监听器的按钮也能点。** 点了只是把弹窗关掉。「知道了」「取消」这类按钮通常不需要监听。
- **禁用的按钮点不动。** `isEnabled` 是 `false` 时按钮是灰色的，点它弹窗不关，也不派发事件。**未在模拟器验证。**
- **用代码关掉弹窗不算点了按钮。** 调 [`dismissViewController()`](ui-view-controller.md#dismissviewcontroller) 关掉弹窗时，没有按钮派发事件。**未在模拟器验证。**
- **底部菜单可以点菜单外面关掉。** 这等于点了取消样式的那个按钮，那个按钮派发事件。**未在模拟器验证。**
- **提示框点外面关不掉。** 所以提示框至少要有一个按钮；一个按钮都没有的提示框，用户没有办法关掉它，只能由代码关。**未在模拟器验证。**
- **回调里读输入框。** 弹窗关掉之后，`alert.textFields` 里的输入框还在，`text` 是用户输入的内容。

## 推荐的做法

**每次要弹窗时新建一个，用完不保留。** 弹窗上的文字和按钮通常取决于当时的数据。新建一个弹窗的开销很小。

**让用户做决定时，给一个取消样式的按钮。** 系统把取消按钮放在用户习惯的位置；在底部菜单里，它还让「点外面」有了去处。一个弹窗只能有一个取消样式的按钮。

**会删东西的按钮用 `'destructive'` 样式。** 系统把它的标题显示成红色。**未在模拟器验证。**

**一句话的提示用提示框，几个操作里选一个用底部菜单。** 输入框只能加在提示框上。

**在按钮上监听，不要在弹窗上监听。** 弹窗自己没有事件。每个按钮各自派发自己的事件，回调里不用再判断是哪一个。

**不要用页面的关闭事件来得知弹窗关了。** [`dismiss`](ui-view-controller.md#关闭事件) 这一组事件在弹窗上不会派发，监听它们不报错，只是收不到。弹窗只有两种关法：用户点了某个按钮，这时那个按钮派发事件；或者代码调了 `dismissViewController()`，这时等它返回的 Promise。

## 完整例子

下面的代码从空白 App 开始，在页面上放一个按钮。点它弹出一个提示框，问用户要不要删除。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('删除照片', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    // 1. 建弹窗：标题、说明、样式
    const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
      message: '删除之后不能恢复。',
      preferredStyle: 'alert',
    });

    // 2. 建两个按钮
    const cancel = UIAlertAction.actionWithTitle('取消', { style: 'cancel' });
    const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });

    // 3. 点了「删除」做什么。「取消」只需要把弹窗关掉，不用监听
    remove.addEventListener('click', () => {
      console.log('照片删掉了');
    });

    // 4. 把按钮加到弹窗上
    alert.addAction(cancel);
    alert.addAction(remove);

    // 5. 从当前页面弹出来
    page.presentViewController(alert, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）：

- 页面左上方有一个蓝色文字的按钮「删除照片」。
- 点它，屏幕中间出现一个提示框，标题是「删除这张照片？」，下面一行说明，底下两个按钮「取消」和红色的「删除」。
- 点「删除」，提示框消失，控制台输出 `照片删掉了`。
- 点「取消」，提示框消失，控制台没有输出。

## 常见用法

下面的例子沿用完整例子里的 `page`。

### 提示一句话

```js
const alert = UIAlertController.alertControllerWithTitle('保存失败', {
  message: '网络连接断开了，请稍后再试。',
  preferredStyle: 'alert',
});
alert.addAction(UIAlertAction.actionWithTitle('知道了', { style: 'default' }));
page.presentViewController(alert, { animated: true });
```

**效果**（**未在模拟器验证**）：屏幕中间出现提示框，只有一个按钮「知道了」。点它提示框消失。

### 等用户选完再往下走

按钮的事件可以包成一个 Promise，调用的地方就能用 `await` 等用户的选择。

```js
function confirm(page, title, message) {
  return new Promise((resolve) => {
    const alert = UIAlertController.alertControllerWithTitle(title, {
      message,
      preferredStyle: 'alert',
    });
    const no = UIAlertAction.actionWithTitle('取消', { style: 'cancel' });
    const yes = UIAlertAction.actionWithTitle('确定', { style: 'default' });
    no.addEventListener('click', () => resolve(false));
    yes.addEventListener('click', () => resolve(true));
    alert.addAction(no);
    alert.addAction(yes);
    page.presentViewController(alert, { animated: true });
  });
}

async function logOut() {
  if (await confirm(page, '退出登录？', '退出之后要重新输入密码。')) {
    console.log('退出了');
  }
}
```

**效果**（**未在模拟器验证**）：调 `logOut()` 弹出提示框。点「确定」，控制台输出 `退出了`；点「取消」，没有输出。

两个按钮都要监听：只监听「确定」的话，用户点「取消」时这个 Promise 永远不会有结果。

### 让用户在几个操作里选一个

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
const save = UIAlertAction.actionWithTitle('存到相册', { style: 'default' });
const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
save.addEventListener('click', () => console.log('存了'));
remove.addEventListener('click', () => console.log('删了'));
menu.addAction(save);
menu.addAction(remove);
menu.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
page.presentViewController(menu, { animated: true });
```

**效果**（**未在模拟器验证**）：

- 屏幕底部升起一个菜单，三项：「存到相册」、红色的「删除」、「取消」。
- 点「存到相册」，菜单消失，控制台输出 `存了`。
- 点「取消」或者菜单外面的空白处，菜单消失，没有输出。

底部菜单的标题和说明都可以是 `null`，这时菜单里只有按钮。

### 让用户输入一段文字

`addTextField()` 往提示框里加一个输入框，并把它返回。它是一个普通的 [`UITextField`](ui-text-field.md)，照常配置。

```js
const alert = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const field = alert.addTextField();
field.placeholder = '相册名';

const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
save.addEventListener('click', () => {
  console.log('名字是', field.text);
});
alert.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
alert.addAction(save);
page.presentViewController(alert, { animated: true });
```

**效果**（**未在模拟器验证**）：

- 提示框里标题下面有一个输入框，里面是灰色的「相册名」。提示框出现时键盘弹起。
- 输入 `旅行`，点「保存」，提示框消失，控制台输出 `名字是 旅行`。

输入密码时把 `field.isSecureTextEntry` 设成 `true`。可以加多个输入框，它们从上到下按加进来的顺序排列。

### 没填内容时不让点「保存」

接着上一个例子，在弹出之前加几行：

```js
save.isEnabled = false;
field.addEventListener('input', () => {
  save.isEnabled = field.text.length > 0;
});
```

**效果**（**未在模拟器验证**）：提示框刚出现时「保存」是灰色的，点不动。输入框里有了字，「保存」变成可以点的；把字删光，它又变灰。

### 标出推荐的那个按钮

```js
alert.preferredAction = save;
```

**效果**（**未在模拟器验证**）：提示框里「保存」的标题加粗显示。接了键盘时按回车等于点它。

`preferredAction` 必须是已经用 `addAction()` 加进来的按钮，所以这一行写在 `addAction()` 之后。

### 用代码关掉弹窗

```js
const alert = UIAlertController.alertControllerWithTitle('正在同步…', {
  preferredStyle: 'alert',
});
await page.presentViewController(alert, { animated: true });
// …同步完成之后
await alert.dismissViewController({ animated: true });
```

**效果**（**未在模拟器验证**）：出现一个没有按钮的提示框，用户关不掉它。`dismissViewController()` 把它关掉。

## 两种样式

| `preferredStyle` | 出现在哪 | 能带输入框吗 | 适合 |
| --- | --- | --- | --- |
| `'alert'` | 屏幕中间 | 能 | 告知一件事；让用户确认；让用户输入一小段文字 |
| `'actionSheet'` | 从屏幕底部升起来 | 不能，调 `addTextField()` 抛 `TypeError` | 在几个操作里选一个 |

样式在创建时给，之后不能改。

## 按钮的三种样式

| `style` | 效果 |
| --- | --- |
| `'default'` | 普通按钮 |
| `'cancel'` | 取消。位置由系统安排，不按加进来的顺序。一个弹窗最多一个。底部菜单里，点菜单外面等于点它 |
| `'destructive'` | 标题是红色，表示这个操作会删东西或者不能撤销 |

三种样式在屏幕上的样子**未在模拟器验证**。

## 成员说明

### `UIAlertController`

#### `UIAlertController.alertControllerWithTitle()`

创建一个弹窗。

```js
const alert = UIAlertController.alertControllerWithTitle('标题', {
  message: '说明文字',
  preferredStyle: 'alert',
});
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `title` | `string \| null` | 是 | 标题。`null` 是没有标题 |
| `options.message` | `string \| null` | 否 | 标题下面的说明文字。不给或给 `null` 是没有 |
| `options.preferredStyle` | `'alert' \| 'actionSheet'` | 是 | 样式，见[两种样式](#两种样式) |

- **返回**：新建的 `UIAlertController`。每次调用得到一个新的。
- `title` 和 `message` 不是字符串时转成字符串，比如 `5` 变成 `'5'`。
- **出错**：`preferredStyle` 没给或者不认识时抛 `TypeError`，比如 `preferredStyle has no value "modal"; expected one of: actionSheet / alert`。

`new UIAlertController()` 不能用，抛 `TypeError: Illegal constructor: UIAlertController has no public initializer; use UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })`。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | `string \| null` | 是 | 是 | 创建时给的 | 标题。继承自[页面](ui-view-controller.md) |
| `message` | `string \| null` | 是 | 是 | 创建时给的 | 标题下面的说明文字 |
| `preferredStyle` | `'alert' \| 'actionSheet'` | 是 | 否 | 创建时给的 | 样式 |
| `actions` | `UIAlertAction[]` | 是 | 否 | 空数组 | 加进来的全部按钮，按加进来的顺序 |
| `preferredAction` | `UIAlertAction \| null` | 是 | 是 | `null` | 提示框里加粗显示的按钮 |
| `textFields` | `UITextField[]` | 是 | 否 | 空数组 | 加进来的全部输入框，按加进来的顺序。底部菜单上是空数组 |
| `severity` | `'default' \| 'critical'` | 是 | 是 | `'default'` | 严重程度。`'critical'` 表示需要用户立刻处理，系统可以用更醒目的方式显示。两种取值在 iPhone 上显示出来有没有区别**未在模拟器验证** |

- 弹窗已经在屏幕上时改 `title`、`message`，屏幕上跟不跟着变**未在模拟器验证**。
- 这些属性变化时不派发事件：它们只有 App 自己能改。
- 写 `preferredAction` 时，给的不是 `UIAlertAction` 也不是 `null` 抛 `TypeError`；给的按钮不在这个弹窗里抛 `TypeError: preferredAction must be one of this alert's actions; add it with addAction() first`。
- 写 `severity` 时，不认识的值不抛异常：属性保持原来的值，控制台输出一条警告 `[Nacre] severity has no value "high"; expected one of: default / critical, ignored`。

#### `addAction()`

往弹窗上加一个按钮。

```js
alert.addAction(UIAlertAction.actionWithTitle('好', { style: 'default' }));
```

- **参数**：一个 `UIAlertAction`。
- **返回**：无。
- 按钮在弹窗上的顺序是加进来的顺序；取消样式的按钮由系统安排位置。提示框里两个按钮左右排，三个以上上下排，**未在模拟器验证**。
- 同一个按钮加两次，系统不拒绝，`actions` 里出现两个。不要这样用。
- **出错**：
  - 给的不是 `UIAlertAction`：`TypeError: addAction needs a UIAlertAction`
  - 弹窗里已经有一个取消样式的按钮，又加一个：`TypeError: addAction: an alert can have only one action with the cancel style`

弹窗已经在屏幕上之后再加按钮，会发生什么**未在模拟器验证**。在弹出之前把按钮加完。

#### `addTextField()`

往提示框里加一个输入框。

```js
const field = alert.addTextField();
field.placeholder = '相册名';
```

- **参数**：无。
- **返回**：新加的 [`UITextField`](ui-text-field.md)。它也在 `alert.textFields` 的最后一个。
- **出错**：在底部菜单上调用抛 `TypeError: addTextField: text fields can only be added to an alert whose preferredStyle is "alert"`。

#### 弹出和关闭

弹窗没有自己的方法，用页面的：

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(alert, { animated: true })`](ui-view-controller.md#presentviewcontroller) |
| 用代码关掉 | [`alert.dismissViewController({ animated: true })`](ui-view-controller.md#dismissviewcontroller) |
| 知道现在是不是弹着 | `page.presentedViewController === alert` |

两个方法都返回 Promise，在弹出或关闭的动画结束时有结果。

#### 弹窗上的事件

弹窗没有自己的事件。

- 页面的 `beforedismiss`、`dismiss`、`dismissattempt` 在弹窗上不会派发，两种样式都是：系统不让弹窗报告自己被关掉。监听它们不会报错，只是收不到。
- 用户点了哪个按钮，在那个按钮上监听，见[按钮的事件](#按钮的事件)。
- 继承来的 `traitchange`（[外观特征](ui-trait-collection.md)变了）可以监听，**未在模拟器验证**。

### `UIAlertAction`

#### `UIAlertAction.actionWithTitle()`

创建一个按钮。

```js
const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 按钮上的字 |
| `options.style` | `'default' \| 'cancel' \| 'destructive'` | 是 | 样式，见[按钮的三种样式](#按钮的三种样式) |

- **返回**：新建的 `UIAlertAction`。每次调用得到一个新的。
- `title` 不是字符串时转成字符串；`null` 和 `undefined` 得到空串。系统不接受没有标题的按钮，所以这里不会是 `null`。
- **出错**：`style` 没给或者不认识时抛 `TypeError`，比如 `style has no value "primary"; expected one of: default / cancel / destructive`。

`new UIAlertAction()` 不能用，抛 `TypeError: Illegal constructor: UIAlertAction has no public initializer; use UIAlertAction.actionWithTitle(title, { style })`。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | `string` | 是 | 否 | 创建时给的 | 按钮上的字 |
| `style` | `'default' \| 'cancel' \| 'destructive'` | 是 | 否 | 创建时给的 | 样式 |
| `isEnabled` | `boolean` | 是 | 是 | `true` | `true`：可以点。`false`：按钮是灰色的，点不动 |

标题和样式创建之后不能改。要换，新建一个按钮。

#### 按钮的事件

| 事件 | 什么时候派发 |
| --- | --- |
| `click` | 用户点了这个按钮。弹窗关掉之后派发 |

- 事件对象的 `type` 是事件名，`target` 是这个按钮。不带别的数据。
- 事件不能取消，`preventDefault()` 不起作用：派发时弹窗已经关了。
- 回调不是在手指松开的那一刻执行的，而是稍后执行，见[回调的执行时机](ui-control.md#回调的执行时机)。
- 系统派发的只有这一个名字。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[UIAlertController alertControllerWithTitle:@"标题" message:@"说明" preferredStyle:UIAlertControllerStyleAlert]` | `UIAlertController.alertControllerWithTitle('标题', { message: '说明', preferredStyle: 'alert' })` |
| `[UIAlertAction actionWithTitle:@"好" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a) { … }]` | `const a = UIAlertAction.actionWithTitle('好', { style: 'default' });`<br>`a.addEventListener('click', () => { … })` |
| `[alert addAction:action]` | `alert.addAction(action)` |
| `[alert addTextFieldWithConfigurationHandler:^(UITextField *f) { f.placeholder = @"名字"; }]` | `const f = alert.addTextField();`<br>`f.placeholder = '名字'` |
| `alert.textFields.firstObject.text` | `alert.textFields[0].text` |
| `alert.preferredAction = action` | `alert.preferredAction = action` |
| `action.enabled = NO` | `action.isEnabled = false` |
| `[self presentViewController:alert animated:YES completion:nil]` | `page.presentViewController(alert, { animated: true })` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 在 iPad 上弹底部菜单（要指定它从哪里弹出来） | `popoverPresentationController` | 未实现。运行时只支持 iPhone |
| 点了按钮不关弹窗 | 无，系统不提供 | 做不了 |
| 改弹窗的颜色、字体，往里放自己的视图 | 无公开接口 | 做不了。要自定义外观，用一个自己的页面[模态弹出](ui-view-controller.md#模态呈现) |
| 在弹窗上监听 `dismiss` 一组关闭事件 | `UIAdaptivePresentationControllerDelegate` | 做不了。系统不允许给提示框设置这个委托 |

## 参见

- [`UIViewController`](ui-view-controller.md)：弹窗的父类。弹出、关闭、谁弹出了谁
- [`UITextField`](ui-text-field.md)：弹窗里输入框的类型
- [`UIActivityViewController`](ui-activity-view-controller.md)：系统分享面板，同一组里的另一个系统页面
- [枚举](enums.md)：枚举为什么是字符串，写错了会怎样
- [实现原理：系统弹窗和分享面板](../internals/alerts.md)
