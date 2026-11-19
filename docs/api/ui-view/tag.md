---
type: reference
native: UIView.tag
---

# `UIView`：`tag` 属性

**`tag`** 属性是自己定的整数编号。配合 [`viewWithTag()`](viewwithtag.md) 查找视图。

## 值

整数，没有单位。

- 可读，可写。
- 默认值是 `0`。

### 写错时

按整数转换：`'7'` 得到 7，`3.9` 得到 3，`-3.9` 得到 -3。转不出有限的数时抛 `TypeError`，原值不变。

## 示例

```js
const dot = new UIView();
// @ts-expect-error 类型只收数，这里演示运行时按整数转换
dot.tag = '7';
console.log(dot.tag);
```

**结果**：输出 `7`。

## 对应的 iOS API

`UIView.tag`。

## 参见

- [`viewWithTag()`](viewwithtag.md)
