---
type: reference
native: UICollectionLayoutListConfiguration.appearance
---

# `UICollectionLayoutListConfiguration`：`appearance` 属性

**`appearance`** 属性是建配置时给的外观。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'plain'` | 每行通栏，分区之间没有间隔 |
| `'grouped'` | 分区之间有间隔，行通栏 |
| `'insetGrouped'` | 每个分区是一张左右缩进的圆角卡片。系统设置里那种列表 |
| `'sidebar'` | 侧边栏的样式 |
| `'sidebarPlain'` | 侧边栏的样式，分区没有背景 |

五种外观都建得出来（实测），屏幕上的样子**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError`（实测）。要别的外观，建一份新的配置。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
console.log(config.appearance);
```

**结果**：输出 `insetGrouped`。

## 对应的 iOS API

`UICollectionLayoutListConfiguration.appearance`。

## 参见

- [`UICollectionLayoutListConfiguration()`](constructor.md)
