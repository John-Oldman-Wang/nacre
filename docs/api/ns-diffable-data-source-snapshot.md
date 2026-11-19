---
type: reference
native: NSDiffableDataSourceSnapshot
status: partial
---

# `NSDiffableDataSourceSnapshot`

**`NSDiffableDataSourceSnapshot`** 表示一份列表数据的清单：有哪些分区、每个分区里有哪些项、什么顺序。里面只有[标识](ui-collection-view.md#标识)，没有内容；内容在数据源的 `cellProvider` 里按标识去取。

快照只是数据，改它不影响屏幕。交给数据源的 [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md) 之后列表才变。

得到快照有两种方式：

| 方式 | 得到什么 | 什么时候用 |
| --- | --- | --- |
| [`new NSDiffableDataSourceSnapshot()`](ns-diffable-data-source-snapshot/constructor.md) | 空的快照 | 第一次放数据；数据整体换掉 |
| [`source.snapshot()`](ui-collection-view-diffable-data-source/snapshot.md) | 列表现在的数据的一份副本 | 在现有数据上增、删、改 |

**继承关系**：`EventTarget` → `NSObject` → `NSDiffableDataSourceSnapshot`

## 构造函数

[`NSDiffableDataSourceSnapshot()`](ns-diffable-data-source-snapshot/constructor.md)

建一份空的快照。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`numberOfSections`](ns-diffable-data-source-snapshot/numberofsections.md) <small>只读</small> | 一共有几个分区 |
| [`numberOfItems`](ns-diffable-data-source-snapshot/numberofitems.md) <small>只读</small> | 一共有几项 |
| [`sectionIdentifiers`](ns-diffable-data-source-snapshot/sectionidentifiers.md) <small>只读</small> | 全部分区的标识，按顺序 |
| [`itemIdentifiers`](ns-diffable-data-source-snapshot/itemidentifiers.md) <small>只读</small> | 全部项的标识，按分区的顺序接在一起 |

## 实例方法

查询：

| 方法 | 说明 |
| --- | --- |
| [`numberOfItemsInSection()`](ns-diffable-data-source-snapshot/numberofitemsinsection.md) | 一个分区里有几项 |
| [`itemIdentifiersInSectionWithIdentifier()`](ns-diffable-data-source-snapshot/itemidentifiersinsectionwithidentifier.md) | 一个分区里各项的标识 |
| [`sectionIdentifierForSectionContainingItemIdentifier()`](ns-diffable-data-source-snapshot/sectionidentifierforsectioncontainingitemidentifier.md) | 一项在哪个分区 |
| [`indexOfItemIdentifier()`](ns-diffable-data-source-snapshot/indexofitemidentifier.md) | 一项在全部项里排第几 |
| [`indexOfSectionIdentifier()`](ns-diffable-data-source-snapshot/indexofsectionidentifier.md) | 一个分区排第几 |

改分区：

| 方法 | 说明 |
| --- | --- |
| [`appendSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/appendsectionswithidentifiers.md) | 在最后加几个分区 |
| [`insertSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/insertsectionswithidentifiers.md) | 插在某个分区的前面或后面 |
| [`deleteSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/deletesectionswithidentifiers.md) | 删掉几个分区和里面的项 |
| [`moveSectionWithIdentifier()`](ns-diffable-data-source-snapshot/movesectionwithidentifier.md) | 把一个分区移到另一个的前面或后面 |
| [`reloadSectionsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloadsectionswithidentifiers.md) | 标记几个分区里的项内容变了 |

改项：

| 方法 | 说明 |
| --- | --- |
| [`appendItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/appenditemswithidentifiers.md) | 加到一个分区的末尾 |
| [`insertItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/insertitemswithidentifiers.md) | 插在某一项的前面或后面 |
| [`deleteItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/deleteitemswithidentifiers.md) | 删掉几项 |
| [`deleteAllItems()`](ns-diffable-data-source-snapshot/deleteallitems.md) | 删掉全部分区和项 |
| [`moveItemWithIdentifier()`](ns-diffable-data-source-snapshot/moveitemwithidentifier.md) | 把一项移到另一项的前面或后面 |
| [`reloadItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloaditemswithidentifiers.md) | 标记几项内容变了，应用时换一个单元格 |
| [`reconfigureItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reconfigureitemswithidentifiers.md) | 标记几项内容变了，应用时用原来的单元格 |

## 改动方法的共同规则

- 都没有返回值。要传一组标识的参数都是数组。
- 带 `before…` 和 `after…` 两个键的方法，两个键必须给一个，而且只给一个。
- 出错时都抛 `TypeError`，报错开头是方法名。出错时快照保持原样，那一次调用里的标识一个都不会加进去。

| 情况 | 报错 |
| --- | --- |
| 标识不是字符串或整数 | `appendItemsWithIdentifiers: identifiers must be strings or integers, got 1.5` |
| 该给数组的地方不是数组 | `appendItemsWithIdentifiers needs an array of identifiers` |
| 要加的标识已经在快照里 | `appendItemsWithIdentifiers: item identifier "pear" is already in the snapshot` |
| 同一次调用里标识重复 | `appendItemsWithIdentifiers: item identifier "x" appears more than once` |
| 指的分区不存在 | `appendItemsWithIdentifiers: there is no section with identifier "nope"` |
| 指的项不存在（插入的位置、移动、重新加载、重新设置） | `insertItemsWithIdentifiers: there is no item with identifier "nope"` |
| `before…` 和 `after…` 没给或者都给了 | `insertItemsWithIdentifiers needs exactly one of { beforeItemWithIdentifier } or { afterItemWithIdentifier }` |

## 内容变了：`reload` 和 `reconfigure`

[`reloadItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reloaditemswithidentifiers.md) 和 [`reconfigureItemsWithIdentifiers()`](ns-diffable-data-source-snapshot/reconfigureitemswithidentifiers.md) 都表示「这一项的内容变了」，区别在单元格：

| 方法 | 应用快照时 |
| --- | --- |
| `reconfigureItemsWithIdentifiers()` | 在原来的单元格上再调一次 `cellProvider`。一般用这个 |
| `reloadItemsWithIdentifiers()` | 换一个单元格，再调 `cellProvider` |

只改 App 自己存的数据，列表不会变：快照里只有标识，标识没变，系统就认为没有东西要更新。

## 示例

### 两个分区

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['unpaid', 'done']);
snapshot.appendItemsWithIdentifiers(['A1002'], { intoSectionWithIdentifier: 'unpaid' });
snapshot.appendItemsWithIdentifiers(['A1001', 'A1003'], { intoSectionWithIdentifier: 'done' });
console.log(snapshot.numberOfSections, snapshot.numberOfItems, snapshot.itemIdentifiers.join(','));
```

**结果**：输出 `2 3 A1002,A1001,A1003`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[NSDiffableDataSourceSnapshot alloc] init]` | `new NSDiffableDataSourceSnapshot()` |
| `[snapshot appendItemsWithIdentifiers:ids intoSectionWithIdentifier:@"main"]` | `snapshot.appendItemsWithIdentifiers(ids, { intoSectionWithIdentifier: 'main' })` |
| `[snapshot insertItemsWithIdentifiers:ids beforeItemWithIdentifier:@"x"]` | `snapshot.insertItemsWithIdentifiers(ids, { beforeItemWithIdentifier: 'x' })` |

标识在 ObjC 里可以是任何可哈希的对象，JS 里是字符串或整数。`NSNotFound` 换成了 -1。系统对用错的情况抛出让 App 崩溃的异常，JS 里是可以 `catch` 的 `TypeError`。

## 参见

- [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md)：把快照交给列表
- [做一个列表](../guides/lists.md)：增删改行的写法
