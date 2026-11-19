---
type: reference
native: "-[UISegmentedControl initWithItems:]"
---

# `UISegmentedControl()` 构造函数

**`UISegmentedControl()`** 构造函数创建一个分段选择，数组里的每一项是一段。

## 语法

```
new UISegmentedControl()
new UISegmentedControl(items)
```

### 参数

**`items`** <small>可选</small>

数组，每一项是字符串（这一段的标题）或 [`UIImage`](../ui-image.md)（这一段的图），可以混着给。数字和布尔值转成字符串。

不传、传 `null`、传空数组，都得到一段都没有的控件。

### 返回值

新建的 `UISegmentedControl`。

- [`numberOfSegments`](numberofsegments.md) 等于 `items` 的项数。
- [`selectedSegmentIndex`](selectedsegmentindex.md) 是 -1：没有选中的段。一般在创建之后马上写一个初始值。

### 异常

**`TypeError`**

- `items` 不是数组：`new UISegmentedControl needs an array of strings and UIImages, got "日周月"`。
- 某一项不是字符串、数字、布尔值，也不是 `UIImage`（比如 `null`、`UIColor`、普通对象）：`new UISegmentedControl: items[1] must be a string or a UIImage, got null`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
seg.selectedSegmentIndex = 0;
console.log(seg.numberOfSegments);
```

**结果**：输出 `3`。三段分别是「日」「周」「月」，第 0 段是选中的。

### 标题和图标混着用

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const seg = new UISegmentedControl(['全部', star]);
  console.log(seg.titleForSegmentAtIndex(1));
}
```

**结果**：输出 `null`。第 1 段是图片段，没有标题。

`systemImageNamed` 在名字不存在时返回 `null`，而数组里放 `null` 会抛，所以先判空。

## 对应的 iOS API

`-[UISegmentedControl initWithItems:]`。`new UISegmentedControl()` 对应 `[[UISegmentedControl alloc] init]`。

## 参见

- [`insertSegmentWithTitle()`](insertsegmentwithtitle.md)：创建之后再加段
