---
type: reference
native: UINavigationItem.titleView
---

# `UINavigationItem`：`titleView` 属性

**`titleView`** 属性是显示在导航条正中、代替标题文字的视图。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，导航条正中显示 [`title`](title.md)。
- 读回来的和写进去的是同一个对象。
- 设了它之后，页面的 `title` 仍然有用：下一页的返回按钮上显示的还是它。
- 在屏幕上的样子**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

### 写错时

写入的不是视图：抛 `TypeError: titleView needs a UIView or null`。

## 示例

```js
const page = new UIViewController();
const logo = new UILabel();
logo.text = 'Nacre';
logo.font = UIFont.systemFontOfSize(20, { weight: 'bold' });

page.navigationItem.titleView = logo;
console.log(page.navigationItem.titleView === logo);
```

**结果**：控制台输出 `true`。导航条正中显示这个 [`UILabel`](../ui-label.md)，不再显示 `title` 的文字。写 `null` 恢复显示 `title`。

## 对应的 iOS API

`UINavigationItem.titleView`。

## 参见

- [`customView`](../ui-bar-button-item/customview.md)：把自己的视图放在导航条两侧
