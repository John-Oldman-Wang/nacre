---
type: reference
native: UINavigationItem.title
---

# `UINavigationItem`：`title` 属性

**`title`** 属性是导航条正中显示的文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是页面的 [`title`](../ui-view-controller/title.md)。
- 写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 设了 [`titleView`](titleview.md) 时，导航条正中显示那个视图，不显示这里的文字。
- 变化时不派发事件：它只会被代码改变。

它和页面的 `title` 是两份数据，同步是单向的：写页面的 `title` 会同时改它；写它不会改页面的 `title`；把它写成 `null` 之后不会退回页面的 `title`。见[标题的两个入口](../ui-navigation-item.md#标题的两个入口)。

## 示例

```js
const p = new UIViewController();

p.title = '首页';
console.log(p.navigationItem.title);

p.navigationItem.title = '改过的';
console.log(p.title);
console.log(p.navigationItem.title);

p.navigationItem.title = null;
console.log(p.navigationItem.title);

p.title = '首页';
console.log(p.navigationItem.title);
```

**结果**：控制台依次输出 `首页`、`首页`、`改过的`、`null`、`首页`。

## 对应的 iOS API

`UINavigationItem.title`。

## 参见

- [`UIViewController.title`](../ui-view-controller/title.md)：推荐用它设标题
- [`backButtonTitle`](backbuttontitle.md)：只想让返回按钮上的字不一样时用它
