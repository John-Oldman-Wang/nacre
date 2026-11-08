# 包装机制

原生对象和 JS 对象怎么对应、谁持有谁、GC 怎么收场。

## 包装机制的实现说明

从 `ui-window-scene.md` 搬过来。

- **句柄不用 V8 的 internal field**，而是挂在内置脚本闭包里的一个 Symbol 上。用 internal field 就得绕过 JS 构造函数来建对象，`EventTarget` 的监听器表就初始化不了
- **C++ 侧维护两张表**：`原生指针 → 句柄 id` 和 `句柄 id → 弱 Global<Object>`。要把原生对象交给 JS 时先查表，命中就复用——这就是身份一致的来源
- **所有权统一用强引用**：包装建立时 `CFRetain`，被 GC 回收时 `CFRelease`。不用弱引用是因为那要处理原生对象先死的悬空问题
- **属性读写走一张分发表**，值用 JSON 编码，加一个属性只要加一行，不用动 C++。这是手写方案，到 `UIView` 那一层就必须换成 M3

## 所有权镜像：JS 侧有自己的引用图

原生对象的 JS 包装是**弱**的（`Engine.cpp` 里 `SetWeak`）。包装被回收之后再从原生读回来，拿到的是 `wrapper_factory(class_name, handle)` **按原生类名新建**的包装——挂在旧包装上的 JS 状态全丢。`EmitObjectEvent` 走的是同一条路，所以**窗口的事件监听器也会静默失效**。

根因是把原生的**边强度**照抄进了 JS。原生用引用计数，`weak` 回边是为了断环；V8 是追踪式 GC，环不要钱。所以边的强度要按 V8 的需求重新定：

> **原生对象 A 持有 B，A 的包装就也持有 B 的包装。**

| 原生边 | 原生强度 | JS 侧 | 不补的后果 |
| --- | --- | --- | --- |
| `container` → `child` | strong | ✅ 镜像 | 包装身份丢、监听器失效 |
| `scene` → `windows` | strong | ✅ 镜像 | 窗口整棵树丢 |
| `view` → `backgroundColor` / `image` / `font`… | strong | ✅ 镜像 | 同上 |
| `vc` → `view`、`window` → `rootViewController`、`scene` → `session` | strong | ✅ 镜像 | 同上 |
| `child` → `superview`、`view` → `window`、`window` → `windowScene` | **weak** | ❌ 不镜像 | 没有——另一端已被上游的所有权边兜住 |
| `anchor` → `item`（第 3c 步） | **weak** | ✅ 镜像 | **SIGSEGV**，实测 |

实现在 `nacre.js`：一张模块级 `WeakMap`（owner 包装 → 边名 → 包装）。用 `WeakMap` 不用包装上的属性，是因为 JS 侧完全看不见它（`getOwnPropertySymbols` 也列不出来），而且 owner 一死整条记录跟着死。所有权边上的对象属性走 `nativeGetOwned` / `nativeSetOwned`，回边仍走 `nativeGetObject` / `nativeSetObject`——`check-api.sh` 两个都算。

**这张表只给 GC 当根，不参与任何查询**，所有的读都走原生。所以 UIKit 自己改树时（pop 一个控制器之类）镜像会漂，但它**只会多留一份引用，永远不会给错答案**。读 `subviews` / `scenes` 时按原生的真相整层重建，碰到哪层修哪层。

连带的结果：**`UIWindow` 不用再手动保持引用了**。`main.js` 里的 `mainWindow` 变量已删除——屏幕上还有东西，就是这条链接上了的证据。

验证方式（`main.js` 里的三条断言）：运行时没有强制 GC 的手段，所以制造垃圾逼 V8 回收，再拿一个**没有所有者**的包装（`UIColor.systemBrownColor`）当对照组。只有对照组的身份也丢了，才说明 GC 真跑过，这一轮的结论才算数；对照组没丢就报「未验证」，不假装通过。实测三条全过。

还没覆盖的：**UIKit 自己建的边镜像不到**（`pushViewController:` 把 `vc.view` 塞进自己的层级，JS 从没调过 `addSubview`）。要全局正确只有两条路，都等 bindgen：按 `CFGetRetainCount` 在空闲期扫一遍（引用计数有自动释放池干扰，不稳），或者接 V8 的 embedder 根、像 Blink 管 DOM 那样在 GC 时问宿主（引擎级改造）。Apple 自己的 JSC 桥走的是和我们一样的路——`JSVirtualMachine` 的 `addManagedReference:withOwner:` 就是让你**把原生侧的所有权边显式报告给 GC**。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
