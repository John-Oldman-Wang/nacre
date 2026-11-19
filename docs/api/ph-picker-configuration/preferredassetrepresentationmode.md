---
type: reference
native: PHPickerConfiguration.preferredAssetRepresentationMode
---

# `PHPickerConfiguration`：`preferredAssetRepresentationMode` 属性

**`preferredAssetRepresentationMode`** 属性表示一项有几种格式时，选图界面给哪一种。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定 |
| `'current'` | 尽量给原来的格式，不转换。新款手机拍的照片是 HEIC 格式，取到的就是 HEIC |
| `'compatible'` | 尽量给最通用的格式，需要时转换（HEIC 转成 JPEG）。转换要时间 |

- 可读，可写。
- 默认值是 `'automatic'`。
- 取成 `UIImage` 时三种取值看起来没有区别（**未在模拟器验证**）：`UIImage` 两种格式都认。
- 只有 App 自己能改它，没有变化通知。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。写数字也一样。

## 示例

```js
const config = new PHPickerConfiguration();
config.preferredAssetRepresentationMode = 'compatible';
console.log(config.preferredAssetRepresentationMode);
```

**结果**：输出 `compatible`。

## 对应的 iOS API

`PHPickerConfiguration.preferredAssetRepresentationMode`。`PHPickerConfigurationAssetRepresentationModeCompatible` 写成 `'compatible'`，其余同理。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
