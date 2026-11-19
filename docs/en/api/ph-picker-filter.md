---
type: reference
native: PHPickerFilter
status: partial
---

# `PHPickerFilter`

**`PHPickerFilter`** represents which kinds of items a photo picker shows, for example only images, only videos, or images without screenshots. Assign it to the [`filter`](ph-picker-configuration/filter.md) of a [`PHPickerConfiguration`](ph-picker-configuration.md).

The twelve predefined filters are read from the class. Three static methods combine them into new filters, and combinations can be nested.

You need to install `@nacrejs/photos` first. See [`PHPickerViewController`](photos.md#installation) for how, or see [Core and capability packages](capabilities.md).

**Inheritance**: `NSObject` → `PHPickerFilter`

## Constructor

You can't create one with `new`. `new PHPickerFilter()` throws `TypeError`:

```
Illegal constructor: PHPickerFilter is created by the runtime, not by new
```

You get filters from the static properties and static methods below.

## Static properties

All are read-only. Each one returns the same object on every read.

| Property | What it shows |
| --- | --- |
| [`PHPickerFilter.imagesFilter`](ph-picker-filter/imagesfilter.md) | Images, including Live Photos |
| [`PHPickerFilter.videosFilter`](ph-picker-filter/videosfilter.md) | Videos |
| [`PHPickerFilter.livePhotosFilter`](ph-picker-filter/livephotosfilter.md) | Live Photos |
| [`PHPickerFilter.depthEffectPhotosFilter`](ph-picker-filter/deptheffectphotosfilter.md) | Photos with a depth effect (taken in Portrait mode) |
| [`PHPickerFilter.burstsFilter`](ph-picker-filter/burstsfilter.md) | Bursts |
| [`PHPickerFilter.panoramasFilter`](ph-picker-filter/panoramasfilter.md) | Panoramas |
| [`PHPickerFilter.screenshotsFilter`](ph-picker-filter/screenshotsfilter.md) | Screenshots |
| [`PHPickerFilter.screenRecordingsFilter`](ph-picker-filter/screenrecordingsfilter.md) | Screen recordings |
| [`PHPickerFilter.cinematicVideosFilter`](ph-picker-filter/cinematicvideosfilter.md) | Videos shot in Cinematic mode |
| [`PHPickerFilter.slomoVideosFilter`](ph-picker-filter/slomovideosfilter.md) | Slow-motion videos |
| [`PHPickerFilter.timelapseVideosFilter`](ph-picker-filter/timelapsevideosfilter.md) | Time-lapse videos |
| [`PHPickerFilter.spatialMediaFilter`](ph-picker-filter/spatialmediafilter.md) | Spatial photos and spatial videos |

## Static methods

| Method | Resulting filter |
| --- | --- |
| [`PHPickerFilter.anyFilterMatchingSubfilters()`](ph-picker-filter/anyfiltermatchingsubfilters.md) | Matches any one of them |
| [`PHPickerFilter.allFilterMatchingSubfilters()`](ph-picker-filter/allfiltermatchingsubfilters.md) | Matches every one of them |
| [`PHPickerFilter.notFilterOfSubfilter()`](ph-picker-filter/notfilterofsubfilter.md) | Doesn't match this one |

## Instance methods

| Method | Description |
| --- | --- |
| [`isEqual()`](ph-picker-filter/isequal.md) | Whether two filters mean the same thing |

## Comparing two filters

Compare two filters with [`isEqual()`](ph-picker-filter/isequal.md), not `===`:

- The twelve predefined filters return the same object on every read, so `===` works for them.
- Combined filters are new objects every time. If you build the same combination twice, `===` is `false` and `isEqual()` is `true`.
- Reading the configuration's [`filter`](ph-picker-configuration/filter.md) doesn't return the object you assigned: the system stores a copy.

## Examples

```js
const config = new PHPickerConfiguration();
// Images, but no screenshots
config.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**Effect**: A photo picker created with this configuration shows photos, but no screenshots and no videos. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `PHPickerFilter.imagesFilter` | `PHPickerFilter.imagesFilter` |
| `[PHPickerFilter anyFilterMatchingSubfilters:@[a, b]]` | `PHPickerFilter.anyFilterMatchingSubfilters([a, b])` |
| `[PHPickerFilter allFilterMatchingSubfilters:@[a, b]]` | `PHPickerFilter.allFilterMatchingSubfilters([a, b])` |
| `[PHPickerFilter notFilterOfSubfilter:a]` | `PHPickerFilter.notFilterOfSubfilter(a)` |
| `[a isEqual:b]` | `a.isEqual(b)` |

## See also

- [`PHPickerConfiguration`](ph-picker-configuration.md): the filter goes in its `filter`
- [Picking photos and saving them to the photo library](../guides/pick-photos.md#showing-only-certain-kinds-of-items)
