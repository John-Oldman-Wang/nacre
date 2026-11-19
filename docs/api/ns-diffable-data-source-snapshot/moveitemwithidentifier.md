---
type: reference
native: "-[NSDiffableDataSourceSnapshot moveItemWithIdentifier]"
---

# `NSDiffableDataSourceSnapshot`：`moveItemWithIdentifier()` 方法

**`moveItemWithIdentifier()`** 方法把一项移到另一项的前面或后面，可以跨分区。

## 语法

```
moveItemWithIdentifier(itemIdentifier, { beforeItemWithIdentifier })
moveItemWithIdentifier(itemIdentifier, { afterItemWithIdentifier })
```

### 参数

**`itemIdentifier`**

要移的项的标识。

**`options.beforeItemWithIdentifier`**、**`options.afterItemWithIdentifier`**

插在哪个项的前面或后面，给一个项的标识。两个键必须给一个，而且只给一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 要移的项或者指的项不存在（实测）。
- 把一项移到它自己旁边：`moveItemWithIdentifier: an item cannot be moved next to itself`
- `before…` 和 `after…` 没给或者都给了。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.moveItemWithIdentifier('kale', { afterItemWithIdentifier: 'apple' });
console.log(snapshot.itemIdentifiersInSectionWithIdentifier('fruit').join(','));
```

**结果**：输出 `apple,kale,pear`：「kale」移进了「fruit」分区。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot moveItemWithIdentifier…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
