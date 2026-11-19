---
type: reference
native: "-[UIView viewWithTag:]"
---

# `UIView`：`viewWithTag()` 方法

**`viewWithTag()`** 方法在调用者自己和它的所有后代里找 [`tag`](tag.md) 等于给定值的视图。

## 语法

```
viewWithTag(tag)
```

### 参数

**`tag`**

要找的编号，整数。按整数转换：`'7'` 得到 7，小数向零取整。

### 返回值

找到的 `UIView`，或者 `null`。找不到时返回 `null`。

### 异常

**`TypeError`**

`tag` 转不出有限的数：`tag must be a finite number, got …`。**报错开头的名字未在模拟器验证。**

## 示例

```js
const page = new UIView();
const card = new UIView();
const dot = new UIView();
page.addSubview(card);
card.addSubview(dot);
dot.tag = 42;

const found = page.viewWithTag(42);
if (found) {
  found.backgroundColor = 'systemRed';
}
```

**效果**：`dot` 变成红色。

## 对应的 iOS API

`-[UIView viewWithTag:]`。

## 参见

- [`tag`](tag.md)
