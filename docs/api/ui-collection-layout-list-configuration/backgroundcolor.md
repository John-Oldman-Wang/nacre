---
type: reference
native: UICollectionLayoutListConfiguration.backgroundColor
---

# `UICollectionLayoutListConfiguration`：`backgroundColor` 属性

**`backgroundColor`** 属性是列表的底色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示用这种外观自带的底色。
- 写 `null` 退回默认（实测）。
- 配置在交给 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改它，已经建好的列表不变。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.backgroundColor = 'systemBackground';
console.log(config.backgroundColor);
```

**效果**：控制台输出 `systemBackground`。用这份配置建的列表底色是页面的底色。

## 对应的 iOS API

`UICollectionLayoutListConfiguration.backgroundColor`。

## 参见

- [颜色](../ui-color.md)
