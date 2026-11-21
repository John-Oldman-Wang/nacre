# 远程推送

`@nacrejs/push`：`application.remoteNotifications`（`register()`、`unregister()`、`isRegistered`、`token`、`tokenchange`、`push`）和 `PushEvent`。2026-11-21 做的，形状和用户讨论过。

文件：`ios/Capabilities/Push/NacrePush.mm`、`ios/Capabilities/Push/Builtin/parts/push.js`、`packages/push/`、`acceptance/src/steps/push.js`；示例模块里的三个测试替身（`simulatePushToken`、`simulatePushFailure`、`simulateSilentPush`）。

## 为什么单独成包

它要用户的工程带 `aps-environment` 这条 entitlement，签名用的描述文件也得开着推送能力。放进核心，每个 App 都会被要求写它、都签不了通配的描述文件。包的清单里声明要这一条，内容（`development` / `production`）由项目写在 `nacre.config.json` 里。

静默推送要的后台模式（`UIBackgroundModes` 的 `remote-notification`）不强制：只用能看见的推送的 App 不需要它。

能看见的推送（横幅、声音）到了和被点了，系统交给通知中心的委托，远程的和本地的是同一条路，已经由 `@nacrejs/user-notifications` 派发。这个包只管注册和静默推送。

## 给 App 的委托补方法

拿到令牌、注册失败、收到静默推送，系统都交给 **App 的委托**（`UIApplicationDelegate`）。它是启动壳里的类，启动壳要设计成不需要被改，所以照 `openurl` 给场景委托补方法的做法，在运行期给它的类补上这三个方法：没实现的加上，实现了的包一层，先调原来的。

补的时机是 `-[UIApplication setDelegate:]`：这个包的 `+load` 换掉它，在原来的实现之前先补好委托的类。原因是 UIKit 在设委托的那一刻记下委托会回答哪些方法，之后才补上的不一定来问。`+load` 在 `main()` 之前，那时委托还没设。`register()` 时再补一次（幂等），防宿主在别处、更早设了委托。

委托自己实现了静默推送那个方法时，完成回调只能调一次，由它回答系统；`push` 事件照样派发，但 `waitUntil` 不再决定结果。

## register()：同时等着的只注册一次

系统每调一次 `registerForRemoteNotifications` 就回一次。最初每个 `register()` 都去调，同时两个就回两次：第一次回应把两个都兑现了，第二次晚到，那时已经没人等，却会把 `token` 改掉。验收里撞到的就是这个（测试替身塞的令牌被晚到的真令牌冲掉）。改成：已经有人在等时只排队，不再调系统。

## push 事件：照 Web 推送的 ExtendableEvent

静默推送的完成回调要在 30 秒左右之内调（Apple 的文档），告诉系统「有新数据 / 没有 / 失败了」。JS 那一侧照 Web 推送的 `push` 事件：`waitUntil(promise)`，只能在派发的过程中调。

原生把推送作为内部事件 `@push` 派发在 `RemoteNotifications` 上，带着一个号和内容，完成回调按号记着。JS 建 `PushEvent`、派发，等 `waitUntil` 收下的 Promise 都落定再调回原生（`nacre:finishPush`）：都兑现是 `newData`，有一个拒绝是 `failed`，一个都没有是 `noData`。没有监听器时原生当场答 `noData`，不进 JS。

冷启动被静默推送唤醒时，入口文件顶层同步挂上的监听器赶得上：运行时在 `didFinishLaunching` 里就把入口文件跑完了，静默推送的回调在那之后。没有真的推送验过，见下面。

## 验收怎么验

真的注册取决于签名：平时验收用的通配描述文件没有推送能力，`register()` 被系统拒绝（中文系统上的原文「未找到应用程序的“aps-environment”的授权字符串」）；用一份开着推送能力的显式包名描述文件签名时，拿到 32 字节的真令牌，每次重新安装都不一样。这一段的结果只打印，按结果多验几条。

其余的由测试替身照系统的做法调委托：拿到令牌、注册失败、收到静默推送。两种签名下都要能过，难处在带推送能力时：替身抢先回答之后，系统对那一次注册的真回应还在路上，会晚到。处理办法：

- 要读 `token` 的断言放在替身回答的**同一轮**里（下一轮真令牌可能就到了）
- 往下走之前先等真回应到：让 `token` 先是替身给的值，真令牌一到就派发 `tokenchange`，等这个事件；不带推送能力时真回应是失败，没人在等，不改任何东西，不用等
- `tokenchange` 的几条只用替身，不再调 `register()`

带推送能力的签名怎么跑：描述文件和包名都从环境变量给，仓库里不写任何账号相关的东西。

```bash
cd acceptance && NACRE_DEVICE_BUNDLE_ID=<登记过的包名> NACRE_PROFILE=<描述文件的路径> npm run verify -- --device --steps=push
```

签名脚本在通配和正好是这个包名的描述文件都能用时，优先用后者：推送这类能力只有它签得进去。

## 没验证的

- 真的从服务器发一条推送到手机。2026-11-21 试过一次：用一份开着推送能力的描述文件签名、真令牌拿到了，从 Mac 用一把测试环境的推送密钥往 Apple 的测试服务器发，每条都回 200；但 Apple 推送控制台的送达记录（Delivery Log，按 `apns-unique-id` 查，只有测试环境有）一直是 discarded / stored as device was offline。换手机热点、重启手机都一样，这台手机没连上测试环境的推送服务器。所以从 Apple 到手机、再进 App 的 `push` 事件这一段没验到。发送时要带 `apns-expiration`，不带的话手机不在线时 Apple 直接丢掉，不存
- 换一台手机或者换一个网络再试时，先在送达记录里看是不是 delivered
- App 在后台、没在运行时被静默推送唤醒；系统等 `waitUntil` 最多多久
- `production` 环境
