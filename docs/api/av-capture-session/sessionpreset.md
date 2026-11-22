---
type: reference
native: AVCaptureSession.sessionPreset
---

# `AVCaptureSession`：`sessionPreset` 属性

**`sessionPreset`** 属性是会话的画质档位。它决定摄像头送出的画面有多大。

## 值

字符串，下面十二个之一：

| 取值 | 含义 |
| --- | --- |
| `'high'` | 高画质。默认值 |
| `'medium'` | 中等画质 |
| `'low'` | 低画质 |
| `'photo'` | 适合拍照的高分辨率画面 |
| `'352x288'` | 画面宽 352、高 288 像素 |
| `'640x480'` | 画面宽 640、高 480 像素 |
| `'1280x720'` | 画面宽 1280、高 720 像素 |
| `'1920x1080'` | 画面宽 1920、高 1080 像素 |
| `'3840x2160'` | 画面宽 3840、高 2160 像素 |
| `'iFrame960x540'` | iFrame 格式，宽 960、高 540 像素。iFrame 是一种便于剪辑的视频格式 |
| `'iFrame1280x720'` | iFrame 格式，宽 1280、高 720 像素 |
| `'inputPriority'` | 会话不定画质，由摄像头当前的格式决定 |

- 可读，可写。
- 默认值是 `'high'`（实测）。
- 一个档位能不能用，取决于会话里接的摄像头和输出。写之前用 [`canSetSessionPreset()`](cansetsessionpreset.md) 问。
- 只有 App 自己写时它才变，所以没有变化事件。
- 各档位在取景图层里的样子**未在真机验证**。

### 写错时

- 写入表里没有的名字：不抛异常，控制台输出一条警告，列出全部可用的值，`sessionPreset` 保持原来的值（实测）。
- 写入表里有、但现在不能用的档位（`canSetSessionPreset()` 是 `false`）：抛 `TypeError`，信息是 `sessionPreset "…" is not supported by this session's current inputs and outputs`，值不变。

## 示例

```js
const session = new AVCaptureSession();
if (session.canSetSessionPreset('medium')) {
  session.sessionPreset = 'medium';
}
console.log(session.sessionPreset);
```

**结果**：输出 `medium`（实测）。

## 对应的 iOS API

`AVCaptureSession.sessionPreset`。`AVCaptureSessionPresetHigh` 写成 `'high'`，`AVCaptureSessionPreset1920x1080` 写成 `'1920x1080'`，`AVCaptureSessionPresetiFrame960x540` 写成 `'iFrame960x540'`，其余同理。

## 参见

- [`canSetSessionPreset()`](cansetsessionpreset.md)：问一个档位能不能用
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
