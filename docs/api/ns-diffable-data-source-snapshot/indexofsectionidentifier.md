---
type: reference
native: "-[NSDiffableDataSourceSnapshot indexOfSectionIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`：`indexOfSectionIdentifier()` 方法

**`indexOfSectionIdentifier()`** 方法返回一个分区排第几。

## 语法

```
indexOfSectionIdentifier(sectionIdentifier)
```

### 参数

**`sectionIdentifier`**

分区的标识。

### 返回值

数，从 0 数。没有这个分区返回 `-1`。

### 异常

无。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.indexOfSectionIdentifier('veg'));
```

**结果**：输出 `1`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot indexOfSectionIdentifier:]`。`NSNotFound` 换成了 -1。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
