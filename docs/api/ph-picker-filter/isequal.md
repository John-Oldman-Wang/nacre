---
type: reference
native: "-[PHPickerFilter isEqual:]"
---

# `PHPickerFilter`：`isEqual()` 方法

**`isEqual()`** 方法判断两个筛选条件是不是同一个意思。

## 语法

```
isEqual(other)
```

### 参数

**`other`**

任何值。

### 返回值

布尔。`true`：两个筛选条件是同一个意思，比如同样的组合建了两次。`false`：意思不同，或者 `other` 不是 `PHPickerFilter`（包括 `null` 和字符串）。

### 异常

无。`other` 不是筛选条件时返回 `false`，不抛。

## 说明

比较筛选条件要用它，不能用 `===`：组合出来的每次是新对象；配置的 [`filter`](../ph-picker-configuration/filter.md) 读回来的是副本。只有现成的十二个每次读是同一个对象。

## 示例

```js
const a = PHPickerFilter.anyFilterMatchingSubfilters([PHPickerFilter.imagesFilter, PHPickerFilter.videosFilter]);
const b = PHPickerFilter.anyFilterMatchingSubfilters([PHPickerFilter.imagesFilter, PHPickerFilter.videosFilter]);
console.log(a === b, a.isEqual(b));
console.log(a.isEqual(PHPickerFilter.imagesFilter), a.isEqual('imagesFilter'));
```

**结果**：第一行输出 `false true`，第二行输出 `false false`。

## 对应的 iOS API

`-[NSObject isEqual:]`。

## 参见

- [比较两个筛选条件](../ph-picker-filter.md#比较两个筛选条件)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
