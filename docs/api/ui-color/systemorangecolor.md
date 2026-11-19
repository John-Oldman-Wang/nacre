---
type: reference
native: UIColor.systemOrangeColor
---

# `UIColor.systemOrangeColor` 静态属性

**`UIColor.systemOrangeColor`** 静态属性是系统色中的橙色。系统色是 iOS 界面里常用的一组颜色，色值由系统决定，浅色模式和深色模式下略有不同。

日常不需要用它：颜色属性直接写字符串 `'systemOrange'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.systemOrangeColor === UIColor.systemOrangeColor` 是 `true`。
- 赋给颜色属性的效果和写 `'systemOrange'` 相同。读回来的是字符串 `'systemOrange'`，不是 `UIColor` 对象。写入颜色属性后读出 `'systemOrange'`，这一点走和其他颜色名同一段代码，**未在模拟器逐个验证**。
- 具体色值没有记录。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.systemOrangeColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `systemOrange`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.systemOrangeColor`。Swift 里的名字是 `UIColor.systemOrange`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
