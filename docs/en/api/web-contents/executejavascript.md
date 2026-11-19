---
type: reference
native: "-[WKWebView callAsyncJavaScript:arguments:inFrame:inContentWorld:completionHandler:]"
---

# `WebContents`: `executeJavaScript()` method

The **`executeJavaScript()`** method runs code in the web page and brings the result back to the app.

## Syntax

```
executeJavaScript(code)
```

### Parameters

**`code`**

The code to run in the web page, a string. It runs in the page's environment: it can use `document` and `window`, but not the app's variables.

The code comes in two forms, with different results:

- **A single expression**, such as `'document.title'` or `'fetch("/api").then((r) => r.status)'`. A trailing semicolon doesn't change this; `'foo();'` also counts as an expression.
- **Multiple statements**, such as `'var a = 1; a + 1'`. Code starting with `{` (a block), `function`, or `class` is also treated as multiple statements; names declared by `function` and `class` go into the page's global scope.

### Return value

`Promise<any>`.

| Case | Result |
| --- | --- |
| The code is a single expression | Fulfills with its value. If the value is a Promise, waits for it; if that is rejected, this one is rejected too |
| The code is multiple statements | Fulfills with the value of the last expression, without waiting for Promises. If the value is an object, member order isn't guaranteed |
| The page throws, or the code has a syntax error | Rejects with an `Error` whose `message` is the page's original text, such as `Error: boom` or `SyntaxError: …` |
| The result can't be passed back (a function, a DOM node, a Promise produced by multiple statements) | Rejects with `TypeError`: `executeJavaScript: the result cannot be passed back; it is a function, a DOM node, or a Promise produced by multi-statement code` |
| The page has been destroyed | Rejects with `TypeError`: `Object has been destroyed` |

The result is passed back as JSON: dates become strings, `NaN` becomes `null`, `Map` becomes `{}`. For all the rules, see [How values are passed](../web-contents.md#how-values-are-passed).

### Exceptions

Doesn't throw directly. All errors reject the returned Promise.

## Description

- It works even before any page has loaded; it then runs in a blank document.
- It works as usual when the page forbids scripts (Content Security Policy).
- The result comes from the page and is untrusted input; check its type and range before using it.

## Examples

### Reading content from the page

```js
const contents = new WebView().webContents;
await contents.loadURL('https://example.com/');
const title = await contents.executeJavaScript('document.title');
const count = await contents.executeJavaScript('document.querySelectorAll("a").length');
console.log(title, count);
```

**Result**: It prints the page's title and the number of links.

### Waiting for a Promise in multiple statements

Multiple statements don't wait for Promises. To use `await` inside, wrap the code in an immediately invoked async function; the whole thing then becomes a single expression:

```js
const contents = new WebView().webContents;
await contents.loadURL('https://example.com/');
const text = await contents.executeJavaScript(`(async () => {
  const response = await fetch('/api/user');
  return (await response.json()).name;
})()`);
```

**Result**: `text` is the `name` the API returns.

### The page throws an exception

```js
const contents = new WebView().webContents;
contents.executeJavaScript('throw new Error("boom")').catch((err) => console.log(err.message));
```

**Result**: It prints `Error: boom`.

## Differences from Electron

Same as Electron's `contents.executeJavaScript(code)`, with three differences: code with multiple statements doesn't wait for Promises; objects returned from multiple statements don't guarantee member order; results are passed as JSON (dates are strings, `Map` is `{}`). Electron's second argument, `userGesture`, isn't supported.

The native iOS equivalents are `[webView evaluateJavaScript:completionHandler:]` and `callAsyncJavaScript:…`.

## See also

- [How values are passed](../web-contents.md#how-values-are-passed)
- [Reading content from the page](../../guides/web-pages.md#reading-content-from-the-web-page)
