---
type: reference
native: AVCaptureMetadataOutputDetectEvent
---

# `AVCaptureMetadataOutputDetectEvent`

**`AVCaptureMetadataOutputDetectEvent`** 表示取景画面的一帧里认到了要找的东西，比如二维码。

[`AVCaptureMetadataOutput`](av-capture-metadata-output.md) 的 [`detect`](av-capture-metadata-output/detect-event.md) 事件是它，[`objects`](av-capture-metadata-output-detect-event/objects.md) 是这一帧里认到的全部。

它属于 `@nacrejs/av-capture` 这个包，装法见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：[`Event`](event.md) → `AVCaptureMetadataOutputDetectEvent`

## 构造函数

[`AVCaptureMetadataOutputDetectEvent()`](av-capture-metadata-output-detect-event/constructor.md)

创建一个 `AVCaptureMetadataOutputDetectEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`objects`](av-capture-metadata-output-detect-event/objects.md) <small>只读</small> | 这一帧里认到的全部 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) | [`detect`](av-capture-metadata-output/detect-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  console.log(e instanceof AVCaptureMetadataOutputDetectEvent, e.objects.length);
}, { once: true });
```

**效果**：第一次认到东西时，输出 `true` 和这一帧认到的个数。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `captureOutput:didOutputMetadataObjects:fromConnection:` | `detect` 事件 |
| 参数 `metadataObjects` | `event.objects` |

## 参见

- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)：派发这个事件的对象
- [扫码](../guides/scanning.md)
