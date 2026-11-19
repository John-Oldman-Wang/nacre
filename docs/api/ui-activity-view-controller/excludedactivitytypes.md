---
type: reference
native: UIActivityViewController.excludedActivityTypes
---

# `UIActivityViewController`：`excludedActivityTypes` 属性

**`excludedActivityTypes`** 属性列出不出现在分享面板里的系统动作。

## 值

[系统动作的名字](../ui-activity-view-controller.md#系统动作的名字)组成的数组，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- `null` 和空数组都是一个也不排除。写入空数组读回空数组，写入 `null` 读回 `null`。
- 只能排除系统动作。第三方 App 的分享扩展排除不了。
- 在弹出之前设好。面板已经在屏幕上之后再改，有没有效果**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

### 写错时

- 数组里有不在[系统动作的名字](../ui-activity-view-controller.md#系统动作的名字)里的名字：不抛异常。整次赋值不生效，属性保持原来的值，控制台输出一条警告 `[Nacre] excludedActivityTypes has no value "<写的名字>"; expected one of: …, ignored`，省略号处是全部可用的名字。
- 给的不是数组也不是 `null`：抛 `TypeError: excludedActivityTypes must be an array of names, got "airDrop"`（`got` 后面是实际给的值），原来的值不变。

## 示例

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.excludedActivityTypes = ['print', 'assignToContact', 'addToReadingList'];
console.log(sheet.excludedActivityTypes);
```

**结果**：控制台输出这三个名字。弹出的面板里没有「打印」「指定给联系人」「添加到阅读列表」，**面板上的效果未在模拟器验证**。

## 对应的 iOS API

`UIActivityViewController.excludedActivityTypes`。`UIActivityTypePrint` 写成 `'print'`，其余同理。

## 参见

- [系统动作的名字](../ui-activity-view-controller.md#系统动作的名字)
- [`excludedActivitySectionTypes`](excludedactivitysectiontypes.md)：整块隐藏一个分区
