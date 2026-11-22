---
type: reference
web: BarcodeDetector()
---

# `BarcodeDetector()` 构造函数

**`BarcodeDetector()`** 构造函数创建一个在图片里找条码的检测器。可以指定只找哪几种格式。

## 语法

```
new BarcodeDetector()
new BarcodeDetector({ formats })
```

### 参数

**`options.formats`**

可选。要找的格式名的数组：

| 取值 | 格式 |
| --- | --- |
| `'qr_code'` | 二维码（QR 码） |
| `'aztec'` | Aztec 码 |
| `'data_matrix'` | Data Matrix 码 |
| `'pdf417'` | PDF417 码 |
| `'code_128'` | Code 128 条码 |
| `'code_39'` | Code 39 条码 |
| `'code_93'` | Code 93 条码 |
| `'codabar'` | Codabar 条码 |
| `'itf'` | ITF 条码（交叉 25 码和 ITF-14） |
| `'ean_13'` | EAN-13 商品条码 |
| `'ean_8'` | EAN-8 商品条码 |
| `'upc_a'` | UPC-A 商品条码 |
| `'upc_e'` | UPC-E 商品条码 |

- 不传 `options`、传 `null`、传 `{}`、`formats` 是 `undefined`：找这台设备认得的全部格式（实测这几种写法都不抛）。
- 数组里每一项按字符串转。
- 写了这台设备不认得的格式（见 [`getSupportedFormats()`](getsupportedformats.md)），构造不抛，但这种格式永远认不出来。`'upc_a'` 就是这样：能写，但实测 iPhone 14 上不认得它。

只找要用的格式。扫二维码就写 `{ formats: ['qr_code'] }`，别的格式的码即使在图里也不会出现在结果里（实测：只找 `'ean_13'` 时，二维码不算）。

### 返回值

新建的 `BarcodeDetector`。

### 异常

**`TypeError`**

- `formats` 里有不认识的名字：`BarcodeDetector formats has no value "qr"; expected one of: aztec, code_128, …`，列出全部 13 个名字。`'unknown'` 也算不认识（实测）。
- `formats` 是空数组：`BarcodeDetector formats must not be empty`（实测）。
- `formats` 不是数组（比如字符串）：`BarcodeDetector formats must be an array of format names, got …`（实测）。
- `options` 不是对象：`BarcodeDetector options must be an object, got …`。
- 继承它：`class Mine extends BarcodeDetector {}` 在 `new Mine()` 时抛：`Illegal constructor: Mine extends BarcodeDetector, but subclassing native classes is not supported yet`（实测抛 `TypeError`）。

## 示例

```js
const anyCode = new BarcodeDetector();
const qrOnly = new BarcodeDetector({ formats: ['qr_code'] });
console.log(anyCode instanceof BarcodeDetector, qrOnly instanceof BarcodeDetector);
```

**结果**：控制台输出 `true true`。`anyCode` 找这台设备认得的全部格式，`qrOnly` 只找二维码。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`getSupportedFormats()`](getsupportedformats.md)：这台设备认得哪几种
- [`detect()`](detect.md)：找图片里的条码
