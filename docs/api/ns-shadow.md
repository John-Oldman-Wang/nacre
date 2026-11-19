---
type: reference
native: NSShadow
status: partial
---

# `NSShadow`

**`NSShadow`** 表示文字的阴影：偏移、模糊半径和颜色。设好之后作为 `shadow` 属性放进[富文本](ns-attributed-string.md)。

放进富文本的是当时的一份副本：之后再改这个对象，已经建好的富文本不变。从富文本读回来的阴影也是副本。

`NSShadow` 不派发事件。它的值只会被 App 自己的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `NSShadow`

## 构造函数

[`NSShadow()`](ns-shadow/constructor.md)

创建一个阴影，偏移是 `(0, 0)`，没有模糊，颜色是三分之一不透明的黑色。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`shadowOffset`](ns-shadow/shadowoffset.md) | 阴影相对文字偏多少 |
| [`shadowBlurRadius`](ns-shadow/shadowblurradius.md) | 模糊半径 |
| [`shadowColor`](ns-shadow/shadowcolor.md) | 阴影的颜色 |

## 实例方法

`NSShadow` 没有自己的实例方法。

## 示例

```js
const shadow = new NSShadow();
shadow.shadowOffset = new CGSize(0, 1);
shadow.shadowBlurRadius = 2;
shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';

const label = new UILabel();
label.attributedText = new NSAttributedString('带阴影', { shadow });
```

**效果**（未在模拟器验证）：文字下方 1 pt 处有一层淡淡的、边缘模糊的黑色阴影。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[NSShadow alloc] init]` | `new NSShadow()` |
| `shadow.shadowOffset = CGSizeMake(0, 1)` | `shadow.shadowOffset = new CGSize(0, 1)` |
| `shadow.shadowColor = [UIColor colorWithWhite:0 alpha:0.4]` | `shadow.shadowColor = 'rgba(0, 0, 0, 0.4)'` |
| `NSShadowAttributeName: shadow` | `{ shadow }` |

## 参见

- [`NSAttributedString`](ns-attributed-string.md)：`shadow` 属性
- [`UILabel.shadowColor`](ui-label/shadowcolor.md)：整个标签的文字阴影，没有模糊半径
- [`CALayer`](ca-layer.md)：图层的阴影
