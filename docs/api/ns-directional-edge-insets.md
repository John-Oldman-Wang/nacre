---
type: reference
native: NSDirectionalEdgeInsets
---

# `NSDirectionalEdgeInsets`

**`NSDirectionalEdgeInsets`** 表示四条边各自向内缩进多少，左右按文字方向区分：`top`、`leading`、`bottom`、`trailing`，单位 [pt](units.md)。

`leading` 是文字开始的一侧，`trailing` 是文字结束的一侧。从左往右书写的语言里 `leading` 是左、`trailing` 是右；从右往左书写的语言里两者对调。对调的效果**未在模拟器验证**。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`NSDirectionalEdgeInsets` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`NSDirectionalEdgeInsets()`](ns-directional-edge-insets/constructor.md)

用上、文字开始侧、下、文字结束侧四个数创建一组边距。不给的参数是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`top`](ns-directional-edge-insets/top.md) <small>只读</small> | 上边缩进，pt |
| [`leading`](ns-directional-edge-insets/leading.md) <small>只读</small> | 文字开始的一侧缩进，pt |
| [`bottom`](ns-directional-edge-insets/bottom.md) <small>只读</small> | 下边缩进，pt |
| [`trailing`](ns-directional-edge-insets/trailing.md) <small>只读</small> | 文字结束的一侧缩进，pt |

## 示例

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
console.log(String(box.layoutMargins));
```

**结果**：语言是从左往右时，控制台输出 `UIEdgeInsets(1, 2, 3, 4)`。`directionalLayoutMargins` 和 `layoutMargins` 是同一份内边距。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `NSDirectionalEdgeInsetsZero` | `new NSDirectionalEdgeInsets()` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- 用到它的地方：[`UIView`](ui-view.md) 的 `directionalLayoutMargins`
- [`UIEdgeInsets`](ui-edge-insets.md)：左右固定的版本
