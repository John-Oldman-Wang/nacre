---
type: reference
native: "+[PHPickerFilter anyFilterMatchingSubfilters:]"
---

# `PHPickerFilter.anyFilterMatchingSubfilters()` 静态方法

**`PHPickerFilter.anyFilterMatchingSubfilters()`** 静态方法组合出一个新的筛选条件：符合其中任何一个子条件的项都显示。

## 语法

```
PHPickerFilter.anyFilterMatchingSubfilters(subfilters)
```

### 参数

**`subfilters`**

`PHPickerFilter` 的数组，至少一个。任何可迭代的东西都行（比如 `Set`）。子条件可以是组合出来的，组合可以嵌套。

### 返回值

新的 `PHPickerFilter`。每次调用得到一个新对象：同样的组合建两次，`===` 是 `false`，[`isEqual()`](isequal.md) 是 `true`。

### 异常

**`TypeError`**

- 空数组：`anyFilterMatchingSubfilters needs at least one PHPickerFilter`。
- 不是可迭代的东西，比如直接传一个筛选条件：`anyFilterMatchingSubfilters needs an array of PHPickerFilter, got an object`。
- 有一项不是 `PHPickerFilter`：`anyFilterMatchingSubfilters: subfilters[1] must be a PHPickerFilter, got "videos"`。

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.anyFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.videosFilter,
]);
```

**效果**：选图界面里有图片和视频。**未在模拟器验证。**

## 对应的 iOS API

`+[PHPickerFilter anyFilterMatchingSubfilters:]`。

## 参见

- [`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md)：每一个都符合
- [`notFilterOfSubfilter()`](notfilterofsubfilter.md)：取反
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
