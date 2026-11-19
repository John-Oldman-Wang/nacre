---
type: reference
native: "-[NSDiffableDataSourceSnapshot deleteAllItems]"
---

# `NSDiffableDataSourceSnapshot`：`deleteAllItems()` 方法

**`deleteAllItems()`** 方法删掉全部分区和项。

## 语法

```
deleteAllItems()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.deleteAllItems();
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**结果**：输出 `0 0`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot deleteAllItems…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
