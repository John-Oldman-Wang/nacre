---
type: reference
native: "-[NSDiffableDataSourceSnapshot reconfigureItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`reconfigureItemsWithIdentifiers()` 方法

**`reconfigureItemsWithIdentifiers()`** 方法标记几项的内容变了。应用快照时，在原来的单元格上再调一次 `cellProvider`。

## 语法

```
reconfigureItemsWithIdentifiers(itemIdentifiers)
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

内容变了时一般用这个。先改 App 自己存的数据，再调它；只改数据，列表不会变。见[内容变了：`reload` 和 `reconfigure`](../ns-diffable-data-source-snapshot.md#内容变了reload-和-reconfigure)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.reconfigureItemsWithIdentifiers(['apple']);
```

**效果**：下次把这份快照交给 `applySnapshot()` 时，系统为「apple」再调一次 `cellProvider`。实测这时 `cellProvider` 取到的还是这一行原来的那个单元格。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot reconfigureItemsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
