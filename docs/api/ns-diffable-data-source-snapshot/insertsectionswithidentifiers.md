---
type: reference
native: "-[NSDiffableDataSourceSnapshot insertSectionsWithIdentifiers]"
---

# `NSDiffableDataSourceSnapshot`：`insertSectionsWithIdentifiers()` 方法

**`insertSectionsWithIdentifiers()`** 方法在某个分区的前面或后面插几个分区。

## 语法

```
insertSectionsWithIdentifiers(sectionIdentifiers, { beforeSectionWithIdentifier })
insertSectionsWithIdentifiers(sectionIdentifiers, { afterSectionWithIdentifier })
```

### 参数

**`sectionIdentifiers`**

标识的数组。每个标识是字符串或整数。

**`options.beforeSectionWithIdentifier`**、**`options.afterSectionWithIdentifier`**

插在哪个分区的前面或后面，给一个分区的标识。两个键必须给一个，而且只给一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 指的分区不存在（实测）。
- `before…` 和 `after…` 没给或者都给了。
- 分区的标识已经在快照里。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.insertSectionsWithIdentifiers(['grain'], { afterSectionWithIdentifier: 'fruit' });
console.log(snapshot.sectionIdentifiers.join(','));
```

**结果**：输出 `fruit,grain,veg`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot insertSectionsWithIdentifiers…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
