---
type: reference
native: "+[UIImage imageWithContentsOfFile:]"
---

# `UIImage.imageWithContentsOfFile()` static method

The **`UIImage.imageWithContentsOfFile()`** static method reads an image from a file on the device.

## Syntax

```
UIImage.imageWithContentsOfFile(path)
```

### Parameters

**`path`**

A string. The file's full absolute path. Get directory paths from the [file system](../filesystem.md) API, such as `application.fileSystem.caches`. Non-strings are converted with `String()`.

### Return value

A `UIImage`. Returns `null` when the file doesn't exist or isn't an image, rather than throwing.

It reads only real files and doesn't look in the Asset Catalog.

### Exceptions

None.

## Examples

```js
const path = application.fileSystem.caches + '/cover.jpg';
const img = UIImage.imageWithContentsOfFile(path);
console.log(img === null ? 'No such file' : img.size.width);
```

**Result**: When the caches directory has `cover.jpg`, it prints its width in pt; otherwise it prints `No such file`. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIImage imageWithContentsOfFile:]`.

## See also

- [File system](../filesystem.md)
- [Displaying images](../../guides/images.md): downloading and saving first, then reading from the file later
