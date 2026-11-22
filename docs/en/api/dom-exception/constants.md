---
type: reference
web: DOMException
---

# `DOMException` error code constants

The **error code constants** are 25 read-only numbers on `DOMException`, each a legacy numeric code, for comparing with [`code`](code.md).

## Value

A number.

- On both the class and instances: `DOMException.ABORT_ERR` and `err.ABORT_ERR` are both 20.
- Read-only. Assigning to them throws `TypeError`, and the values don't change.

| Constant | Value | Corresponding `name` |
| --- | --- | --- |
| `INDEX_SIZE_ERR` | 1 | `'IndexSizeError'` |
| `DOMSTRING_SIZE_ERR` | 2 | None |
| `HIERARCHY_REQUEST_ERR` | 3 | `'HierarchyRequestError'` |
| `WRONG_DOCUMENT_ERR` | 4 | `'WrongDocumentError'` |
| `INVALID_CHARACTER_ERR` | 5 | `'InvalidCharacterError'` |
| `NO_DATA_ALLOWED_ERR` | 6 | None |
| `NO_MODIFICATION_ALLOWED_ERR` | 7 | `'NoModificationAllowedError'` |
| `NOT_FOUND_ERR` | 8 | `'NotFoundError'` |
| `NOT_SUPPORTED_ERR` | 9 | `'NotSupportedError'` |
| `INUSE_ATTRIBUTE_ERR` | 10 | `'InUseAttributeError'` |
| `INVALID_STATE_ERR` | 11 | `'InvalidStateError'` |
| `SYNTAX_ERR` | 12 | `'SyntaxError'` |
| `INVALID_MODIFICATION_ERR` | 13 | `'InvalidModificationError'` |
| `NAMESPACE_ERR` | 14 | `'NamespaceError'` |
| `INVALID_ACCESS_ERR` | 15 | `'InvalidAccessError'` |
| `VALIDATION_ERR` | 16 | None |
| `TYPE_MISMATCH_ERR` | 17 | `'TypeMismatchError'` |
| `SECURITY_ERR` | 18 | `'SecurityError'` |
| `NETWORK_ERR` | 19 | `'NetworkError'` |
| `ABORT_ERR` | 20 | `'AbortError'` |
| `URL_MISMATCH_ERR` | 21 | `'URLMismatchError'` |
| `QUOTA_EXCEEDED_ERR` | 22 | `'QuotaExceededError'` |
| `TIMEOUT_ERR` | 23 | `'TimeoutError'` |
| `INVALID_NODE_TYPE_ERR` | 24 | `'InvalidNodeTypeError'` |
| `DATA_CLONE_ERR` | 25 | `'DataCloneError'` |

The three constants with values 2, 6, and 16 have no corresponding name; no `DOMException` has one of these as its `code`.

## Examples

```js
try {
  structuredClone(() => 1);
} catch (err) {
  if (err instanceof DOMException) {
    console.log(err.code === DOMException.DATA_CLONE_ERR, err.code === err.DATA_CLONE_ERR);
  }
}
```

**Result**: Prints `true true`.

## See also

- [`code`](code.md)
