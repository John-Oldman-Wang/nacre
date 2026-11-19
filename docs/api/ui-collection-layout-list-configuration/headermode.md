---
type: reference
native: UICollectionLayoutListConfiguration.headerMode
---

# `UICollectionLayoutListConfiguration`：`headerMode` 属性

**`headerMode`** 属性决定分区的头从哪来。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 分区没有头 |
| `'firstItemInSection'` | 每个分区的第一项当头显示 |

- 可读，可写。
- 默认值是 `'none'`。
- 头显示成什么样**未在模拟器验证**。
- 配置在交给 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改它，已经建好的列表不变。

### 写错时

- 写 `'supplementary'`（头是单独的视图）：还不支持，抛 `TypeError`（实测）。
- 写别的不认识的值：不抛异常，控制台输出一条警告，值不变（实测）。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.headerMode = 'firstItemInSection';
console.log(config.headerMode);
```

**效果**：控制台输出 `firstItemInSection`。用这份配置建的列表，每个分区的第一项当头显示。

## 对应的 iOS API

`UICollectionLayoutListConfiguration.headerMode`。`UICollectionLayoutListHeaderModeFirstItemInSection` 写成 `'firstItemInSection'`。`UICollectionLayoutListHeaderModeSupplementary` 还不支持。

## 参见

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)
