# API 还不能做的

这一页收的是原来写在每个 API 类页末尾「还不能做的」那一节：这个类在 iOS 里有、而 Nacre 还没接的能力。2026-11-19 起 API 文档只写有什么，这些挪到这里，作为接类时的参考。整体的待办见 [project.md](../project.md#7-还要做的)。

## `ATTrackingManager`

原来在 `docs/api/app-tracking-transparency.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 申请时让提示框带一个「更多信息」按钮（面向欧盟的用户） | `requestTrackingAuthorizationPreferringExpandedInterface:additionalInformationAction:completionHandler:`（iOS 27.2），未实现 |
| 授权状态变化时收到通知 | 系统没有提供这个通知。在 App 回到活动状态时重新读 |
| 读「限制广告跟踪」开关 | `advertisingTrackingEnabled`，iOS 14 起废弃。不提供，用 `trackingAuthorizationStatus` |
| 广告归因 | SKAdNetwork、AdAttributionKit，未实现 |
| 在 App 的隐私清单里声明「这个 App 跟踪用户」 | `PrivacyInfo.xcprivacy` 的 `NSPrivacyTracking`。由 App 自己写，见[建自己的 App](../guides/your-own-app.md) |

## `Application`

原来在 `docs/api/application.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 进后台后申请一段时间把工作做完 | `beginBackgroundTaskWithName:expirationHandler:` |
| 知道进后台后还能执行多久 | `backgroundTimeRemaining` |
| 打开 URL 时带选项，比如只允许通用链接 | `openURL:options:` 的 `options` |
| 打开之前先问系统能不能打开某个 URL | `canOpenURL:`。不提供：直接调 `openURL()`，按兑现的值判断 |
| 知道用户点了哪一条推送通知 | `UNUserNotificationCenterDelegate` |
| 接着别的设备上做到一半的事继续做（接力），或者从系统搜索的结果打开 | `scene:continueUserActivity:` 里通用链接以外的活动类型。这些活动现在不派发任何事件 |
| 读链接附带的其他信息 | `UISceneOpenURLOptions` 的 `annotation`、`openInPlace` |
| 把字体大小档位读成 `'large'` 这类统一的名字 | `UIContentSizeCategory` 的映射。现在是 iOS 的原始字符串 |
| 拒绝已经上报之后才补挂处理函数时得到更正通知 | Web 的 `rejectionhandled` |

## `ASIdentifierManager`

原来在 `docs/api/as-identifier-manager.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读「限制广告跟踪」开关 | `advertisingTrackingEnabled`，iOS 14 起废弃。不提供，用 [`ATTrackingManager.trackingAuthorizationStatus`](../api/app-tracking-transparency/trackingauthorizationstatus.md) |

## `NSLayoutConstraint`

原来在 `docs/api/auto-layout.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 视图的大小被系统改变时（旋转、字体大小变化、键盘弹出）得到通知 | 覆写 `layoutSubviews` | 未实现 |
| 在系统布局的过程中更新约束 | 覆写 `updateConstraints` | 未实现。可以用 [`setNeedsUpdateConstraints()`](../api/ui-view/setneedsupdateconstraints.md) 标记，但不能写更新的那一步 |
| 自己定义一个视图的固有尺寸 | 覆写 `intrinsicContentSize` | 未实现 |
| 从约束对象读出两端的视图 | `firstItem`、`secondItem` | 不提供。创建约束时自己记下来 |
| 用一个字符串描述一组约束 | `constraintsWithVisualFormat:options:metrics:views:` | 未实现 |
| 不通过锚点、用「视图 + 属性名」创建约束 | `constraintWithItem:attribute:relatedBy:toItem:attribute:multiplier:constant:` | 未实现。锚点能表达同样的约束 |
| 键盘靠近或离开某条边时自动切换约束 | `UITrackingLayoutGuide` 的 `setConstraints:activeWhenNearEdge:` | 未实现 |
| 让对齐用的矩形和 `frame` 不同（比如不算阴影） | 覆写 `alignmentRectInsets` | 未实现。可以读 [`alignmentRectInsets`](../api/ui-view/alignmentrectinsets.md)，不能改 |
| 指定用哪个子视图的基线作为自己的基线 | 覆写 `viewForFirstBaselineLayout`、`viewForLastBaselineLayout` | 未实现。可以读 [`viewForFirstBaselineLayout`](../api/ui-view/viewforfirstbaselinelayout.md)，不能改 |

## `Blob`

原来在 `docs/api/blob.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用几个 `Blob` 拼成一个新的 `Blob` | 未实现 |
| 取 `Blob` 的一段（`slice()`） | 未实现 |

## `CAAnimation`

原来在 `docs/api/ca-animation.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用一个代码块描述视图动画 | `UIView.animateWithDuration:animations:` |
| 给旋转和缩放做动画 | `transform` 的动画、`valueFunction` |
| 给渐变的颜色和位置做动画 | `colors`、`locations` 的动画 |
| 读动画进行中屏幕上正显示的值 | `presentationLayer` |
| 用 `beginTime` 让单独一个动画延迟开始。现在用定时器代替 | `CACurrentMediaTime()`、`convertTime:fromLayer:` |
| 整个事务里的动画都结束时得到通知。现在在动画对象上监听 `stop` | `CATransaction.completionBlock` |
| 用「感觉上的时长」和「回弹程度」创建弹簧动画。这两个值现在可以读，不能直接指定 | `initWithPerceptualDuration:bounce:` |
| 页面切换那样的整体转场 | `CATransition` |
| 让动画的值叠加在属性的值之上 | `additive`、`cumulative` |
| 每帧回调一次的 `requestAnimationFrame()`。现在用 `CADisplayLink` | — |

## `CADisplayLink`

原来在 `docs/api/ca-display-link.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 每帧回调一次的 `requestAnimationFrame()`。现在用 `CADisplayLink` | — |

## `CALayer`

原来在 `docs/api/ca-layer.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 视图大小变化时自动调整子图层 | 覆写 `layoutSubviews` | 未实现。原生里靠继承来做，而[原生类不能继承](../api/native-classes.md) |
| 得知视图的大小变了 | 没有现成的通知，原生 App 同样靠覆写 `layoutSubviews` | 未实现 |
| 让一个视图直接用渐变图层或形状图层作为自己的图层 | 覆写 `+layerClass` | 未实现，原因同上 |
| 用一个形状裁剪图层的内容 | `mask` | 未实现 |
| 指定阴影的轮廓 | `shadowPath` | 未实现 |
| 旋转、缩放图层，改变旋转的中心 | `transform`、`anchorPoint` | 未实现。视图可以用 `view.transform`，见 [`UIView`](../api/ui-view.md) |
| 指定图片在图层里怎么摆放：保持比例、居中、只显示一部分 | `contentsGravity`、`contentsRect` | 未实现。需要这些时用 [`UIImageView`](../api/ui-image-view.md) 的 `contentMode` |
| 读动画进行中图层正显示的值 | `presentationLayer` | 未实现 |
| 文字图层、复制图层等其他图层 | `CATextLayer`、`CAReplicatorLayer` 等 | 未实现 |

## `CASpringAnimation`

原来在 `docs/api/ca-spring-animation.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用「感觉上的时长」和「回弹程度」创建弹簧动画。这两个值现在可以读，不能直接指定 | `initWithPerceptualDuration:bounce:` |

## `CATransaction`

原来在 `docs/api/ca-transaction.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 整个事务里的动画都结束时得到通知。现在在动画对象上监听 `stop` | `CATransaction.completionBlock` |

## `CGAffineTransform`

原来在 `docs/api/cg-affine-transform.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 三维变换（透视、绕 x 或 y 轴翻转） | `CATransform3D`、`CALayer.transform` |

## `CGRect`

原来在 `docs/api/cg-rect.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 矩形的几何运算（求交集、判断包含、向内缩进） | `CGRectIntersection`、`CGRectContainsPoint`、`CGRectInset` 等 C 函数。可以在 JS 里按字段自己计算 |

## `CLLocationManager`

原来在 `docs/api/cl-location-manager.md`。

下面这些都没有。表里的方法，调用会抛「不是函数」的 `TypeError`；属性，读到的是 `undefined`，写入不报错也不起作用；类，读它的名字会抛 `ReferenceError`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 申请「始终」定位 | `requestAlwaysAuthorization` |
| App 退到后台之后继续定位 | `allowsBackgroundLocationUpdates`、`pausesLocationUpdatesAutomatically`、`showsBackgroundLocationIndicator`、`activityType`，以及后台模式的工程配置 |
| 位置有大的变化时才唤醒 App | `startMonitoringSignificantLocationChanges` |
| 进出某个区域时得到通知（地理围栏） | `startMonitoringForRegion:`、`CLCircularRegion`、`CLMonitor` |
| 指南针：设备朝向哪个方向 | `startUpdatingHeading`、`heading`、`CLHeading` |
| 用户只给了大概位置时，临时申请一次精确位置 | `requestTemporaryFullAccuracyAuthorizationWithPurposeKey:` |
| 查整个系统的定位服务开没开 | `+locationServicesEnabled`。关着的时候 `authorizationStatus` 是 `'denied'` |
| 经纬度和地址互相转换 | `CLGeocoder`、`CLPlacemark` |

`CLLocation` 上还不能做的见 [`CLLocation`](api-gaps.md#cllocation)。

## `CLLocation`

原来在 `docs/api/cl-location.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 算两个位置之间的距离 | `distanceFromLocation:` |
| 位置在建筑的第几层 | `CLLocation.floor` |
| 自己造一个 `CLLocation` | `initWithLatitude:longitude:` 一组 |

这几个成员在 `CLLocation` 上不存在：`'floor' in location` 和 `'distanceFromLocation' in location` 都是 `false`。

## `CNContactFormatter`

原来在 `docs/api/cn-contact-formatter.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 姓名的其他拼法：指定姓在前还是名在前、带格式的文字 | `CNContactFormatter` 的实例、`attributedStringFromContact:`。未实现 |

## `CNContactProperty`

原来在 `docs/api/cn-contact-property.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 选中地址、生日这类字段时拿到值 | `value` 是 `CNPostalAddress`、`NSDateComponents`。未实现，`value` 是 `null`；`key` 仍然说明选的是哪种字段 |

## `CNContact`

原来在 `docs/api/cn-contact.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读联系人的其他字段：中间名、昵称、职位、地址、生日、网址、头像、备注 | `CNContact` 的其余属性，`CNPostalAddress` 等。可以用 `displayedPropertyKeys` 让详情页显示它们，但读不到值 |
| 新建、修改联系人 | `CNMutableContact`、`CNSaveRequest`，要通讯录权限，不在这个包里 |

## `CNLabeledValue`

原来在 `docs/api/cn-labeled-value.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 判断一个标签是不是「手机」 | `CNLabelPhoneNumberMobile` 等常量。未实现，现在只能和标签的原文比较 |

## `CNContactPickerViewController`

原来在 `docs/api/contacts.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读整个通讯录、按名字搜索联系人 | `CNContactStore`。不在这个包里：它需要通讯录权限，项目要写 `NSContactsUsageDescription` |
| 新建、修改、删除联系人 | `CNMutableContact`、`CNSaveRequest`。同上 |
| 通讯录变了的通知 | `CNContactStoreDidChangeNotification`。同上 |
| 一次选几个电话或几个邮箱 | `contactPicker:didSelectContactProperties:`，未实现。监听 `didselectcontactproperties` 不报错，但收不到 |
| 让一部分联系人点不了（比如没有电话的） | `predicateForEnablingContact`，未实现，要先有 `NSPredicate` |
| 只有一个电话的联系人直接选中，有几个的才进详情 | `predicateForSelectionOfContact`、`predicateForSelectionOfProperty`，未实现，同上 |
| 显示一个联系人的详情页、新建联系人的界面 | `CNContactViewController`，未实现 |

联系人、标签、姓名拼法上还不能做的，见各自的类页。

## `contextBridge`

原来在 `docs/api/context-bridge.md`。

| 想做的事 | 对应的能力 |
| --- | --- |
| 让预加载脚本和网页的脚本互相隔离 | Electron 的 `contextIsolation`；`WKContentWorld` |

## `Cookies`

原来在 `docs/api/cookies.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 知道是哪一条 cookie 变了、是加了还是删了 | Electron 的 `changed` 事件的参数。系统的通知不带这些 |
| 让网页的 cookie 和 `fetch` 的 cookie 互通 | `NSHTTPCookieStorage` |

## `Crypto`

原来在 `docs/api/crypto.md`。

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 计算 SHA-256 等摘要 | `crypto.subtle.digest()` | 未实现 |
| 加密、解密、签名、验签 | `crypto.subtle.encrypt()`、`sign()` 等 | 未实现 |
| 生成和导入密钥 | `crypto.subtle.generateKey()`、`importKey()` | 未实现 |

## 枚举

原来在 `docs/api/enums.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在运行时列出某个枚举的全部取值 | 没有对应的原生能力。取值表写在各类的文档和类型定义里 |
| 用整数表示枚举值 | `NS_ENUM` 的整数值。JS 侧只接受字符串 |
| 设置视图随父视图改变大小的方式 | `UIViewAutoresizing`（`autoresizingMask`） |

## `fetch()`

原来在 `docs/api/fetch.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用表单的方式上传文件（请求体用 `FormData`） | 未实现。二进制数据可以直接当 `body` 发送，见[上传二进制数据](../guides/fetch.md#上传二进制数据) |
| 显示上传的进度 | 未实现 |
| 请求体边生成边发送（`body` 用流） | 未实现。请求体要一次给全 |
| 自己创建流，或者把流接到别处（`new ReadableStream()`、`pipeTo()`、`pipeThrough()`、`tee()`、`TransformStream`、`WritableStream`） | 未实现。流只能从 `res.body` 得到，只能读 |
| 把数据读进自己准备的缓冲区（BYOB 读取器） | 未实现 |
| `EventSource`（自动解析服务器推送的事件、断线重连） | 未实现。可以用 `res.body` 自己按行切，见[读服务器持续推送的文本](../guides/streaming-response.md#读服务器持续推送的文本) |
| 把一个 `Response` 复制一份（`clone()`） | 未实现 |
| 把大文件直接下载到磁盘，不经过 JS | `NSURLSessionDownloadTask`。用 `res.body` 可以边下边读，但每一块都要经过 JS |
| App 在后台或退出后继续上传、下载 | 后台 `NSURLSession` |
| 用几个 `Blob` 拼成一个新的 `Blob` | 未实现 |
| 禁止自动跟随重定向，或得知是否发生过重定向 | 未实现 |
| 控制缓存策略 | 未实现 |
| 读取、清除 `fetch()` 保存的 cookie | `NSHTTPCookieStorage`。单个响应的 `Set-Cookie` 可以用 `res.headers.getSetCookie()` 读到 |
| 设置系统默认的超时时间 | 未实现。用 `AbortSignal.timeout()` |

## `application.fileSystem`

原来在 `docs/api/filesystem.md`。

| 想做的事 | 对应的原生能力 | 现在怎么办 |
| --- | --- | --- |
| 分段读写大文件 | `NSFileHandle`、`NSInputStream` | 整个读进内存 |
| 在文件末尾追加内容 | `NSFileHandle` | 读出来拼好再整个写回 |
| 文件被修改时得到通知 | `DispatchSource` | 没有替代办法 |
| 设置文件在设备锁定时的加密等级 | `NSFileProtectionKey` | 没有替代办法 |
| 把某个文件排除在备份之外 | `NSURLIsExcludedFromBackupKey` | 放进 `caches` |
| 读写 iCloud 里的文件 | `NSFileCoordinator` | 没有替代办法 |
| 符号链接、权限位 | `NSFileManager` 的对应方法 | 没有替代办法 |
| 让用户从「文件」App 里选文件 | `UIDocumentPickerViewController` | 没有替代办法 |

## `Intl.DateTimeFormat`

原来在 `docs/api/intl-date.md`。

| 想做的事 | 标准里的成员 | 状态 |
| --- | --- | --- |
| 把一段时间的结果拆开，知道每一段属于起点还是终点 | `formatRangeToParts()` | 未实现 |
| 写「3 小时前」「昨天」 | `Intl.RelativeTimeFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片，**未在 Nacre 上验证** |

## `Intl.NumberFormat`

原来在 `docs/api/intl.md`。

| 想做的事 | 标准里的成员 | 状态 |
| --- | --- | --- |
| 按地区的规则给字符串排序、比较 | `Intl.Collator`，`String.prototype.localeCompare()` | 未实现，运行时不打算提供。`localeCompare()` 按字符的编码值比较，`'ä'.localeCompare('z')` 是正数，中文不按拼音排。需要时在 JS 里自己处理 |
| 写「3 小时前」「昨天」 | `Intl.RelativeTimeFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-relativetimeformat`），**未在 Nacre 上验证** |
| 把几项连成「A、B 和 C」 | `Intl.ListFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-listformat`），**未在 Nacre 上验证** |
| 选单数、复数的写法 | `Intl.PluralRules` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-pluralrules`），**未在 Nacre 上验证** |
| 带单位的数（公里、字节） | `style: 'unit'` | 未实现 |
| 把格式化的结果拆成整数、小数、货币符号等部分 | `formatToParts()` | 未实现 |
| 写一个范围，「3–5」 | `formatRange()` | 未实现 |
| 按地区转大小写 | `toLocaleUpperCase()`、`toLocaleLowerCase()` | 忽略地区，`'istanbul'.toLocaleUpperCase('tr')` 得到 `ISTANBUL`。这是标准函数给出错的结果，不报错 |

## `ipcRenderer`

原来在 `docs/api/ipc-renderer.md`。

| 想做的事 | 对应的能力 |
| --- | --- |
| 网页同步地向 App 要一个结果 | Electron 的 `ipcRenderer.sendSync` |
| 在 `<iframe>` 里用 | Electron 的 `nodeIntegrationInSubFrames`；`WKUserScript` 的 `forMainFrameOnly` |
| 类型定义 | |

## `application.keychain`

原来在 `docs/api/keychain.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读取前要求用户通过面容或指纹验证 | `SecAccessControlCreateWithFlags`、LocalAuthentication |
| 按网站保存账号密码 | `kSecClassInternetPassword` |
| 保存证书和密钥对 | `kSecClassCertificate`、`kSecClassKey` |
| 和同一开发者的其他 App 共用条目 | `kSecAttrAccessGroup` |
| 通过 iCloud 钥匙串在用户的多台设备之间同步 | `kSecAttrSynchronizable` |
| 读出一个条目的访问级别 | `kSecAttrAccessible` 的读取 |

## `LAContext`

原来在 `docs/api/la-context.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用配对的 Apple Watch 确认身份 | `LAPolicyDeviceOwnerAuthenticationWithCompanion`、`LAPolicyDeviceOwnerAuthenticationWithBiometricsOrCompanion` |
| 让钥匙串里的条目在读取前要求通过认证 | `evaluateAccessControl:operation:localizedReason:reply:`、`SecAccessControlCreateWithFlags`、`kSecUseAuthenticationContext` |
| 给钥匙串操作引出的认证界面设置默认的说明文字 | `localizedReason` 属性 |
| 知道用户录入的面容或指纹有没有变过 | `domainState`、`evaluatedPolicyDomainState` |
| 由 App 提供密码，不让系统显示密码界面 | `setCredential:type:`、`isCredentialSet:` |
| 读出系统允许的最长复用时间 | `LATouchIDAuthenticationMaximumAllowableReuseDuration`（值是 300 秒） |
| 按「权限」组织的新一套认证接口 | `LARight`、`LARightStore`、`LASecret` |

## 原生类

原来在 `docs/api/native-classes.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 继承原生类 | 定义 ObjC 子类 |
| 在视图布局时执行代码、自己绘制视图的内容 | 覆写 `layoutSubviews`、`drawRect:`、`sizeThatFits:` |
| 属性名拼错时在运行时报错 | 没有对应的原生能力。用类型检查发现 |
| 使用没有文档的 iOS 类（`NSString`、`UITableView` 等） | 全局只有文档里列出的类 |

## `application.nativeModules`

原来在 `docs/api/native-modules.md`。

| 想做的事 | 状态 |
| --- | --- |
| 把 JS 的函数传给原生，让原生之后回调 | 不支持。函数不能作参数。用事件代替：原生发事件，JS 监听 |
| 把原生对象（视图、图片）传给模块，或者让模块交回一个原生对象 | 不支持。模块只能收发[能传的那几种值](../api/native-module.md#能传什么值) |
| 模块提供一个可以放进界面的视图 | 不支持 |
| 让模块收到 App 级的系统回调（推送令牌、从别的 App 跳转进来的 URL） | 未实现 |
| 把 App 自己目录里的原生源码直接编进 App，不做成包 | 未实现。现在模块要做成一个带预编译 framework 的 npm 包 |
| 用 CocoaPods 或 Swift Package Manager 引第三方 SDK | 不支持。第三方 SDK 要以预编译的 `.xcframework` 随包带上 |

## `NavigationHistory`

原来在 `docs/api/navigation-history.md`。

| 想做的事 | 对应的能力 |
| --- | --- |
| 历史记录的列表、跳到某一条 | Electron 的 `navigationHistory.getAllEntries()`、`goToIndex()`；`backForwardList` |
| 从屏幕左边缘右滑后退 | `allowsBackForwardNavigationGestures` |

## `NSAttributedString`

原来在 `docs/api/ns-attributed-string.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 自己控制文字怎么排、读每一行的位置 | TextKit：`NSLayoutManager`、`NSTextLayoutManager`、`NSTextStorage` | 未实现 |
| 点文本视图里的链接时得到通知、决定要不要打开 | `UITextViewDelegate` 的链接相关方法 | 未实现 |
| 设置输入框里接下来打的字用什么样式；改链接的样式 | `typingAttributes`、`defaultTextAttributes`、`linkTextAttributes` | 未实现 |
| 读一个属性连续生效的范围 | `attributesAtIndex:effectiveRange:` 的出参 | 用 `enumerateAttributesInRange()` 代替 |
| 遍历时中途停下、从后往前遍历、只遍历某一个属性 | `enumerateAttributesInRange:` 的 `stop` 和 `options`、`enumerateAttribute:inRange:…` | 未实现 |
| 放自己起名字的属性 | 任意字符串作键 | 未实现。写入时名字不认识会抛；读出时不认识的键不出现 |
| 倾斜、横向拉伸、竖排、凸版效果、文字高亮、书写方向覆盖 | `NSObliquenessAttributeName`、`NSExpansionAttributeName`、`NSVerticalGlyphFormAttributeName`、`NSTextEffectAttributeName`、`NSTextHighlightStyleAttributeName`、`NSWritingDirectionAttributeName` | 未实现。前三个系统已经标为将废弃 |
| 制表位、列表、按 CJK 规则断行的策略 | `tabStops`、`textLists`、`lineBreakStrategy` | 未实现 |
| 附件显示文件、显示一个视图；调附件左右的间距 | `initWithData:ofType:`、`NSTextAttachmentViewProvider`、`lineLayoutPadding` | 未实现 |
| 把富文本直接画到图片或图层上 | `drawAtPoint:`、`drawInRect:` | 未实现 |
| 改 `string` 而保留属性 | `mutableString` | 用 `replaceCharactersInRange()` 代替 |

## `NSBundle`

原来在 `docs/api/ns-bundle.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 以 URL 的形式拿资源 | `URLForResource:withExtension:` 一组。用 `pathForResource()` 拿路径 |
| 加载包里的代码 | `load`、`principalClass`、`classNamed:`。iOS 上不能动态加载代码 |
| 读程序文件、frameworks 和插件的路径 | `executablePath`、`privateFrameworksPath`、`builtInPlugInsPath` |
| 列出所有加载了的包 | `allBundles`、`allFrameworks` |
| 按需下载的资源 | `NSBundleResourceRequest` |

## `NSItemProvider`

原来在 `docs/api/ns-item-provider.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 取出选中的视频 | `loadFileRepresentationForTypeIdentifier:completionHandler:` |
| 取图片的原始文件数据（不解码成 `UIImage`） | `loadDataRepresentationForTypeIdentifier:completionHandler:` |
| 用提供者传图片以外的东西 | `NSItemProvider` 的其余成员 |

## `NSLocale`

原来在 `docs/api/ns-locale.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读这个地区常用的字符 | `exemplarCharacterSet`（`NSCharacterSet` 没有提供） |
| 把地区标识拆成各段的字典、从字典拼回来 | `componentsFromLocaleIdentifier:`、`localeIdentifierFromComponents:`。拆用 `new NSLocale(id)` 的各项属性，拼用 `canonicalLocaleIdentifierFromString()` |
| 和 Windows 的区域代码互换 | `localeIdentifierFromWindowsLocaleCode:`、`windowsLocaleCodeFromLocaleIdentifier:` |
| 读 App 实际支持、正在用的语言列表 | `NSBundle.preferredLocalizations` |

## `NSMutableAttributedString`

原来在 `docs/api/ns-mutable-attributed-string.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 改 `string` 而保留属性 | `mutableString`。用 `replaceCharactersInRange()` 代替 |

## `NSParagraphStyle`

原来在 `docs/api/ns-paragraph-style.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 制表位、列表、按 CJK 规则断行的策略 | `tabStops`、`textLists`、`lineBreakStrategy` |

## `NSTextAttachment`

原来在 `docs/api/ns-text-attachment.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 附件显示文件、显示一个视图；调附件左右的间距 | `initWithData:ofType:`、`NSTextAttachmentViewProvider`、`lineLayoutPadding` |

## `NSTextContainer`

原来在 `docs/api/ns-text-container.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 自己建文字排版的区域，分栏排版 | `NSTextContainer` 的初始化方法、`NSLayoutManager` |
| 让文字绕开一块区域 | `exclusionPaths` |

## `Performance`

原来在 `docs/api/performance.md`。

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 给一段过程打标记、取两个标记之间的耗时 | `performance.mark()`、`performance.measure()` | 未实现。用两次 `now()` 相减代替 |
| 读取页面加载、资源请求的各阶段耗时 | `performance.getEntries()`、`PerformanceObserver` | 未实现 |
| 读取内存占用 | `performance.memory` | 未实现 |

## `PHPhotoLibrary`

原来在 `docs/api/ph-photo-library.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读相册里已有的照片、相簿 | `PHAsset`、`PHAssetCollection`、`PHImageManager`，以及 `PHAccessLevelReadWrite`。要完整的相册权限 |
| 相册变了时得到通知 | `PHPhotoLibraryChangeObserver` |
| 把视频、文件里的图片存进相册，删除和修改照片 | `PHAssetChangeRequest` 的其余方法、`PHAssetCreationRequest` |
| 存进去之后拿到那张新照片 | `PHObjectPlaceholder`。要完整的相册权限才用得上 |

## `PHPickerConfiguration`

原来在 `docs/api/ph-picker-configuration.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 预先选中几张、知道选中的是相册里的哪一张 | `initWithPhotoLibrary:`、`preselectedAssetIdentifiers` |
| 隐藏选图界面的搜索框等部件、去掉位置信息 | `disabledCapabilities`、`edgesWithoutContentMargins`、`metadataOptions`、`searchText` |

## `PHPickerFilter`

原来在 `docs/api/ph-picker-filter.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 按播放方式筛选 | `playbackStyleFilter:` |

## `PHPickerResult`

原来在 `docs/api/ph-picker-result.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 知道选中的是相册里的哪一张 | `assetIdentifier` |

## `PHPickerViewController`

原来在 `docs/api/photos.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读相册里已有的照片、相簿 | `PHAsset`、`PHAssetCollection`、`PHImageManager`，以及 `PHAccessLevelReadWrite`。要完整的相册权限 |
| 相册变了时得到通知 | `PHPhotoLibraryChangeObserver` |
| 取出选中的视频 | `NSItemProvider` 的 `loadFileRepresentationForTypeIdentifier:completionHandler:` |
| 取出实况照片里会动的那一段 | `PHLivePhoto`、`PHLivePhotoView` |
| 知道选中的是相册里的哪一张、预先选中几张 | `PHPickerConfiguration` 的 `initWithPhotoLibrary:`、`preselectedAssetIdentifiers`，`PHPickerResult.assetIdentifier` |
| 选图界面显示着的时候改它 | `PHPickerViewController` 的 `updatePickerUsingConfiguration:`、`deselectAssetsWithIdentifiers:`、`moveAssetWithIdentifier:afterAssetWithIdentifier:`、`scrollToInitialPosition`、`zoomIn`、`zoomOut` |

配置、筛选条件、提供者、相册各自还不能做的，见各自的类页。

## `ReadableStream`

原来在 `docs/api/readable-stream.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 自己创建流，或者把流接到别处（`new ReadableStream()`、`pipeTo()`、`pipeThrough()`、`tee()`、`TransformStream`、`WritableStream`） | 未实现 |
| 把数据读进自己准备的缓冲区（BYOB 读取器） | 未实现 |
| 请求体用流边生成边发送 | 未实现 |

## `Session`

原来在 `docs/api/session.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 只清 HTTP 缓存 | Electron 的 `ses.clearCache()`；`WKWebsiteDataTypeDiskCache` |
| 让网页的 cookie 和 `fetch` 的 cookie 互通 | `NSHTTPCookieStorage` |
| 改这个分区里所有网页的 User-Agent | Electron 的 `ses.setUserAgent()` |
| 拦截或改写网页发出的请求 | Electron 的 `ses.webRequest` |
| 处理网页发起的下载 | Electron 的 `will-download`；`WKDownload` |
| 看一个分区里存了哪些站点的数据 | `fetchDataRecordsOfTypes:` |

## `application.storage`

原来在 `docs/api/storage.md`。

| 想做的事 | 对应的原生能力 | 现在怎么办 |
| --- | --- | --- |
| 直接存 `Date` | `NSDate` | 存毫秒时间戳 |
| 存二进制数据 | `NSData` | 用[文件读写](../api/filesystem.md) |
| 只监听某一个键的变化 | 键值观察（KVO） | 监听 `change`，在回调里比较新旧值 |
| 和同一开发者的其他 App、小组件共用一份存储 | `initWithSuiteName:`、App Group | 没有替代办法 |
| 在用户的多台设备之间同步 | `NSUbiquitousKeyValueStore` | 没有替代办法 |

## 结构体

原来在 `docs/api/structs.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 三维变换（透视、绕 x 或 y 轴翻转） | `CATransform3D`、`CALayer.transform` |
| 用向量、范围、偏移这几种结构体 | `CGVector`、`NSRange`、`UIOffset` |
| 矩形的几何运算（求交集、判断包含、向内缩进） | `CGRectIntersection`、`CGRectContainsPoint`、`CGRectInset` 等 C 函数。可以在 JS 里按字段自己计算 |
| 用预定义的零值常量 | `CGPointZero`、`CGRectZero`、`UIEdgeInsetsZero`。用 `new CGPoint()`、`new CGRect()` 代替，没给的参数是 0 |

## `TextDecoder`

原来在 `docs/api/text-decoder.md`。

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 解码 GBK、UTF-16 等别的编码的文字 | `new TextDecoder('gbk')` | 未实现 |
| 边读数据流边解码 | `TextDecoderStream` | 未实现。用 `decode()` 的 `stream` 选项逐段解码 |

## `TextEncoder`

原来在 `docs/api/text-encoder.md`。

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 边读数据流边编码 | `TextEncoderStream` | 未实现 |

## 定时器

原来在 `docs/api/timers.md`。

| 想做的事 | 状态 |
| --- | --- |
| 每帧回调一次（`requestAnimationFrame`） | 没有这个函数。用 [`CADisplayLink`](../api/ca-animation.md) |
| 让定时器在 App 进入后台后继续执行 | 未实现。对应 iOS 的后台任务（`beginBackgroundTask`） |
| 给回调分优先级 | 未实现 |
| `setImmediate` | 没有。用 `setTimeout(fn, 0)` |

## `UIActivityViewController`

原来在 `docs/api/ui-activity-view-controller.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 往面板里加 App 自己的动作 | `UIActivity` 的子类、`applicationActivities` |
| 排除第三方 App 的分享扩展 | 往 `excludedActivityTypes` 里写扩展的标识符。现在只收表里的名字 |
| 分享文件、视频、别的类型的数据 | 数组里放 `NSURL`（文件地址）、`NSData`、`NSItemProvider`。现在只收字符串、`URL`、`UIImage` |
| 按去处给不同的内容，定制面板顶上的预览 | `UIActivityItemSource`、`LPLinkMetadata` |
| 拿到去处改过之后送回来的数据 | 完成回调的 `returnedItems` |
| 在 iPad 上弹出（要指定它从哪里弹出来） | `popoverPresentationController`。运行时只支持 iPhone |

## `UIAlertController`

原来在 `docs/api/ui-alert-controller.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在 iPad 上弹底部菜单（要指定它从哪里弹出来） | `popoverPresentationController`。运行时只支持 iPhone |
| 点了按钮不关弹窗 | 系统不提供 |
| 改弹窗的颜色、字体，往里放自己的视图 | 系统没有公开接口。要自定义外观，用一个自己的页面[模态弹出](../api/ui-view-controller/presentviewcontroller.md) |
| 在弹窗上监听 `dismiss` 一组关闭事件 | `UIAdaptivePresentationControllerDelegate`。系统不允许给提示框设置这个委托 |

## `UIBarButtonItem`

原来在 `docs/api/ui-bar-button-item.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 点按钮弹出菜单 | `UIMenu`、`UIAction`、`primaryAction`、`menu` |
| 调整图标的位置、横屏时换一张图 | `imageInsets`、`landscapeImagePhone` |
| 统一定制所有按钮的外观 | `UIAppearance`、`setBackgroundImage:forState:barMetrics:` |
| 给按钮单独设颜色 | `tintColor` |

## `UIBezierPath`

原来在 `docs/api/ui-bezier-path.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让路径自己把自己画出来。现在用 `CAShapeLayer` 画 | `-fill`、`-stroke`、`-addClip`，以及路径上的 `lineWidth`、`lineCapStyle`、`lineJoinStyle`、`miterLimit`、`flatness`。这些只能在自定义绘制（`drawRect:`）里用，原生里靠继承来做，而[原生类不能继承](../api/native-classes.md) |
| 读出路径里的每个点 | `CGPath` 的遍历 |
| 从 `CGPath` 创建路径 | `bezierPathWithCGPath:` |
| 读路径上的虚线设置。虚线设在 `CAShapeLayer` 上 | `getLineDash:count:phase:` |

## `UIBlurEffect`

原来在 `docs/api/ui-blur-effect.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读出一个模糊效果是哪种样式 | 无，iOS 没有公开这个属性 |
| 用 tvOS 的 `extraDark` 模糊 | `UIBlurEffectStyleExtraDark`，iOS 上不可用 |

## `UIButton`

原来在 `docs/api/ui-button.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用一个配置对象设置内边距、图标位置、副标题、填充样式 | `UIButton.Configuration` |
| 点按钮弹出菜单 | `menu`、`showsMenuAsPrimaryAction` |
| 调整图标的粗细和大小 | `setPreferredSymbolConfiguration:forImageInState:` |

## `UICollectionLayoutListConfiguration`

原来在 `docs/api/ui-collection-layout-list-configuration.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 分区的头和尾用单独的视图 | `headerMode = UICollectionLayoutListHeaderModeSupplementary`、`footerMode` |
| 左滑、右滑出现操作按钮 | `trailingSwipeActionsConfigurationProvider`、`leadingSwipeActionsConfigurationProvider` |
| 按行改分隔线 | `separatorConfiguration`、`itemSeparatorHandler` |

## `UICollectionViewCell`

原来在 `docs/api/ui-collection-view-cell.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 改单元格的背景、选中时的样子 | `backgroundConfiguration`、`configurationUpdateHandler`、`UICellConfigurationState` |
| 继承单元格做自己的类 | ObjC 的子类化。JS 里原生类不能继承 |

## `UICollectionViewCompositionalLayout`

原来在 `docs/api/ui-collection-view-compositional-layout.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 网格、横向滚动的分区、每个分区不同的排法 | `initWithSection:`、`initWithSectionProvider:`、`NSCollectionLayoutSection` 一组 |

## `UICollectionViewDiffableDataSource`

原来在 `docs/api/ui-collection-view-diffable-data-source.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 能展开和收起的分组 | `NSDiffableDataSourceSectionSnapshot`、`applySnapshot:toSection:animatingDifferences:` |
| 拖动排序 | `reorderingHandlers` |
| 分区的头和尾用单独的视图 | `supplementaryViewProvider` |

## `UICollectionViewLayout`

原来在 `docs/api/ui-collection-view-layout.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 网格、横向滚动的分区、自定义的排法 | `UICollectionViewFlowLayout`、`NSCollectionLayoutSection` 一组、继承 `UICollectionViewLayout` |

## `UICollectionViewListCell`

原来在 `docs/api/ui-collection-view-list-cell.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 行右侧的箭头、对勾、删除按钮 | `accessories` |
| 缩进的层级 | `indentationLevel`、`indentationWidth` |

## `UICollectionView`

原来在 `docs/api/ui-collection-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 网格、横向滚动的分区、自定义的排法 | `NSCollectionLayoutSection` 一组、`UICollectionViewFlowLayout`。现在只有列表布局 |
| 分区的头和尾用单独的视图 | 补充视图（supplementary view）、`headerMode = 'supplementary'`。可以用 `headerMode = 'firstItemInSection'` 把第一项当头 |
| 行右侧的箭头、对勾、删除按钮 | `UICollectionViewListCell.accessories` |
| 左滑出现操作按钮 | `trailingSwipeActionsConfigurationProvider` |
| 改内容配置里文字的字体和颜色、图片的大小 | `UIListContentConfiguration.textProperties` 等。可以在 `contentView` 里放自己的视图 |
| 改单元格的背景、选中时的样子 | `backgroundConfiguration`、`configurationUpdateHandler`、`UICellConfigurationState` |
| 拖动排序 | `reorderingHandlers` |
| 长按出菜单 | `collectionView:contextMenuConfigurationForItemsAtIndexPaths:point:` |
| 下拉刷新 | `UIRefreshControl` |
| 能展开和收起的分组 | `NSDiffableDataSourceSectionSnapshot` |
| 按下标给数据（不用快照） | `UICollectionViewDataSource` 协议 |
| 阻止某一项被选中 | `collectionView:shouldSelectItemAtIndexPath:` |
| 标识用字符串和整数以外的值 | 任何可哈希的对象。不支持 |

## `UIColor`

原来在 `docs/api/ui-color.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用色相、饱和度、亮度写颜色 | `colorWithHue:saturation:brightness:alpha:` | 未实现 |
| 写广色域（Display P3）颜色 | `colorWithDisplayP3Red:green:blue:alpha:` | 未实现 |
| 给颜色名加透明度，比如半透明的 `systemBlue` | `colorWithAlphaComponent:` | 未实现 |
| 读出一个颜色的红、绿、蓝、不透明度 | `getRed:green:blue:alpha:` | 未实现 |
| 按色值比较两个颜色 | `isEqual:` | 未实现 |
| 在写入之前检查一个字符串是不是合法的颜色 | — | 未实现。只能写入后看控制台的警告 |
| 用更多系统颜色：`systemGray2`–`systemGray6`、`systemFill` 一组、`systemGroupedBackground` 一组 | 对应的 `UIColor` 类级属性 | 未实现 |
| 用图片平铺作为颜色 | `colorWithPatternImage:` | 未实现 |
| 让图层上的颜色自动跟随深浅色模式 | 原生也不自动跟随 | 做法是在 `traitchange` 事件里重新写入，见指南[适配深色模式](../guides/dark-mode.md) |
| 在命令行工具生成的工程里添加 Asset Catalog 颜色 | Asset Catalog 的 Color Set | 未实现。生成的工程每次重建 |

## `UIControl`

原来在 `docs/api/ui-control.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在回调里得到事件发生那一刻的控件状态 | 事件对象带状态。触点位置已经在事件对象上 |
| 自己处理原始触摸，决定控件怎么跟踪手指 | 覆写 `touchesBegan:withEvent:`、`beginTrackingWithTouch:withEvent:` 等方法 |
| 一次监听所有触摸事件 | `UIControlEventAllTouchEvents` 等聚合掩码。现在逐个事件名调用 `addEventListener()` |
| 点控件弹出菜单 | `contextMenuInteraction`、`showsMenuAsPrimaryAction` |
| 让父视图收到子控件的事件 | 无。原生的控件事件也不冒泡 |

## `UIDatePicker`

原来在 `docs/api/ui-date-picker.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让选择器用另一种语言或地区的格式显示 | `locale` |
| 让选择器按另一个时区显示 | `timeZone` |
| 换一种历法（农历、佛历） | `calendar` |

## `UIDevice`

原来在 `docs/api/ui-device.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读电量和充电状态，并在变化时收到通知 | `batteryLevel`、`batteryState`、`isBatteryMonitoringEnabled` |
| 读设备的物理朝向（竖着、横着、面朝上），并在变化时收到通知 | `orientation`、`beginGeneratingDeviceOrientationNotifications` |
| 知道设备是否贴近了脸 | `proximityState`、`isProximityMonitoringEnabled` |
| 读具体的型号（iPhone 14、iPhone Air） | `uname()` 的 `machine` 字段 |
| 读用户给设备起的名字 | 需要 Apple 单独批准的权限 |

## `UIFeedbackGenerator`

原来在 `docs/api/ui-feedback-generator.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`selectionChangedAtLocation:` 等 |
| 自己编排震动的时长、强度和节奏 | Core Haptics（`CHHapticEngine`） |
| 知道用户有没有关掉触感反馈 | 无。系统不提供这个查询 |

## `UIFont`

原来在 `docs/api/ui-font.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 复制一个字体并改字号 | `fontWithSize:`。替代写法见指南[设置字体](../guides/fonts.md) |
| 同时指定斜体和粗细，或使用小型大写字母等字体特性 | `UIFontDescriptor` |
| 列出系统里有哪些字体 | `UIFont.familyNames`、`fontNamesForFamilyName:` |
| 使用随 App 打包的字体文件 | `CTFontManagerRegisterFontsForURL`、Info.plist 的 `UIAppFonts` |
| 让标签在用户改了文字大小后自动换字号 | `UILabel.adjustsFontForContentSizeCategory`。替代写法见指南[设置字体](../guides/fonts.md) |
| 让自己指定的字体按文字大小设置缩放 | `UIFontMetrics` |
| 用圆体、衬线体等系统字体的其他设计 | `UIFontDescriptor` 的 `fontDescriptorWithDesign:` |
| 用数字指定字重 | `UIFontWeight` 的任意浮点值。只接受九个名字 |
| 不经过视图，直接量一段纯文字的宽高 | `NSString` 的 `sizeWithAttributes:`。替代写法是读标签的 `intrinsicContentSize`、调用 `sizeThatFits()`，或用富文本的 `boundingRectWithSize()` |

## `UIGestureRecognizer`

原来在 `docs/api/ui-gesture-recognizer.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让两个识别器同时认出手势，比如边缩放边旋转 | `UIGestureRecognizerDelegate` 的 `gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:`。系统在手势进行中当场询问，要求立刻回答，目前 JS 的回调做不到 |
| 按条件决定一个手势要不要开始、要不要接收某次触摸 | `UIGestureRecognizerDelegate` 的 `gestureRecognizerShouldBegin:`、`gestureRecognizer:shouldReceiveTouch:` 等。原因同上 |
| 撤销 `requireGestureRecognizerToFail()` 建立的关系 | 无。系统没有提供撤销的方法 |
| 随时查询手势在任意视图里的位置 | `locationInView:`、`locationOfTouch:inView:`。现在位置从事件对象的 `location` 读 |
| 自己定义一种手势 | 继承 `UIGestureRecognizer` 并覆写 `touchesBegan:withEvent:` 等方法。[原生类不能继承](../api/native-classes.md) |
| 限定只认手指、触控笔或鼠标 | `allowedTouchTypes`、`buttonMaskRequired` |

## `UIImagePickerController`

原来在 `docs/api/ui-image-picker-controller.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 把拍到的照片上传到服务器，或者存成文件 | `UIImageJPEGRepresentation`、`UIImagePNGRepresentation` | 未实现。[`UIImage`](api-gaps.md#uiimage) 现在不能编码成字节，拍到的照片只能显示和交给[分享面板](../api/ui-activity-view-controller.md) |
| 从相册选一张照片 | `PHPickerViewController` | 不在这个包里，用 `@nacrejs/photos`。`sourceType` 写 `'photoLibrary'` 抛 `TypeError` |
| 把拍到的照片存进相册 | `UIImageWriteToSavedPhotosAlbum` | 不在这个包里，用 `@nacrejs/photos`。它要另一句权限文案 |
| 录视频 | `mediaTypes`、`cameraCaptureMode`、`videoQuality`、`videoMaximumDuration`、`startVideoCapture` | 未实现。只拍照片 |
| 扫二维码和条码 | `AVCaptureSession`、`AVCaptureMetadataOutput`，或者 `DataScannerViewController` | 未实现。要接实时取景 |
| 自己画取景界面，自己放快门按钮 | `showsCameraControls`、`cameraOverlayView`、`cameraViewTransform`、`takePicture`，或者 `AVCaptureSession` | 未实现。同上 |
| 读照片的拍摄参数（光圈、时间、方向） | `info[UIImagePickerControllerMediaMetadata]` | 未实现 |
| 拍实况照片 | `info[UIImagePickerControllerLivePhoto]` | 未实现 |
| 查询或者主动申请相机权限 | `AVCaptureDevice.authorizationStatusForMediaType:`、`requestAccessForMediaType:` | 未实现。权限提示框由系统在第一次打开拍照界面时弹出 |
| 监听导航的 `beforeshow` / `show`，改它里面的页面 | `UINavigationControllerDelegate`、`viewControllers` | 不提供。拍照界面内部的页面是系统私有的 |

## `UIImageView`

原来在 `docs/api/ui-image-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 暂停、继续图片视图上的动图，或者得知它播完了 | 图层的 `speed`，动画的 delegate。替代做法见指南[显示图片](../guides/images.md) |
| 用一组单独的图片做逐帧动画 | `UIImageView.animationImages`。替代做法同上，把那组图片作为关键帧动画的 `values` |
| 给图片视图以外的视图设 `tintColor`，让子视图继承 | `UIView.tintColor`。`tintColor` 只在 `UIImageView` 和标签栏（[`UITabBarController`](../api/ui-tab-bar-controller.md)）上有 |

## `UIImage`

原来在 `docs/api/ui-image.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 播放解码后超过 64 MB 的动图 | ImageIO 逐帧解码（`CGAnimateImageDataWithBlock`）。只显示第一帧 |
| 播放 HEIC 序列、动画 AVIF | ImageIO。得到的是静态图 |
| 在运行时显示 SVG 文件 | 系统不支持。SVG 只能放进 Asset Catalog，在编译时转成位图 |
| 自己画一张图、把几张图合成一张、把视图截成图 | `UIGraphicsImageRenderer` |
| 把图片编码成 PNG 或 JPEG 的字节 | `UIImagePNGRepresentation`、`UIImageJPEGRepresentation` |
| 调整 SF Symbols 图标的粗细、大小，使用多色图标 | `UIImageSymbolConfiguration`。图标的大小目前靠图片视图的大小和 `contentMode` 控制 |
| 深色模式下自动换一张图 | Asset Catalog 的外观变体。命令行工具生成的工程里做不到。替代做法是监听 `traitchange` 事件，在回调里换图，见指南[适配深色模式](../guides/dark-mode.md) |
| 运行时提供图片缓存 | 没有对应的原生能力。做法见指南[显示图片](../guides/images.md) |

## `UIImpactFeedbackGenerator`

原来在 `docs/api/ui-impact-feedback-generator.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`impactOccurredWithIntensity:atLocation:` |

## `UIKeyboardLayoutGuide`

原来在 `docs/api/ui-keyboard-layout-guide.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 键盘靠近或离开某条边时自动切换约束 | `UITrackingLayoutGuide` 的 `setConstraints:activeWhenNearEdge:` |

## `UILabel`

原来在 `docs/api/ui-label.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用户在系统设置里调整文字大小后，标签自动换成新字号 | `adjustsFontForContentSizeCategory`。替代写法是在系统设置变化时重新给 `font` 赋值，见指南[设置字体](../guides/fonts.md) |
| 细调换行和截断时的排版 | `lineBreakStrategy`、`allowsDefaultTighteningForTruncation` |
| 让文字垂直靠上或靠下 | 原生没有这个属性。做法是不约束标签的高度，让它等于文字的高度，再用约束或 `frame` 摆放标签 |
| 让用户选中和复制文字 | `UITextView` 的可选中模式 |
| 让用户编辑文字 | 用 [`UITextField`](../api/ui-text-field.md) 或 [`UITextView`](../api/ui-text-view.md) |

## `UIListContentConfiguration`

原来在 `docs/api/ui-list-content-configuration.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 改文字的字体和颜色、图片的大小 | `textProperties`、`secondaryTextProperties`、`imageProperties`。可以在单元格的 `contentView` 里放自己的视图 |
| 带样式的文字 | `attributedText`、`secondaryAttributedText` |
| 改内边距和间距 | `directionalLayoutMargins`、`imageToTextPadding` |

## `UINavigationController`

原来在 `docs/api/ui-navigation-controller.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用 `class` 继承 `UIViewController` 写自己的页面类 | 子类化。`new` 时抛 `TypeError`，见[原生类](../api/native-classes.md) |
| 拦住返回按钮，或者在返回前弹确认框 | `navigationItem.backAction`、`UINavigationBarDelegate`。左滑返回可以关掉，见[左滑返回](../api/ui-navigation-controller.md#左滑返回) |
| 设置左滑返回和页面里其他手势谁优先 | `UIGestureRecognizerDelegate` |
| 往底部工具条上放按钮 | 页面的 `toolbarItems`、`setToolbarItems:animated:` |
| 导航控制器被模态呈现时，在它上面监听关闭事件 | `beforedismiss`、`dismiss`、`dismissattempt`。监听这三个事件名不报错，但收不到 |
| 定制导航条的背景、字体、颜色 | `navigationBar`、`UINavigationBarAppearance` |
| 自己写切换页面的动画 | `UIViewControllerAnimatedTransitioning` |

## `UINavigationItem`

原来在 `docs/api/ui-navigation-item.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 大标题和大副标题 | `largeTitleDisplayMode`、`largeTitle`、`largeSubtitle` |
| 换掉返回按钮本身，或者拦截返回 | `backBarButtonItem`、`backAction` |
| 设了左侧按钮之后仍然保留返回按钮 | `leftItemsSupplementBackButton` |
| 把自己的视图当副标题 | `subtitleView` |
| 屏幕底部的工具条 | `UIToolbar`、`toolbarItems` |

## `UINotificationFeedbackGenerator`

原来在 `docs/api/ui-notification-feedback-generator.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `notificationOccurred:atLocation:` |

## `UIPageControl`

原来在 `docs/api/ui-page-control.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 当前页的点上显示一条进度，走完自动翻到下一页 | `progress`（`UIPageControlProgress`、`UIPageControlTimerProgress`） |

## `UIPasteboard`

原来在 `docs/api/ui-pasteboard.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 复制和粘贴图片、网址、颜色 | `image`、`URL`、`color`，以及 `hasImages` 等 |
| 一次放多条内容 | `strings`、`items` |
| 让复制的内容过一段时间自动失效，或者只在本机有效 | `setItems:options:` 的 `expirationDate`、`localOnly` |
| App 自己专用的剪贴板 | `pasteboardWithName:create:`、`pasteboardWithUniqueName` |
| 不取内容，只判断剪贴板里是不是网址或数字 | `detectPatternsForPatterns:completionHandler:` |
| 用系统自带的「粘贴」按钮，免去系统提示 | `UIPasteControl` |

## `UIPinchGestureRecognizer`

原来在 `docs/api/ui-pinch-gesture-recognizer.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 和旋转识别器同时生效，边缩放边旋转 | `UIGestureRecognizerDelegate`，见 [`UIGestureRecognizer`](api-gaps.md#uigesturerecognizer) |

## `UIProgressView`

原来在 `docs/api/ui-progress-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让进度条自动跟随一个任务的进度对象 | `observedProgress`（`NSProgress`） |
| 显示一个网络请求下载或上传了多少 | `NSURLSessionTask` 的进度，见 [fetch 还不能做的](api-gaps.md#fetch) |

## `UIRotationGestureRecognizer`

原来在 `docs/api/ui-rotation-gesture-recognizer.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 和捏合识别器同时生效，边缩放边旋转 | `UIGestureRecognizerDelegate`，见 [`UIGestureRecognizer`](api-gaps.md#uigesturerecognizer) |

## `UIScreen`

原来在 `docs/api/ui-screen.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 横竖屏切换时收到通知、读屏幕方向 | `UIWindowScene.effectiveGeometry`（在待办里） |
| 在屏幕的坐标系里换算位置 | `coordinateSpace`、`fixedCoordinateSpace` |
| 外接电视的过扫描补偿 | `overscanCompensation`、`overscanCompensationInsets` |
| 不经过场景拿到屏幕 | `UIScreen.mainScreen`、`UIScreen.screens`（iOS 废弃了） |

## `UIScrollView`

原来在 `docs/api/ui-scroll-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 双指捏合缩放内容 | `viewForZoomingInScrollView:`。缩放比例这一组属性和 `setZoomScale()`、`zoomToRect()` 已经有了；系统要当场问「缩放的是哪个子视图」，这一问还没接 |
| 松手时改变最终停下的位置（自定义吸附） | `scrollViewWillEndDragging:withVelocity:targetContentOffset:` |
| 下拉刷新 | `refreshControl` |
| 滚动边缘的模糊效果（iOS 26） | `UIScrollEdgeEffect` |

## `UISearchBar`

原来在 `docs/api/ui-search-bar.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 阻止搜索框开始或结束输入 | `searchBarShouldBeginEditing:`、`searchBarShouldEndEditing:`。它们要求回调同步返回一个布尔值 |
| 在文字改变之前拦截或改写输入 | `searchBar:shouldChangeTextInRanges:replacementText:`，原因同上。可以在 `input` 里事后改 `text` |
| 把搜索框放进导航条，让它随页面滚动收起 | `UISearchController`、`UINavigationItem.searchController` |
| 在输入框里放搜索标记，在下面显示搜索建议 | `UISearchTextField` 的 `tokens`、`searchSuggestions`。`searchTextField` 按普通的 `UITextField` 提供 |
| 换搜索框的背景图、输入框的背景图、各个图标 | `backgroundImage`、`setSearchFieldBackgroundImage:forState:`、`setImage:forSearchBarIcon:state:` 等 |
| 定制范围按钮的背景、分隔线和文字样式 | `setScopeBarButtonBackgroundImage:forState:` 一组 |
| 微调输入框、文字和图标的位置 | `searchFieldBackgroundPositionAdjustment`、`searchTextPositionAdjustment`、`setPositionAdjustment:forSearchBarIcon:` |
| 设置智能引号、智能破折号、行内预测、密码规则等其余的键盘设置 | `smartQuotesType`、`smartDashesType`、`smartInsertDeleteType`、`inlinePredictionType`、`passwordRules` 等。`UITextField` 和 `UITextView` 上有其中的几个 |
| 定制 iPad 键盘上方的快捷栏 | `inputAssistantItem` |
| 告诉系统搜索框在页面的顶部还是别处 | `barPosition`、`positionForBar:` |

## `UISegmentedControl`

原来在 `docs/api/ui-segmented-control.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 改标题的字体和颜色 | `setTitleTextAttributes:forState:` |
| 换底图和段之间的分隔线 | `setBackgroundImage:forState:barMetrics:`、`setDividerImage:forLeftSegmentState:rightSegmentState:barMetrics:` |
| 按「最左、中间、最右」分别微调内容的位置 | `setContentPositionAdjustment:forSegmentType:barMetrics:` |
| 给每一段绑一个带回调的动作 | `initWithFrame:actions:`、`insertSegmentWithAction:atIndex:animated:`、`setAction:forSegmentAtIndex:`。不做：用 `change` 加 `selectedSegmentIndex` |

## `UISelectionFeedbackGenerator`

原来在 `docs/api/ui-selection-feedback-generator.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `selectionChangedAtLocation:` |

## `UISlider`

原来在 `docs/api/ui-slider.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在轨道上画刻度，让圆钮只能停在刻度上 | `trackConfiguration`（`UISliderTrackConfiguration`、`UISliderTick`）。未实现 |
| 改变轨道和圆钮的画法 | 覆写 `trackRectForBounds:` 等。未实现：原生类还不能继承，见[原生类](../api/native-classes.md) |
| 竖着的滑块 | 无，系统没有这个选项。用 [`transform`](../api/ui-view.md) 把滑块转 90° |

## `UIStackView`

原来在 `docs/api/ui-stack-view.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 指定用哪个子视图的文字做基线对齐 | `viewForFirstBaselineLayout`、`viewForLastBaselineLayout` | 未实现 |
| 放不下时自动换行，或排成网格 | iOS 没有对应的容器，要用 `UICollectionView` | 未实现 |
| 排列项位置变化时带动画 | `UIView` 动画 | 未实现 |
| 排列项很多时只创建看得见的那些 | `UICollectionView` | 不在这个类上。用[列表](../api/ui-collection-view.md) |

## `UIStepper`

原来在 `docs/api/ui-stepper.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 把加号、减号、底图、中间的分隔线换成自己的图 | `setIncrementImage:forState:`、`setDecrementImage:forState:`、`setBackgroundImage:forState:`、`setDividerImage:forLeftSegmentState:rightSegmentState:`。不做：实测 iOS 27.2 上这四个方法设进去的图读不回来（读到的是空） |

## `UISwitch`

原来在 `docs/api/ui-switch.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 把开关显示成复选框，旁边带标题 | `preferredStyle`、`style`、`title`。不做：这三个只在 Mac 上有效；实测 iPhone 上把 `preferredStyle` 设成复选框，`style` 仍然是滑动的开关 |
| 给开和关两种状态各放一张图 | `onImage`、`offImage`。不做：Apple 的文档写明这两个属性从 iOS 7 起没有效果 |

## `UITabBarController`

原来在 `docs/api/ui-tab-bar-controller.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在用户点标签时决定「让不让切过去」 | `tabBarController:shouldSelectViewController:`。它要求当场返回结果，运行时现在做不到 |
| 用 iOS 18 的新写法描述标签 | `UITab`、`tabs`、`UITabGroup`。`UITab` 要一个当场返回页面的回调，原因同上 |
| 超过 5 个标签时的「更多」页，以及让用户调整标签顺序 | `moreNavigationController`、`customizableViewControllers`。超过 5 个时系统仍会显示「更多」，但 JS 这边读不到它，`selectedIndex` 在选中「更多」时是 `-1` |
| 定制标签栏的背景、字体、间距 | `UITabBarAppearance` |
| 在标签栏上方放一条附加内容 | `bottomAccessory`（`UITabAccessory`） |
| 自己写切换标签的动画 | `UIViewControllerAnimatedTransitioning` |

## `UITabBarItem`

原来在 `docs/api/ui-tab-bar-item.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用系统预置的标签（搜索、收藏等） | `initWithTabBarSystemItem:tag:` |

## `UITabBar`

原来在 `docs/api/ui-tab-bar.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 定制标签栏的背景、字体、间距 | `UITabBarAppearance` |
| 给普通视图设 `tintColor` | `UIView.tintColor`。现在只有 `UITabBar` 上有 |

## `UITextField`

原来在 `docs/api/ui-text-field.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 得知输入法正在组字的那一段（拼音还没选字时） | `markedTextRange` |
| 按屏幕上的位置找到文字的位置，或者反过来 | `closestPositionToPoint:`、`caretRectForPosition:` 等 `UITextInput` 的成员 |
| 改文字到边框的内边距 | 覆写 `textRectForBounds:`。现在的做法见[自己画边框和底色](../guides/text-fields.md#自己画边框和底色) |
| 得知键盘弹出、收起的时刻和键盘的高度 | `UIKeyboardWillShowNotification` 等通知。避开键盘用 `keyboardLayoutGuide`，不需要这些 |
| 设置密码规则 | `passwordRules` |

## `UITextView`

原来在 `docs/api/ui-text-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在字符显示之前拦截：限制长度、过滤字符 | `textView:shouldChangeTextInRange:replacementText:`。单行输入框上对应的是 [`beforeinput`](../api/ui-text-field/beforeinput-event.md)，多行的还没有接。现在只能[事后改回去](../guides/multiline-text.md#限制输入的长度) |
| 阻止开始输入、结束输入 | `textViewShouldBeginEditing:`、`textViewShouldEndEditing:` |
| 设置之后输入的文字的样式；链接的样式 | `typingAttributes`、`linkTextAttributes` |
| 占位文字 | 无。`UITextView` 本身没有这项能力，叠一个标签，见[显示占位文字](../guides/multiline-text.md#显示占位文字) |
| 同时选中不相连的几段 | `selectedRanges` |
| 系统样式的边框 | `borderStyle`。iOS 上它只有 `none` 一个取值。用底色、圆角，或者[图层](../api/ca-layer.md)的 `borderWidth` 和 `borderColor` |
| 自定义长按出来的菜单 | `editMenuForTextInRange:` 等 |
| 调出系统的查找面板 | `findInteraction`。开关 [`isFindInteractionEnabled`](../api/ui-text-view/isfindinteractionenabled.md) 有 |
| 自己建文字排版的区域，分栏排版 | `NSTextContainer` 的初始化方法、`NSLayoutManager` |

## `UIToolbar`

原来在 `docs/api/ui-toolbar.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 整体定制工具条的外观（背景、阴影、按钮的文字样式） | `standardAppearance` 等四个属性，`UIToolbarAppearance` |
| 给工具条换背景图和阴影图 | `setBackgroundImage:forToolbarPosition:barMetrics:`、`setShadowImage:forToolbarPosition:` |
| 告诉系统工具条在页面的顶部还是底部 | `barPosition`、`UIToolbarDelegate` 的 `positionForBar:`。它要求同步返回一个值 |
| 使用导航控制器自带的工具条 | `UINavigationController.toolbar`、`UIViewController.toolbarItems` |
| 把工具条放到 [`UITextField`](../api/ui-text-field.md) 的键盘上方 | `UITextField.inputAccessoryView`。[`UISearchBar`](../api/ui-search-bar.md) 的可以 |

## `UITraitCollection`

原来在 `docs/api/ui-trait-collection.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 写了 `overrideUserInterfaceStyle` 之后让它立刻生效 | `updateTraitsIfNeeded` | 未实现 |
| 强制深浅色以外的其它项，比如固定文字大小 | `traitOverrides` | 未实现 |
| 读其余的十几项 | `userInterfaceLevel`、`legibilityWeight`、`displayGamut`、`activeAppearance` 等 | 未实现 |
| 自己定义一项特征，让它沿着视图树往下传 | 自定义 trait（`UITraitDefinition`） | 未实现 |
| 把一个会随深浅色变的颜色算成某种外观下的具体颜色 | `resolvedColorWithTraitCollection:` | 未实现 |
| 深色和浅色各用一张图 | 图片资源里的外观变体 | 未实现 |
| 图层上的颜色自动跟着深浅色变 | 无。原生也要自己处理 | 做不到。写法见指南[适配深色模式](../guides/dark-mode.md) |
| 让标签的字号自动跟随系统的文字大小 | `adjustsFontForContentSizeCategory` | 未实现。在 `traitchange` 里重新取字体 |

## `UIVibrancyEffect`

原来在 `docs/api/ui-vibrancy-effect.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读出一个鲜明效果是哪种样式 | 无，iOS 没有公开这个属性 |

## `UIViewController`

原来在 `docs/api/ui-view-controller.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 在页面的视图重新布局时执行代码 | `viewDidLayoutSubviews`。这是要覆写的方法，原生类不能继承 |
| 继承 `UIViewController` 写自己的页面类 | 子类化。替代写法见[原生类](../api/native-classes.md) |
| 半屏高度的卡片、卡片顶部的抓手 | `UISheetPresentationController` 的 `detents` |
| 气泡式的弹出 | `UIPopoverPresentationController` |
| 自己写页面切换的动画 | `UIViewControllerAnimatedTransitioning` |
| 两个子页面之间带动画地切换 | `transitionFromViewController:toViewController:duration:options:animations:completion:` |
| 自己控制子页面什么时候算出现、什么时候算消失 | `beginAppearanceTransition:animated:`、`shouldAutomaticallyForwardAppearanceMethods` |
| 用代码关闭模态页时也收到事件 | 系统不发这个通知。在调 `dismissViewController()` 的地方自己处理 |
| 在回调里同步决定「这次让不让用户关闭」 | `presentationControllerShouldDismiss:`。不做，用 `isModalInPresentation` 预先声明 |
| 每个页面单独控制屏幕方向、状态栏样式 | `supportedInterfaceOrientations`、`preferredStatusBarStyle` |

## `UIView`

原来在 `docs/api/ui-view.md`。

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 视图的位置或大小变化时收到通知 | 覆写 `layoutSubviews` | 未实现。原生里靠继承来做，而[原生类不能继承](../api/native-classes.md)。用约束定位的视图不需要这个通知 |
| 安全区变化时收到通知 | 覆写 `safeAreaInsetsDidChange` | 未实现，原因同上。对齐 `safeAreaLayoutGuide` 的约束会自动重算 |
| 视图被加入、移除时收到通知 | `didAddSubview:`、`willMoveToWindow:` 等 | 未实现，原因同上 |
| 自己绘制视图的内容 | `drawRect:` | 未实现，原因同上。画线和形状可以用 [`CAShapeLayer`](../api/ca-layer.md) |
| 直接接收触摸 | `touchesBegan:withEvent:` 等 | 未实现，原因同上。响应触摸用[手势识别器](../api/ui-gesture-recognizer.md)或 [`UIControl`](../api/ui-control.md) |
| 关键帧动画、两个视图之间的转场动画 | `+[UIView animateKeyframesWithDuration:…]`、`+[UIView transitionWithView:…]` | 未实现。关键帧动画可以用 [Core Animation](../api/ca-animation.md) |
| 中途暂停、倒放、拖动进度的动画 | `UIViewPropertyAnimator` | 未实现 |
| 三维变换 | `transform3D`、`CATransform3D` | 未实现 |
| 内边距变化时收到通知 | 覆写 `layoutMarginsDidChange` | 未实现，原因同上 |
| 去掉页面根视图的最小内边距 | `UIViewController` 的 `viewRespectsSystemMinimumLayoutMargins`、`systemMinimumLayoutMargins` | 未实现 |
| 用户长按时显示放大的版本 | `UILargeContentViewerInteraction` | 未实现。[`showsLargeContentViewer`](../api/ui-view/showslargecontentviewer.md) 这一组属性能读写，但这个交互还没有接入；只设属性时长按会不会显示放大的版本，**未在模拟器验证** |

## `UIVisualEffectView`

原来在 `docs/api/ui-visual-effect-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用一个纯色当效果 | `UIColorEffect`（它的工厂方法从 iOS 26.1 才有） |
| 换效果时带过渡动画 | 在 `UIView` 的动画里改 `effect` |
| 给玻璃指定和系统控件一致的圆角 | `UIView.cornerConfiguration` |

## `UIWindowScene`

原来在 `docs/api/ui-window-scene.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 列出这个场景里的所有窗口，找到当前接收键盘输入的窗口 | `windows`、`keyWindow` |
| 限制窗口的最小和最大尺寸，请求改变窗口大小 | `sizeRestrictions`、`requestGeometryUpdate:` |
| 指定哪个场景响应外部事件、场景何时销毁（iPad 多窗口） | `activationConditions`、`destructionConditions` |
| `openURL()` 带选项，比如只允许通用链接 | `openURL:options:completionHandler:` 的 `options` |
| 替换场景的 delegate | `delegate`。不会提供：它由运行时使用，JS 改它会破坏运行时 |

## `UIWindow`

原来在 `docs/api/ui-window.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 列出一个场景里的所有窗口，或拿到场景当前的 key window | `UIWindowScene.windows`、`keyWindow` |
| 继承 `UIWindow`，接管触摸事件的分发 | 子类化、`sendEvent:`。`sendEvent:` 不计划提供 |

## `UNCalendarNotificationTrigger`

原来在 `docs/api/un-calendar-notification-trigger.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 日期分量指定日历或时区 | `NSDateComponents.calendar`、`timeZone` |
| 问一个触发器下一次是什么时候 | `nextTriggerDate` |

## `UNMutableNotificationContent`

原来在 `docs/api/un-mutable-notification-content.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 通知里带图片、音频、视频 | `UNNotificationAttachment`、内容的 `attachments` |
| 通知上的自定义按钮 | 内容的 `categoryIdentifier`，以及登记分类 |
| 时效性通知、通知的排序权重 | 内容的 `interruptionLevel`、`relevanceScore` |
| 标题和正文在送达时按语言取 | `+[NSString localizedUserNotificationStringForKey:arguments:]` |

## `UNNotificationResponse`

原来在 `docs/api/un-notification-response.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 通知上的自定义按钮、在通知上直接回复 | `UNNotificationAction`、`UNTextInputNotificationAction`、`UNTextInputNotificationResponse` |

## `UNNotificationSound`

原来在 `docs/api/un-notification-sound.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 自定义的声音文件、紧急通知的声音 | `+soundNamed:`、`defaultCriticalSound` |

## `UNNotificationTrigger`

原来在 `docs/api/un-notification-trigger.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 到了某个地方时送达 | `UNLocationNotificationTrigger` |

## `UNPushNotificationTrigger`

原来在 `docs/api/un-push-notification-trigger.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让 App 能收到远程推送：向苹果注册、拿到设备令牌 | `registerForRemoteNotifications`，以及推送的 entitlement |

## `UNTimeIntervalNotificationTrigger`

原来在 `docs/api/un-time-interval-notification-trigger.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 问一个触发器下一次是什么时候 | `nextTriggerDate` |

## `UNUserNotificationCenter`

原来在 `docs/api/un-user-notification-center.md`。

下面这些都没有。表里的方法，调用会抛「不是函数」的 `TypeError`；属性，读到的是 `undefined`；类，读它的名字会抛 `ReferenceError`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让 App 能收到远程推送：向苹果注册、拿到设备令牌 | `registerForRemoteNotifications`、`application:didRegisterForRemoteNotificationsWithDeviceToken:`，以及推送的 entitlement |
| 收到远程推送时在后台执行一段代码（静默推送） | `application:didReceiveRemoteNotification:fetchCompletionHandler:` |
| 通知上的自定义按钮、在通知上直接回复 | `UNNotificationCategory`、`UNNotificationAction`、`UNTextInputNotificationAction`、`setNotificationCategories:`、内容的 `categoryIdentifier` |
| 用户划掉通知时得到通知 | `UNNotificationCategoryOptionCustomDismissAction`（要先能登记分类） |
| 到了某个地方时送达 | `UNLocationNotificationTrigger` |
| 按通知的内容逐条决定前台显不显示 | 在 `willPresentNotification:` 里按通知决定。现在只有一个对所有通知生效的属性 |
| 系统的通知设置里那个「在 App 里设置」按钮被点了 | `userNotificationCenter:openSettingsForNotification:` |
| 通知送达之前改它的内容、自定义通知的界面 | 通知服务扩展、通知内容扩展 |

内容、声音、触发器各自还不能做的，见各自的类页。

## `URLSearchParams`

原来在 `docs/api/url-search-params.md`。

| 想做的事 | 状态 |
| --- | --- |
| 用 `FormData` 组织表单数据 | 没有 `FormData`。用 `URLSearchParams` 组织键值对 |

## `URL`

原来在 `docs/api/url.md`。

| 想做的事 | 状态 |
| --- | --- |
| 把非 ASCII 的域名读成 `xn--` 开头的形式 | 未实现 |
| 用 `FormData` 组织表单数据 | 没有 `FormData`。用 [`URLSearchParams`](../api/url-search-params.md) 组织键值对 |

## 文字、字节和深拷贝

原来在 `docs/api/web-globals.md`。

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 解码 GBK、UTF-16 等别的编码的文字 | `new TextDecoder('gbk')` | 未实现 |
| 拷贝时把 `ArrayBuffer` 转移过去而不是复制 | `structuredClone()` 的 `transfer` | 未实现 |
| 深拷贝 `Blob` | `structuredClone(blob)` | 未实现 |
| 边读数据流边解码 | `TextDecoderStream` | 未实现。用 `decode()` 的 `stream` 选项逐段解码 |
| 判断异常是不是 `DOMException` | `DOMException` 类 | 未实现。用 `err.name` 判断 |

## `WebSocket`

原来在 `docs/api/websocket.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 知道还有多少数据排队没发出去（`bufferedAmount`） | `NSURLSessionWebSocketTask` 没有对应的值 |
| 让二进制消息直接以 `ArrayBuffer` 到达（`binaryType`）。现在收到 `Blob` 后调 `arrayBuffer()` | 无 |
| 读服务器启用的协议扩展（`extensions`） | `NSURLSessionWebSocketTask` 不提供 |
| 断开后自动重连。运行时不做，写法见[保持一条长期使用的连接](../guides/websocket.md#保持一条长期使用的连接) | 无 |
| App 在后台时保持连接 | iOS 的后台任务 |

## `WebContents`

原来在 `docs/api/web-contents.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 拦住服务器重定向 | Electron 的 `will-redirect` |
| 拦住 `<iframe>` 里的跳转 | Electron 的 `will-frame-navigate` |
| 网页同步地向 App 要一个结果 | Electron 的 `ipcRenderer.sendSync` |
| 从本地加载用到模块脚本、用 `fetch` 读本地文件的网页 | Electron 的 `protocol.handle`；`WKURLSchemeHandler`（让本地文件以自己定的协议提供） |
| 自己指定本地网页能读哪个目录 | `loadFileURL:allowingReadAccessToURL:` 的第二个参数 |
| 加载进度的百分比 | `estimatedProgress` |
| 网页内跳转的通知（只改 `#` 后面的部分） | Electron 的 `did-navigate-in-page` |
| 历史记录的列表、跳到某一条 | Electron 的 `navigationHistory.getAllEntries()`、`goToIndex()`；`backForwardList` |

## `WebView`

原来在 `docs/api/web-view.md`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让预加载脚本和网页的脚本互相隔离 | Electron 的 `contextIsolation`；`WKContentWorld` |
| 在 `<iframe>` 里也执行预加载脚本 | Electron 的 `nodeIntegrationInSubFrames`；`WKUserScript` 的 `forMainFrameOnly` |
| 预加载脚本的类型定义（`ipcRenderer`、`contextBridge`） | |
| 让不在界面里的网页不被放慢 | Electron 的 `backgroundThrottling`。系统没有起作用的公开开关。替代做法见[先加载，要用的时候再显示](../guides/web-pages.md#先加载要用的时候再显示) |
| 处理网页打开新窗口的请求（`window.open`、`target="_blank"`） | Electron 的 `setWindowOpenHandler`；`WKUIDelegate` |
| 显示网页的 `alert()`、`confirm()`、`prompt()` | `WKUIDelegate` |
| 改 User-Agent、缩放 | Electron 的 `setUserAgent`、`setZoomFactor`；`customUserAgent`、`pageZoom` |
| 从屏幕左边缘右滑后退 | `allowsBackForwardNavigationGestures` |
| 用 Safari 的开发者工具调试网页 | `inspectable` |
| 调网页滚动的行为（回弹、内边距） | `WKWebView.scrollView` |
| 下载文件 | Electron 的 `will-download`；`WKDownload` |

## 从 API 正文里删掉的「还不能做」

2026-11-19 清理 API 文档和指南时，正文里散着写的「还不能做」也删了。下面这些是读者可能会去找的，记在这里。

| 原来在 | 还不能做的 |
| --- | --- |
| `api/cl-location-manager.md` | App 退到后台之后继续定位、进出某个区域时通知、指南针 |
| `api/ph-picker-filter/videosfilter.md` | 选中的视频取不出来 |
| `api/ui-font.md` | 随 App 打包的字体文件不能用（相当于 Web 的 `@font-face`），能用的字体都是系统自带的 |
| `api/ui-progress-view.md` | `fetch()` 得不到单个请求上传、下载了多少，只能按完成了几个请求算进度。注意：`guides/streaming-response.md` 讲了边下载边读响应，下载进度其实能算，这条要核对 |
| `api/ui-view.md` | 页面根视图的最小边距关不掉（`viewRespectsSystemMinimumLayoutMargins`） |
| `api/ui-view/showslargecontentviewer.md` | 还要给视图加一个系统的大内容查看交互才有效果，那个交互没接 |
| `api/ui-view/setneedsupdateconstraints.md` | 不能覆写 `updateConstraints` |
| `api/ui-window-scene.md` | 只支持 iPhone |
| `api/navigation-history.md` | Electron 的 `getAllEntries()`、`goToIndex()` |
| `api/ca-layer.md` | 系统引起的大小变化（比如旋转）没有通知，子图层没有办法自动跟上视图的大小 |
| `api/ca-property-animation.md` | `transform` 不能做动画（旋转和缩放）。这条作为「表里没有 `transform`」留在了正文里 |
| `api/ui-navigation-controller/toolbar.md` | 往导航控制器的工具条上放按钮要页面的 `toolbarItems`，没接 |
| `api/ui-navigation-controller.md` | 返回手势和页面里其他手势谁优先，要手势的委托，没接 |
| `api/ui-device.md` | 电量、设备的物理朝向 |
| `api/ui-pasteboard.md` | 剪贴板只能读写文字，图片、网址、颜色不能 |
| `api/ui-image-picker-controller.md` | 录视频、扫码、自己画取景界面 |
| `api/filesystem.md` | 文件被修改时的通知；分段读写（能处理的文件大小受可用内存限制） |
| `guides/fetch.md` | 表单格式（`multipart/form-data`）的上传；上传期间的进度 |
| `guides/local-notifications.md` | 远程推送的注册（向苹果注册、拿设备令牌） |
| `guides/multiline-text.md` | 在字符显示之前拦住它 |
| `guides/native-modules.md` | 把 JS 的函数传给原生，现在用事件代替 |
| `guides/project-config.md` | 屏幕方向固定竖屏；深色模式下启动屏用同一张图 |
| `guides/your-own-app.md` | 一条命令编译并启动；要先装 XcodeGen；改了 JS 不用重新编译；Android |
