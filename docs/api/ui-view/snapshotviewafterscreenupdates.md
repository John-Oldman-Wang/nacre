---
type: reference
native: "-[UIView snapshotViewAfterScreenUpdates:]"
---

# `UIView`：`snapshotViewAfterScreenUpdates()` 方法

**`snapshotViewAfterScreenUpdates()`** 方法给视图此刻的样子拍一张快照，返回一个显示这张快照的新视图。常用来做转场动画：动画期间显示快照，原来的视图可以隐藏或移走。

## 语法

```
snapshotViewAfterScreenUpdates(afterUpdates)
```

### 参数

**`afterUpdates`**

布尔。`true`：等最近的改动画到屏幕上之后再拍。`false`：按屏幕上现在的样子拍。

### 返回值

新的 `UIView`，或者 `null`（拍不出来时）。快照视图还没有加到视图树上。

### 异常

无。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);

const copy = card.snapshotViewAfterScreenUpdates(false);
if (copy) {
  copy.frame = card.frame;
}
```

**效果**：`copy` 是一个和 `card` 外观相同的视图，加到视图树上就能看到。视图不在屏幕上时能不能拍出内容**未在模拟器验证**。

## 对应的 iOS API

`-[UIView snapshotViewAfterScreenUpdates:]`。

## 参见

- [`resizableSnapshotViewFromRect()`](resizablesnapshotviewfromrect.md)
