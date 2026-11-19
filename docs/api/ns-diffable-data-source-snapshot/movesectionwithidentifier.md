---
type: reference
native: "-[NSDiffableDataSourceSnapshot moveSectionWithIdentifier]"
---

# `NSDiffableDataSourceSnapshot`：`moveSectionWithIdentifier()` 方法

**`moveSectionWithIdentifier()`** 方法把一个分区移到另一个分区的前面或后面，里面的项跟着走。

## 语法

```
moveSectionWithIdentifier(sectionIdentifier, { beforeSectionWithIdentifier })
moveSectionWithIdentifier(sectionIdentifier, { afterSectionWithIdentifier })
```

### 参数

**`sectionIdentifier`**

要移的分区的标识。

**`options.beforeSectionWithIdentifier`**、**`options.afterSectionWithIdentifier`**

插在哪个分区的前面或后面，给一个分区的标识。两个键必须给一个，而且只给一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 要移的分区或者指的分区不存在（实测）。
- `before…` 和 `after…` 没给或者都给了。

出错时快照保持原样，那一次调用里的标识一个都不会加进去。共同的报错见[改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['fruit', 'veg']);
snapshot.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
snapshot.appendItemsWithIdentifiers(['kale'], { intoSectionWithIdentifier: 'veg' });
snapshot.moveSectionWithIdentifier('veg', { beforeSectionWithIdentifier: 'fruit' });
console.log(snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `kale,apple,pear`。

## 对应的 iOS API

`-[NSDiffableDataSourceSnapshot moveSectionWithIdentifier…]`。

## 参见

- [改动方法的共同规则](../ns-diffable-data-source-snapshot.md#改动方法的共同规则)
