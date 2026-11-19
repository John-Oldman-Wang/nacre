---
type: reference
native: UIView.largeContentImageInsets
---

# `UIView`：`largeContentImageInsets` 属性

**`largeContentImageInsets`** 属性是放大显示时图片四周留出的边距。

## 值

[`UIEdgeInsets`](../ui-edge-insets.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写入时可以给 `UIEdgeInsets`，也可以给四个字段齐全的普通对象。读出来的结构体字段只读，每次读得到一个新对象，见[结构体](../structs.md)。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

### 写错时

- 给的不是对象：抛 `TypeError: largeContentImageInsets needs an object with all of: top, left, bottom, right`。
- 缺字段，或字段转不出有限的数：抛 `TypeError: largeContentImageInsets is missing …, or it is not a finite number`，中间是缺的字段名。
- 出错时属性保持原值。字段的值按 `Number()` 转换，所以 `'10'` 可以。

## 示例

```js
const item = new UIView();
item.largeContentImageInsets = new UIEdgeInsets(4, 4, 4, 4);
console.log(String(item.largeContentImageInsets));
```

**结果**：输出 `UIEdgeInsets(4, 4, 4, 4)`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.largeContentImageInsets`。

## 参见

- [`largeContentImage`](largecontentimage.md)
