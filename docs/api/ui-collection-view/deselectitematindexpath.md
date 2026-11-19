---
type: reference
native: "-[UICollectionView deselectItemAtIndexPath:animated:]"
---

# `UICollectionView`：`deselectItemAtIndexPath()` 方法

**`deselectItemAtIndexPath()`** 方法用代码取消选中一项。

## 语法

```
deselectItemAtIndexPath(indexPath)
deselectItemAtIndexPath(indexPath, { animated })
```

### 参数

**`indexPath`**

这一项的位置，[`NSIndexPath`](../ns-index-path.md) 或 `{ section, item }`。

**`options.animated`**

布尔，可以不传。默认 `false`。`true` 时选中的高亮淡出。

### 返回值

无（`undefined`）。

不派发 [`itemdeselect`](itemdeselect-event.md)（实测）。

### 异常

**`TypeError`**

位置上没有项：`deselectItemAtIndexPath: there is no item at section 9, item 0`

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('itemselect', (event) => {
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**效果**：点一行，这一行的高亮淡出。**未在模拟器验证。**

## 对应的 iOS API

`-[UICollectionView deselectItemAtIndexPath:animated:]`。

## 参见

- [`selectItemAtIndexPath()`](selectitematindexpath.md)
