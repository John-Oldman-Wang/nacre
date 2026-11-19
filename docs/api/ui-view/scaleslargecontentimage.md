---
type: reference
native: UIView.scalesLargeContentImage
---

# `UIView`：`scalesLargeContentImage` 属性

**`scalesLargeContentImage`** 属性决定放大显示时是否把 [`largeContentImage`](largecontentimage.md) 放大。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 放大图片 |
| `false` | 按原始大小显示 |

- 可读，可写。
- 默认值是 **未在模拟器验证**。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const item = new UIView();
item.scalesLargeContentImage = true;
```

**效果**：放大显示时图片跟着放大。**未在模拟器验证。**

## 对应的 iOS API

`UIView.scalesLargeContentImage`。

## 参见

- [`largeContentImage`](largecontentimage.md)
