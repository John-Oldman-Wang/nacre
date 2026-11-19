---
type: reference
native: "-[UISegmentedControl setImage:forSegmentAtIndex:]"
---

# `UISegmentedControl`：`setImage()` 方法

**`setImage()`** 方法设某一段的图。一段要么是标题要么是图：给标题段设了图，它原来的标题就没有了。

## 语法

```
setImage(image, { forSegmentAtIndex })
```

### 参数

**`image`**

这一段的图，[`UIImage`](../ui-image.md) 或 `null`。`null` 去掉图。

**`options.forSegmentAtIndex`**

第几段，从 0 数，必填。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forSegmentAtIndex`：`setImage needs { forSegmentAtIndex }`。
- 下标越界或是负数：`setImage: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `setImage: segment 0 is out of range; there are none`。
- `image` 不是 `UIImage` 也不是 `null`：`setImage needs a UIImage or null`。

## 示例

```js
const seg = new UISegmentedControl(['日', '周', '月']);
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  seg.setImage(star, { forSegmentAtIndex: 2 });
  console.log(seg.titleForSegmentAtIndex(2));
}
```

**结果**：输出 `null`。第 2 段显示星形图标，原来的标题「月」没有了。**图标的样子未在模拟器验证。**

## 对应的 iOS API

`-[UISegmentedControl setImage:forSegmentAtIndex:]`。原生对越界的下标有的抛异常、有的不做任何事，这里一律抛 `TypeError`。

## 参见

- [`imageForSegmentAtIndex()`](imageforsegmentatindex.md)：读这一段的图
- [`setTitle()`](settitle.md)：把这一段换成标题
- [`UIImage`](../ui-image.md)
