---
type: reference
native: "-[PHPickerViewController initWithConfiguration:]"
---

# `PHPickerViewController()` constructor

The **`PHPickerViewController()`** constructor creates a photo picker from a configuration. Creating it doesn't present anything; present it with the view controller's [`presentViewController()`](../ui-view-controller/presentviewcontroller.md).

## Syntax

```
new PHPickerViewController(configuration)
```

### Parameters

**`configuration`**

A [`PHPickerConfiguration`](../ph-picker-configuration.md), required. The configuration is copied here: changing this configuration object afterward doesn't affect the created picker. Read the copy from [`configuration`](configuration.md).

### Return value

A new `PHPickerViewController`. It hasn't been presented yet; `presentingViewController` is `null`.

### Exceptions

**`TypeError`**

No configuration given, or what's given isn't a `PHPickerConfiguration`:

```
new PHPickerViewController needs a PHPickerConfiguration, got undefined
```

## Description

Create a new picker each time the user picks photos. What happens if the same picker is presented a second time is **not verified in the simulator**.

## Examples

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 3;
const picker = new PHPickerViewController(config);
config.selectionLimit = 5;
console.log(picker.configuration.selectionLimit);
```

**Result**: Prints `3`. Changing the original configuration after construction doesn't change the picker's copy.

## Corresponding iOS API

`-[PHPickerViewController initWithConfiguration:]`.

## See also

- [`PHPickerConfiguration`](../ph-picker-configuration.md): what's in a configuration
- [`pick`](pick-event.md): fires when the user finishes picking
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
