---
type: reference
native: UIActivityViewController.allowsProminentActivity
---

# `UIActivityViewController`：`allowsProminentActivity` 属性

**`allowsProminentActivity`** 属性决定系统能不能把某一个动作放大显示在分享面板顶部。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 系统可以把某一个动作放大显示在面板顶部。放大哪一个由系统定 |
| `false` | 不放大任何动作 |

- 可读，可写。
- 默认值是 `true`。
- 两种取值在屏幕上的效果**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

## 示例

```js
const sheet = new UIActivityViewController(['一段文字']);
sheet.allowsProminentActivity = false;
console.log(sheet.allowsProminentActivity);
```

**结果**：控制台输出 `false`。

## 对应的 iOS API

`UIActivityViewController.allowsProminentActivity`。

## 参见

- [`UIActivityViewController`](../ui-activity-view-controller.md)
