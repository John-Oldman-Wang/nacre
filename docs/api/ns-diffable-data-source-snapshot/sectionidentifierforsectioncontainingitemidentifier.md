---
type: reference
native: "-[NSDiffableDataSourceSnapshot sectionIdentifierForSectionContainingItemIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`：`sectionIdentifierForSectionContainingItemIdentifier()` 方法

**`sectionIdentifierForSectionContainingItemIdentifier()`** 方法返回一项在哪个分区里。

## 语法

```
sectionIdentifierForSectionContainingItemIdentifier(itemIdentifier)
```

### 参数

**`itemIdentifier`**

项的标识。

### 返回值

分区的标识，或者 `null`。没有这一项返回 `null`。

### 异常

无。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.sectionIdentifierForSectionContainingItemIdentifier('kale'));
```

**结果**：输出 `veg`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot sectionIdentifierForSectionContainingItemIdentifier:]`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
