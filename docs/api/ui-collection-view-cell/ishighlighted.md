---
type: reference
native: UICollectionViewCell.highlighted
---

# `UICollectionViewCell`：`isHighlighted` 属性

**`isHighlighted`** 属性表示手指是不是正按在这一项上。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 这一项是按下的样子 |
| `false` | 不是 |

- 可读，可写。
- 默认值是 `false`（实测）。
- 由列表维护，一般不用写。要选中一项用列表的 [`selectItemAtIndexPath()`](../ui-collection-view/selectitematindexpath.md)。
- 没有单独的变化事件。选中的变化用列表的 `itemselect`、`itemdeselect` 得知。

## 示例

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  console.log(cell.isHighlighted);
}
```

**结果**：对一个刚取到的单元格调 `inspect(cell)`，输出 `false`。

## 对应的 iOS API

`UICollectionViewCell.highlighted`（getter 是 `isHighlighted`）。

## 参见

- [`itemselect`](../ui-collection-view/itemselect-event.md)
