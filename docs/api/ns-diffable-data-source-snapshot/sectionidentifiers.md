---
type: reference
native: NSDiffableDataSourceSnapshot.sectionIdentifiers
---

# `NSDiffableDataSourceSnapshot`：`sectionIdentifiers` 属性

**`sectionIdentifiers`** 属性是全部分区的标识，按顺序。

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
console.log(snapshot.sectionIdentifiers.join(','));
```

**结果**：输出 `fruit,veg`。

## 对应的 iOS API

`NSDiffableDataSourceSnapshot.sectionIdentifiers`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
