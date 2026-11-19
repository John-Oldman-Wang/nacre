---
type: reference
native: LAContext.localizedFallbackTitle
---

# `LAContext`：`localizedFallbackTitle` 属性

**`localizedFallbackTitle`** 属性是生物认证失败一次之后，认证界面上出现的备用按钮的标题。用户点这个按钮，认证以 `UserFallbackError` 结束。

## 值

字符串，或者 `null`。

| 取值 | 效果 |
| --- | --- |
| `null` | 备用按钮用系统默认的标题 |
| `''`（空串） | 不显示备用按钮，界面上只有取消按钮 |
| 其他字符串 | 备用按钮的标题 |

- 可读，可写。
- 默认值是 `null`。
- 只有 App 自己能改它，所以没有变化通知。
- 屏幕上的效果和用户点了按钮之后的结果，**未在模拟器验证**。

### 写错时

不抛异常。`null` 和 `undefined` 得到 `null`；其余的值按 `String()` 转，写 `5` 读回 `'5'`。

## 示例

```js
const context = new LAContext();
context.localizedFallbackTitle = '输入登录密码';
console.log(context.localizedFallbackTitle);
```

**效果**：输出 `输入登录密码`。用这个对象认证、生物认证失败一次之后，界面上出现标题是「输入登录密码」的按钮（**未在模拟器验证**）。

```js
const context = new LAContext();
context.localizedFallbackTitle = '';
```

**效果**：生物认证失败之后，界面上只有取消按钮。**未在模拟器验证。**

## 对应的 iOS API

`LAContext.localizedFallbackTitle`。

## 参见

- [`localizedCancelTitle`](localizedcanceltitle.md)：取消按钮的标题
- [生物认证失败时改用 App 自己的密码](../../guides/face-id.md#生物认证失败时改用-app-自己的密码)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
