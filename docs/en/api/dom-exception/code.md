---
type: reference
web: DOMException.code
---

# `DOMException`: `code` property

The **`code`** property is the legacy numeric code the web standards give the [`name`](name.md).

## Value

A number.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- Determined by `name`; it can't be given separately.

| `name` | `code` | Constant |
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
| Any other name, including `'NotAllowedError'`, `'OperationError'`, and names you make up | 0 | None |

Names such as `'NotAllowedError'` and `'OperationError'` have no legacy numeric code, so their `code` is 0. To tell what went wrong, check `name`, not `code`.

`code` isn't the iOS system's error code. When the error comes from the system, the system's error code is on `cause.code`; see [The original system error](../dom-exception.md#the-original-system-error).

## Examples

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
if (reason instanceof DOMException) {
  console.log(reason.name, reason.code, reason.code === DOMException.ABORT_ERR);
}
```

**Result**: Prints `AbortError 20 true`.

## See also

- [Error code constants](constants.md)
- [`name`](name.md)
