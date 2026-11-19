# 弹出提示框和菜单

这一篇讲怎么用系统弹窗 [`UIAlertController`](../api/ui-alert-controller.md) 和它的按钮 [`UIAlertAction`](../api/ui-alert-action.md) 提示用户、让用户确认、在几个操作里选一个、输入一段文字。

## 推荐的做法

- **每次要弹窗时新建一个，用完不保留。** 弹窗上的文字和按钮通常取决于当时的数据。新建一个弹窗的开销很小。
- **让用户做决定时，给一个取消样式的按钮。** 系统把取消按钮放在用户习惯的位置；在底部菜单里，它还让「点外面」有了去处。一个弹窗只能有一个取消样式的按钮。
- **会删东西的按钮用 `'destructive'` 样式。** 系统把它的标题显示成红色。**未在模拟器验证。**
- **一句话的提示用提示框，几个操作里选一个用底部菜单。** 输入框只能加在提示框上。
- **在按钮上监听，不要在弹窗上监听。** 弹窗自己没有事件。每个按钮各自派发自己的 [`click`](../api/ui-alert-action/click-event.md)，回调里不用再判断是哪一个。
- **不要用页面的关闭事件来得知弹窗关了。** [`dismiss`](../api/ui-view-controller/dismiss-event.md) 这一组事件在弹窗上不会派发，监听它们不报错，只是收不到。弹窗只有两种关法：用户点了某个按钮，这时那个按钮派发事件；或者代码调了 [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md)，这时等它返回的 Promise。

## 第一个弹窗

从空白 App 开始，在页面上放一个按钮。点它弹出一个提示框，问用户要不要删除。

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

**效果**（**未在模拟器验证**）

- 页面左上方有一个蓝色文字的按钮「删除照片」。
- 点它，屏幕中间出现一个提示框，标题是「删除这张照片？」，下面一行说明，底下两个按钮「取消」和红色的「删除」。
- 点「删除」，提示框消失，控制台输出 `照片删掉了`。
- 点「取消」，提示框消失，控制台没有输出。

下面的例子沿用这里的 `page`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
```

## 提示一句话

```js
const notice = UIAlertController.alertControllerWithTitle('保存失败', {
  message: '网络连接断开了，请稍后再试。',
  preferredStyle: 'alert',
});
notice.addAction(UIAlertAction.actionWithTitle('知道了', { style: 'default' }));
page.presentViewController(notice, { animated: true });
```

**效果**（**未在模拟器验证**）：屏幕中间出现提示框，只有一个按钮「知道了」。点它提示框消失。

「知道了」「取消」这类只需要关掉弹窗的按钮不用监听。

## 等用户选完再往下走

按钮的事件可以包成一个 Promise，调用的地方就能用 `await` 等用户的选择。

```js
/**
 * @param {UIViewController} from
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
function confirm(from, title, message) {
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
    from.presentViewController(alert, { animated: true });
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

## 让用户在几个操作里选一个

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
const saveToAlbum = UIAlertAction.actionWithTitle('存到相册', { style: 'default' });
const removePhoto = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
saveToAlbum.addEventListener('click', () => console.log('存了'));
removePhoto.addEventListener('click', () => console.log('删了'));
menu.addAction(saveToAlbum);
menu.addAction(removePhoto);
menu.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
page.presentViewController(menu, { animated: true });
```

**效果**（**未在模拟器验证**）

- 屏幕底部升起一个菜单，三项：「存到相册」、红色的「删除」、「取消」。
- 点「存到相册」，菜单消失，控制台输出 `存了`。
- 点「取消」或者菜单外面的空白处，菜单消失，没有输出。

底部菜单的标题和说明都可以是 `null`，这时菜单里只有按钮。

## 让用户输入一段文字

[`addTextField()`](../api/ui-alert-controller/addtextfield.md) 往提示框里加一个输入框，并把它返回。它是一个普通的 [`UITextField`](../api/ui-text-field.md)，照常配置。

```js
const naming = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const field = naming.addTextField();
field.placeholder = '相册名';

const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
save.addEventListener('click', () => {
  console.log('名字是', field.text);
});
naming.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
naming.addAction(save);
page.presentViewController(naming, { animated: true });
```

**效果**（**未在模拟器验证**）

- 提示框里标题下面有一个输入框，里面是灰色的「相册名」。提示框出现时键盘弹起。
- 输入 `旅行`，点「保存」，提示框消失，控制台输出 `名字是 旅行`。

输入密码时把 `field.isSecureTextEntry` 设成 `true`。可以加多个输入框，它们从上到下按加进来的顺序排列。

## 没填内容时不让点「保存」

这一节接着上一节的提示框，在弹出之前把「保存」设成不能点，并在输入时更新它。开头几行重建了上一节的 `naming`、`field` 和 `save`：

```js
const naming = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const field = naming.addTextField();
const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
naming.addAction(save);

save.isEnabled = false;
field.addEventListener('input', () => {
  save.isEnabled = field.text.length > 0;
});
page.presentViewController(naming, { animated: true });
```

**效果**（**未在模拟器验证**）：提示框刚出现时「保存」是灰色的，点不动。输入框里有了字，「保存」变成可以点的；把字删光，它又变灰。

## 标出推荐的那个按钮

```js
const naming = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
naming.addAction(UIAlertAction.actionWithTitle('取消', { style: 'cancel' }));
naming.addAction(save);

naming.preferredAction = save;
page.presentViewController(naming, { animated: true });
```

**效果**（**未在模拟器验证**）：提示框里「保存」的标题加粗显示。接了键盘时按回车等于点它。

[`preferredAction`](../api/ui-alert-controller/preferredaction.md) 必须是已经用 `addAction()` 加进来的按钮，所以这一行写在 `addAction()` 之后。

## 用代码关掉弹窗

```js
async function sync() {
  const progress = UIAlertController.alertControllerWithTitle('正在同步…', {
    preferredStyle: 'alert',
  });
  await page.presentViewController(progress, { animated: true });
  // …同步完成之后
  await progress.dismissViewController({ animated: true });
}
```

**效果**（**未在模拟器验证**）：出现一个没有按钮的提示框，用户关不掉它。`dismissViewController()` 把它关掉。

两个方法都返回 Promise，在弹出或关闭的动画结束时有结果。想知道弹窗现在是不是弹着，看 `page.presentedViewController === progress`。

## 参见

- [`UIAlertController`](../api/ui-alert-controller.md)：弹窗的全部成员
- [`UIAlertAction`](../api/ui-alert-action.md)：弹窗上的按钮
- [`UIViewController`](../api/ui-view-controller.md)：弹出和关闭页面
- [`UITextField`](../api/ui-text-field.md)：弹窗里输入框的类型
