---
type: reference
native: UIColor.labelColor
---

# `UIColor.labelColor` 静态属性

**`UIColor.labelColor`** 静态属性是一个语义色：正文文字的颜色。浅色模式下是黑色（`#000000`），深色模式下是白色（`#ffffff`），两个色值是实测的。语义色按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

日常不需要用它：颜色属性直接写字符串 `'label'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.labelColor === UIColor.labelColor` 是 `true`。
- 赋给颜色属性的效果和写 `'label'` 相同。读回来的是字符串 `'label'`，不是 `UIColor` 对象。写入颜色属性后原样读出 `'label'`，在验收用例里验证过。
- 色值由系统决定。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.labelColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `label`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.labelColor`。Swift 里的名字是 `UIColor.label`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
