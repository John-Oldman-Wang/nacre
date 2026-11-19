---
type: reference
native: "-[NSDiffableDataSourceSnapshot itemIdentifiersInSectionWithIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`：`itemIdentifiersInSectionWithIdentifier()` 方法

**`itemIdentifiersInSectionWithIdentifier()`** 方法返回一个分区里各项的标识。

## 语法

```
itemIdentifiersInSectionWithIdentifier(sectionIdentifier)
```

### 参数

**`sectionIdentifier`**

分区的标识。

### 返回值

标识的数组，按顺序。

### 异常

**`TypeError`**

没有这个分区（实测）。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.itemIdentifiersInSectionWithIdentifier('fruit').join(','));
```

**结果**：输出 `apple,pear`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot itemIdentifiersInSectionWithIdentifier:]`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
