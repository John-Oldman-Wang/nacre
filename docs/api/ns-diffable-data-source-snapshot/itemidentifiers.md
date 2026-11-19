---
type: reference
native: NSDiffableDataSourceSnapshot.itemIdentifiers
---

# `NSDiffableDataSourceSnapshot`：`itemIdentifiers` 属性

**`itemIdentifiers`** 属性是全部项的标识，按分区的顺序接在一起。

## 值

标识的数组。每次读得到一个新数组。

- 只读。给它赋值抛 `TypeError`。
- 新建的快照里是 `0` 或空数组。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `apple,pear,kale`。

## 对应的 iOS API

`NSDiffableDataSourceSnapshot.itemIdentifiers`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
