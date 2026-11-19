---
type: reference
native: "-[UIToolbar setItems:animated:]"
---

# `UIToolbar`：`setItems()` 方法

**`setItems()`** 方法给工具条换一组项，可以带动画。

## 语法

```
setItems(items)
setItems(items, { animated })
```

### 参数

**`items`**

`UIBarButtonItem` 的数组，从左到右。`null` 等于空数组。

**`options.animated`**

布尔，可以不传。`true` 时新加的项淡入、去掉的项淡出、留下的项移到新位置。不传或 `false` 时立刻换掉，等同于直接写 [`items`](items.md)。动画的样子**未在模拟器验证**。

### 返回值

无（`undefined`）。

带动画时，`items` 属性在调用返回时已经是新的那一组。没有「动画结束」的通知。

### 异常

**`TypeError`**

- `items` 不是数组：`setItems needs an array of UIBarButtonItem or null`。
- 数组里有不是 `UIBarButtonItem` 的元素：`setItems needs an array of UIBarButtonItem`。

两种情况下原来的项都不变。

## 示例

```js
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
toolbar.items = [add, UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('trash')];

toolbar.setItems([add, UIBarButtonItem.flexibleSpace()], { animated: true });
console.log(toolbar.items.length);
```

**效果**：垃圾桶淡出。控制台输出 `2`。

## 对应的 iOS API

`-[UIToolbar setItems:animated:]`。`animated:` 写成 options 对象的 `animated`。

## 参见

- [`items`](items.md)
