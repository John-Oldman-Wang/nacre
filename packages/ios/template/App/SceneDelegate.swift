import UIKit

/// 场景的生命周期通过通知转发给 JS（见 Runtime/NacreRuntime.mm），这里不做任何事。
/// 窗口和根页面由 JS 创建——见 JS/main.js 里对 sceneconnect 的处理。
///
/// 别的 App 或者一条链接打开这个 App 时，系统调的是这个类的方法
/// （scene(_:openURLContexts:) 那几个）。它们也不用写在这里：运行时启动时
/// 会给这个类补上，转成 JS 的 openurl 事件。这里自己实现了的话，运行时先调
/// 这里的，再转发。
final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
}
