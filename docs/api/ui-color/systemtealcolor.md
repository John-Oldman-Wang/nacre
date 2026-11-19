---
type: reference
native: UIColor.systemTealColor
---

# `UIColor.systemTealColor` 静态属性

**`UIColor.systemTealColor`** 静态属性是系统色中的蓝绿色。系统色是 iOS 界面里常用的一组颜色，色值由系统决定，浅色模式和深色模式下略有不同。

日常不需要用它：颜色属性直接写字符串 `'systemTeal'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.systemTealColor === UIColor.systemTealColor` 是 `true`。
- 赋给颜色属性的效果和写 `'systemTeal'` 相同。读回来的是字符串 `'systemTeal'`，不是 `UIColor` 对象。写入颜色属性后原样读出 `'systemTeal'`，在验收用例里验证过。
- 具体色值没有记录。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.systemTealColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `systemTeal`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.systemTealColor`。Swift 里的名字是 `UIColor.systemTeal`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
