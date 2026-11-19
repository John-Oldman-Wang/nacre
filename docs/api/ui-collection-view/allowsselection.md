---
type: reference
native: UICollectionView.allowsSelection
---

# `UICollectionView`：`allowsSelection` 属性

**`allowsSelection`** 属性表示用户能不能点选列表里的项。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户可以点选 |
| `false` | 点了没有反应，不派发 [`itemselect`](itemselect-event.md) |

- 可读，可写。
- 默认值是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.allowsSelection = false;
```

**效果**：点一行没有反应。**未在模拟器验证。**

## 对应的 iOS API

`UICollectionView.allowsSelection`。

## 参见

- [`allowsMultipleSelection`](allowsmultipleselection.md)
