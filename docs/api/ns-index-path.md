---
type: reference
native: NSIndexPath
---

# `NSIndexPath`

**`NSIndexPath`** 表示一项在列表里的位置：第 [`section`](ns-index-path/section.md) 个分区里的第 [`item`](ns-index-path/item.md) 项，都从 0 数。

位置会随数据变：在一项前面插一行，它的位置就变了。要长期记住一项，记它的[标识](ui-collection-view.md#标识)，用到时再用数据源的 [`indexPathForItemIdentifier()`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md) 换成位置。

`NSIndexPath` 是[结构体](structs.md)那一类只读的值：

- **字段只读。** 写入抛 `TypeError`。
- **两个数都是非负整数。** 小数向零取整，负数和转不成数的值抛 `TypeError`。
- **需要位置的参数也接受普通对象。** `{ section: 0, item: 3 }` 和 `new NSIndexPath(0, 3)` 等价。读出来的都是 `NSIndexPath`。
- **转成字符串**是 `'NSIndexPath(0, 3)'`。

**继承关系**：`NSIndexPath`。它不继承 `NSObject`。

## 构造函数

[`NSIndexPath()`](ns-index-path/constructor.md)

用分区和项的序号创建一个位置。参数顺序是先分区后项。

## 静态方法

[`NSIndexPath.indexPathForItem()`](ns-index-path/indexpathforitem.md)

和 ObjC 的写法顺序一样，先项后分区。

[`NSIndexPath.indexPathForRow()`](ns-index-path/indexpathforrow.md)

和上一个相同，名字用 row。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`section`](ns-index-path/section.md) <small>只读</small> | 第几个分区，从 0 数 |
| [`item`](ns-index-path/item.md) <small>只读</small> | 分区里的第几项，从 0 数 |
| [`row`](ns-index-path/row.md) <small>只读</small> | 和 `item` 是同一个数 |

## 示例

```js
const a = new NSIndexPath(0, 3);
const b = NSIndexPath.indexPathForItem(3, { inSection: 0 });
console.log(String(a), a.section === b.section && a.item === b.item);
```

**结果**：输出 `NSIndexPath(0, 3) true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[NSIndexPath indexPathForItem:3 inSection:0]` | `new NSIndexPath(0, 3)`、`NSIndexPath.indexPathForItem(3, { inSection: 0 })` 或 `{ section: 0, item: 3 }` |
| `[NSIndexPath indexPathForRow:3 inSection:0]` | `NSIndexPath.indexPathForRow(3, { inSection: 0 })` |
| `path.section`、`path.item`、`path.row` | 同名 |

`new NSIndexPath(section, item)` 的参数顺序是先分区后项，和 ObjC 的 `indexPathForItem:inSection:` 相反。ObjC 里任意长度的 `NSIndexPath`（`indexPathWithIndexes:length:`）没有提供。

## 参见

- [`UICollectionView`](ui-collection-view.md)：[分区和项](ui-collection-view.md#分区和项)
- [结构体](structs.md)
