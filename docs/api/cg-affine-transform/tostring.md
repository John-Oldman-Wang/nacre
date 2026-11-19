---
type: reference
native: NSStringFromCGAffineTransform
---

# `CGAffineTransform`：`toString()` 方法

**`toString()`** 方法把变换写成 `CGAffineTransform(a, b, c, d, tx, ty)` 这样的字符串。`String(t)` 和模板字符串都会调用它。

## 语法

```
toString()
```

### 参数

无。

### 返回值

字符串。六个数按构造函数的参数顺序排列。

### 异常

无。

## 示例

```js
const t = CGAffineTransform.translation(10, 20);
console.log(String(t));
console.log(JSON.stringify(t));
```

**结果**

- 第一行输出 `CGAffineTransform(1, 0, 0, 1, 10, 20)`。
- 第二行输出 `{"a":1,"b":0,"c":0,"d":1,"tx":10,"ty":20}`。

## 对应的 iOS API

和 `NSStringFromCGAffineTransform(t)` 的作用相同，格式不同。

## 参见

- [结构体](../structs.md)：所有结构体共同的规则
