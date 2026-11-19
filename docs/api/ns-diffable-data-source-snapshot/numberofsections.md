---
type: reference
native: NSDiffableDataSourceSnapshot.numberOfSections
---

# `NSDiffableDataSourceSnapshot`：`numberOfSections` 属性

**`numberOfSections`** 属性是快照里一共有几个分区。

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
console.log(snapshot.numberOfSections);
```

**结果**：输出 `2`。

## 对应的 iOS API

`NSDiffableDataSourceSnapshot.numberOfSections`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
