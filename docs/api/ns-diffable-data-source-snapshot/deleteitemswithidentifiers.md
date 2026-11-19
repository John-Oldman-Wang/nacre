---
type: reference
native: "-[NSDiffableDataSourceSnapshot deleteItemsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`deleteItemsWithIdentifiers()` 方法

**`deleteItemsWithIdentifiers()`** 方法删掉几项。

## 语法

```
deleteItemsWithIdentifiers(itemIdentifiers)
```

### 参数

**`itemIdentifiers`**

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
snapshot.deleteItemsWithIdentifiers(['pear', 'nope']);
console.log(snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `apple,kale`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot deleteItemsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
