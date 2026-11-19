---
type: reference
native: "-[NSDiffableDataSourceSnapshot appendSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`appendSectionsWithIdentifiers()` 方法

**`appendSectionsWithIdentifiers()`** 方法在最后加几个分区。

## 语法

```
appendSectionsWithIdentifiers(sectionIdentifiers)
```

### 参数

**`sectionIdentifiers`**

标识的数组。每个标识是字符串或整数。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 分区的标识已经在快照里（实测）。
- 标识不是字符串或整数，或者参数不是数组。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.appendSectionsWithIdentifiers(['meat']);
console.log(snapshot.sectionIdentifiers.join(','));
```

**结果**：输出 `fruit,veg,meat`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot appendSectionsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
