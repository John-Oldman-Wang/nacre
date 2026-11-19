---
type: reference
native: CGSize
---

# `CGSize`

**`CGSize`** 表示一个尺寸：宽 `width` 和高 `height`，单位 [pt](units.md)。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`CGSize` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CGSize()`](cg-size/constructor.md)

用宽和高创建一个尺寸。不给的参数是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`width`](cg-size/width.md) <small>只读</small> | 宽，pt |
| [`height`](cg-size/height.md) <small>只读</small> | 高，pt |

## 示例

```js
const label = new UILabel();
label.text = 'Hello, Nacre';
const need = label.sizeThatFits(new CGSize(300, 1000));
console.log(need instanceof CGSize);
```

**结果**：`need` 是文字需要的大小，控制台输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CGSizeMake(100, 50)` | `new CGSize(100, 50)` |
| `CGSizeZero` | `new CGSize()` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- 用到它的地方：[`UIView`](ui-view.md) 的 `sizeThatFits()` 和 `intrinsicContentSize`、[`UIScrollView`](ui-scroll-view.md) 的 `contentSize`、[`CALayer`](ca-layer.md) 的 `shadowOffset`
- [`CGRect`](cg-rect.md)：`size` 是一个 `CGSize`
