import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    /// 整个 App 共用一个 Nacre 运行时
    let runtime = NacreRuntime()

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // App 启动 → 初始化 V8 → 准备全局对象 → 加载并执行 JS（全部在 JS 线程上进行）
        if let scripts = Bundle.main.url(forResource: "JS", withExtension: nil) {
            runtime.start(withScriptsDirectory: scripts)
        } else {
            print("[nacre] JS directory not found in app bundle")
        }
        return true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}
