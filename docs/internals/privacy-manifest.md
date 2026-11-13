# 隐私清单

`Nacre.framework` 自带一份 `PrivacyInfo.xcprivacy`，声明它用到的 required reason API。这一页记为什么必须由我们带、三条是怎么确定的、理由码为什么选那几个。

## 为什么不能让宿主 App 去声明

Apple 的原话：

> Your third-party SDK can't rely on the privacy manifest files for apps that link the third-party SDK, or those of other third-party SDKs the app links, to report your third-party SDK's use of required reasons API.

还有一条更具体的：

> For each executable or dynamic library in an app that uses a required reason API, the bundle that includes the executable or dynamic library needs to include a privacy manifest file that reports the API.

`Nacre.framework` 是一个 dynamic library，所以清单必须在**它自己的包根**。放进宿主的 App 里不算数。

2024 年 5 月 1 日起，用了 required reason API 却没在清单里说明的 App，App Store Connect 不收。

## 三条是 `nm` 扫出来的，不是读源码读出来的

这是这件事最反直觉的地方：**我们一行相关代码都没写，却碰了两类。**

| 类别 | 符号 | 谁引进来的 |
| --- | --- | --- |
| UserDefaults | `_OBJC_CLASS_$_NSUserDefaults`、`_NSUserDefaultsDidChangeNotification` | 我们：`Bridge/NacreStorage.mm`，和 `NacreRuntime.mm` 里 `change` 事件的 trampoline |
| FileTimestamp | `_NSFileModificationDate` | 我们：`Bridge/NacreFileSystem.mm` |
| FileTimestamp | `_fstat` | **V8 的 `libv8_libbase.a`** |
| SystemBootTime | `_mach_absolute_time` | **V8 的 `libv8_libbase.a`** |

后两个是逐个 `.a` 扫出来的：

```
for L in ios/Vendor/v8/lib/iphoneos/*.a; do nm -u "$L" | grep -c _mach_absolute_time; done
→ 只有 libv8_libbase.a 命中
```

**所以判据只能是「链接出来的事实」。** 换一版 V8、加一个系统框架，这张表就可能变，而源码一个字都没动。

两类**没有**碰到，也是实测的：`DiskSpace`（没有 `statfs` / `volumeAvailable*` / `systemFreeSize`）、`ActiveKeyboards`（没有 `activeInputModes`）。

### `std::steady_clock` 不是 `mach_absolute_time`

`performance.now()` 的时钟是 `Engine.cpp` 里的 `std::chrono::steady_clock`。一开始以为它就是 SystemBootTime 那一类的来源，**实测不是**：二进制里既没有 `_clock_gettime` 也没有来自我们这边的 `_mach_absolute_time`，libc++ 把它编成了别的东西。而且 `clock_gettime` 根本不在 Apple 的清单里，只有 `systemUptime` 和 `mach_absolute_time()` 在。

真正带进这个符号的是 V8 自己的 `TimeTicks::Now()`。

### 宿主 App 的主可执行文件一个都没碰

实测验收 App 的 `Nacre.app/Nacre`：五类符号全空。所以用 Nacre 写 App 的人**不需要**为 required reason API 补清单——那部分我们替他担了。

他仍然可能需要一份自己的清单来声明 `NSPrivacyTracking` 和 `NSPrivacyCollectedDataTypes`，但那是他的 App 收集什么数据的问题，我们替他填反而是错的。

## 理由码：按我们自己的用法选

Apple 每个类别给了几个码，不是随便挑一个填。

| 类别 | 选的 | 为什么是它 |
| --- | --- | --- |
| UserDefaults | `C56D.1` | 「第三方 SDK 为 app 提供包装函数，只在 app 调用包装函数时才访问」。`application.storage` 正是。确认过运行时自己一个字节都不往 UserDefaults 存 |
| FileTimestamp | `C617.1` | 「访问 app container / app group / CloudKit container 内文件的时间戳、大小或其他元数据」。`fileSystem` 只给 documents / caches / applicationSupport / temporary 四个根，全在容器里 |
| SystemBootTime | `35F9.1` | 「测量 app 内事件之间经过的时间，或做计算以实现定时器」。V8 的内部计时、我们的定时器和 `performance.now()` 都是这个 |

**FileTimestamp 为什么不用 `0A2A.1`。** 那条是 SDK 包装函数专用的，和 UserDefaults 的 `C56D.1` 对应，看着更贴切。但它要求「你**只**在 app 调用你的包装函数时才访问这些 API」——V8 的 `fstat` 是 SDK 自己在用，不满足。`C617.1` 两边都盖得住，所以用它。

UserDefaults 那一侧能用 `C56D.1`，是因为确实只有包装，没有 V8 掺进来。

**两条 SDK 专用码都带一句限制**：「如果你的第三方 SDK 主要就是为了包装 required reason API 而创建的，不能声明这个理由」。Nacre 是一个 JS 运行时，不是为了包 UserDefaults 而生，所以站得住。

`FileTimestamp` 不需要 `3B52.1`（用户通过 document picker 授权的目录）——我们没有 document picker。`SystemBootTime` 不需要 `8FFB.1`（算出的绝对时间戳要发到设备外）——我们不发。

## `check-api.sh` 怎么核对

这张表会漂：换 V8、加系统框架、Apple 更新清单，三件事都会让它失效，而没有一件在源码里看得见。所以加了机械检查（`check-api.sh` 第 8 节）。

**两路扫，缺一不可：**

| 扫什么 | 用什么 | 为什么要两路 |
| --- | --- | --- |
| C 函数、ObjC 的类和常量 | `nm -u` | `_fstat`、`_OBJC_CLASS_$_NSUserDefaults`、`_NSFileModificationDate` 都在这里 |
| ObjC 的属性和方法 | `otool -v -s __TEXT __objc_methname` | **`nm` 看不见它们**——调用只产生 `objc_msgSend` 加一个 selector 字符串 |

第二路不是多余的：`systemUptime` 和 `activeInputModes` 都是属性，只走 `nm` 的话这两个永远扫不出来，清单会漏。

实测确认过这一路有效：`__objc_methname` 里抽得到 `addSubview:`、`standardUserDefaults`，而 `systemUptime`、`activeInputModes` 确实不在里面。

**三个失效出口**，照这个项目一贯的规矩，每个提取点都要能说出「是我自己坏了」：

- `nm` 一个未定义符号都没抽到 → 报「check-api.sh 要更新」，不往下比
- `__objc_methname` 一个 selector 都没抽到 → 同上
- 找不到任何构建产物 → 跳过这一节，报告行写「隐私清单没查（没有构建产物）」

**`getattrlist` 一组不自动归类。** Apple 把 `getattrlist` / `getattrlistbulk` / `fgetattrlist` / `getattrlistat` **同时**算进 FileTimestamp 和 DiskSpace，看符号判不出是哪一种用途。所以撞上了就单独报出来让人看，不猜。现在没有。

### 四种弄坏法都验过

| 弄坏 | 报的 |
| --- | --- |
| 清单里删掉 UserDefaults 那条 | 二进制里有 `_OBJC_CLASS_$_NSUserDefaults`，属于 …UserDefaults，但清单没声明它 |
| 清单里多加一条 DiskSpace | 清单声明了 …DiskSpace，二进制里却找不到它的符号 |
| 第 8 节的符号表里把 `_mach_absolute_time` 改名 | 清单声明了 …SystemBootTime，二进制里却找不到它的符号——要么用法没了，要么符号表该补 |
| 让它扫一个空二进制 | 脚本：`nm` 一个未定义符号都没抽到，check-api.sh 要更新 |

第三条是关键：**符号表自己过时**和**用法真的没了**在现象上是一样的，所以报错文案把两种可能都写出来，让人去判断。

## 和 bindgen 的关系

bindgen 做完之后这件事会变大：覆盖的框架越多，碰到的 required reason API 越多，而且**每多链一个系统框架，这份清单就可能要改**。

所以 bindgen 的产物按 framework 切片（核心只带几个，其余放边缘包）不只是为了 Info.plist 的 usage description，隐私清单同样跟着切——一个边缘包带自己那一份。`check-api.sh` 的第 8 节到那时要按包分别核对。

## 出处

- [Describing use of required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- [NSPrivacyAccessedAPIType](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype)——五个类别各覆盖哪些 API、每个类别有哪些理由码，全在这一页
- [Adding a privacy manifest to your app or third-party SDK](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk)——framework 的清单该放哪

> `developer.apple.com` 的正文是 JS 渲染的，`curl` 和 WebFetch 只拿得到标题。查它有两条路：`https://developer.apple.com/tutorials/data/<去掉 developer.apple.com 的路径>.json`，或者开浏览器读渲染后的页面。上面那页的理由码清单是用浏览器读出来的——它在 JSON 里也抓不全。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
