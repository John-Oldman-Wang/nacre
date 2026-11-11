// 图层这个域在方法通道上的分支。
//
// 一个域一个文件、装它在所有通道上的分支，每个入口返回「认不认领」——
// 新写的分发链按已定的规矩来，将来再拆才是纯搬家。
//
// 这里只有层级操作。子图层**不走 Auto Layout**：iOS 上 CALayer 的
// autoresizingMask 和 layoutManager 都标了 API_UNAVAILABLE(ios)，约束也
// 不作用于图层，所以 frame 只能由 JS 自己设。见 docs/internals/ca-layer.md。
#import "NacreBridge.h"

namespace nacre_bridge {

bool LayerCallMethod(id object, NSString* sel, const NacreArgs& args,
                     std::string* out, std::string* error) {
  if (![object isKindOfClass:CALayer.class]) return false;
  CALayer* layer = (CALayer*)object;
  auto layerArg = [&](size_t i) -> CALayer* {
    id v = args.object(i);
    return [v isKindOfClass:CALayer.class] ? (CALayer*)v : nil;
  };

  if ([sel isEqualToString:@"addSublayer:"]) {
    CALayer* child = layerArg(0);
    if (child == nil) {
      *error = "addSublayer: expects a CALayer";
      *out = "null";
      return true;
    }
    [layer addSublayer:child];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"insertSublayer:atIndex:"]) {
    CALayer* child = layerArg(0);
    if (child == nil) {
      *error = "insertSublayer: expects a CALayer";
      *out = "null";
      return true;
    }
    // 下标越界 UIKit 会抛，错误来自调用方，接住变成 TypeError
    @try {
      [layer insertSublayer:child atIndex:(unsigned)[args.value(1) unsignedIntValue]];
    } @catch (NSException* e) {
      *error = [NSString stringWithFormat:@"insertSublayer:atIndex: %@", e.reason].UTF8String;
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"insertSublayer:above:"] ||
      [sel isEqualToString:@"insertSublayer:below:"]) {
    CALayer* child = layerArg(0);
    CALayer* sibling = layerArg(1);
    if (child == nil || sibling == nil) {
      *error = "insertSublayer: expects two CALayers";
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"insertSublayer:above:"]) {
      [layer insertSublayer:child above:sibling];
    } else {
      [layer insertSublayer:child below:sibling];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeFromSuperlayer"]) {
    [layer removeFromSuperlayer];
    *out = "null";
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
