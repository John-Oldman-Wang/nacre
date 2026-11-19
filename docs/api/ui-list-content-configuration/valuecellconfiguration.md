---
type: reference
native: +[UIListContentConfiguration valueCellConfiguration]
---

# `UIListContentConfiguration.valueCellConfiguration()` 静态方法

**`UIListContentConfiguration.valueCellConfiguration()`** 静态方法返回一份「主文字在左、副文字在右」样式的内容配置，上面还没有内容。

## 语法

```
UIListContentConfiguration.valueCellConfiguration()
```

### 参数

无。

### 返回值

新建的 [`UIListContentConfiguration`](../ui-list-content-configuration.md)（实测）。`text`、`secondaryText`、`image` 都是 `null`。

### 异常

无。

## 示例

```js
const content = UIListContentConfiguration.valueCellConfiguration();
content.text = '标题';
content.secondaryText = '说明';
```

**效果**：得到一份「主文字在左、副文字在右」样式的内容，写给单元格的 `contentConfiguration` 之后显示出来。样式在屏幕上的样子**未在模拟器验证**，含义来自 Apple 的文档。

## 对应的 iOS API

`+[UIListContentConfiguration valueCellConfiguration]`。

## 参见

- [`defaultContentConfiguration()`](../ui-collection-view-list-cell/defaultcontentconfiguration.md)：和列表外观配套的那一份
