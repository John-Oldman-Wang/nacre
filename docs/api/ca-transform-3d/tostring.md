---
type: reference
native: CATransform3D
---

# `CATransform3D`：`toString()` 方法

**`toString()`** 方法把变换写成 `CATransform3D(m11, m12, …, m44)` 这样的字符串。`String(t)` 和模板字符串都会调用它。

## 语法

```
toString()
```

### 参数

无。

### 返回值

字符串。16 个数按构造函数的参数顺序排列，也就是按行：先第一行的四个，再第二行，依此类推。

### 异常

无。

## 示例

```js
const t = CATransform3D.translation(10, 20);
console.log(String(t));
console.log(JSON.stringify(t));
```

**结果**

- 第一行输出 `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 0, 1)`。
- 第二行输出 `{"m11":1,"m12":0,"m13":0,"m14":0,"m21":0,"m22":1,"m23":0,"m24":0,"m31":0,"m32":0,"m33":1,"m34":0,"m41":10,"m42":20,"m43":0,"m44":1}`。

## 对应的 iOS API

没有对应的函数。

## 参见

- [结构体](../structs.md)：所有结构体共同的规则
