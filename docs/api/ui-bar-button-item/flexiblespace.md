---
type: reference
native: +[UIBarButtonItem flexibleSpaceItem]
---

# `UIBarButtonItem.flexibleSpace()` 静态方法

**`UIBarButtonItem.flexibleSpace()`** 静态方法创建一个不显示任何东西、宽度自动伸缩的空白，占满两侧按钮之间剩下的位置。

## 语法

```
UIBarButtonItem.flexibleSpace()
```

### 参数

无。

### 返回值

新建的 `UIBarButtonItem`。

### 异常

无。

## 示例

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: '编辑' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.flexibleSpace(), more];
console.log(page.navigationItem.rightBarButtonItems.length);
```

**结果**：控制台输出 `3`。空白在导航条上的效果**未在模拟器验证**。

## 对应的 iOS API

`+[UIBarButtonItem flexibleSpaceItem]`，等同于 `initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace`。

## 参见

- [`UIBarButtonItem.fixedSpace()`](fixedspace.md)：固定宽度的空白
