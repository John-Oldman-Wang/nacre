---
type: reference
native: UISearchBar
status: partial
---

# `UISearchBar`

**`UISearchBar`** 表示一个搜索框：一个带放大镜图标的单行输入框，右端有清空按钮。它还可以带一个取消按钮、一个书签按钮和一排用来切换搜索范围的按钮。

搜索框只负责接收用户输入的搜索词并通知 App。搜什么、结果显示在哪里，都由 App 自己做。

搜索框是[视图](ui-view.md)，位置、宽度、隐藏、透明度都来自视图。它不是[控件](ui-control.md)：没有 `touchupinside`、`input` 这些控件事件，它有自己的一组事件。

这一页里的数值和状态变化（默认值、大小、读写的结果、报错）是在模拟器（iPhone Air，iOS 27.2）上对没有放进窗口的搜索框量的。画面上的样子、键盘的行为和真实触摸**未在模拟器验证**。事件里有四个是用代码触发验证的，另外四个只能靠真实触摸，见[事件](#事件)。九个键盘设置是在 Mac 上量的（Mac Catalyst，macOS 27.2），**未在模拟器验证**，见[键盘设置](#键盘设置)。

## 怎么知道用户输入了什么

监听搜索框的事件，在回调里读 `text`：

```js
search.addEventListener('input', () => {
  console.log(search.text);
});
```

用户每改一次文字（输入、删除、点清空按钮），`input` 派发一次。事件对象不带文字，文字从 `search.text` 读，读到的是回调执行时的值。

用代码写 `search.text` 不派发 `input`。所以在 `input` 的回调里改 `text` 不会造成循环。

## 键盘什么时候弹出，怎么收起

用户点搜索框，键盘弹出，搜索框派发 `focus`。也可以用代码让它弹出：

```js
search.becomeFirstResponder();
```

收起键盘：

```js
search.resignFirstResponder();
```

键盘收起时搜索框派发 `blur`。

这两个方法来自所有视图共有的焦点机制，返回值和被系统拒绝的情况见 [`UITextField` 的 first responder](ui-text-field.md#first-responder焦点)。

用户点键盘上的「搜索」键时，搜索框派发 `search`；点取消按钮时派发 `cancel`。这两种情况下系统是否自己收起键盘**未在模拟器验证**。推荐在这两个事件的回调里调一次 `resignFirstResponder()`。

键盘弹出后会不会挡住页面上的内容，和单行输入框是同一个问题，处理办法见[键盘避让](ui-text-field.md#键盘避让一条约束)。

## 新建的搜索框为什么看不见

新建的搜索框 `frame` 是 0 × 0。它对宽度没有要求，自己想要的高度随内容变：

| 情况 | 自己想要的高度 |
| --- | --- |
| 只有输入框 | 64 pt |
| 有 `prompt`（输入框上面的一行说明） | 98 pt |
| 显示了范围条，并且有两个以上的范围按钮 | 111 pt |

- 用 [Auto Layout](auto-layout.md) 定位时，约束它的左右两边和上边。高度不用约束。
- 用 `frame` 定位时，先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()`。之后每次加减 `prompt` 或范围条，都要再调一次。

## 怎么设置键盘

搜索框有九个键盘设置：弹出哪种键盘、回车键上的字、键盘的明暗、自动大写、自动纠错等。它们直接写在搜索框上：

```js
search.keyboardType = 'emailAddress';
search.autocapitalizationType = 'none';
```

**效果**：点搜索框时弹出输入邮箱用的键盘，上面有 `@` 和 `.` 键；输入的第一个字母不自动大写。**画面未在模拟器验证。**

这九个属性和 [`UITextField`](ui-text-field.md#键盘)、[`UITextView`](ui-text-view.md#键盘) 上的同名属性名字相同、取值相同，写错时的行为也相同。全部成员见[键盘设置](#键盘设置)。

搜索框上有三个默认值和新建的 `UITextField` 不同：

| 属性 | 搜索框 | 新建的 `UITextField` |
| --- | --- | --- |
| `returnKeyType` | `'search'`：回车键上是「搜索」 | `'default'` |
| `enablesReturnKeyAutomatically` | `true`：没有内容时回车键是灰的 | `false` |
| `autocorrectionType` | `'no'`：不自动纠错 | `'default'` |

## 搜索框里的输入框

搜索框里的那个输入框从 `searchTextField` 读出来，它是一个 [`UITextField`](ui-text-field.md)。

它和搜索框共用同一份文字和同一份键盘设置：`searchTextField.text` 和 `search.text` 是同一份文字，`placeholder` 也是；九个键盘设置写在哪一边，另一边读到的都是新的值。所以这些只写搜索框这一边就够了。

要用到 `searchTextField` 的，是搜索框自己没有的那些输入框成员，例如字体、文字颜色和清空按钮什么时候显示。它的 `clearButtonMode` 默认是 `'always'`（有内容时右端一直有清空按钮），新建的 `UITextField` 是 `'never'`。

> **注意**：监听文字变化用搜索框的 `input`。`searchTextField` 是控件，在它上面监听 `input` 也能收到用户的输入，但用户点清空按钮时它是否派发**未在模拟器验证**。

## 推荐的做法

**用 Auto Layout 定位，约束左右和上边。** 高度由搜索框自己决定，加了 `prompt` 或范围条之后它自己变高。

**在 `input` 里做「边输入边筛选」，在 `search` 里做「提交搜索」。** 前者每改一个字就来一次，适合筛选已经在手里的数据；后者只在用户点了键盘上的「搜索」时来一次，适合发网络请求。

**在 `search` 和 `cancel` 的回调里收起键盘。** 调 `search.resignFirstResponder()`。

**点取消时自己清空文字。** 取消按钮只派发事件，不改 `text`。清空之后 `input` 不会派发（文字是代码改的），要自己把筛选结果恢复原样。

**需要取消按钮时，只在输入期间显示它。** 在 `focus` 里 `setShowsCancelButton(true, { animated: true })`，在 `blur` 里设回 `false`。

## 完整例子

下面的代码从空白 App 开始，在页面顶部放一个搜索框，下面一行文字显示当前的搜索词。

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

安全区是屏幕上不被刘海、圆角和底部横条遮挡的区域，见 [`UIView` 的安全区](ui-view.md#安全区)。

这段代码没有作为一个整体在模拟器运行过。

## 常见用法

以下例子都假设已经有上面的 `search` 和 `page`。

### 读出和设置搜索词

```js
search.text = 'beijing';
console.log(search.text);
```

**效果**：输入框里出现 `beijing`，控制台输出 `beijing`。不派发 `input`。

没输入过时 `text` 是空串 `''`，不是 `null`。

### 显示占位文字

```js
search.placeholder = '搜索城市';
```

**效果**：输入框里没有内容时，显示灰色的「搜索城市」。用户输入第一个字时它消失。

### 用代码弹出键盘

```js
const ok = search.becomeFirstResponder();
console.log(ok);
```

**效果**：键盘弹出，光标在搜索框里，控制台输出 `true`。搜索框派发 `focus`。

搜索框还没有显示在屏幕上，或者页面正在切换时，系统会拒绝，这时输出 `false`，键盘不弹出。

### 显示取消按钮，点它时退出搜索

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

### 加一排范围按钮

```js
search.scopeButtonTitles = ['全部', '我的', '共享'];
search.showsScopeBar = true;
search.addEventListener('scopechange', () => {
  console.log('范围', search.selectedScopeButtonIndex);
});
```

**效果**：输入框下面多出一排三个按钮，「全部」是选中的。搜索框变高。点「我的」，控制台输出 `范围 1`。**点按钮触发事件未在模拟器验证。**

只写 `scopeButtonTitles` 不会显示这一排，还要 `showsScopeBar = true`。标题至少要有两个。

### 用代码切换范围

```js
search.selectedScopeButtonIndex = 2;
```

**效果**：第三个范围按钮变成选中的。不派发 `scopechange`。

### 在输入框上面加一行说明

```js
search.prompt = '输入城市的中文名或拼音';
```

**效果**：输入框上面多出一行小字。搜索框自己想要的高度从 64 pt 变成 98 pt。

写 `null` 去掉这一行。

### 换键盘和回车键

```js
search.keyboardType = 'url';
search.returnKeyType = 'go';
```

**效果**：键盘换成输入网址用的布局，回车键上的字换成「前往」。**画面未在模拟器验证。**

可选的取值见 [`UITextField` 的键盘](ui-text-field.md#键盘)。

### 关掉自动大写和拼写检查

```js
search.autocapitalizationType = 'none';
search.spellCheckingType = 'no';
```

**效果**：输入的第一个字母不自动变成大写，拼错的词下面不画红线。适合搜索用户名、代码这类不是自然语言的内容。**画面未在模拟器验证。**

搜索框的自动纠错（`autocorrectionType`）默认就是关的。

### 改光标和按钮的颜色

```js
search.tintColor = 'systemOrange';
```

**效果**：光标、取消按钮变成橙色。

颜色的写法见[颜色](ui-color.md)。写 `null` 恢复成继承来的颜色。

### 去掉搜索框的背景

```js
search.searchBarStyle = 'minimal';
```

**效果**：搜索框自己的背景消失，只剩里面的输入框。**画面未在模拟器验证。**

### 暂时禁用搜索框

```js
search.isEnabled = false;
```

**效果**：点搜索框没有反应，键盘不弹出。写回 `true` 恢复。禁用时画面上的样子**未在模拟器验证**。

### 在键盘上方放一排按钮

```js
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**效果**：键盘弹出时，键盘上面多一条[工具条](ui-toolbar.md)，右端是「完成」。点它，键盘收起。**这个例子未在模拟器验证。**

### 用 `frame` 定位

```js
const fixed = new UISearchBar();
fixed.frame = new CGRect(0, 100, 390, 0);
fixed.sizeToFit();
page.view.addSubview(fixed);
console.log(fixed.frame.height);
```

**效果**：控制台输出 `64`。一个 390 pt 宽的搜索框，上边在页面的 y = 100 处。

## 概念

### 事件

搜索框有八个事件。回调收到的事件对象只有 `type` 和 `target`（就是这个搜索框），不带别的数据；事件不能取消。

| 事件 | 什么时候派发 | 回调里读什么 |
| --- | --- | --- |
| `focus` | 开始输入：搜索框拿到了焦点 | |
| `blur` | 结束输入：搜索框交出了焦点 | `text` |
| `input` | 用户改了文字，包括点清空按钮 | `text` |
| `search` | 用户点了键盘上的「搜索」键 | `text` |
| `cancel` | 用户点了取消按钮 | |
| `bookmarkclick` | 用户点了书签按钮 | |
| `resultslistclick` | 用户点了结果列表按钮 | |
| `scopechange` | 用户点了另一个范围按钮 | `selectedScopeButtonIndex` |

三条共同的规则：

- **只有用户的操作派发事件。** 用代码写 `text`、写 `selectedScopeButtonIndex` 都不派发。
- **事件在操作发生之后稍晚一点派发**，不在操作的当时。回调里读到的 `text` 和 `selectedScopeButtonIndex` 是回调执行时的值。
- **系统派发的是这八个**，以及继承来的 `traitchange`（[外观特征](ui-trait-collection.md)变化）。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

验证的情况：`focus`、`blur`、`input`、`search` 四个是用代码让里面的输入框发出对应的动作来验证的，没有经过真实的键盘。`cancel`、`bookmarkclick`、`resultslistclick`、`scopechange` 四个要真实点击才能触发，**未在模拟器验证**。

### `placeholder` 的 `null` 和空串

`null` 和空串 `''` 都表示「没有占位文字」，写哪一个都是清掉它。

清掉之后读回来的是 `null` 还是 `''`，取决于清掉它的那一次写的是哪一个；而搜索框已经没有占位文字时，再写另一个不会改变读回来的值：

```js
search.placeholder = '搜索城市';
search.placeholder = '';
console.log(search.placeholder === '');
search.placeholder = null;
console.log(search.placeholder === '');
```

**效果**：两次都输出 `true`。第二次写 `null` 时搜索框已经没有占位文字，读回来的还是 `''`。

所以判断有没有占位文字，用 `!search.placeholder`，不要用 `=== null`。

`prompt` 没有这种情况：写 `''` 读回 `''`，写 `null` 读回 `null`。

### 范围按钮的下标

`selectedScopeButtonIndex` 是选中的范围按钮的下标，从 0 数。

- 写一个超出范围的值不报错，这个值被原样存下来：有三个按钮时写 `7`，读回来是 `7`。这时哪个按钮显示成选中**未在模拟器验证**。
- 换一组标题不会把下标改回 0：下标是 `1` 时换成另外两个标题，下标还是 `1`。换成只有一个标题时，下标变成 `0`。
- 把标题清空（写 `[]`）之后，下标变成 `-1`。

所以用 `selectedScopeButtonIndex` 去取 `scopeButtonTitles` 里的标题之前，先确认它在范围内。

## 成员说明

### 创建

#### `new UISearchBar()`

创建一个搜索框。没有参数。`frame` 是 0 × 0，`text` 是空串。

`UISearchBar` 不能被继承，`class X extends UISearchBar` 在 `new X()` 时抛 `TypeError`，见[原生类](native-classes.md#不能继承)。

### 文字

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `text` | 字符串 | 是 | 是 | `''` | 输入框里的文字。写 `null` 或 `undefined` 得到 `''`；写数字得到它的字符串形式。用户改了它派发 `input`，代码改的不派发 |
| `placeholder` | 字符串或 `null` | 是 | 是 | `null` | 没有内容时显示的灰色文字。`null` 和 `''` 都是清掉，见 [`placeholder` 的 `null` 和空串](#placeholder-的-null-和空串) |
| `prompt` | 字符串或 `null` | 是 | 是 | `null` | 输入框上面的一行说明。有它时搜索框想要的高度是 98 pt |
| `searchTextField` | [`UITextField`](ui-text-field.md) | 是 | 否 | 搜索框里的输入框 | 每次读到的是同一个对象。它的文字和键盘设置和搜索框的是同一份，见[搜索框里的输入框](#搜索框里的输入框) |

### 样式

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `searchBarStyle` | `'default'` \| `'prominent'` \| `'minimal'` | 是 | 是 | `'default'` | `'prominent'`：搜索框带自己的背景。`'minimal'`：没有背景，只有输入框。`'default'`：现在等同于 `'prominent'`。画面上的差别**未在模拟器验证** |
| `barStyle` | `'default'` \| `'black'` | 是 | 是 | `'default'` | `'default'`：跟随系统的浅色或深色。`'black'`：深色的条。画面上的差别**未在模拟器验证** |
| `isTranslucent` | 布尔 | 是 | 是 | `true` | `true`：背景半透明。`false`：不透明。画面上的差别**未在模拟器验证** |
| `isEnabled` | 布尔 | 是 | 是 | `true` | `true`：可以点、可以输入。`false`：搜索框不接收触摸（`isUserInteractionEnabled` 变成 `false`），里面的输入框的 `isEnabled` 也变成 `false` |
| `tintColor` | [颜色](ui-color.md)字符串 | 是 | 是 | 继承来的颜色 | 光标和按钮的颜色。读出来永远有值。写 `null` 是恢复成继承来的颜色 |
| `barTintColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 搜索框自己的底色。`null` 表示用系统的背景 |

### 按钮

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `showsCancelButton` | 布尔 | 是 | 是 | `false` | `true`：搜索框右边显示取消按钮。`false`：不显示 |
| `showsBookmarkButton` | 布尔 | 是 | 是 | `false` | `true`：输入框右端显示书签按钮。`false`：不显示 |
| `showsSearchResultsButton` | 布尔 | 是 | 是 | `false` | `true`：输入框右端显示结果列表按钮。`false`：不显示 |
| `isSearchResultsButtonSelected` | 布尔 | 是 | 是 | `false` | `true`：结果列表按钮显示成选中的样子。`false`：普通的样子。关掉结果列表按钮不会把它改回 `false` |

书签按钮和结果列表按钮的两个开关互不影响，可以同时是 `true`；两个都开时画面上显示哪一个**未在模拟器验证**。

这些值变了没有事件。它们只会被代码改变。

### 范围按钮

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `scopeButtonTitles` | 字符串的数组 | 是 | 是 | `[]` | 范围按钮的标题，从左到右。读出来是快照，改它不影响搜索框。写 `null` 等于写空数组。数组里不是字符串的元素被转成字符串 |
| `selectedScopeButtonIndex` | 整数 | 是 | 是 | `0` | 选中的范围按钮的下标，没有单位。见[范围按钮的下标](#范围按钮的下标)。用户换了它派发 `scopechange`，代码改的不派发 |
| `showsScopeBar` | 布尔 | 是 | 是 | `false` | `true`：显示范围条。`false`：不显示。有两个以上的标题时，显示之后搜索框想要的高度是 111 pt；没有标题时这个属性照样写得进去，高度不变 |

### 键盘设置

这九个属性和 [`UITextField`](ui-text-field.md#键盘)、[`UITextView`](ui-text-view.md#键盘) 上的同名属性相同，取值的完整列表和每个取值的效果见 `UITextField` 那一页。默认值是搜索框自己的，有三个和输入框不同。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyboardType` | 字符串 | 是 | 是 | `'default'` | 弹出哪种键盘。[取值](ui-text-field.md#keyboardtype) |
| `returnKeyType` | 字符串 | 是 | 是 | `'search'` | 回车键上显示什么字。[取值](ui-text-field.md#returnkeytype)。换成别的取值之后，点它是否仍然派发 `search` **未在模拟器验证** |
| `keyboardAppearance` | 字符串 | 是 | 是 | `'default'` | 键盘的明暗：`'default'` 跟随系统，`'light'` 浅色，`'dark'` 深色。`'alert'` 是 `'dark'` 的旧名字，写得进去，读出来是 `'dark'` |
| `enablesReturnKeyAutomatically` | 布尔 | 是 | 是 | `true` | `true`：没有内容时回车键变灰、不能按。`false`：回车键一直能按 |
| `isSecureTextEntry` | 布尔 | 是 | 是 | `false` | `true`：输入的内容显示成圆点。`false`：正常显示 |
| `autocapitalizationType` | 字符串 | 是 | 是 | `'sentences'` | 自动大写：`'none'` 不大写，`'words'` 每个词的首字母，`'sentences'` 每句的首字母，`'allCharacters'` 全部 |
| `autocorrectionType` | 字符串 | 是 | 是 | `'no'` | 自动纠错：`'default'` 由系统决定，`'no'` 关，`'yes'` 开 |
| `spellCheckingType` | 字符串 | 是 | 是 | `'default'` | 拼写检查：`'default'` 由系统决定，`'no'` 关，`'yes'` 开 |
| `textContentType` | 字符串或 `null` | 是 | 是 | `null` | 这里装的是什么，系统据此提供自动填充。[取值](ui-text-field.md#textcontenttype-的取值)。`null` 表示没配，写 `null` 清掉 |

这些值变了没有事件。它们只会被代码改变：写搜索框的属性，或者写 `searchTextField` 上的同名属性。

验证的情况：

- 九个默认值、九个属性在搜索框上的读写、和 `searchTextField` 是同一份设置，在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上都验证过。
- 各个取值在画面上的效果**未在模拟器验证**。

### 键盘上方

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `inputAccessoryView` | [`UIView`](ui-view.md) 或 `null` | 是 | 是 | `null` | 键盘弹出时贴在键盘上面的视图。读回来的是写进去的那个对象 |

### 写错取值时

- `searchBarStyle` 写了别的值，不抛，在控制台输出一条警告 `[Nacre] searchBarStyle has no value "compact"; expected one of: default / prominent / minimal, ignored`，原值不变。`barStyle` 同理：`[Nacre] barStyle has no value "blackTranslucent"; expected one of: default / black, ignored`。
- 七个取值是字符串的键盘设置（`keyboardType`、`returnKeyType`、`keyboardAppearance`、`autocapitalizationType`、`autocorrectionType`、`spellCheckingType`、`textContentType`）写了不在取值表里的值，不抛，在控制台输出一条警告，例如 `[Nacre] keyboardType has no value "numeric"; expected one of: …, ignored`（省略号处是全部可用的值），原值不变。`textContentType` 写 `null` 是清掉它；另外六个写 `null` 按写错处理。
- `selectedScopeButtonIndex` 写了转不成有限数的值，抛 `TypeError: selectedScopeButtonIndex must be a finite number, got undefined`，原值不变。`'1'` 这样的字符串按数处理，小数向零取整。
- `scopeButtonTitles` 写了不是数组的值（数、字符串），抛 `TypeError: scopeButtonTitles needs an array of strings or null`，原值不变。
- `inputAccessoryView` 写了不是视图的原生对象，抛 `TypeError: inputAccessoryView needs a UIView or null`；写了数、字符串等普通值，抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。原值不变。
- `searchTextField` 是只读的，给它赋值抛 `TypeError`。
- 两个颜色属性写了不合法的颜色，不抛，在控制台输出一条警告，原值不变，见[颜色](ui-color.md#写错不抛打警告)。
- 布尔属性写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。

### 方法

#### `setShowsCancelButton(showsCancelButton, options)`

显示或隐藏取消按钮，可以带动画。

```js
search.setShowsCancelButton(true, { animated: true });
```

- **`showsCancelButton`**：布尔。
- **`options.animated`**：布尔，可以不传。`true` 时取消按钮滑入或滑出；不传或 `false` 时立刻变，等同于直接写 `showsCancelButton`。
- **返回**：无。
- 带动画时，`showsCancelButton` 属性在调用返回时已经是新的值。

#### `setShowsScopeBar(showsScopeBar, options)`

显示或隐藏范围条，可以带动画。

```js
search.setShowsScopeBar(true, { animated: true });
```

- **`showsScopeBar`**：布尔。
- **`options.animated`**：布尔，可以不传。不传或 `false` 时等同于直接写 `showsScopeBar`。
- **返回**：无。
- 带动画时，`showsScopeBar` 属性在调用返回时已经是新的值。

#### 焦点

`becomeFirstResponder()`、`resignFirstResponder()`、`isFirstResponder` 继承自所有视图共有的部分，说明见 [`UITextField` 的 first responder](ui-text-field.md#first-responder焦点)。搜索框拿到焦点时，`search.isFirstResponder` 和 `search.searchTextField.isFirstResponder` 都是 `true`。

#### 事件

```js
search.addEventListener('input', (ev) => {
  console.log(ev.type, ev.target === search, search.text);
});
```

**效果**：用户输入 `a`，输出 `input true a`。

- 八个事件名和各自的时机见[事件](#事件)。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

位置、大小、隐藏、透明度等继承自 [`UIView`](ui-view.md)。自己想要的大小从 `intrinsicContentSize` 读：宽是 -1（没有要求）。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UISearchBar alloc] init]` | `new UISearchBar()` |
| `bar.text = @"beijing"` | `bar.text = 'beijing'` |
| `bar.placeholder = @"Search"` | `bar.placeholder = 'Search'` |
| `bar.prompt = nil` | `bar.prompt = null` |
| `bar.keyboardType = UIKeyboardTypeURL` | `bar.keyboardType = 'url'` |
| `bar.returnKeyType = UIReturnKeyGo` | `bar.returnKeyType = 'go'` |
| `bar.keyboardAppearance = UIKeyboardAppearanceDark` | `bar.keyboardAppearance = 'dark'` |
| `bar.enablesReturnKeyAutomatically = NO` | `bar.enablesReturnKeyAutomatically = false` |
| `bar.secureTextEntry = YES` | `bar.isSecureTextEntry = true` |
| `bar.autocapitalizationType = UITextAutocapitalizationTypeNone` | `bar.autocapitalizationType = 'none'` |
| `bar.autocorrectionType = UITextAutocorrectionTypeYes` | `bar.autocorrectionType = 'yes'` |
| `bar.spellCheckingType = UITextSpellCheckingTypeNo` | `bar.spellCheckingType = 'no'` |
| `bar.textContentType = UITextContentTypeUsername` | `bar.textContentType = 'username'` |
| `bar.textContentType = nil` | `bar.textContentType = null` |
| `bar.searchTextField.keyboardType = UIKeyboardTypeURL` | `bar.searchTextField.keyboardType = 'url'` |
| `bar.searchBarStyle = UISearchBarStyleMinimal` | `bar.searchBarStyle = 'minimal'` |
| `bar.barStyle = UIBarStyleBlack` | `bar.barStyle = 'black'` |
| `bar.translucent = NO` | `bar.isTranslucent = false` |
| `bar.enabled = NO` | `bar.isEnabled = false` |
| `bar.showsCancelButton = YES` | `bar.showsCancelButton = true` |
| `[bar setShowsCancelButton:YES animated:YES]` | `bar.setShowsCancelButton(true, { animated: true })` |
| `bar.showsBookmarkButton = YES` | `bar.showsBookmarkButton = true` |
| `bar.showsSearchResultsButton = YES` | `bar.showsSearchResultsButton = true` |
| `bar.searchResultsButtonSelected = YES` | `bar.isSearchResultsButtonSelected = true` |
| `bar.scopeButtonTitles = @[@"All", @"Mine"]` | `bar.scopeButtonTitles = ['All', 'Mine']` |
| `bar.selectedScopeButtonIndex = 1` | `bar.selectedScopeButtonIndex = 1` |
| `[bar setShowsScopeBar:YES animated:YES]` | `bar.setShowsScopeBar(true, { animated: true })` |
| `bar.tintColor = UIColor.systemOrangeColor` | `bar.tintColor = 'systemOrange'` |
| `bar.barTintColor = nil` | `bar.barTintColor = null` |
| `bar.inputAccessoryView = toolbar` | `bar.inputAccessoryView = toolbar` |
| `[bar becomeFirstResponder]` | `bar.becomeFirstResponder()` |

iOS 用一个委托对象（`UISearchBarDelegate`）接收通知，JS 里换成搜索框上的事件：

| `UISearchBarDelegate` 的方法 | JS 的事件 |
| --- | --- |
| `searchBarTextDidBeginEditing:` | `focus` |
| `searchBarTextDidEndEditing:` | `blur` |
| `searchBar:textDidChange:` | `input`（文字从 `bar.text` 读） |
| `searchBarSearchButtonClicked:` | `search` |
| `searchBarCancelButtonClicked:` | `cancel` |
| `searchBarBookmarkButtonClicked:` | `bookmarkclick` |
| `searchBarResultsListButtonClicked:` | `resultslistclick` |
| `searchBar:selectedScopeButtonIndexDidChange:` | `scopechange`（下标从 `bar.selectedScopeButtonIndex` 读） |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 阻止搜索框开始或结束输入 | `searchBarShouldBeginEditing:`、`searchBarShouldEndEditing:` | 未实现。它们要求回调同步返回一个布尔值 |
| 在文字改变之前拦截或改写输入 | `searchBar:shouldChangeTextInRanges:replacementText:` | 未实现，原因同上。可以在 `input` 里事后改 `text` |
| 把搜索框放进导航条，让它随页面滚动收起 | `UISearchController`、`UINavigationItem.searchController` | 未实现 |
| 在输入框里放搜索标记，在下面显示搜索建议 | `UISearchTextField` 的 `tokens`、`searchSuggestions` | 未实现。`searchTextField` 按普通的 `UITextField` 提供 |
| 换搜索框的背景图、输入框的背景图、各个图标 | `backgroundImage`、`setSearchFieldBackgroundImage:forState:`、`setImage:forSearchBarIcon:state:` 等 | 未实现 |
| 定制范围按钮的背景、分隔线和文字样式 | `setScopeBarButtonBackgroundImage:forState:` 一组 | 未实现 |
| 微调输入框、文字和图标的位置 | `searchFieldBackgroundPositionAdjustment`、`searchTextPositionAdjustment`、`setPositionAdjustment:forSearchBarIcon:` | 未实现 |
| 设置智能引号、智能破折号、行内预测、密码规则等其余的键盘设置 | `smartQuotesType`、`smartDashesType`、`smartInsertDeleteType`、`inlinePredictionType`、`passwordRules` 等 | 未实现。`UITextField` 和 `UITextView` 上也没有 |
| 定制 iPad 键盘上方的快捷栏 | `inputAssistantItem` | 未实现 |
| 告诉系统搜索框在页面的顶部还是别处 | `barPosition`、`positionForBar:` | 未实现 |

## 参见

- [`UITextField`](ui-text-field.md)：`searchTextField` 的类型；键盘设置的全部取值、焦点和键盘避让都在那一页
- [`UITextView`](ui-text-view.md)：多行输入，有同一组九个键盘设置
- [`UIToolbar`](ui-toolbar.md)：同一组里的另一个条；可以放到搜索框的键盘上方
- [`UIView`](ui-view.md)：搜索框的父类，位置、大小、隐藏
- [Auto Layout](auto-layout.md)：约束左右和上边的写法
- [颜色](ui-color.md)
- [单位](units.md)
- [实现原理：工具条和搜索框](../internals/bars.md)
