---
type: reference
native: PHPickerFilter
status: partial
---

# `PHPickerFilter`

**`PHPickerFilter`** 表示选图界面里显示哪些类型，比如只显示图片、只显示视频、图片里去掉截屏。把它写进 [`PHPickerConfiguration`](ph-picker-configuration.md) 的 [`filter`](ph-picker-configuration/filter.md)。

现成的十二个筛选条件从类上读，三个静态方法把它们组合成新的条件，组合可以嵌套。

要先装 `@nacrejs/photos`，装法见 [`PHPickerViewController`](photos.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`NSObject` → `PHPickerFilter`

## 构造函数

不能用 `new` 创建。`new PHPickerFilter()` 抛 `TypeError`：

```
Illegal constructor: PHPickerFilter is created by the runtime, not by new
```

筛选条件从下面的静态属性和静态方法得到。

## 静态属性

全部只读。每个每次读都是同一个对象。

| 属性 | 显示什么 |
| --- | --- |
| [`PHPickerFilter.imagesFilter`](ph-picker-filter/imagesfilter.md) | 图片，包括实况照片 |
| [`PHPickerFilter.videosFilter`](ph-picker-filter/videosfilter.md) | 视频 |
| [`PHPickerFilter.livePhotosFilter`](ph-picker-filter/livephotosfilter.md) | 实况照片 |
| [`PHPickerFilter.depthEffectPhotosFilter`](ph-picker-filter/deptheffectphotosfilter.md) | 带景深效果的照片（人像模式拍的） |
| [`PHPickerFilter.burstsFilter`](ph-picker-filter/burstsfilter.md) | 连拍 |
| [`PHPickerFilter.panoramasFilter`](ph-picker-filter/panoramasfilter.md) | 全景照片 |
| [`PHPickerFilter.screenshotsFilter`](ph-picker-filter/screenshotsfilter.md) | 截屏 |
| [`PHPickerFilter.screenRecordingsFilter`](ph-picker-filter/screenrecordingsfilter.md) | 屏幕录制 |
| [`PHPickerFilter.cinematicVideosFilter`](ph-picker-filter/cinematicvideosfilter.md) | 电影效果模式拍的视频 |
| [`PHPickerFilter.slomoVideosFilter`](ph-picker-filter/slomovideosfilter.md) | 慢动作视频 |
| [`PHPickerFilter.timelapseVideosFilter`](ph-picker-filter/timelapsevideosfilter.md) | 延时摄影 |
| [`PHPickerFilter.spatialMediaFilter`](ph-picker-filter/spatialmediafilter.md) | 空间照片和空间视频 |

## 静态方法

| 方法 | 得到的筛选条件 |
| --- | --- |
| [`PHPickerFilter.anyFilterMatchingSubfilters()`](ph-picker-filter/anyfiltermatchingsubfilters.md) | 符合其中任何一个的 |
| [`PHPickerFilter.allFilterMatchingSubfilters()`](ph-picker-filter/allfiltermatchingsubfilters.md) | 每一个都符合的 |
| [`PHPickerFilter.notFilterOfSubfilter()`](ph-picker-filter/notfilterofsubfilter.md) | 不符合这一个的 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`isEqual()`](ph-picker-filter/isequal.md) | 两个筛选条件是不是同一个意思 |

## 比较两个筛选条件

比较两个筛选条件用 [`isEqual()`](ph-picker-filter/isequal.md)，不要用 `===`：

- 现成的十二个每次读是同一个对象，`===` 比得出来。
- 组合出来的每次是新对象。同样的组合建两次，`===` 是 `false`，`isEqual()` 是 `true`。
- 配置的 [`filter`](ph-picker-configuration/filter.md) 读回来的不是写进去的那个对象：系统存的是一份副本。

## 示例

```js
const config = new PHPickerConfiguration();
// 图片，但不要截屏
config.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**效果**：用这份配置建的选图界面里有照片，没有截屏，也没有视频。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `PHPickerFilter.imagesFilter` | `PHPickerFilter.imagesFilter` |
| `[PHPickerFilter anyFilterMatchingSubfilters:@[a, b]]` | `PHPickerFilter.anyFilterMatchingSubfilters([a, b])` |
| `[PHPickerFilter allFilterMatchingSubfilters:@[a, b]]` | `PHPickerFilter.allFilterMatchingSubfilters([a, b])` |
| `[PHPickerFilter notFilterOfSubfilter:a]` | `PHPickerFilter.notFilterOfSubfilter(a)` |
| `[a isEqual:b]` | `a.isEqual(b)` |

## 参见

- [`PHPickerConfiguration`](ph-picker-configuration.md)：筛选条件写在它的 `filter` 里
- [从相册选图、把图存进相册](../guides/pick-photos.md#只显示某几种类型)
