// 示例原生模块（@nacrejs/example-module）。
//
// 它有两个用处：给「怎么写自己的原生模块」当样板，以及给验收当被调的那个模块
// （acceptance/src/steps/native-modules.js）。所以它的方法大多是把值原样交回
// 去、故意报错、在后台线程上兑现这一类——真的模块里放的是你自己的 SDK 调用。
//
// 它是用 Swift 写的，**只用运行时公开的接口**：import Nacre 之后只碰
// NacreModule 和 NacreModuleProvider（见 ios/Runtime/NacreModule.h）。
// 第三方的模块能拿到的也就是这些。
//
// Swift 没有 +load，登记走的是「framework 的主类」这条路：这个 target 的
// Info.plist 里 NSPrincipalClass 是 NacreExampleModuleProvider（见 ios/project.yml
// 里的 INFOPLIST_KEY_NSPrincipalClass），运行时在 JS 第一次用到
// application.nativeModules 时找到它。
import CryptoKit
import Foundation
import Nacre
import UIKit

// @objc(…) 把类在 ObjC 运行时里的名字定下来。不写的话名字前面带模块名
// （NacreExampleModule.ExampleModuleProvider），NSPrincipalClass 就得照那个写
@objc(NacreExampleModuleProvider)
final class ExampleModuleProvider: NSObject, NacreModuleProvider {
  static func nacreModules() -> [NacreModule] {
    // 第二个故意用了同一个名字：它登记不上，运行时打一条警告，先登记的不受影响
    // （验收里盯着这一条）。真的模块里不会这样写
    let duplicate = NacreModule(name: "example")
    duplicate.addMethod("shadow") { _ in "from the duplicate" }
    return [makeExampleModule(), duplicate]
  }
}

/// JS 给的值到了原生是什么类型。布尔和数都是 NSNumber，要用 isBoolean 分
private func typeName(_ value: Any?) -> String {
  guard let value = value, !(value is NSNull) else { return "null" }
  if value is String { return "string" }
  if value is Data { return "bytes" }
  if value is [Any] { return "array" }
  if value is [String: Any] { return "object" }
  if value is NSNumber { return NacreModule.isBoolean(value) ? "boolean" : "number" }
  return "unknown"
}

/// JS 给的一个数。布尔不算
private func number(_ value: Any?) -> Double? {
  guard let value = value as? NSNumber, !NacreModule.isBoolean(value) else { return nil }
  return value.doubleValue
}

/// 第 i 个字节是 i 的低 8 位
private func patternBytes(_ count: Int) -> Data {
  return Data((0..<max(count, 0)).map { UInt8($0 & 0xff) })
}

/// 模块自己留着的一份数据，每次交出去的都是这同一个对象。特意用 NSData 而不是
/// Data：不可变的 NSData 被 copy 时得到的还是它自己，验收靠它盯住「JS 拿到的
/// 是不是独立的一份」
private let cachedBytes = NSData(data: patternBytes(64))

/// 照参数造一个错误：name、message，第三个参数给了数就带上 code
private func makeError(_ args: [Any]) -> NSError {
  let name = args.first as? String ?? "Error"
  let message = args.count > 1 ? (args[1] as? String ?? "") : ""
  if args.count > 2, let code = number(args[2]) {
    return NacreModule.error(name: name, message: message, code: Int(code)) as NSError
  }
  return NacreModule.error(name: name, message: message) as NSError
}

private let background = DispatchQueue(label: "example-module.background", qos: .utility)

private func makeExampleModule() -> NacreModule {
  let module = NacreModule(name: "example")

  // ---- 事件：先声明，才能发 ----
  module.addEvent("tick")
  module.addEvent("data")

  // ---- 同步方法 ----
  // 处理函数在主线程上被调，返回值当场交给 JS。返回 nil 是 null

  module.addMethod("echo") { args in args.first }
  module.addMethod("echoAll") { args in args }
  module.addMethod("argumentCount") { args in args.count }
  module.addMethod("typeOf") { args in typeName(args.first) }
  module.addMethod("isMainThread") { _ in Thread.isMainThread }

  // 发一次系统的内存警告通知，和模拟器菜单里 Simulate Memory Warning 一样。
  // 验收用它测「内存警告之后运行时让 V8 回收」：命令行触发不了这个通知
  // （见 docs/internals/runtime.md）。真的模块里不会有这种方法
  module.addMethod("simulateMemoryWarning") { _ in
    NotificationCenter.default.post(name: UIApplication.didReceiveMemoryWarningNotification,
                                    object: UIApplication.shared)
    return nil
  }

  module.addMethod("add") { args in
    // 参数不对就报错：返回一个 NSError，JS 那边 call() 把它抛出来
    guard args.count == 2, let a = number(args[0]), let b = number(args[1]) else {
      return NacreModule.error(name: "TypeError", message: "add needs two numbers")
    }
    return a + b
  }

  // 二进制：JS 的 ArrayBuffer 到这里是 Data，交回去的 Data 到 JS 是 ArrayBuffer
  module.addMethod("bytes") { args in patternBytes(Int(number(args.first) ?? 0)) }
  // 模块留着的那份数据的第 i 个字节（验收用：看它有没有被 JS 改掉）
  module.addMethod("cachedByte") { args in
    let index = Int(number(args.first) ?? 0)
    guard index >= 0, index < cachedBytes.length else {
      return NacreModule.error(name: "RangeError", message: "cachedByte index out of range")
    }
    return Int(cachedBytes.bytes.load(fromByteOffset: index, as: UInt8.self))
  }
  module.addMethod("sha256") { args in
    guard let data = args.first as? Data else {
      return NacreModule.error(name: "TypeError", message: "sha256 needs binary data")
    }
    return Data(SHA256.hash(data: data))
  }

  module.addMethod("fail") { args in makeError(args) }
  // 别处来的 NSError（第三方 SDK 给的那种）可以原样返回，code 和 domain 都带到 JS
  module.addMethod("failWithNSError") { _ in
    NSError(domain: NSCocoaErrorDomain, code: 260,
            userInfo: [NSLocalizedDescriptionKey: "no such file"])
  }
  // 过不了桥的值：JS 那边得到一个 TypeError，不会被悄悄换成别的
  module.addMethod("unsupported") { _ in Date() }
  module.addMethod("nonFinite") { _ in Double.nan }

  // 发事件。第一个参数是事件名，第二个是带的数据
  module.addMethod("emit") { [unowned module] args in
    guard let type = args.first as? String else {
      return NacreModule.error(name: "TypeError", message: "emit needs an event type")
    }
    module.emit(type, detail: args.count > 1 ? args[1] : nil)
    return nil
  }
  module.addMethod("emitUnsupported") { [unowned module] args in
    module.emit(args.first as? String ?? "tick", detail: ["when": Date()])
    return nil
  }

  // ---- 异步方法 ----
  // 处理函数同样在主线程上被调。resolve / reject 可以在任何线程调，只调一次

  module.addAsyncMethod("echoAsync") { args, resolve, _ in resolve(args.first) }

  // 耗时的活自己派到后台。这里用「等一会儿」代替
  module.addAsyncMethod("echoLater") { args, resolve, _ in
    let value = args.first
    let delay = (number(args.count > 1 ? args[1] : nil) ?? 0) / 1000
    background.asyncAfter(deadline: .now() + delay) { resolve(value) }
  }

  // 照 UIKit「手指离开滚动视图」的做法调委托的 scrollViewWillEndDragging:
  // withVelocity:targetContentOffset:。参数：滚动视图的 tag、速度 x / y（pt/ms）、
  // 系统算出来的停点 x / y。兑现成委托改完之后的停点 { x, y }；找不到这个 tag
  // 的滚动视图时是 null。真的拖动要手指，自动跑的验收靠它。真的模块里不会有这种方法
  module.addMethod("simulateDragEnd") { args in
    guard args.count == 5, let tag = number(args[0]), let vx = number(args[1]),
          let vy = number(args[2]), let tx = number(args[3]), let ty = number(args[4]) else {
      return NacreModule.error(name: "TypeError", message: "simulateDragEnd needs tag, vx, vy, x, y")
    }
    let window = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }
    guard let scroll = window?.viewWithTag(Int(tag)) as? UIScrollView else { return nil }
    var target = CGPoint(x: tx, y: ty)
    scroll.delegate?.scrollViewWillEndDragging?(scroll, withVelocity: CGPoint(x: vx, y: vy),
                                                targetContentOffset: &target)
    return ["x": target.x, "y": target.y]
  }

  // 照输入法的做法给当前正在编辑的输入框设一段组字：给字符串是
  // setMarkedText:selectedRange:（光标在这段的末尾），给 null 是 unmarkText
  // （选完字，组字结束、文字留下）。真的输入法要真实键盘，自动跑的验收靠它。
  // 没有正在编辑的输入框时报错。真的模块里不会有这种方法
  module.addMethod("simulateMarkedText") { args in
    let window = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }
    func editing(in view: UIView?) -> (UIResponder & UITextInput)? {
      guard let view = view else { return nil }
      if view.isFirstResponder, let input = view as? (UIResponder & UITextInput) { return input }
      for sub in view.subviews { if let found = editing(in: sub) { return found } }
      return nil
    }
    guard let input = editing(in: window) else {
      return NacreModule.error(name: "Error", message: "no text input is being edited")
    }
    if let text = args.first as? String {
      input.setMarkedText(text, selectedRange: NSRange(location: (text as NSString).length, length: 0))
    } else {
      input.unmarkText()
    }
    return nil
  }

  // 照 UIKit「用户把卡片往下拖走」的顺序走一遍：先调卡片的呈现委托
  // presentationControllerWillDismiss:，关掉（不带动画），关完再调
  // presentationControllerDidDismiss:。真的拖拽要手指，自动跑的验收靠它。
  // 兑现成被关掉的那一页的类名；没有弹出的页面时兑现 null。真的模块里不会有这种方法
  module.addAsyncMethod("simulateSheetSwipeDown") { _, resolve, _ in
    let window = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }
    var top = window?.rootViewController
    while let next = top?.presentedViewController { top = next }
    guard let page = top, let presenter = page.presentingViewController else {
      resolve(nil)
      return
    }
    let controller = page.presentationController
    let delegate = controller?.delegate
    if let controller = controller {
      delegate?.presentationControllerWillDismiss?(controller)
    }
    presenter.dismiss(animated: false) {
      if let controller = controller {
        delegate?.presentationControllerDidDismiss?(controller)
      }
      resolve(NSStringFromClass(type(of: page)))
    }
  }

  module.addAsyncMethod("threads") { _, resolve, _ in
    let handlerOnMain = Thread.isMainThread
    background.async {
      resolve(["handlerOnMain": handlerOnMain, "settledOnMain": Thread.isMainThread])
    }
  }

  module.addAsyncMethod("failLater") { args, _, reject in
    let error = makeError(args)
    background.asyncAfter(deadline: .now() + 0.01) { reject(error) }
  }

  module.addAsyncMethod("bytesAsync") { args, resolve, _ in
    let count = Int(number(args.first) ?? 0)
    background.async { resolve(patternBytes(count)) }
  }
  // 每次交回同一个 NSData 对象
  module.addAsyncMethod("cachedBytesAsync") { _, resolve, _ in resolve(cachedBytes) }
  module.addAsyncMethod("nestedBytesAsync") { _, resolve, _ in
    resolve(["head": Data([1, 2, 3]), "list": [Data([4]), "x"]] as [String: Any])
  }

  // 下面四个是故意写错的，验的是运行时怎么兜
  module.addAsyncMethod("settleTwice") { args, resolve, _ in
    resolve(args.first)
    resolve(args.count > 1 ? args[1] : nil)   // 第二次被忽略，运行时打一条警告
  }
  module.addAsyncMethod("resolveThenReject") { args, resolve, reject in
    resolve(args.first)
    reject(NacreModule.error(name: "Late", message: "ignored"))
  }
  // 两个回调一个都没调：它们被放掉的那一刻，运行时把 Promise 拒掉
  module.addAsyncMethod("drop") { _, _, _ in }
  module.addAsyncMethod("unsupportedAsync") { _, resolve, _ in resolve(Date()) }

  // 从后台线程发事件，发完再兑现
  module.addAsyncMethod("emitLater") { [unowned module] args, resolve, _ in
    let type = args.first as? String ?? "tick"
    let detail: Any? = args.count > 1 ? args[1] : nil
    let delay = (number(args.count > 2 ? args[2] : nil) ?? 0) / 1000
    background.asyncAfter(deadline: .now() + delay) {
      module.emit(type, detail: detail)
      resolve(nil)
    }
  }

  return module
}
