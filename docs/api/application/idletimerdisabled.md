---
type: reference
native: UIApplication.idleTimerDisabled
---

# `Application`：`idleTimerDisabled` 属性

**`idleTimerDisabled`** 属性决定设备在一段时间没有触摸后会不会自动锁屏。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | App 在前台期间设备不自动锁屏。**未在模拟器验证** |
| `false` | 按系统设置自动锁屏 |

- 可读，可写。
- 默认值是 `false`。
- 写入立刻生效，写完马上读得到新值。写入非布尔值时按 `Boolean(v)` 转换。
- 对整个 App 生效，不会自动恢复。离开需要常亮的页面时设回 `false`，否则设备在 App 位于前台期间一直不锁屏，耗电增加。
- 变化时不派发事件：只有 App 自己的代码能改它。

## 示例

```js
application.idleTimerDisabled = true;
console.log(application.idleTimerDisabled);
```

**结果**：控制台输出 `true`。播放视频、显示二维码时用它让屏幕保持常亮。

## 对应的 iOS API

`UIApplication.idleTimerDisabled`。

## 参见

- [处理 App 的生命周期](../../guides/app-lifecycle.md#让屏幕保持常亮)
