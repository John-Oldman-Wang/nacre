---
type: reference
native: PHPickerFilter.burstsFilter
---

# `PHPickerFilter.burstsFilter` 静态属性

**`PHPickerFilter.burstsFilter`** 静态属性是一个现成的筛选条件：只显示连拍。

## 值

`PHPickerFilter`。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象，可以用 `===` 比。
- 可以拿它和别的筛选条件组合，见 [`anyFilterMatchingSubfilters()`](anyfiltermatchingsubfilters.md)、[`allFilterMatchingSubfilters()`](allfiltermatchingsubfilters.md)、[`notFilterOfSubfilter()`](notfilterofsubfilter.md)。

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.burstsFilter;
console.log(PHPickerFilter.burstsFilter === PHPickerFilter.burstsFilter);
```

**效果**：控制台输出 `true`。用这份配置建的选图界面，选图界面里只有连拍的照片。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`PHPickerFilter.burstsFilter`。

## 参见

- [`PHPickerFilter`](../ph-picker-filter.md)：全部筛选条件和比较方法
- [`filter`](../ph-picker-configuration/filter.md)：筛选条件写在配置的这个属性里
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
