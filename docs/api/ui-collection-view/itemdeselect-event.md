---
type: reference
native: "UICollectionViewDelegate collectionView:didDeselectItemAtIndexPath:"
---

# `UICollectionView`：`itemdeselect` 事件

**`itemdeselect`** 事件在用户让一项不再选中时派发：多选时再点一次，单选时点了另一项。

## 语法

```
list.addEventListener('itemdeselect', (event) => { })
```

## 事件对象

`UICollectionViewItemEvent`。`type` 是事件名，`target` 是这个列表，另外多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `indexPath` | [`NSIndexPath`](../ns-index-path.md) | 事件发生那一刻这一项的位置 |

不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户的操作引起时派发。**未在模拟器验证**：只有真实触摸能触发。
- 用代码调 [`deselectItemAtIndexPath()`](deselectitematindexpath.md) 不派发（实测）。
- 回调排在当前这一轮代码之后执行。回调执行前数据变了的话，`indexPath` 这个位置上可能已经是另一项，或者没有项。先用 [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识，结果是 `null` 时这个位置上已经没有项。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsMultipleSelection = true;
list.addEventListener('itemdeselect', (event) => {
  console.log('取消了第 ' + event.indexPath.item + ' 项');
});
```

**效果**：多选的列表里再点一次已选中的行，控制台输出它的序号。**未在模拟器验证。**

## 对应的 iOS API

`UICollectionViewDelegate` 的 `collectionView:didDeselectItemAtIndexPath:`。

## 参见

- [`itemselect`](itemselect-event.md)
