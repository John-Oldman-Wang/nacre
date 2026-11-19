---
type: reference
native: "-[NSDiffableDataSourceSnapshot reloadItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`reloadItemsWithIdentifiers()` 方法

**`reloadItemsWithIdentifiers()`** 方法标记几项的内容变了。应用快照时，这几项换一个单元格，再调 `cellProvider`。

## 语法

```
reloadItemsWithIdentifiers(itemIdentifiers)
```

### 参数

**`itemIdentifiers`**

标识的数组。每个标识是字符串或整数。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

指的项不存在（实测）。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 说明

只是内容变了、想保留原来那个单元格时，用 [`reconfigureItemsWithIdentifiers()`](reconfigureitemswithidentifiers.md)，见[内容变了：`reload` 和 `reconfigure`](../ns-diffable-data-source-snapshot.md#内容变了reload-和-reconfigure)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reloadItemsWithIdentifiers(['pear']);
```

**效果**：下次把这份快照交给 `applySnapshot()` 时，「pear」那一行换一个单元格重新取。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot reloadItemsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
