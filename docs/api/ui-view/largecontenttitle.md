---
type: reference
native: UIView.largeContentTitle
---

# `UIView`：`largeContentTitle` 属性

**`largeContentTitle`** 属性是放大显示时的文字。见 [`showsLargeContentViewer`](showslargecontentviewer.md)。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写入 `null` 或 `undefined` 得到 `null`，其他值转成字符串。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const item = new UIView();
item.largeContentTitle = '收藏';
console.log(item.largeContentTitle);
```

**结果**：输出 `收藏`。

## 对应的 iOS API

`UIView.largeContentTitle`。

## 参见

- [`showsLargeContentViewer`](showslargecontentviewer.md)
