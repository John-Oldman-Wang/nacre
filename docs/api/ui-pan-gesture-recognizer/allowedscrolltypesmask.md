---
type: reference
native: UIPanGestureRecognizer.allowedScrollTypesMask
---

# `UIPanGestureRecognizer`：`allowedScrollTypesMask` 属性

**`allowedScrollTypesMask`** 属性决定哪几种滚动输入也算拖动。滚动输入来自外接的鼠标滚轮和触控板。

## 值

字符串数组，数组里可以出现的值：

| 取值 | 含义 |
| --- | --- |
| `'discrete'` | 一格一格的滚动输入，比如鼠标滚轮 |
| `'continuous'` | 连续的滚动输入，比如触控板 |

- 可读，可写。
- 默认值是 `[]`：滚动输入不触发这个识别器。
- 它在 iPhone 上的效果**未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 不是数组：抛 `TypeError: allowedScrollTypesMask needs an array of names; expected any of: discrete / continuous`。
- 数组里有不认识的名字：不抛异常，整次赋值不生效，属性保持原来的值，控制台输出一条警告，比如 `[Nacre] allowedScrollTypesMask has no value "wheel"; expected one of: discrete / continuous, ignored`。数组里写对的名字也不会单独应用。

## 示例

```js
const drag = new UIPanGestureRecognizer();
drag.allowedScrollTypesMask = ['discrete', 'continuous'];
```

**效果**：接了鼠标或触控板时，滚动也触发这个识别器。**未在模拟器验证。**

## 对应的 iOS API

`UIPanGestureRecognizer.allowedScrollTypesMask`。`UIScrollTypeMaskAll` 写成 `['discrete', 'continuous']`。

## 参见

- [枚举](../enums.md)：位掩码写成字符串数组
