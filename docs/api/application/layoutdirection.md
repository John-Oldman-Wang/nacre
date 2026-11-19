---
type: reference
native: UIApplication.userInterfaceLayoutDirection
---

# `Application`：`layoutDirection` 属性

**`layoutDirection`** 属性是界面的书写方向，由系统语言决定。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'ltr'` | 从左往右 |
| `'rtl'` | 从右往左（阿拉伯语、希伯来语） |

- 只读。给它赋值抛 `TypeError`。
- 没有变化事件：iOS 不提供对应的通知。

## 示例

```js
console.log(application.layoutDirection);
```

**结果**：系统语言是从左往右书写时输出 `ltr`。

## 对应的 iOS API

`UIApplication.userInterfaceLayoutDirection`。`UIUserInterfaceLayoutDirectionLeftToRight` 写成 `'ltr'`。

## 参见

- [外观特征](../ui-trait-collection.md)：视图自己的 `layoutDirection`
