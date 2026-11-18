// 路径域的枚举。现在只有一个：圆角矩形要圆哪几个角。
//
// 字符串 ↔ 数值的映射只能放原生层，理由同其他枚举文件。
#import "NacreBridge.h"

namespace nacre_bridge {

// 哪几个角要圆。名字是 ObjC 常量去掉 UIRectCorner 前缀、首字母小写。
//
// 这里的 top / bottom 是**视觉上的**上下，和 CACornerMask 的 minY / maxY
// 说的是同一件事——UIKit y 轴朝下，所以 minY 就是 top。两套名字不一样是
// 因为 Apple 自己就起了两套，我们按各自的头文件来，不去统一。
//
// 不收 allCorners：它的值是 ~0，不是「四个位或起来」，往返不回来。
// 要四个角全圆就四个名字都写。
NACRE_MASK_MAP(RectCorner, UIRectCorner,
               @"topLeft": @(UIRectCornerTopLeft),
               @"topRight": @(UIRectCornerTopRight),
               @"bottomLeft": @(UIRectCornerBottomLeft),
               @"bottomRight": @(UIRectCornerBottomRight))

}  // namespace nacre_bridge
