---
type: reference
native: UIColor.systemGray6Color
---

# `UIColor.systemGray6Color` 静态属性

**`UIColor.systemGray6Color`** 静态属性是系统色中的第 6 档灰。从 `systemGray2` 到 `systemGray6` 越来越接近底色：浅色模式下越来越浅，深色模式下越来越深。

日常不需要用它：颜色属性直接写字符串 `'systemGray6'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.systemGray6Color === UIColor.systemGray6Color` 是 `true`。
- 赋给颜色属性的效果和写 `'systemGray6'` 相同。读回来的是字符串 `'systemGray6'`，不是 `UIColor` 对象（实测）。
- 具体色值没有量过。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.systemGray6Color;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `systemGray6`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.systemGray6Color`。Swift 里的名字是 `UIColor.systemGray6`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
