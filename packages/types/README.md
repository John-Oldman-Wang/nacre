# `@nacrejs/types`

TypeScript type definitions for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps.

This package has types only, no runtime code. The runtime puts its APIs on `globalThis`; this package declares them so the editor autocompletes them and the type checker catches mistakes.

[Documentation](https://john-oldman-wang.github.io/nacre/) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/)

## Install

```bash
npm install -D @nacrejs/types typescript
```

Add one line at the top of the entry file:

```js
/// <reference types="@nacrejs/types" />
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": true,
    "types": []
  },
  "include": ["src/**/*.js"]
}
```

- `"lib": ["ESNext"]` has no `DOM`: the runtime has no `window`, `document` or `location`, and including DOM would make them look like they exist.
- `"allowJs"` and `"checkJs"` type-check `.js` files too, so the same setup works for JavaScript projects.

**Effect**: the editor autocompletes `UIWindow`, `UILabel`, `application` and the rest, and `npx tsc --noEmit` reports mistakes such as a misspelled property or an enum value that doesn't exist.

## What's declared

| | Examples |
| --- | --- |
| Native classes | `UIView`, `UILabel`, `UIColor`, `NSLayoutConstraint`, with the same class names as in Apple's documentation |
| Nacre's own APIs | `application`, `console`, `fetch`, `URL`, timers |

Two rules carry native APIs over to JS:

```ts
// The method name is the first part of the selector; the other parts become keys of an options object
view.insertSubview(box, { atIndex: 0 });        // insertSubview:atIndex:
view.convertPoint(p, { toView: other });        // convertPoint:toView:

// Enum values are strings: the ObjC constant without its type prefix, starting lowercase
label.textAlignment = 'center';                 // NSTextAlignmentCenter
```

See [Native classes](https://john-oldman-wang.github.io/nacre/api/native-classes) for all the rules, and the [API reference](https://john-oldman-wang.github.io/nacre/api/) for every class.

Capability packages such as `@nacrejs/core-location` ship their own types; add a `/// <reference types="…" />` line for each one you install. See [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## License

FSL-1.1-MIT, see `LICENSE.md`.
