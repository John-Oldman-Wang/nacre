---
type: reference
web: DOMException
---

# `DOMException` 的错误码常量

**错误码常量**是 `DOMException` 上 25 个只读的数，每个是一个老数字码，和 [`code`](code.md) 比较用。

## 值

数。

- 类上和实例上都有：`DOMException.ABORT_ERR` 和 `err.ABORT_ERR` 都是 20。
- 只读。给它们赋值抛 `TypeError`，值不变。

| 常量 | 值 | 对应的 `name` |
| --- | --- | --- |
| `INDEX_SIZE_ERR` | 1 | `'IndexSizeError'` |
| `DOMSTRING_SIZE_ERR` | 2 | 无 |
| `HIERARCHY_REQUEST_ERR` | 3 | `'HierarchyRequestError'` |
| `WRONG_DOCUMENT_ERR` | 4 | `'WrongDocumentError'` |
| `INVALID_CHARACTER_ERR` | 5 | `'InvalidCharacterError'` |
| `NO_DATA_ALLOWED_ERR` | 6 | 无 |
| `NO_MODIFICATION_ALLOWED_ERR` | 7 | `'NoModificationAllowedError'` |
| `NOT_FOUND_ERR` | 8 | `'NotFoundError'` |
| `NOT_SUPPORTED_ERR` | 9 | `'NotSupportedError'` |
| `INUSE_ATTRIBUTE_ERR` | 10 | `'InUseAttributeError'` |
| `INVALID_STATE_ERR` | 11 | `'InvalidStateError'` |
| `SYNTAX_ERR` | 12 | `'SyntaxError'` |
| `INVALID_MODIFICATION_ERR` | 13 | `'InvalidModificationError'` |
| `NAMESPACE_ERR` | 14 | `'NamespaceError'` |
| `INVALID_ACCESS_ERR` | 15 | `'InvalidAccessError'` |
| `VALIDATION_ERR` | 16 | 无 |
| `TYPE_MISMATCH_ERR` | 17 | `'TypeMismatchError'` |
| `SECURITY_ERR` | 18 | `'SecurityError'` |
| `NETWORK_ERR` | 19 | `'NetworkError'` |
| `ABORT_ERR` | 20 | `'AbortError'` |
| `URL_MISMATCH_ERR` | 21 | `'URLMismatchError'` |
| `QUOTA_EXCEEDED_ERR` | 22 | `'QuotaExceededError'` |
| `TIMEOUT_ERR` | 23 | `'TimeoutError'` |
| `INVALID_NODE_TYPE_ERR` | 24 | `'InvalidNodeTypeError'` |
| `DATA_CLONE_ERR` | 25 | `'DataCloneError'` |

值是 2、6、16 的三个常量没有对应的名字，任何 `DOMException` 的 `code` 都不会是这三个数。

## 示例

```js
try {
  structuredClone(() => 1);
} catch (err) {
  if (err instanceof DOMException) {
    console.log(err.code === DOMException.DATA_CLONE_ERR, err.code === err.DATA_CLONE_ERR);
  }
}
```

**结果**：输出 `true true`。

## 参见

- [`code`](code.md)
