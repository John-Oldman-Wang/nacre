# 实现原理和细节

面向**改运行时的人**。这里写「怎么实现的」「为什么这么实现」「实测出来什么」。

和另外两处的分工：

| 目录 | 写什么 | 面向谁 |
| --- | --- | --- |
| [`docs/api/`](../api/README.md) | 怎么用、参数、默认值、效果、坑、ObjC ↔ JS 对照表 | 用 Nacre 写 App 的人 |
| **`docs/internals/`** | **桥怎么搭的、为什么这么选、实测数据、被否掉的方案** | **改运行时的人** |
| [`docs/project.md`](../project.md) | 项目定义、已定的决策、目录约定、SOP、进度、待定的设计问题 | 这个项目本身 |

判据：

- 「`shadowOpacity` 默认 0，不设就看不见」→ **api**，不知道这条就不会用
- 「`CGColorRef` 转 `UIColor` 为什么会丢动态色」→ **internals**，不知道也会用
- 「颜色的上层写法定成字符串」→ **project.md**，这是一个决策

## 参考

| | |
| --- | --- |
| [包装机制](wrapper.md) | 句柄表、身份一致、所有权镜像、GC |
| [结构体](structs.md) | 为什么只读、为什么不用 Object.freeze |
| [桥的通道](bridge.md) | 七条通道、JSON 编码、错误出口 |
| [枚举和位掩码](enums.md) | 名字 ↔ 数值的映射为什么只能在原生层 |
| [颜色](ui-color.md) | 相等性实测、动态色、上层写法的推导 |
| [图层](ca-layer.md) | CGColor 的代价、和 UIView 重叠的属性 |
| [Auto Layout](auto-layout.md) | 约束的所有权、NSException 的接法 |
| [图片](ui-image.md) | Asset Catalog 实测、解码线程 |
| [定时器](timers.md) | 调度、时间预算、未处理拒绝的结算 |
| [网络](network.md) | fetch 的线程分工、URL 和 WHATWG 的差异 |
| [运行时](runtime.md) | V8 启动、主线程、严格模式、空闲 GC |

> 还没写的条目会随着对应能力的整理陆续补上——**新增或改动一块能力时，`api/` 和 `internals/` 两份一起写**，规则见[项目说明](../project.md#文档怎么分)。

---

← 返回[项目说明](../project.md)
