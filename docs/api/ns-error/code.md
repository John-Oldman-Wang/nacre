---
type: reference
native: NSError.code
---

# `NSError`：`code` 属性

**`code`** 属性是错误在它的错误域里的编号。

## 值

数。

- 只读。给它赋值抛 `TypeError`，值不变。
- 是系统给的原值。
- 同一个数在不同的错误域里含义不同，要和 [`domain`](domain.md) 一起判断。

几个常见的值：

| `domain` | `code` | 含义 |
| --- | --- | --- |
| `'NSCocoaErrorDomain'` | 260 | 要读的文件不存在（实测） |
| `'NSURLErrorDomain'` | -999 | 加载被取消，比如调了 [`stop()`](../web-contents/stop.md)（实测） |
| `'NSURLErrorDomain'` | -1100 | 要加载的本地文件不存在（实测） |
| `'kCLErrorDomain'` | 1 | 没有定位的授权 |
| `'com.apple.LocalAuthentication'` | -8 | 生物认证失败次数过多被锁定 |

各个错误域里每个编号的含义，查 Apple 文档里这个错误域的错误码列表。

## 示例

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError && cause.domain === 'NSCocoaErrorDomain' && cause.code === 260) {
      console.log('文件不存在');
    }
  }
}
main();
```

**结果**：输出 `文件不存在`（实测的错误码）。

## 对应的 iOS API

`NSError.code`。

## 参见

- [`domain`](domain.md)
