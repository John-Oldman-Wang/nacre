---
type: reference
native: UIApplication.prefersReducedResourceUsage
---

# `Application`：`reducedresourceusagechange` 事件

**`reducedresourceusagechange`** 事件在系统对资源消耗的建议变了时派发。

## 语法

```
application.addEventListener('reducedresourceusagechange', (event) => { })
```

## 事件对象

`Event`，只有基本字段。新的值从 [`application.prefersReducedResourceUsage`](prefersreducedresourceusage.md) 读。不能取消。

## 什么时候派发

- 系统对资源消耗的建议变了时派发。只在 iOS 27 及以上派发。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('reducedresourceusagechange', () => {
  console.log('减少资源消耗', application.prefersReducedResourceUsage);
});
```

**效果**：建议变了之后输出新的值。**未在模拟器验证。**

## 对应的 iOS API

iOS 27 起 `prefersReducedResourceUsage` 的变化通知。

## 参见

- [`prefersReducedResourceUsage`](prefersreducedresourceusage.md)
