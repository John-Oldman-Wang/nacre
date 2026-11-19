---
type: reference
native: NSLocale.usesMetricSystem
---

# `NSLocale`：`usesMetricSystem` 属性

**`usesMetricSystem`** 属性表示这个地区是否用公制。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`，原值不变。
- `true`：用公制（米、千克、摄氏度）。`de_DE` 读到 `true`。
- `false`：不用公制。`en_US` 读到 `false`。

## 示例

```js
console.log(new NSLocale('en_US').usesMetricSystem);
```

**结果**：输出 `false`。

## 对应的 iOS API

`NSLocale.usesMetricSystem`。

## 参见

- [`NSLocale`](../ns-locale.md)
