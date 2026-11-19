---
type: reference
native: "-[NSDiffableDataSourceSnapshot numberOfItemsInSection:]"
---

# `NSDiffableDataSourceSnapshot`：`numberOfItemsInSection()` 方法

**`numberOfItemsInSection()`** 方法返回一个分区里有几项。

## 语法

```
numberOfItemsInSection(sectionIdentifier)
```

### 参数

**`sectionIdentifier`**

分区的标识。

### 返回值

数，是个数。

### 异常

**`TypeError`**

没有这个分区（实测）：`numberOfItemsInSection: there is no section with identifier "nope"`，开头是方法名。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.numberOfItemsInSection('fruit'));
```

**结果**：输出 `2`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot numberOfItemsInSection:]`。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
