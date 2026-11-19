---
type: reference
native: UIDevice.userInterfaceIdiom
---

# `UIDevice`：`userInterfaceIdiom` 属性

**`userInterfaceIdiom`** 属性是界面的类型：这台设备上的 App 按哪一类设备的界面显示。

## 值

字符串，下面几个之一：

| 取值 | 含义 |
| --- | --- |
| `'phone'` | iPhone 的界面。运行时现在只支持 iPhone，所以读到的总是这个值 |
| `'pad'` | iPad 的界面 |
| `'tv'` | Apple TV 的界面 |
| `'carPlay'` | 车载界面 |
| `'mac'` | Mac 的界面 |
| `'vision'` | Apple Vision 的界面 |
| `'unspecified'` | 未指定 |

- 只读。给它赋值抛 `TypeError`，原值不变。
- App 运行期间不变，所以没有变化通知。
- `'phone'` 以外的取值**未在模拟器验证**。

## 示例

```js
if (UIDevice.currentDevice.userInterfaceIdiom === 'phone') {
  console.log('iPhone 界面');
}
```

**结果**：在 iPhone 上输出 `iPhone 界面`。

## 对应的 iOS API

`UIDevice.userInterfaceIdiom`。`UIUserInterfaceIdiomPhone` 写成 `'phone'`，其余同理。

## 参见

- [`model`](model.md)
- [`UITraitCollection`](../ui-trait-collection.md)：界面的其他特征
