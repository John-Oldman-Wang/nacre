---
type: reference
native: UISearchBar.showsScopeBar
---

# `UISearchBar`：`showsScopeBar` 属性

**`showsScopeBar`** 属性表示是否显示范围条，也就是输入框下面那排范围按钮。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 显示范围条。有两个以上的标题时，搜索框想要的高度变成 111 pt |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `false`。
- 没有标题时这个属性照样写得进去，高度不变。
- 用 `frame` 定位时，改了它之后要再调一次 `sizeToFit()`，见[大小](../ui-search-bar.md#大小)。
- 直接写它是立刻显示或隐藏。要动画用 [`setShowsScopeBar()`](setshowsscopebar.md)。
- 写别的类型的值时按真假转成布尔。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['全部', '我的'];
search.showsScopeBar = true;
console.log(search.intrinsicContentSize.height);
```

**效果**：输入框下面多出两个范围按钮。控制台输出 `111`。

## 对应的 iOS API

`UISearchBar.showsScopeBar`。

## 参见

- [`scopeButtonTitles`](scopebuttontitles.md)
- [`setShowsScopeBar()`](setshowsscopebar.md)
