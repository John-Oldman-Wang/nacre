// URL 解析：照网页标准（WHATWG URL）把一个 URL 拆成各部分。底下用的是 ada。
//
// 这个目录现在只有 Android 编（android/runtime/src/main/cpp/CMakeLists.txt），
// iOS 的工程不引它，iOS 还是用 NSURLComponents。两端要不要统一用它，以后单独讨论。
// ada 本身不进仓库，由 android/scripts/fetch-ada.sh 下载。
#pragma once

#include <string>

namespace nacre {

// 解析 url。base 为空串表示没有基准：我们没有 location，相对 URL 无依可循，
// 这种情况返回解析失败。
//
// 成功返回各部分的 JSON，字段和 iOS 的 ParseURL 一样（core 的 22-url.js 按它们读）：
// protocol、username、password、hostname、host、port、pathname、search、hash、origin。
// 失败返回空串。
std::string ParseUrlParts(const std::string& url, const std::string& base);

}  // namespace nacre
