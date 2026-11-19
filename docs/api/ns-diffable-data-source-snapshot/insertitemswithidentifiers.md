---
type: reference
native: "-[NSDiffableDataSourceSnapshot insertItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`insertItemsWithIdentifiers()` 方法

**`insertItemsWithIdentifiers()`** 方法在某一项的前面或后面插几项，插进那一项所在的分区。

## 语法

```
insertItemsWithIdentifiers(itemIdentifiers, { beforeItemWithIdentifier })
insertItemsWithIdentifiers(itemIdentifiers, { afterItemWithIdentifier })
```

### 参数

**`itemIdentifiers`**

标识的数组。每个标识是字符串或整数。

**`options.beforeItemWithIdentifier`**、**`options.afterItemWithIdentifier`**

插在哪个项的前面或后面，给一个项的标识。两个键必须给一个，而且只给一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 指的项不存在：`insertItemsWithIdentifiers: there is no item with identifier "nope"`
- `before…` 和 `after…` 没给或者都给了：`insertItemsWithIdentifiers needs exactly one of { beforeItemWithIdentifier } or { afterItemWithIdentifier }`
- 要加的标识已经在快照里。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.insertItemsWithIdentifiers(['fig'], { beforeItemWithIdentifier: 'apple' });
console.log(snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `fig,apple,pear,kale`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot insertItemsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
