---
type: reference
native: "-[UITextField rightViewRectForBounds:]"
---

# `UITextField`：`rightViewRectForBounds()` 方法

**`rightViewRectForBounds()`** 方法返回输入框在给定的范围里摆放时，右端视图（[`rightView`](rightview.md)）所占的矩形。

## 语法

```
rightViewRectForBounds(bounds)
```

### 参数

**`bounds`**

一个矩形，[`CGRect`](../structs.md) 或 `{ x, y, width, height }` 这样的普通对象，单位是 [pt](../units.md)。通常传输入框自己的 `bounds`。

### 返回值

[`CGRect`](../structs.md)，单位是 pt，坐标系是输入框自己的。

### 异常

**`TypeError`**

`bounds` 不是矩形。**未在模拟器验证。**

## 说明

这个方法是按 iOS 的头文件补上的，**没有在模拟器上调过**，用法照 Apple 的文档。

## 示例

```js
const field = new UITextField();
field.frame = new CGRect(0, 0, 300, 44);
field.borderStyle = 'roundedRect';
const r = field.rightViewRectForBounds(field.bounds);
console.log(r.x, r.y, r.width, r.height);
```

**结果**：输出这个矩形的位置和大小。具体的数**未在模拟器验证**。

## 对应的 iOS API

`-[UITextField rightViewRectForBounds:]`。ObjC 里子类覆写它来改摆放的位置；JS 里不能继承，只能调用它读出系统算的矩形。

## 参见

- [`UITextField`](../ui-text-field.md#实例方法)：同一组的其他几个方法
