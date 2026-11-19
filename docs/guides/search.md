# 做一个搜索框

这一篇讲怎么用 [`UISearchBar`](../api/ui-search-bar.md) 做搜索：放到页面上、边输入边筛选、提交搜索、取消按钮、范围按钮、设置键盘。每个属性和事件的细节在 [`UISearchBar`](../api/ui-search-bar.md) 的参考页。

## 推荐的做法

- **用 Auto Layout 定位，约束左右和上边。** 高度由搜索框自己决定，加了 `prompt` 或范围条之后它自己变高。
- **在 [`input`](../api/ui-search-bar/input-event.md) 里做「边输入边筛选」，在 [`search`](../api/ui-search-bar/search-event.md) 里做「提交搜索」。** 前者每改一个字就来一次，适合筛选已经在手里的数据；后者只在用户点了键盘上的「搜索」时来一次，适合发网络请求。
- **在 `search` 和 [`cancel`](../api/ui-search-bar/cancel-event.md) 的回调里收起键盘。** 调 `search.resignFirstResponder()`。
- **点取消时自己清空文字。** 取消按钮只派发事件，不改 `text`。清空之后 `input` 不会派发（文字是代码改的），要自己把筛选结果恢复原样。
- **需要取消按钮时，只在输入期间显示它。** 在 `focus` 里 `setShowsCancelButton(true, { animated: true })`，在 `blur` 里设回 `false`。

## 第一个搜索框

从空白 App 开始，在页面顶部放一个搜索框，下面一行文字显示当前的搜索词。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建搜索框
  const search = new UISearchBar();
  search.placeholder = '搜索城市';

  // 2. 一行文字，显示当前的搜索词
  const status = new UILabel();
  status.text = '还没有输入';

  // 3. 放到页面上：搜索框贴着安全区顶部，文字在它下面
  const safe = page.view.safeAreaLayoutGuide;
  search.translatesAutoresizingMaskIntoConstraints = false;
  status.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(search);
  page.view.addSubview(status);
  NSLayoutConstraint.activateConstraints([
    search.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    search.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    search.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
    status.topAnchor.constraintEqualToAnchor(search.bottomAnchor, { constant: 16 }),
    status.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);

  // 4. 用户每改一次文字，更新那行字
  search.addEventListener('input', () => {
    status.text = search.text === '' ? '还没有输入' : '正在输入：' + search.text;
  });

  // 5. 用户点了键盘上的「搜索」：收起键盘，提交
  search.addEventListener('search', () => {
    search.resignFirstResponder();
    status.text = '搜索：' + search.text;
    console.log('搜索', search.text);
  });
});
```

**效果**

- 页面顶部出现一个搜索框，里面是灰色的「搜索城市」。下面一行字「还没有输入」。
- 点搜索框，键盘弹出。输入 `bei`，下面的字依次变成「正在输入：b」「正在输入：be」「正在输入：bei」。
- 点输入框右端的清空按钮，文字清空，下面的字变回「还没有输入」。
- 再输入 `bei`，点键盘上的「搜索」，键盘收起，下面的字变成「搜索：bei」，控制台输出 `搜索 bei`。

安全区是屏幕上不被刘海、圆角和底部横条遮挡的区域，见 [`UIView` 的安全区](../api/ui-view.md#安全区)。

这段代码没有作为一个整体在模拟器运行过。

下面各节沿用 `search` 和 `page` 这两个变量。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const search = new UISearchBar();
page.view.addSubview(search);
```

## 新建的搜索框为什么看不见

新建的搜索框 `frame` 是 0 × 0。

| 原因 | 处理 |
| --- | --- |
| 用 Auto Layout 定位，但没约束左右两边 | 约束左右两边和上边。高度不用约束 |
| 用 `frame` 定位，没给宽度 | 先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()` |
| 用 `frame` 定位，后来加了 `prompt` 或范围条 | 再调一次 `sizeToFit()` |

各种情况下搜索框自己想要的高度见[大小](../api/ui-search-bar.md#大小)。

## 怎么知道用户输入了什么

监听 [`input`](../api/ui-search-bar/input-event.md)，在回调里读 [`text`](../api/ui-search-bar/text.md)：

```js
search.addEventListener('input', () => {
  console.log(search.text);
});
```

**效果**：用户每改一次文字（输入、删除、点清空按钮），控制台输出一次当时的文字。

事件对象不带文字，文字从 `search.text` 读，读到的是回调执行时的值。用代码写 `search.text` 不派发 `input`，所以在 `input` 的回调里改 `text` 不会造成循环。

## 读出和设置搜索词

```js
search.text = 'beijing';
console.log(search.text);
```

**效果**：输入框里出现 `beijing`，控制台输出 `beijing`。不派发 `input`。

没输入过时 `text` 是空串 `''`，不是 `null`。

## 显示占位文字

```js
search.placeholder = '搜索城市';
```

**效果**：输入框里没有内容时，显示灰色的「搜索城市」。用户输入第一个字时它消失。

判断有没有占位文字用 `!search.placeholder`，原因见 [`placeholder`](../api/ui-search-bar/placeholder.md)。

## 弹出和收起键盘

用户点搜索框，键盘弹出，搜索框派发 `focus`。也可以用代码让它弹出：

```js
const ok = search.becomeFirstResponder();
console.log(ok);
```

**效果**：键盘弹出，光标在搜索框里，控制台输出 `true`。搜索框派发 `focus`。

搜索框还没有显示在屏幕上，或者页面正在切换时，系统会拒绝，这时输出 `false`，键盘不弹出。什么时候会被拒绝见 [`UITextField` 的焦点](../api/ui-text-field.md#焦点)。

收起键盘：

```js
search.resignFirstResponder();
```

**效果**：键盘收起，搜索框派发 `blur`。

键盘弹出后会不会挡住页面上的内容，和单行输入框是同一个问题，处理办法见[做一个输入框](text-fields.md)。

## 显示取消按钮，点它时退出搜索

```js
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
search.addEventListener('blur', () => {
  search.setShowsCancelButton(false, { animated: true });
});
search.addEventListener('cancel', () => {
  search.text = '';
  search.resignFirstResponder();
});
```

**效果**：点搜索框，右边滑出取消按钮。点取消按钮，文字清空，键盘收起，取消按钮消失。**这个例子未在模拟器验证。**

## 加一排范围按钮

```js
search.scopeButtonTitles = ['全部', '我的', '共享'];
search.showsScopeBar = true;
search.addEventListener('scopechange', () => {
  console.log('范围', search.selectedScopeButtonIndex);
});
```

**效果**：输入框下面多出一排三个按钮，「全部」是选中的。搜索框变高。点「我的」，控制台输出 `范围 1`。**点按钮触发事件未在模拟器验证。**

只写 `scopeButtonTitles` 不会显示这一排，还要 `showsScopeBar = true`。标题至少要有两个。

## 用代码切换范围

```js
search.selectedScopeButtonIndex = 2;
```

**效果**：第三个范围按钮变成选中的。不派发 `scopechange`。

下标可能超出标题的个数，也可能是 `-1`，取标题之前先确认它在范围内，见 [`selectedScopeButtonIndex`](../api/ui-search-bar/selectedscopebuttonindex.md)。

## 在输入框上面加一行说明

```js
search.prompt = '输入城市的中文名或拼音';
```

**效果**：输入框上面多出一行小字。搜索框自己想要的高度从 64 pt 变成 98 pt。

写 `null` 去掉这一行。

## 换键盘和回车键

搜索框有九个键盘设置，直接写在搜索框上：

```js
search.keyboardType = 'url';
search.returnKeyType = 'go';
```

**效果**：键盘换成输入网址用的布局，回车键上的字换成「前往」。**画面未在模拟器验证。**

可选的取值见 [`keyboardType`](../api/ui-text-field/keyboardtype.md) 和 [`returnKeyType`](../api/ui-text-field/returnkeytype.md)。搜索框上有三个默认值和新建的 `UITextField` 不同：

| 属性 | 搜索框 | 新建的 `UITextField` |
| --- | --- | --- |
| `returnKeyType` | `'search'`：回车键上是「搜索」 | `'default'` |
| `enablesReturnKeyAutomatically` | `true`：没有内容时回车键是灰的 | `false` |
| `autocorrectionType` | `'no'`：不自动纠错 | `'default'` |

## 关掉自动大写和拼写检查

```js
search.autocapitalizationType = 'none';
search.spellCheckingType = 'no';
```

**效果**：输入的第一个字母不自动变成大写，拼错的词下面不画红线。适合搜索用户名、代码这类不是自然语言的内容。**画面未在模拟器验证。**

搜索框的自动纠错（`autocorrectionType`）默认就是关的。

## 改字体和文字颜色

搜索框自己没有字体和文字颜色的属性。这些在里面的输入框 [`searchTextField`](../api/ui-search-bar/searchtextfield.md) 上设：

```js
search.searchTextField.font = UIFont.systemFontOfSize(18);
search.searchTextField.textColor = 'systemBlue';
```

**效果**：搜索词变成 18 pt、蓝色。**未在模拟器验证。**

文字、占位文字和键盘设置在搜索框和 `searchTextField` 上是同一份，只写搜索框这一边就够了。

## 改光标和按钮的颜色

```js
search.tintColor = 'systemOrange';
```

**效果**：光标、取消按钮变成橙色。

颜色的写法见[颜色](../api/ui-color.md)。写 `null` 恢复成继承来的颜色。

## 去掉搜索框的背景

```js
search.searchBarStyle = 'minimal';
```

**效果**：搜索框自己的背景消失，只剩里面的输入框。**画面未在模拟器验证。**

## 暂时禁用搜索框

```js
search.isEnabled = false;
```

**效果**：点搜索框没有反应，键盘不弹出。写回 `true` 恢复。禁用时画面上的样子**未在模拟器验证**。

## 在键盘上方放一排按钮

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**效果**：键盘弹出时，键盘上面多一条[工具条](../api/ui-toolbar.md)，右端是「完成」。点它，键盘收起。**这个例子未在模拟器验证。**

## 用 `frame` 定位

```js
const fixed = new UISearchBar();
fixed.frame = new CGRect(0, 100, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**效果**：控制台输出 `64`。一个 390 pt 宽的搜索框，上边在页面的 y = 100 处。

## 参见

- [`UISearchBar`](../api/ui-search-bar.md)：全部属性、方法和事件
- [`UITextField`](../api/ui-text-field.md)：`searchTextField` 的类型；焦点和键盘设置
- [做一个工具条](toolbars.md)：放到键盘上方的那一排按钮
