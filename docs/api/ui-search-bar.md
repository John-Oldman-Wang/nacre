---
type: reference
native: UISearchBar
status: partial
---

# `UISearchBar`

**`UISearchBar`** 表示一个搜索框：一个带放大镜图标的单行输入框，右端有清空按钮。它还可以带一个取消按钮、一个书签按钮和一排用来切换搜索范围的按钮。

搜索框只负责接收用户输入的搜索词并通知 App。搜什么、结果显示在哪里，都由 App 自己做。

搜索框不是[控件](ui-control.md)：没有控件的那组事件，它有自己的八个事件，见[事件](#事件)。事件不带数据，收到事件时读 [`text`](ui-search-bar/text.md) 和 [`selectedScopeButtonIndex`](ui-search-bar/selectedscopebuttonindex.md)。弹出和收起键盘用继承来的 `becomeFirstResponder()` 和 `resignFirstResponder()`，见 [`UITextField` 的焦点](ui-text-field.md#焦点)。

搜索框里的输入框是一个 [`UITextField`](ui-text-field.md)，从 [`searchTextField`](ui-search-bar/searchtextfield.md) 读出来。它和搜索框共用同一份文字和同一份键盘设置。

这一组页面里的数值和状态变化（默认值、大小、读写的结果、报错）是在模拟器（iPhone Air，iOS 27.2）上对没有放进窗口的搜索框量的。画面上的样子、键盘的行为和真实触摸**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UISearchBar`

怎么做边输入边筛选、取消按钮和范围按钮，见指南[做一个搜索框](../guides/search.md)。

## 构造函数

[`UISearchBar()`](ui-search-bar/constructor.md)

创建一个搜索框，`frame` 是 0 × 0，`text` 是空串。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。搜索框常用的继承属性是 `frame`、`isHidden`、`isFirstResponder`。

文字：

| 属性 | 说明 |
| --- | --- |
| [`text`](ui-search-bar/text.md) | 输入框里的文字 |
| [`placeholder`](ui-search-bar/placeholder.md) | 没有内容时显示的灰色文字 |
| [`prompt`](ui-search-bar/prompt.md) | 输入框上面的一行说明 |
| [`searchTextField`](ui-search-bar/searchtextfield.md) <small>只读</small> | 搜索框里的输入框 |

样式：

| 属性 | 说明 |
| --- | --- |
| [`searchBarStyle`](ui-search-bar/searchbarstyle.md) | 搜索框有没有自己的背景 |
| [`barStyle`](ui-search-bar/barstyle.md) | 条的明暗样式 |
| [`isTranslucent`](ui-search-bar/istranslucent.md) | 背景是不是半透明的 |
| [`isEnabled`](ui-search-bar/isenabled.md) | 能不能点、能不能输入 |
| [`tintColor`](ui-search-bar/tintcolor.md) | 光标和按钮的颜色 |
| [`barTintColor`](ui-search-bar/bartintcolor.md) | 搜索框自己的底色 |

按钮：

| 属性 | 说明 |
| --- | --- |
| [`showsCancelButton`](ui-search-bar/showscancelbutton.md) | 显示取消按钮 |
| [`showsBookmarkButton`](ui-search-bar/showsbookmarkbutton.md) | 在输入框右端显示书签按钮 |
| [`showsSearchResultsButton`](ui-search-bar/showssearchresultsbutton.md) | 在输入框右端显示结果列表按钮 |
| [`isSearchResultsButtonSelected`](ui-search-bar/issearchresultsbuttonselected.md) | 结果列表按钮是不是选中的样子 |

范围按钮：

| 属性 | 说明 |
| --- | --- |
| [`scopeButtonTitles`](ui-search-bar/scopebuttontitles.md) | 范围按钮的标题，从左到右 |
| [`selectedScopeButtonIndex`](ui-search-bar/selectedscopebuttonindex.md) | 选中的是第几个范围按钮 |
| [`showsScopeBar`](ui-search-bar/showsscopebar.md) | 显示范围条 |

键盘设置。这九个属性和 [`UITextField`](ui-text-field.md)、[`UITextView`](ui-text-view.md) 上的同名属性取值相同，写错时的行为也相同。有三个默认值和新建的 `UITextField` 不同：`returnKeyType`、`enablesReturnKeyAutomatically`、`autocorrectionType`。

| 属性 | 说明 |
| --- | --- |
| [`keyboardType`](ui-search-bar/keyboardtype.md) | 弹出哪种键盘 |
| [`returnKeyType`](ui-search-bar/returnkeytype.md) | 回车键上显示什么字 |
| [`keyboardAppearance`](ui-search-bar/keyboardappearance.md) | 键盘的明暗 |
| [`enablesReturnKeyAutomatically`](ui-search-bar/enablesreturnkeyautomatically.md) | 没有内容时回车键变灰 |
| [`isSecureTextEntry`](ui-search-bar/issecuretextentry.md) | 把输入的字显示成圆点 |
| [`autocapitalizationType`](ui-search-bar/autocapitalizationtype.md) | 自动大写 |
| [`autocorrectionType`](ui-search-bar/autocorrectiontype.md) | 自动纠错 |
| [`spellCheckingType`](ui-search-bar/spellcheckingtype.md) | 拼写检查 |
| [`textContentType`](ui-search-bar/textcontenttype.md) | 这里装的是什么内容，用于自动填充 |

键盘上方：

| 属性 | 说明 |
| --- | --- |
| [`inputAccessoryView`](ui-search-bar/inputaccessoryview.md) | 键盘弹出时贴在键盘上面的视图 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法，比如 `becomeFirstResponder()`、`resignFirstResponder()`、`sizeToFit()`。搜索框拿到焦点时，`search.isFirstResponder` 和 `search.searchTextField.isFirstResponder` 都是 `true`。

| 方法 | 说明 |
| --- | --- |
| [`setShowsCancelButton()`](ui-search-bar/setshowscancelbutton.md) | 显示或隐藏取消按钮，可以带动画 |
| [`setShowsScopeBar()`](ui-search-bar/setshowsscopebar.md) | 显示或隐藏范围条，可以带动画 |

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`focus`](ui-search-bar/focus-event.md) | 开始输入：搜索框拿到了焦点 |
| [`blur`](ui-search-bar/blur-event.md) | 结束输入：搜索框交出了焦点 |
| [`input`](ui-search-bar/input-event.md) | 用户改了文字，包括点清空按钮 |
| [`search`](ui-search-bar/search-event.md) | 用户点了键盘上的「搜索」键 |
| [`cancel`](ui-search-bar/cancel-event.md) | 用户点了取消按钮 |
| [`bookmarkclick`](ui-search-bar/bookmarkclick-event.md) | 用户点了书签按钮 |
| [`resultslistclick`](ui-search-bar/resultslistclick-event.md) | 用户点了结果列表按钮 |
| [`scopechange`](ui-search-bar/scopechange-event.md) | 用户点了另一个范围按钮 |
| `traitchange` | [外观特征](ui-trait-collection.md)变化，继承自 `UIView` |

八个事件共同的规则：

- **事件对象只有 `type` 和 `target`**（就是这个搜索框），不带别的数据。事件不能取消。
- **只有用户的操作派发事件。** 用代码写 `text`、写 `selectedScopeButtonIndex` 都不派发。
- **事件在操作发生之后稍晚一点派发**，不在操作的当时。回调里读到的 `text` 和 `selectedScopeButtonIndex` 是回调执行时的值。
- **监听别的名字不会报错**：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

验证的情况：`focus`、`blur`、`input`、`search` 四个是用代码让里面的输入框发出对应的动作来验证的，没有经过真实的键盘。`cancel`、`bookmarkclick`、`resultslistclick`、`scopechange` 四个要真实点击才能触发，**未在模拟器验证**。

## 大小

新建的搜索框 `frame` 是 0 × 0。它对宽度没有要求（`intrinsicContentSize` 的宽是 -1），自己想要的高度随内容变：

| 情况 | 自己想要的高度 |
| --- | --- |
| 只有输入框 | 64 pt |
| 有 [`prompt`](ui-search-bar/prompt.md) | 98 pt |
| 显示了范围条，并且有两个以上的范围按钮 | 111 pt |

- 用 [Auto Layout](auto-layout.md) 定位时，约束它的左右两边和上边，高度不用约束。
- 用 `frame` 定位时，先写 `frame` 给出位置和宽度，再调一次 `sizeToFit()`。之后每次加减 `prompt` 或范围条，都要再调一次。

## 示例

### 页面顶部的搜索框

从空白 App 开始，在页面顶部放一个搜索框，下面一行文字显示当前的搜索词。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const search = new UISearchBar();
  search.placeholder = '搜索城市';
  const status = new UILabel();
  status.text = '还没有输入';

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

  search.addEventListener('input', () => {
    status.text = search.text === '' ? '还没有输入' : '正在输入：' + search.text;
  });
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

这段代码没有作为一个整体在模拟器运行过。

## 对应的 iOS API

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

## 参见

- [做一个搜索框](../guides/search.md)：边输入边筛选、取消按钮、范围按钮、键盘
- [`UITextField`](ui-text-field.md)：`searchTextField` 的类型；键盘设置的全部取值、焦点和键盘避让
- [`UITextView`](ui-text-view.md)：多行输入，有同一组九个键盘设置
- [`UIToolbar`](ui-toolbar.md)：可以放到搜索框的键盘上方
- [`UIView`](ui-view.md)：搜索框的父类，位置、大小、隐藏
