---
type: reference
native: UIColor.opaqueSeparatorColor
---

# `UIColor.opaqueSeparatorColor` 静态属性

**`UIColor.opaqueSeparatorColor`** 静态属性是一个语义色：分隔线的颜色，不透明。语义色按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

日常不需要用它：颜色属性直接写字符串 `'opaqueSeparator'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.opaqueSeparatorColor === UIColor.opaqueSeparatorColor` 是 `true`。
- 赋给颜色属性的效果和写 `'opaqueSeparator'` 相同。读回来的是字符串 `'opaqueSeparator'`，不是 `UIColor` 对象。写入颜色属性后读出 `'opaqueSeparator'`，这一点走和其他颜色名同一段代码，**未在模拟器逐个验证**。
- 具体色值没有量过。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.opaqueSeparatorColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `opaqueSeparator`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.opaqueSeparatorColor`。Swift 里的名字是 `UIColor.opaqueSeparator`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
