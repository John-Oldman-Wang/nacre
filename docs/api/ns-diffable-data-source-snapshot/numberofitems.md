---
type: reference
native: NSDiffableDataSourceSnapshot.numberOfItems
---

# `NSDiffableDataSourceSnapshot`：`numberOfItems` 属性

**`numberOfItems`** 属性是快照里一共有几项，所有分区加在一起。

## 值

数，是个数。

- 只读。给它赋值抛 `TypeError`。
- 新建的快照里是 `0` 或空数组。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.numberOfItems);
```

**结果**：输出 `3`。

## 对应的 iOS API

`NSDiffableDataSourceSnapshot.numberOfItems`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
