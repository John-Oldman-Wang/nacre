// 密码学用的系统能力。现在只有随机源；摘要和签名（CommonCrypto）以后也放这里。

#import "NacreBridge.h"

#import <Security/Security.h>

namespace nacre_bridge {

// crypto.getRandomValues 的随机源。SecRandomCopyBytes 是 Apple 给密码学用途
// 指定的那一个（头文件：generates cryptographically secure random bytes）。
// 失败返回 NO，引擎据此让 JS 抛——不拿别的随机源顶上，那样错了没人知道
bool FillRandom(void* bytes, size_t length) {
  if (length == 0) return true;
  if (bytes == nullptr) return false;
  return SecRandomCopyBytes(kSecRandomDefault, length, bytes) == errSecSuccess;
}

}  // namespace nacre_bridge
