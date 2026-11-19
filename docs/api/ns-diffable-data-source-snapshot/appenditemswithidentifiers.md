---
type: reference
native: "-[NSDiffableDataSourceSnapshot appendItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`appendItemsWithIdentifiers()` 方法

**`appendItemsWithIdentifiers()`** 方法在一个分区的末尾加几项。

## 语法

```
appendItemsWithIdentifiers(itemIdentifiers)
appendItemsWithIdentifiers(itemIdentifiers, { intoSectionWithIdentifier })
```

### 参数

**`itemIdentifiers`**

标识的数组。每个标识是字符串或整数。

**`options.intoSectionWithIdentifier`**

加到哪个分区，给分区的标识。可以不给，不给时加到最后一个分区。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

| 情况 | 报错 |
| --- | --- |
| 还没有分区 | `appendItemsWithIdentifiers: the snapshot has no sections; append a section first` |
| 指的分区不存在 | `appendItemsWithIdentifiers: there is no section with identifier "nope"` |
| 要加的标识已经在快照里 | `appendItemsWithIdentifiers: item identifier "pear" is already in the snapshot` |
| 同一次调用里标识重复 | `appendItemsWithIdentifiers: item identifier "x" appears more than once` |
| 标识不是字符串或整数（小数、对象、`null`） | `appendItemsWithIdentifiers: identifiers must be strings or integers, got 1.5` |
| 参数不是数组 | `appendItemsWithIdentifiers needs an array of identifiers` |

出错时快照保持原样，那一次调用里的标识一个都不会加进去。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.appendItemsWithIdentifiers(['plum'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['leek']);
console.log(snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `apple,pear,plum,kale,leek`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot appendItemsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
