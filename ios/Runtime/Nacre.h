// Nacre 运行时的公开接口。
//
// 这是 framework 的 umbrella header：**凡是出现在这里的，就是我们对外的承诺**。
// 宿主 App 只该看见这些；`Bridge/` 和 `Engine/` 里的头都是内部的（它们带
// C++，Swift 也读不了）。
//
// 加一个新的公开接口 = 在这里 #import 一行，同时在工程描述里把那个头标成
// public。两处都做了才算真的暴露出去。
#import <Foundation/Foundation.h>

#import <Nacre/NacreRuntime.h>
