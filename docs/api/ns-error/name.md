---
type: reference
native: NSError
---

# `NSError`：`name` 属性

**`name`** 属性是错误的分类名字。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`，值不变。
- 出错的含义是 iOS 特有的、而且运行时给了分类时，是分类的名字，比如 [`LAContext`](../la-context.md#认证没通过的原因) 的 `'BiometryLockoutError'`、[`CLLocationManager`](../cl-location-error/name.md) 的 `'LocationUnknownError'`。
- 没有分类可给时是 `'NSError'`，这时用 [`domain`](domain.md) 和 [`code`](code.md) 分辨。
- 挂在 [`DOMException`](../dom-exception.md) 的 `cause` 上时，总是 `'NSError'`。分类看外面那个 `DOMException` 的 `name`。

## 示例

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(err.name, cause.name);
    }
  }
}
main();
```

**结果**：输出 `NotFoundError NSError`（实测）。

## 对应的 iOS API

没有直接对应。ObjC 里按 `error.domain` 和 `error.code` 判断，运行时把常见的组合起成了名字。

## 参见

- [`domain`](domain.md)、[`code`](code.md)
- [哪些 API 给出 NSError](../ns-error.md#哪些-api-给出-nserror)
