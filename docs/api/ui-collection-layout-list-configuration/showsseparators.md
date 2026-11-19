---
type: reference
native: UICollectionLayoutListConfiguration.showsSeparators
---

# `UICollectionLayoutListConfiguration`：`showsSeparators` 属性

**`showsSeparators`** 属性表示行之间画不画分隔线。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 行之间画分隔线 |
| `false` | 不画 |

- 可读，可写。
- 默认值是 `true`。
- 配置在交给 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改它，已经建好的列表不变。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.showsSeparators = false;
const list = new UICollectionView(UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**效果**：列表的行之间没有分隔线。**未在模拟器验证。**

## 对应的 iOS API

`UICollectionLayoutListConfiguration.showsSeparators`。

## 参见

- [`backgroundColor`](backgroundcolor.md)
