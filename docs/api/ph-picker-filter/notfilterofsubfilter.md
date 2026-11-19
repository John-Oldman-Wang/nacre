---
type: reference
native: "+[PHPickerFilter notFilterOfSubfilter:]"
---

# `PHPickerFilter.notFilterOfSubfilter()` 静态方法

**`PHPickerFilter.notFilterOfSubfilter()`** 静态方法得到一个新的筛选条件：不符合这个子条件的项才显示。

## 语法

```
PHPickerFilter.notFilterOfSubfilter(subfilter)
```

### 参数

**`subfilter`**

一个 `PHPickerFilter`，可以是组合出来的。

### 返回值

新的 `PHPickerFilter`。每次调用得到一个新对象，比较用 [`isEqual()`](isequal.md)。

### 异常

**`TypeError`**

`subfilter` 不是 `PHPickerFilter`：`notFilterOfSubfilter needs a PHPickerFilter, got null`。

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.videosFilter);
```

**效果**：选图界面里没有视频。**未在模拟器验证。**

## 对应的 iOS API

`+[PHPickerFilter notFilterOfSubfilter:]`。

## 参见

- [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md)：和取反组合，从一类里去掉另一类
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
