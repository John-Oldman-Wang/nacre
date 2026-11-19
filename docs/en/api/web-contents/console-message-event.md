---
type: reference
native: "（没有对应的系统接口）"
---

# `WebContents`: `console-message` event

The **`console-message`** event fires when the web page calls a `console` method, or when an exception in the page goes uncaught. Use it to collect the page's logs and errors into the app's logs or crash reports.

## Syntax

```
contents.addEventListener('console-message', (event) => {})
```

## Event object

`WebContentsConsoleMessageEvent`. Besides `type` and `target`, it has four fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `level` | string | One of `'info'`, `'warning'`, `'error'`, `'debug'` |
| `message` | string | The log text |
| `lineNumber` | number | The line the call was made on. `0` when unavailable |
| `sourceId` | string | The file the call was made in: the script file's URL, or the page's own URL. Empty string when unavailable |

`target` is this page's `webContents`. Not cancelable.

## When it fires

| In the page | `level` | `message` |
| --- | --- | --- |
| `console.log()`, `console.info()` | `'info'` | The arguments joined into text |
| `console.warn()` | `'warning'` | Same as above |
| `console.error()` | `'error'` | Same as above |
| `console.debug()` | `'debug'` | Same as above |
| An uncaught exception | `'error'` | `'Uncaught '` followed by the error, such as `'Uncaught Error: boom'` |
| A rejected Promise that nobody handles | `'error'` | `'Uncaught (in promise) '` followed by the reason, such as `'Uncaught (in promise) Error: nope'` |
| Code the app runs with [`executeJavaScript()`](executejavascript.md) calls `console` | Same as above | Same as above |

Rules for joining the arguments into text:

- Arguments are joined with a single space: `console.log('hello', 1, true)` is `'hello 1 true'`.
- Objects and arrays are written as JSON: `{ a: 1 }` is `'{"a":1}'`. `null` is `'null'`, `undefined` is `'undefined'`.
- Error objects are written as "name: message": `new Error('x')` is `'Error: x'`.
- When the first argument is a string and more arguments follow, `%s`, `%d`, `%i`, `%f`, `%o`, `%O`, and `%%` are substituted the way browsers do, and `%c` (styles) is removed: `console.log('%s=%d%%', 'a', 5)` is `'a=5%'`.

All of the above was verified by testing.

- Logs inside an `<iframe>` also fire it. **Not verified in the simulator.**
- `console.trace()`, `console.table()`, and `console.assert()` don't fire it.
- For a page whose `WebView` was created with `webPreferences.javascript` set to `false`, the page's own scripts don't run, so it has no logs of its own; `console` calls in code the app runs with `executeJavaScript()` still fire it (verified by testing).
- The callback doesn't run synchronously at the moment the page calls `console`; it runs a little later. The page's `console` methods run and return as usual.

> **Note:** Any script in the page can write to `console`, and it decides the content. Logging it is fine; don't execute it as instructions.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('console-message', (e) => {
  console.log('[page ' + e.level + '] ' + e.message + ' (line ' + e.lineNumber + ')');
});
await contents.loadURL('data:text/html;charset=utf-8,' +
  encodeURIComponent('<title>t</title><script>\nconsole.warn("w");\n</script>'));
```

**Effect**: The app's console prints `[page warning] w (line 2)`.

## Differences from Electron

Same as Electron's `console-message`, with the same field names and the same four `level` values. Differences:

- There is no `frame` field.
- Electron's documentation doesn't say whether uncaught exceptions fire this event; here they do, with text written the way the Chromium console writes it.
- How objects are written in `message` (JSON) is our own choice.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`executeJavaScript()`](executejavascript.md)
- [`preload-error`](preload-error-event.md): exceptions thrown by the preload script itself
