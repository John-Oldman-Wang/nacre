---
type: reference
native: UIActivityViewController.excludedActivitySectionTypes
---

# `UIActivityViewController`：`excludedActivitySectionTypes` 属性

**`excludedActivitySectionTypes`** 属性列出分享面板里整块隐藏的分区。

## 值

分区名组成的数组。现在只有一个分区名：

| 取值 | 含义 |
| --- | --- |
| `'peopleSuggestions'` | 面板顶上那一排系统推荐的联系人 |

- 可读，可写。
- 默认值是空数组，一个分区也不隐藏。
- 在弹出之前设好。面板已经在屏幕上之后再改，有没有效果**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

### 写错时

- 数组里有不认识的名字：不抛异常。整次赋值不生效，属性保持原来的值，控制台输出一条警告 `[Nacre] excludedActivitySectionTypes has no value "apps"; expected one of: peopleSuggestions, ignored`。
- 给的不是数组：抛 `TypeError`。

## 示例

```js
const sheet = new UIActivityViewController(['一段文字']);
sheet.excludedActivitySectionTypes = ['peopleSuggestions'];
```

**效果**（**未在模拟器验证**）：弹出的面板顶部不再显示系统推荐的联系人。

## 对应的 iOS API

`UIActivityViewController.excludedActivitySectionTypes`。ObjC 里是位掩码 `UIActivitySectionTypesPeopleSuggestions`，这里写成数组 `['peopleSuggestions']`。

## 参见

- [`excludedActivityTypes`](excludedactivitytypes.md)：排除单个系统动作
