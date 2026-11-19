---
type: reference
native: UICollectionView.allowsMultipleSelection
---

# `UICollectionView`：`allowsMultipleSelection` 属性

**`allowsMultipleSelection`** 属性表示能不能同时选中多项。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以同时选中多项，再点一次取消 |
| `false` | 选中一项时前一项取消选中 |

- 可读，可写。
- 默认值是 `false`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsMultipleSelection = true;
list.addEventListener('itemdeselect', (event) => console.log('取消了', event.indexPath.item));
```

**效果**：可以选中好几行。再点一次已选中的行，它取消选中，控制台输出它的序号。**未在模拟器验证。**

## 对应的 iOS API

`UICollectionView.allowsMultipleSelection`。

## 参见

- [`indexPathsForSelectedItems`](indexpathsforselecteditems.md)
