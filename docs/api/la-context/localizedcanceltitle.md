---
type: reference
native: LAContext.localizedCancelTitle
---

# `LAContext`：`localizedCancelTitle` 属性

**`localizedCancelTitle`** 属性是认证界面上取消按钮的标题。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- `null` 和空串都用系统默认的标题。
- 只有 App 自己能改它，所以没有变化通知。
- 屏幕上的效果**未在模拟器验证**。

### 写错时

不抛异常。`null` 和 `undefined` 得到 `null`；其余的值按 `String()` 转，写 `5` 读回 `'5'`。

## 示例

```js
const context = new LAContext();
context.localizedCancelTitle = '以后再说';
console.log(context.localizedCancelTitle);
```

**效果**：输出 `以后再说`。用这个对象认证时，取消按钮的标题是「以后再说」（**未在模拟器验证**）。

## 对应的 iOS API

`LAContext.localizedCancelTitle`。

## 参见

- [`localizedFallbackTitle`](localizedfallbacktitle.md)：备用按钮的标题
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
