---
type: reference
web: Response.blob()
---

# `Response`: `blob()` method

The **`blob()`** method reads the whole response body and gives a [`Blob`](../blob.md). The content doesn't enter JS memory.

## Syntax

```
blob()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a [`Blob`](../blob.md) once the whole body has downloaded.

- The `Blob`'s [`type`](../blob/type.md) is the empty string; it isn't taken from the `Content-Type` response header.
- A response without a body gives a `Blob` whose `size` is 0.

### Exceptions

The returned `Promise` rejects in these cases:

**`TypeError`**

- The body has already been read: `Body has already been read`.
- [`body`](body.md) has a reader: `Body is locked: response.body has a reader`.
- The network drops mid-download: `message` starts with `Network request failed: `.

**A [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'`**

The request is canceled mid-download, or `AbortSignal.timeout()` runs out.

## Description

Use it to read files and images. Pass the resulting `Blob` straight to [`UIImage.imageWithData()`](../ui-image.md) or to `writeBytes()` of [`application.fileSystem`](../filesystem.md). From download to handoff, the content never enters JS memory; during the download the whole content is still in the app's memory.

## Examples

```js
async function main() {
  const res = await fetch('https://httpbin.org/image/png');
  const blob = await res.blob();
  const image = UIImage.imageWithData(blob);
  console.log(blob.size, image !== null);
}
main();
```

**Result**: It prints the image's byte count and `true`. When the content isn't an image, `image` is `null`.

## Differences from the web

On the web, the resulting `Blob`'s `type` comes from `Content-Type`. In Nacre it is the empty string.

## See also

- [`Blob`](../blob.md)
- [`arrayBuffer()`](arraybuffer.md)
- [Choosing among the four ways to read](../response.md#choosing-among-the-four-ways-to-read)
