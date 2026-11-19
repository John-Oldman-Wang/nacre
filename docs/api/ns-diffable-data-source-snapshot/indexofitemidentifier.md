---
type: reference
native: "-[NSDiffableDataSourceSnapshot indexOfItemIdentifier:]"
---

# `NSDiffableDataSourceSnapshot`：`indexOfItemIdentifier()` 方法

**`indexOfItemIdentifier()`** 方法返回一项在全部项里排第几。

## 语法

```
indexOfItemIdentifier(itemIdentifier)
```

### 参数

**`itemIdentifier`**

项的标识。

### 返回值

数，从 0 数，是在全部项里的位置。没有这一项返回 `-1`。

### 异常

无。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
console.log(snapshot.indexOfItemIdentifier('kale'), snapshot.indexOfItemIdentifier('nope'));
```

**结果**：输出 `2 -1`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot indexOfItemIdentifier:]`。`NSNotFound` 换成了 -1。

## 参见

- [`NSDiffableDataSourceSnapshot`](../ns-diffable-data-source-snapshot.md)
