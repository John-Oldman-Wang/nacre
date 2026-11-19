---
type: reference
native: "+[UIFont fontWithName:size:]"
---

# `UIFont.fontWithName()` 静态方法

**`UIFont.fontWithName()`** 静态方法按名字取一个系统里装着的字体。系统里没有这个名字时返回 `null`。

## 语法

```
UIFont.fontWithName(name, { size })
```

### 参数

**`name`**

字符串。可以是字体家族名（如 `'Helvetica'`），也可以是具体字体名（如 `'Helvetica-Bold'`）。只能用系统自带的字体，随 App 打包的字体文件目前不能用。系统里有哪些字体名目前不能在 JS 里列出，要查 Apple 的资料。

**`options.size`**

必填。字号，数，单位 [pt](../units.md)。

### 返回值

`UIFont`。系统里没有这个名字的字体时返回 `null`，不抛异常。

没有回退列表：一次只能指定一个名字，取不到时换成什么由 App 的代码决定。

同一个名字取两次是否得到同一个对象没有保证。比较两个指定名字的字体，比较 [`fontName`](fontname.md) 和 [`pointSize`](pointsize.md)，不要用 `===`。

### 异常

**`TypeError`**

没有传 `options`，或 `options` 里没有 `size`：

```
TypeError: fontWithName needs { size }
```

「找不到字体」返回 `null`，「调用方式不对」才抛。

## 示例

### 取一个字体，取不到时不换

```js
const label = new UILabel();
const helvetica = UIFont.fontWithName('Helvetica', { size: 17 });
if (helvetica) {
  label.font = helvetica;
}
```

**效果**：系统里有这个字体时，文字换成 17 pt 的 Helvetica。**未在模拟器验证。**

### 名字不存在

```js
const missing = UIFont.fontWithName('NoSuchFont', { size: 17 });
console.log(missing);
```

**结果**：控制台输出 `null`。

## 对应的 iOS API

`+[UIFont fontWithName:size:]`。第二段 `size:` 放进 options 对象。

## 参见

- [字体从哪里来](../ui-font.md#字体从哪里来)
- [`fontName`](fontname.md)
