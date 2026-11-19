---
type: reference
native: "+[PHPickerFilter allFilterMatchingSubfilters:]"
---

# `PHPickerFilter.allFilterMatchingSubfilters()` 静态方法

**`PHPickerFilter.allFilterMatchingSubfilters()`** 静态方法组合出一个新的筛选条件：每一个子条件都符合的项才显示。

## 语法

```
PHPickerFilter.allFilterMatchingSubfilters(subfilters)
```

### 参数

**`subfilters`**

`PHPickerFilter` 的数组，至少一个。任何可迭代的东西都行（比如 `Set`）。子条件可以是组合出来的，组合可以嵌套。

### 返回值

新的 `PHPickerFilter`。每次调用得到一个新对象，比较用 [`isEqual()`](isequal.md)。

### 异常

**`TypeError`**

- 空数组：`allFilterMatchingSubfilters needs at least one PHPickerFilter`。
- 不是可迭代的东西：`allFilterMatchingSubfilters needs an array of PHPickerFilter, got an object`。
- 有一项不是 `PHPickerFilter`：`allFilterMatchingSubfilters: subfilters[1] must be a PHPickerFilter, got "videos"`。

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**效果**：选图界面里有照片，没有截屏，也没有视频。**未在模拟器验证。**

## 对应的 iOS API

`+[PHPickerFilter allFilterMatchingSubfilters:]`。

## 参见

- [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md)：符合任何一个
- [`notFilterOfSubfilter()`](notfilterofsubfilter.md)：取反
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
