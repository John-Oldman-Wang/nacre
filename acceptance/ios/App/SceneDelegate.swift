import UIKit

/// 场景的生命周期通过通知转发给 JS（见 Runtime/NacreRuntime.mm），这里不做任何事。
/// 窗口和根页面由 JS 创建——见 JS/main.js 里对 sceneconnect 的处理。
final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
}
