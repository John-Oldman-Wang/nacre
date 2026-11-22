---
type: reference
native: UICollectionViewItemEvent
---

# `UICollectionViewItemEvent`

**`UICollectionViewItemEvent`** 表示列表里某一项发生的事：被选中、取消选中、要显示、不再显示。

[`UICollectionView`](ui-collection-view.md) 的四个事件是它，[`indexPath`](ui-collection-view-item-event/indexpath.md) 是那一项的位置。

**继承关系**：[`Event`](event.md) → `UICollectionViewItemEvent`

## 构造函数

[`UICollectionViewItemEvent()`](ui-collection-view-item-event/constructor.md)

创建一个 `UICollectionViewItemEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`indexPath`](ui-collection-view-item-event/indexpath.md) <small>只读</small> | 事件发生那一刻这一项的位置 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UICollectionView`](ui-collection-view.md) | [`itemselect`](ui-collection-view/itemselect-event.md)、[`itemdeselect`](ui-collection-view/itemdeselect-event.md)、[`beforedisplay`](ui-collection-view/beforedisplay-event.md)、[`displayend`](ui-collection-view/displayend-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('beforedisplay', (e) => {
  console.log(e instanceof UICollectionViewItemEvent, e.indexPath.item);
});
```

**效果**：列表的每一项要显示到屏幕上之前，输出 `true` 和它的位置。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `collectionView:didSelectItemAtIndexPath:` | `itemselect` |
| `collectionView:didDeselectItemAtIndexPath:` | `itemdeselect` |
| `collectionView:willDisplayCell:forItemAtIndexPath:` | `beforedisplay` |
| `collectionView:didEndDisplayingCell:forItemAtIndexPath:` | `displayend` |
| 参数 `indexPath` | `event.indexPath` |

## 参见

- [`UICollectionView`](ui-collection-view.md)：派发这些事件的对象
- [`NSIndexPath`](ns-index-path.md)
