---
type: reference
native: UIColor.systemRedColor
---

# `UIColor.systemRedColor` 静态属性

**`UIColor.systemRedColor`** 静态属性是系统色中的红色。系统色是 iOS 界面里常用的一组颜色，色值由系统决定，浅色模式和深色模式下略有不同。

日常不需要用它：颜色属性直接写字符串 `'systemRed'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.systemRedColor === UIColor.systemRedColor` 是 `true`。
- 赋给颜色属性的效果和写 `'systemRed'` 相同。读回来的是字符串 `'systemRed'`，不是 `UIColor` 对象。写入颜色属性后读出 `'systemRed'`，这一点走和其他颜色名同一段代码，**未在模拟器逐个验证**。
- 具体色值没有记录。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.systemRedColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `systemRed`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.systemRedColor`。Swift 里的名字是 `UIColor.systemRed`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
