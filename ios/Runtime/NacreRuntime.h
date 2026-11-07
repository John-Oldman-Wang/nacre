// Nacre 运行时的 iOS 入口（ObjC 接口，供 Swift 调用）。
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NacreRuntime : NSObject

/// 启动运行时：创建 JS 线程 → 初始化 V8 → 准备全局对象 → 加载并执行 main.js。
/// @param directory App Bundle 中存放 JS 的目录
- (void)startWithScriptsDirectory:(NSURL *)directory;

@end

NS_ASSUME_NONNULL_END
