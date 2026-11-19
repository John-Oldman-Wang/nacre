---
type: reference
native: "-[UISearchBar setShowsScopeBar:animated:]"
---

# `UISearchBar`：`setShowsScopeBar()` 方法

**`setShowsScopeBar()`** 方法显示或隐藏范围条，可以带动画。

## 语法

```
setShowsScopeBar(showsScopeBar)
setShowsScopeBar(showsScopeBar, { animated })
```

### 参数

**`showsScopeBar`**

布尔。`true` 显示，`false` 隐藏。

**`options.animated`**

布尔，可以不传。不传或 `false` 时立刻变，等同于直接写 [`showsScopeBar`](showsscopebar.md)。动画的样子**未在模拟器验证**。

### 返回值

无（`undefined`）。

带动画时，`showsScopeBar` 属性在调用返回时已经是新的值。

### 异常

无。

## 示例

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['全部', '我的'];
search.setShowsScopeBar(true, { animated: true });
console.log(search.showsScopeBar);
```

**效果**：范围条带动画出现。控制台输出 `true`。

## 对应的 iOS API

`-[UISearchBar setShowsScopeBar:animated:]`。`animated:` 写成 options 对象的 `animated`。

## 参见

- [`showsScopeBar`](showsscopebar.md)
