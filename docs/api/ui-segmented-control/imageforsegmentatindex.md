---
type: reference
native: "-[UISegmentedControl imageForSegmentAtIndex:]"
---

# `UISegmentedControl`：`imageForSegmentAtIndex()` 方法

**`imageForSegmentAtIndex()`** 方法返回某一段的图。

## 语法

```
imageForSegmentAtIndex(index)
```

### 参数

**`index`**

第几段，从 0 数。小数向零取整。必须小于 [`numberOfSegments`](numberofsegments.md)。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。返回的就是设进去的那个对象，`===` 比较为 `true`。标题段返回 `null`。

### 异常

**`TypeError`**

- 下标越界或是负数：`imageForSegmentAtIndex: segment 4 is out of range; expected 0 to 3`（段数是 4 时）。一段都没有时是 `imageForSegmentAtIndex: segment 0 is out of range; there are none`。
- 下标转不出有限数：`imageForSegmentAtIndex must be a finite number, got "first"`。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const seg = new UISegmentedControl(['日', star]);
  console.log(seg.imageForSegmentAtIndex(1) === star, seg.imageForSegmentAtIndex(0));
}
```

**结果**：输出 `true null`。

## 对应的 iOS API

`-[UISegmentedControl imageForSegmentAtIndex:]`。原生对越界的下标不一定报错，这里一律抛 `TypeError`。

## 参见

- [`setImage()`](setimage.md)
