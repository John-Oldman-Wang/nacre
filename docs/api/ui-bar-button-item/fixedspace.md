---
type: reference
native: "+[UIBarButtonItem fixedSpaceItemOfWidth:]"
---

# `UIBarButtonItem.fixedSpace()` 静态方法

**`UIBarButtonItem.fixedSpace()`** 静态方法创建一个不显示任何东西、宽度固定的空白，用来拉开两个按钮的距离。

## 语法

```
UIBarButtonItem.fixedSpace(width)
```

### 参数

**`width`**

宽度，单位 [pt](../units.md)。按 `Number(v)` 转换。

### 返回值

新建的 `UIBarButtonItem`，它的 [`width`](width.md) 是给的宽度。

### 异常

**`TypeError`**

`width` 转不成有限的数。

## 示例

```js
const fixed = UIBarButtonItem.fixedSpace(20);
console.log(fixed.width);
```

**结果**：控制台输出 `20`。

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: '编辑' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.fixedSpace(20), more];
```

**效果**：两个按钮之间多出 20 pt 的空白。**未在模拟器验证。**

## 对应的 iOS API

`+[UIBarButtonItem fixedSpaceItemOfWidth:]`。

## 参见

- [`UIBarButtonItem.flexibleSpace()`](flexiblespace.md)：自动伸缩的空白
- [`width`](width.md)
