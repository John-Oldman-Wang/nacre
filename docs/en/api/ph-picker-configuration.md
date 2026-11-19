---
type: reference
native: PHPickerConfiguration
status: partial
---

# `PHPickerConfiguration`

**`PHPickerConfiguration`** represents the configuration of the photo picker: how many items can be selected at most, which types are shown, how selection works, and what the picker looks like.

The configuration is copied when a [`PHPickerViewController`](photos.md) is created. Changing the configuration object afterwards doesn't affect pickers already created. Its properties have no change notifications: only the app can change them.

You need to install `@nacrejs/photos` first; for how, see [`PHPickerViewController`](photos.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `NSObject` → `PHPickerConfiguration`

## Constructor

[`PHPickerConfiguration()`](ph-picker-configuration/constructor.md)

Creates a configuration with all default values: at most 1 item, all types shown.

## Instance properties

| Property | Description |
| --- | --- |
| [`selectionLimit`](ph-picker-configuration/selectionlimit.md) | The maximum number of items. `0` means no limit |
| [`filter`](ph-picker-configuration/filter.md) | Which types are shown. `null` means all |
| [`preferredAssetRepresentationMode`](ph-picker-configuration/preferredassetrepresentationmode.md) | Which format to give when an item has several |
| [`selection`](ph-picker-configuration/selection.md) | How selection works: checkmarks, numbers, notification on every selection |
| [`mode`](ph-picker-configuration/mode.md) | What the picker looks like: full, or just a row of thumbnails |

## Examples

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.imagesFilter;
config.selectionLimit = 9;
config.selection = 'ordered';
const picker = new PHPickerViewController(config);
```

**Effect**: creates a photo picker that, once presented, shows only images, allows up to 9 to be selected, and shows on each selected image the order in which it was selected. The on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[PHPickerConfiguration alloc] init]` | `new PHPickerConfiguration()` |
| `config.selectionLimit = 3` | `config.selectionLimit = 3` |
| `config.filter = PHPickerFilter.imagesFilter` | `config.filter = PHPickerFilter.imagesFilter` |
| `config.selection = PHPickerConfigurationSelectionOrdered` | `config.selection = 'ordered'` |

## See also

- [`PHPickerViewController`](photos.md): creating a photo picker with this configuration
- [`PHPickerFilter`](ph-picker-filter.md): the type of `filter`
- [Picking photos and saving them to the photo library](../guides/pick-photos.md)
