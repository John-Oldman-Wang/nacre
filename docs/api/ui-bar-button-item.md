# 导航条上的东西

`UINavigationItem` 是「这一页在导航条上长什么样」，`UIBarButtonItem` 是上面的按钮。

```js
const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });
save.addEventListener('primaryActionTriggered', () => submit());

page.navigationItem.title = '编辑';
page.navigationItem.rightBarButtonItems = [save];
```

## `UIBarButtonItem`

### 继承关系

```
EventTarget → NSObject → UIBarItem → UIBarButtonItem
```

> **它不是 `UIView`，也不是 `UIControl`。** 它是一个**描述对象**——你描述要什么，UIKit 自己照着画。所以它没有 `frame`、没有 `backgroundColor`，也没有那 16 个控件事件。

### 三种口味

```js
new UIBarButtonItem({ title: '保存' })
new UIBarButtonItem({ customView: someView })     // = initWithCustomView:
UIBarButtonItem.systemItem('add')                 // 系统预置的那二十几个
```

**`systemItem` 是类方法不是构造参数**，因为 ObjC 侧它只能在 `init` 里给，没有对应的可写属性——而 `title` / `style` 这些构造完当属性设就行。

还有两个占位用的：

```js
UIBarButtonItem.flexibleSpace()      // 弹性空白
UIBarButtonItem.fixedSpace(20)       // 固定 20pt
```

`systemItem` 可选：`done` `cancel` `edit` `save` `add` `flexibleSpace` `fixedSpace` `compose` `reply` `action` `organize` `bookmarks` `search` `refresh` `stop` `camera` `trash` `play` `pause` `rewind` `fastForward` `undo` `redo` `pageCurl` `close` `writingTools`。

### `style` 有两个名字是同一个值

```js
item.style = 'done';
item.style;        // 'prominent'  ← 不是 'done'
```

iOS 26 的头文件里 `UIBarButtonItemStyleDone = UIBarButtonItemStyleProminent`，两个名字一个值。两个都写得进去，但**读出来永远是 `'prominent'`**——和 [`UIStackViewAlignment`](ui-stack-view.md#alignment-有两个别名) 的 `top`/`leading` 完全同一回事。

> 还有一个 `bordered` 已经废弃，**不暴露**，写它会抛。

### 属性

| 属性 | 类型 | 默认值 | 来自 |
| --- | --- | --- | --- |
| `title` | `string` \| `null` | `null` | `UIBarItem` |
| `image` | `UIImage` \| `null` | `null` | `UIBarItem` |
| `isEnabled` | `boolean` | `true` | `UIBarItem` |
| `tag` | `number` | `0` | `UIBarItem` |
| `style` | 枚举字符串 | `'plain'` | |
| `width` | `number` | `0` | 只对固定宽度的项有意义 |
| `isHidden` | `boolean` | `false` | |
| `customView` | `UIView` \| `null` | `null` | |

### 事件

```js
item.addEventListener('primaryActionTriggered', () => …);
```

**只有这一个。** 名字沿用 [`UIButton`](ui-button.md) 的——它不是 `UIControl`，底下走的是 `target/action`，但在按钮和导航条按钮之间切换时不该还要记两个名字。

## `UINavigationItem`

**不可构造**——每个 `UIViewController` 自带一个，`page.navigationItem` 取。

| 属性 | 类型 | 效果 |
| --- | --- | --- |
| `title` | `string` \| `null` | 导航条正中那行字 |
| `subtitle` | `string` \| `null` | 副标题（**iOS 26 起**） |
| `backButtonTitle` | `string` \| `null` | **下一页**返回按钮上的字。不设就用这一页的 `title` |
| `hidesBackButton` | `boolean` | 藏掉返回按钮 |
| `titleView` | `UIView` \| `null` | 放一个自定义 view 当标题。**设了它 `title` 就被忽略** |
| `leftBarButtonItems` | `UIBarButtonItem[]` | 左侧按钮 |
| `rightBarButtonItems` | `UIBarButtonItem[]` | 右侧按钮 |

### `title` 和 `UIViewController.title` 是**单向**的

实测下来这四条，不知道会踩：

```js
page.title = '首页';
page.navigationItem.title;              // '首页'   ← 透下去了

page.navigationItem.title = '改过的';
page.title;                             // '首页'   ← 不跟着变！
page.navigationItem.title;              // '改过的' ← 导航条显示的是它

page.navigationItem.title = null;
page.navigationItem.title;              // null     ← 也不回落到 page.title

page.title = '首页';                     // 想恢复只能从这一侧再写一次
page.navigationItem.title;              // '首页'
```

一句话：**`page.title` 的写入会透到 `navigationItem.title`，反过来不会；而且一旦直接写过 `navigationItem.title`，它就独立了。** 所以**只用一边**——要么全程 `page.title`，要么全程 `page.navigationItem.title`，混着用迟早对不上。

### 两处会关掉左滑返回

[左滑返回](ui-navigation-controller.md#左滑返回默认就有)默认就有，但这两个属性会把它关掉：

| | 为什么 |
| --- | --- |
| `leftBarButtonItems` 设了东西 | 系统不再敢假设左边那个是「返回」 |
| `hidesBackButton = true` | 同上 |

这是 UIKit 的行为，不是我们加的。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIBarButtonItem alloc] initWithTitle:@"保存" style:UIBarButtonItemStyleProminent target:self action:@selector(save)]` | `new UIBarButtonItem({ title: '保存', style: 'prominent' })` + `addEventListener` |
| `[[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:… action:…]` | `UIBarButtonItem.systemItem('add')` |
| `[[UIBarButtonItem alloc] initWithCustomView:v]` | `new UIBarButtonItem({ customView: v })` |
| `[UIBarButtonItem flexibleSpaceItem]` | `UIBarButtonItem.flexibleSpace()` |
| `[UIBarButtonItem fixedSpaceItemOfWidth:20]` | `UIBarButtonItem.fixedSpace(20)` |
| `item.style = UIBarButtonItemStyleDone` | `item.style = 'done'`（读回 `'prominent'`） |
| `vc.navigationItem.rightBarButtonItems = @[a, b]` | `vc.navigationItem.rightBarButtonItems = [a, b]` |
| `vc.navigationItem.titleView = v` | `vc.navigationItem.titleView = v` |
| `item.target` / `item.action` | **不暴露**——订阅通道自己接管它们 |

## 还没做

| | |
| --- | --- |
| `UIMenu` / `UIAction` | 长按菜单、`primaryAction`。一整个子系统 |
| `largeTitle` 一组 | iOS 26 的大标题、大副标题、`largeSubtitleView` |
| `backBarButtonItem` / `backAction` | 自定义返回按钮本身 |
| `subtitleView` | `subtitle` 做了，它的自定义 view 版本还没 |
| `possibleTitles`、`landscapeImagePhone`、`imageInsets` | 边缘调参 |
| `UIToolbar` / `UITabBarItem` | `UIBarItem` 这个基类已经铺好了，加它们时能复用 |
| 外观代理（`setBackgroundImage:forState:barMetrics:`） | `UIAppearance` 整套还没碰 |

---

← 返回 [API 文档](README.md) ・ [`UINavigationController`](ui-navigation-controller.md) ・ [实现原理](../internals/navigation.md)
