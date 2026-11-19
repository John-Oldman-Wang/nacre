---
type: reference
native: "-[NSMutableAttributedString addAttribute:value:range:]"
---

# `NSMutableAttributedString`：`addAttribute()` 方法

**`addAttribute()`** 方法给一段文字加一个属性。这一段原来有同名的属性被覆盖，其他属性不动。

## 语法

```
addAttribute(name, { value, range })
```

### 参数

**`name`**

属性的名字，见[富文本的属性](../ns-attributed-string.md#富文本的属性)。

**`options.value`**

必填。属性的值，类型由属性决定。

**`options.range`**

必填。要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

无（`undefined`）。

颜色字符串写错时不抛：打一条警告，什么都不加。

### 异常

**`TypeError`**

- 没给 `range`：`addAttribute needs { range }`。
- 没给 `value`：`addAttribute needs { value }`。
- 属性名写错：`NSAttributedString has no attribute "colour"; expected one of: …`。
- 值的类型不对，比如 `font must be a UIFont, got "Helvetica"`；颜色写 `null` 也抛。
- `range` 越界：`addAttributes range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });
console.log(text.attribute('kern', { atIndex: 3 }), text.attribute('kern', { atIndex: 0 }));
```

**结果**：控制台输出 `2 null`。

## 对应的 iOS API

`-[NSMutableAttributedString addAttribute:value:range:]`。`NSKernAttributeName` 写成 `'kern'`。

## 参见

- [`addAttributes()`](addattributes.md)
- [`removeAttribute()`](removeattribute.md)
