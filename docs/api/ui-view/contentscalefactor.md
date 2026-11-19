---
type: reference
native: UIView.contentScaleFactor
---

# `UIView`：`contentScaleFactor` 属性

**`contentScaleFactor`** 属性是视图的内容按几倍像素绘制：1 pt 对应几个像素。

## 值

数，比例，没有单位。

- 可读，可写。
- 默认值由屏幕决定，现在的 iPhone 是 3。**未在模拟器验证。**
- 写入时按 `Number()` 转换，转不出有限的数时抛 `TypeError: contentScaleFactor must be a finite number, got …`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。写入其他值的效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
console.log(view.contentScaleFactor);
```

**结果**：输出屏幕的倍数。**未在模拟器验证。**

## 对应的 iOS API

`UIView.contentScaleFactor`。

## 参见

- [单位](../units.md)：pt 和像素
- [`traitCollection`](traitcollection.md)：`displayScale`
