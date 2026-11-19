---
type: reference
native: UIEdgeInsets
---

# `UIEdgeInsets`

**`UIEdgeInsets`** 表示四条边各自向内缩进多少：`top`、`left`、`bottom`、`right`，单位 [pt](units.md)。四个数从上边开始，按逆时针方向排列：上、左、下、右。

`left` 和 `right` 固定是屏幕的左和右。界面需要支持从右往左书写的语言时，用左右随文字方向对调的 [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md)。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`UIEdgeInsets` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`UIEdgeInsets()`](ui-edge-insets/constructor.md)

用上、左、下、右四个数创建一组边距。不给的参数是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`top`](ui-edge-insets/top.md) <small>只读</small> | 上边缩进，pt |
| [`left`](ui-edge-insets/left.md) <small>只读</small> | 左边缩进，pt |
| [`bottom`](ui-edge-insets/bottom.md) <small>只读</small> | 下边缩进，pt |
| [`right`](ui-edge-insets/right.md) <small>只读</small> | 右边缩进，pt |

## 示例

```js
const box = new UIView();
box.layoutMargins = new UIEdgeInsets(8, 16, 8, 16);
console.log(String(new UIEdgeInsets(8, 16, 8, 16)));
```

**结果**：`box` 的内边距变成上下 8 pt、左右 16 pt。控制台输出 `UIEdgeInsets(8, 16, 8, 16)`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIEdgeInsetsMake(8, 16, 8, 16)` | `new UIEdgeInsets(8, 16, 8, 16)` |
| `UIEdgeInsetsZero` | `new UIEdgeInsets()` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- 用到它的地方：[`UIView`](ui-view.md) 的 `layoutMargins` 和 `safeAreaInsets`、[`UIScrollView`](ui-scroll-view.md) 的 `contentInset`
- [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md)：左右随文字方向对调的版本
