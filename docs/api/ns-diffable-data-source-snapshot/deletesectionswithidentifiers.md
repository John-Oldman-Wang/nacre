---
type: reference
native: "-[NSDiffableDataSourceSnapshot deleteSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`deleteSectionsWithIdentifiers()` 方法

**`deleteSectionsWithIdentifiers()`** 方法删掉几个分区，连同里面的项。

## 语法

```
deleteSectionsWithIdentifiers(sectionIdentifiers)
```

### 参数

**`sectionIdentifiers`**

标识的数组。每个标识是字符串或整数。不存在的标识忽略。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

标识不是字符串或整数，或者参数不是数组。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.deleteSectionsWithIdentifiers(['veg', 'nope']);
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**结果**：输出 `1 2`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot deleteSectionsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
