---
type: reference
native: NSMakeRange
---

# `NSRange()` 构造函数

**`NSRange()`** 构造函数用起点和长度创建一个范围。

## 语法

```
new NSRange()
new NSRange(location, length)
```

### 参数

**`location`**

起点，非负整数，单位是 UTF-16 码元。0 是第一个字符之前。不给时是 0。

**`length`**

长度，非负整数，单位是 UTF-16 码元。不给时是 0。

两个参数的转换：

| 给的值 | 结果 |
| --- | --- |
| 不给 | 0。`new NSRange()` 是 `(0, 0)` |
| 小数 | 向零取整。`new NSRange(1.9, 2.2)` 是 `(1, 2)` |
| 像数的字符串 | 按数转。`new NSRange('3', '4')` 是 `(3, 4)` |

### 返回值

新建的 `NSRange`。

### 异常

**`TypeError`**

- 负数：`NSRange location must be a non-negative integer, got -1`。`length` 是负数时同理。
- 转不成有限的数：`NSRange location must be a finite number, got "abc"`。

## 示例

```js
const r = new NSRange(1.9, 2.2);
console.log(String(r), JSON.stringify(r));
```

**结果**：输出 `NSRange(1, 2) {"location":1,"length":2}`。

## 对应的 iOS API

`NSMakeRange(location, length)`。

## 参见

- [`NSRange`](../ns-range.md)
