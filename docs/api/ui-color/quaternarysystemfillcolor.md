---
type: reference
native: UIColor.quaternarySystemFillColor
---

# `UIColor.quaternarySystemFillColor` 静态属性

**`UIColor.quaternarySystemFillColor`** 静态属性是一个语义色：填充色，给里面有复杂内容的大块区域打底。半透明。语义色按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

日常不需要用它：颜色属性直接写字符串 `'quaternarySystemFill'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.quaternarySystemFillColor === UIColor.quaternarySystemFillColor` 是 `true`。
- 赋给颜色属性的效果和写 `'quaternarySystemFill'` 相同。读回来的是字符串 `'quaternarySystemFill'`，不是 `UIColor` 对象（实测）。
- 具体色值没有量过。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.quaternarySystemFillColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `quaternarySystemFill`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.quaternarySystemFillColor`。Swift 里的名字是 `UIColor.quaternarySystemFill`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
