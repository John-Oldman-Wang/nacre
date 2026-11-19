---
type: reference
native: UIColor.separatorColor
---

# `UIColor.separatorColor` 静态属性

**`UIColor.separatorColor`** 静态属性是一个语义色：分隔线的颜色。半透明，会透出后面的内容。语义色按用途命名，色值由系统决定，跟随浅色模式、深色模式和「增强对比度」设置变化。

日常不需要用它：颜色属性直接写字符串 `'separator'`，效果相同。

## 值

`UIColor`。

- 只读。给它赋值抛 `TypeError`。
- 每次取到的是同一个对象：`UIColor.separatorColor === UIColor.separatorColor` 是 `true`。
- 赋给颜色属性的效果和写 `'separator'` 相同。读回来的是字符串 `'separator'`，不是 `UIColor` 对象。写入颜色属性后读出 `'separator'`，这一点走和其他颜色名同一段代码，**未在模拟器逐个验证**。
- 具体色值没有量过。

## 示例

```js
const box = new UIView();
box.backgroundColor = UIColor.separatorColor;
console.log(box.backgroundColor);
```

**结果**：控制台输出 `separator`。屏幕上的颜色**未在模拟器验证**。

## 对应的 iOS API

`UIColor.separatorColor`。Swift 里的名字是 `UIColor.separator`，和这里的颜色名字符串相同。

## 参见

- [能用的颜色名](../ui-color.md#能用的颜色名)
- [什么时候需要 `UIColor` 对象](../ui-color.md#什么时候需要-uicolor-对象)
