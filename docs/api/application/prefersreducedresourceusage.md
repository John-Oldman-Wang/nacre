---
type: reference
native: UIApplication.prefersReducedResourceUsage
---

# `Application`：`prefersReducedResourceUsage` 属性

**`prefersReducedResourceUsage`** 属性表示系统是否建议 App 减少资源消耗。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 系统建议 App 减少资源消耗 |
| `false` | 没有这个建议 |

- 只读。给它赋值抛 `TypeError`。
- iOS 27 以下的系统上总是 `false`。
- 变化时派发 [`reducedresourceusagechange`](reducedresourceusagechange-event.md)。
- 读到 `true` 的情况**未在模拟器验证**。

## 示例

```js
if (application.prefersReducedResourceUsage) {
  console.log('少做一些后台工作');
}
```

**结果**：系统建议减少资源消耗时输出一行。

## 对应的 iOS API

iOS 27 起的 `UIApplication.prefersReducedResourceUsage`。

## 参见

- [`reducedresourceusagechange`](reducedresourceusagechange-event.md)
