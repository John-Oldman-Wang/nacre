---
type: reference
native: "-[WKWebView initWithFrame:configuration:]"
---

# `WebView()` constructor

The **`WebView()`** constructor creates a view that displays web pages, along with the web page inside it, [`webContents`](webcontents.md). The new web page is blank; it has content only after you call [`loadURL()`](../web-contents/loadurl.md) or [`loadFile()`](../web-contents/loadfile.md).

## Syntax

```
new WebView()
new WebView({ webPreferences })
```

### Parameters

**`options`**

An object; optional. Passing `null` or `undefined` is the same as passing nothing.

**`options.webPreferences`**

An object; optional. The three members below can only be specified here and cannot be changed after creation.

**`options.webPreferences.partition`**

A string: which [storage partition](../web-view.md#storage-partitions) the web page's data uses. The default is an empty string, meaning the default set.

| Form | Where the data is stored | After the app quits |
| --- | --- | --- |
| Omitted, or an empty string | The default set | Still there |
| `'persist:name'` | The set for that name, shared by web pages with the same name | Still there |
| `'name'` | The set for that name, in memory only | Gone |

**`options.webPreferences.preload`**

A string: the path of the [preload script](../web-view.md#preload-scripts). Relative paths start from the root of the app bundle; paths starting with `/` are absolute. The app bundle is the directory installed on the device, containing the app's program and the resource files bundled with it. Without it there is no preload script, and the web page has no message channel.

The script is read and syntax-checked at the moment of creation, so if the file cannot be read or has a syntax error, the constructor throws on the spot.

**`options.webPreferences.javascript`**

A boolean: whether the web page's own scripts run. Defaults to `true`. Converted as a boolean: `'false'` is a non-empty string and gives `true`.

- `true`: scripts in the web page run as usual.
- `false`: neither `<script>` elements in the page (inline or referencing files) nor `javascript:` URLs run. The [preload script](../web-view.md#preload-scripts) and [`executeJavaScript()`](../web-contents/executejavascript.md) called by the app are unaffected and still work (`executeJavaScript` is measured; the preload script is per Apple's documentation, **not verified in the simulator**).

Set it to `false` when displaying untrusted HTML (terms of service sent by a server, help articles, user-posted content), so that even if scripts are mixed into the content, they do not run.

### Return value

A new `WebView`. Its width and height are 0 pt; give it a size with `frame` or constraints.

### Exceptions

**`TypeError`**

- `preload` is an empty string: `preload: the path is empty`.
- The file `preload` points to cannot be read: `preload: cannot read JS/web/preload.js as UTF-8 text`, where the path is the one passed in.
- A subclass was defined with `class X extends WebView` and then `new X()` was called: `Illegal constructor: X extends WebView, but subclassing native classes is not supported yet`. `WebView` cannot be subclassed.

**`SyntaxError`**

The preload script has a syntax error: `preload JS/web/preload.js: …`, followed by the specific syntax error.

Exceptions thrown while the preload script runs are not reported here; see the [`preload-error`](../web-contents/preload-error-event.md) event.

## Examples

### A web page in the default partition

```js
const web = new WebView();
web.frame = new CGRect(0, 0, 390, 600);
web.webContents.loadURL('https://example.com/');
```

**Effect**: You get a 390 × 600 pt view that shows example.com once added to the UI.

### Specifying a partition and a preload script

```js
const web = new WebView({
  webPreferences: { partition: 'persist:shop', preload: 'JS/web/preload.js' },
});
```

**Effect**: The web page's cookies and `localStorage` are stored in the `persist:shop` set, separate from other partitions. Each time a web page loads, `JS/web/preload.js` runs first.

## Differences from Electron

Corresponds to Electron's `new WebContentsView({ webPreferences })`. `webPreferences` supports only the two entries `partition` and `preload`. Relative `preload` paths start from the app bundle; the preload script and the web page are not isolated, equivalent to `contextIsolation: false`.

The corresponding native iOS code is `[[WKWebView alloc] initWithFrame:configuration:]`: `partition` corresponds to `configuration.websiteDataStore`, and `preload` corresponds to a `WKUserScript` injected at document start into the main document only.

## See also

- [Storage partitions](../web-view.md#storage-partitions)
- [Preload scripts](../web-view.md#preload-scripts)
- [`session`](../session.md): reading and writing cookies in a partition
