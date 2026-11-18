# 图片

取图、解码、Asset Catalog 的实测结论。

## 第 3b 步：没有新增通道，但纠正了三个事实

做图片**一条新通道都没加**，全部复用现成的：取图是 `call_class_object_method`，九宫格是 `call_object_method`，后台解码是 `call_async`。

`call_async` 原来只兑现布尔（`scene.openURL`），这次加了个 `settleCall:withObject:`。**通道本身没变**——它约定的只是「异步地兑现 call_id」，兑现成什么一直是宿主的自由，Engine 侧 `SettleObject` 早就有了。

实测纠正的三条：

1. **`imageNamed:` 认子目录路径**（`'JS/assets/logo'` 能找到），而且**普通文件也自动选 @2x/@3x**。原来以为这两条都要 Asset Catalog 才有。意味着「丢文件进目录」这条零配置的路比想象中好用，Asset Catalog 换来的只剩深浅色自动切和 App Thinning
2. **Asset Catalog 不收 webp**。`actool` 只认 `.png` / `.jpg` / `.heic` / `.svg` / `.pdf`，喂 webp 报「does not have a valid extension」，而且**整个 catalog 一个产物都不出**。而运行时能解 webp（58 种类型之一）——所以 webp 只能当普通文件。反过来 SVG 是 Asset Catalog 吃得下、运行时解不了（编译期就栅格化了）
3. **SF Symbol 的 `renderingMode` 是 `'automatic'` 不是 `'alwaysTemplate'`**。「按 tintColor 上色」是绘制上下文决定的，不写在图片上
4. **`resizableImageWithCapInsets:` 单参重载默认是 `tile` 不是 `stretch`**。要拉伸得用带 `resizingMode` 的那个重载显式指定

还抓出一条旧账：**不能用窗口通知来验证「定时器和原生事件同队列 FIFO」**。观察者是 `addObserverForName:object:queue:`（mainQueue）注册的，先排一次观察者块，块跑起来才 `postToJS` 排第二次；而 `setTimeout(fn, 0)` 只排一跳。两跳里第一跳什么时候入队由 UIKit 决定，**相对顺序不确定**——两种顺序都实测到过。原来 `timers.md` 里举的例子和 `main.js` 里的断言都把两跳当成了一跳，已改成只断言两边都到了。

FIFO 那条本身没问题，由「同时到期按注册顺序」那条断言保证——那个队列是我们自己的。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
