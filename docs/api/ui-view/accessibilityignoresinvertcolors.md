---
type: reference
native: UIView.accessibilityIgnoresInvertColors
---

# `UIView`：`accessibilityIgnoresInvertColors` 属性

**`accessibilityIgnoresInvertColors`** 属性决定用户打开系统的「智能反转颜色」时，这个视图是否保持原样。照片和视频一般要保持原样。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 不反转，保持原样 |
| `false` | 跟着反转 |

- 可读，可写。
- 默认值是 `false`（按 Apple 的文档，**未在模拟器验证**）。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const photo = new UIImageView();
photo.accessibilityIgnoresInvertColors = true;
```

**效果**：打开智能反转颜色时，图片保持原样。**未在模拟器验证。**

## 对应的 iOS API

`UIView.accessibilityIgnoresInvertColors`。

## 参见

- [`UIImageView`](../ui-image.md)
