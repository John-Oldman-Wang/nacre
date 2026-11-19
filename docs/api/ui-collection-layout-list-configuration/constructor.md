---
type: reference
native: "-[UICollectionLayoutListConfiguration initWithAppearance:]"
---

# `UICollectionLayoutListConfiguration()` 构造函数

**`UICollectionLayoutListConfiguration()`** 构造函数用一种外观创建列表布局的配置。

## 语法

```
new UICollectionLayoutListConfiguration(appearance)
```

### 参数

**`appearance`**

外观，字符串，必填：

| 取值 | 效果 |
| --- | --- |
| `'plain'` | 每行通栏，分区之间没有间隔 |
| `'grouped'` | 分区之间有间隔，行通栏 |
| `'insetGrouped'` | 每个分区是一张左右缩进的圆角卡片。系统设置里那种列表 |
| `'sidebar'` | 侧边栏的样式 |
| `'sidebarPlain'` | 侧边栏的样式，分区没有背景 |

五种外观都建得出来（实测），屏幕上的样子**未在模拟器验证**。

### 返回值

新建的配置。[`showsSeparators`](showsseparators.md) 是 `true`，[`backgroundColor`](backgroundcolor.md) 是 `null`，[`headerMode`](headermode.md) 是 `'none'`（实测）。

### 异常

**`TypeError`**

`appearance` 没给，或者不是上表里的值（实测）。报错信息里列出全部可用的值。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
console.log(config.appearance, config.showsSeparators);
```

**结果**：输出 `insetGrouped true`。

## 对应的 iOS API

`[[UICollectionLayoutListConfiguration alloc] initWithAppearance:UICollectionLayoutListAppearanceInsetGrouped]`。`UICollectionLayoutListAppearanceInsetGrouped` 写成 `'insetGrouped'`。

## 参见

- [`appearance`](appearance.md)
