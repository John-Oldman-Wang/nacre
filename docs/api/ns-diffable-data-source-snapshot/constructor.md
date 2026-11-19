---
type: reference
native: "-[NSDiffableDataSourceSnapshot init]"
---

# `NSDiffableDataSourceSnapshot()` 构造函数

**`NSDiffableDataSourceSnapshot()`** 构造函数建一份空的快照：没有分区，也没有项。

## 语法

```
new NSDiffableDataSourceSnapshot()
```

### 参数

无。

### 返回值

新建的 `NSDiffableDataSourceSnapshot`。`numberOfSections` 和 `numberOfItems` 都是 `0`（实测）。

### 异常

无。

## 示例

```js
const snapshot = new NSDiffableDataSourceSnapshot();
console.log(snapshot.numberOfSections, snapshot.numberOfItems);
```

**结果**：输出 `0 0`。

## 对应的 iOS API

`[[NSDiffableDataSourceSnapshot alloc] init]`。

## 参见

- [`appendSectionsWithIdentifiers()`](appendsectionswithidentifiers.md)：先加分区，再加项
