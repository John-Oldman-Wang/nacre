---
type: reference
native: PHPickerConfiguration.filter
---

# `PHPickerConfiguration`：`filter` 属性

**`filter`** 属性表示选图界面里显示哪些类型。

## 值

[`PHPickerFilter`](../ph-picker-filter.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`：显示所有类型，包括视频。
- 读回来的不是写进去的那个对象：系统存的是一份副本。比较用 [`isEqual()`](../ph-picker-filter/isequal.md)。
- 只有 App 自己能改它，没有变化通知。

只要图片时设成 `PHPickerFilter.imagesFilter`：选中的视频现在取不出来。

### 写错时

写入不是 `PHPickerFilter` 也不是 `null` 的值，抛 `TypeError`。

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.imagesFilter;
console.log(config.filter === PHPickerFilter.imagesFilter);
console.log(config.filter !== null && config.filter.isEqual(PHPickerFilter.imagesFilter));
```

**结果**：第一行输出 `false`，第二行输出 `true`。

## 对应的 iOS API

`PHPickerConfiguration.filter`。

## 参见

- [`PHPickerFilter`](../ph-picker-filter.md)：现成的筛选条件和组合方式
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
