---
type: reference
native: "-[NSDiffableDataSourceSnapshot reloadSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`reloadSectionsWithIdentifiers()` 方法

**`reloadSectionsWithIdentifiers()`** 方法标记几个分区里的项内容变了。应用快照时，这几个分区的单元格会重新取一遍。

## 语法

```
reloadSectionsWithIdentifiers(sectionIdentifiers)
```

### 参数

**`sectionIdentifiers`**

标识的数组。每个标识是字符串或整数。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

指的分区不存在（实测）。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reloadSectionsWithIdentifiers(['fruit']);
```

**效果**：下次把这份快照交给 `applySnapshot()` 时，「fruit」分区里的行重新取单元格。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot reloadSectionsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
