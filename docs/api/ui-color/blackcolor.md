---
type: reference
native: UIColor.blackColor
---

# `UIColor.blackColor` 静态属性

**`UIColor.blackColor`** 静态属性是一个固定色：`rgb(0, 0, 0)`，黑色。色值不随浅色、深色模式变化。

日常不需要用它：颜色属性直接写字符串 `'black'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.blackColor === UIColor.blackColor` 是 `true`。
- 赋给颜色属性的效果和写 `'black'` 相同。读回来的是字符串 `'black'`，不是 `UIColor` 对象。写入颜色属性后原样读出 `'black'`，在验收用例里验证过。
- 色值来自 Apple 的定义，换算成 0–255 并四舍五入。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.blackColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `black`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.blackColor`。Swift 里的名字是 `UIColor.black`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
