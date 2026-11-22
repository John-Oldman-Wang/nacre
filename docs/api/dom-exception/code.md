---
type: reference
web: DOMException.code
---

# `DOMException`：`code` 属性

**`code`** 属性是 [`name`](name.md) 在 Web 标准里对应的老数字码。

## 值

数。

- 只读。给它赋值抛 `TypeError`，值不变。
- 由 `name` 决定，不能单独给。

| `name` | `code` | 对应的常量 |
| --- | --- | --- |
| `'IndexSizeError'` | 1 | `INDEX_SIZE_ERR` |
| `'HierarchyRequestError'` | 3 | `HIERARCHY_REQUEST_ERR` |
| `'WrongDocumentError'` | 4 | `WRONG_DOCUMENT_ERR` |
| `'InvalidCharacterError'` | 5 | `INVALID_CHARACTER_ERR` |
| `'NoModificationAllowedError'` | 7 | `NO_MODIFICATION_ALLOWED_ERR` |
| `'NotFoundError'` | 8 | `NOT_FOUND_ERR` |
| `'NotSupportedError'` | 9 | `NOT_SUPPORTED_ERR` |
| `'InUseAttributeError'` | 10 | `INUSE_ATTRIBUTE_ERR` |
| `'InvalidStateError'` | 11 | `INVALID_STATE_ERR` |
| `'SyntaxError'` | 12 | `SYNTAX_ERR` |
| `'InvalidModificationError'` | 13 | `INVALID_MODIFICATION_ERR` |
| `'NamespaceError'` | 14 | `NAMESPACE_ERR` |
| `'InvalidAccessError'` | 15 | `INVALID_ACCESS_ERR` |
| `'TypeMismatchError'` | 17 | `TYPE_MISMATCH_ERR` |
| `'SecurityError'` | 18 | `SECURITY_ERR` |
| `'NetworkError'` | 19 | `NETWORK_ERR` |
| `'AbortError'` | 20 | `ABORT_ERR` |
| `'URLMismatchError'` | 21 | `URL_MISMATCH_ERR` |
| `'QuotaExceededError'` | 22 | `QUOTA_EXCEEDED_ERR` |
| `'TimeoutError'` | 23 | `TIMEOUT_ERR` |
| `'InvalidNodeTypeError'` | 24 | `INVALID_NODE_TYPE_ERR` |
| `'DataCloneError'` | 25 | `DATA_CLONE_ERR` |
| 别的名字，包括 `'NotAllowedError'`、`'OperationError'` 和自己起的名字 | 0 | 无 |

`'NotAllowedError'`、`'OperationError'` 这些名字没有老数字码，`code` 都是 0。所以判断出了什么错，看 `name`，不看 `code`。

`code` 不是 iOS 系统的错误码。错误来自系统时，系统的错误码在 `cause.code` 上，见[系统给的原值](../dom-exception.md#系统给的原值)。

## 示例

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
if (reason instanceof DOMException) {
  console.log(reason.name, reason.code, reason.code === DOMException.ABORT_ERR);
}
```

**结果**：输出 `AbortError 20 true`。

## 参见

- [错误码常量](constants.md)
- [`name`](name.md)
