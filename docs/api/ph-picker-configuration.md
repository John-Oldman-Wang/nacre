---
type: reference
native: PHPickerConfiguration
status: partial
---

# `PHPickerConfiguration`

**`PHPickerConfiguration`** 表示选图界面的配置：最多选几项、显示哪些类型、选中的方式、界面的样子。

配置在创建 [`PHPickerViewController`](photos.md) 时被复制一份。之后再改这个配置对象，已经建好的选择器不受影响。它的属性没有变化通知：只有 App 自己能改它们。

要先装 `@nacrejs/photos`，装法见 [`PHPickerViewController`](photos.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`NSObject` → `PHPickerConfiguration`

## 构造函数

[`PHPickerConfiguration()`](ph-picker-configuration/constructor.md)

创建一份全是默认值的配置：最多选 1 项，显示所有类型。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`selectionLimit`](ph-picker-configuration/selectionlimit.md) | 最多选几项。`0` 是不限 |
| [`filter`](ph-picker-configuration/filter.md) | 显示哪些类型。`null` 是全部 |
| [`preferredAssetRepresentationMode`](ph-picker-configuration/preferredassetrepresentationmode.md) | 一项有几种格式时给哪一种 |
| [`selection`](ph-picker-configuration/selection.md) | 选中的方式：打勾、编号、每选一项就通知 |
| [`mode`](ph-picker-configuration/mode.md) | 界面的样子：完整的，或者只有一行缩略图 |

## 示例

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.imagesFilter;
config.selectionLimit = 9;
config.selection = 'ordered';
const picker = new PHPickerViewController(config);
```

**效果**：建出一个选图界面，弹出来之后只显示图片，最多选 9 张，选中的图上显示它是第几个选的。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[PHPickerConfiguration alloc] init]` | `new PHPickerConfiguration()` |
| `config.selectionLimit = 3` | `config.selectionLimit = 3` |
| `config.filter = PHPickerFilter.imagesFilter` | `config.filter = PHPickerFilter.imagesFilter` |
| `config.selection = PHPickerConfigurationSelectionOrdered` | `config.selection = 'ordered'` |

## 参见

- [`PHPickerViewController`](photos.md)：用这份配置建选图界面
- [`PHPickerFilter`](ph-picker-filter.md)：`filter` 的类型
- [从相册选图、把图存进相册](../guides/pick-photos.md)
