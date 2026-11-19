---
type: reference
native: "-[UIActivityViewController initWithActivityItems:applicationActivities:]"
---

# `UIActivityViewController()` 构造函数

**`UIActivityViewController()`** 构造函数用一组要分享的东西创建一个分享面板。要分享的东西只能在创建时给，之后不能换。

## 语法

```
new UIActivityViewController(activityItems)
```

### 参数

**`activityItems`**

数组，必填。每一项是下面三种之一：

| 给的东西 | 接收方拿到的 |
| --- | --- |
| 字符串 | 一段文字 |
| [`URL`](../url.md) 对象 | 一个链接 |
| [`UIImage`](../ui-image.md) | 一张图片 |

- 数字、布尔值按字符串处理，`5` 等于 `'5'`。
- 数组可以是空的，系统不拒绝；这时面板里有什么**未在模拟器验证**。

### 返回值

新建的 `UIActivityViewController`。三个属性都是默认值：[`excludedActivityTypes`](excludedactivitytypes.md) 是 `null`，[`excludedActivitySectionTypes`](excludedactivitysectiontypes.md) 是空数组，[`allowsProminentActivity`](allowsprominentactivity.md) 是 `true`。

### 异常

**`TypeError`**

- 没给，或者给的不是数组：`new UIActivityViewController: activityItems must be an array of strings, URLs and UIImages, got undefined`（`got` 后面是实际给的值）。
- 数组里有分享不了的东西（`null`、普通对象、视图…）：`activityItems[0] must be a string, a URL or a UIImage, got an object`（方括号里是第几项）。
- 给了第二个参数 `{ applicationActivities }`：`new UIActivityViewController: applicationActivities is not supported yet`。

## 示例

```js
const sheet = new UIActivityViewController(['一段文字', new URL('https://example.com')]);
console.log(sheet.excludedActivityTypes);
```

**结果**：得到一个分享面板，控制台输出 `null`。面板要用 [`presentViewController()`](../ui-view-controller/presentviewcontroller.md) 弹出来才显示。

## 对应的 iOS API

`-[UIActivityViewController initWithActivityItems:applicationActivities:]`。`applicationActivities`（App 自己的动作）还不支持，只能不传。

## 参见

- [分享内容](../../guides/share.md)
- [`complete`](complete-event.md)：面板结束时的事件
