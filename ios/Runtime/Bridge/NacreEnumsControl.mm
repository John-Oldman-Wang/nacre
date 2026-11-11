// 控件、按钮、导航条按钮
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {

// 控件事件。16 个具体事件，另外 5 个是聚合掩码（AllTouchEvents 之类），
// 不暴露——JS 侧一次订阅一个类型。
//
// 名字是 ObjC 常量去掉 UIControlEvent 前缀、首字母小写。
NACRE_ENUM_MAP(ControlEvent, UIControlEvents,
               @"touchDown": @(UIControlEventTouchDown),
               @"touchDownRepeat": @(UIControlEventTouchDownRepeat),
               @"touchDragInside": @(UIControlEventTouchDragInside),
               @"touchDragOutside": @(UIControlEventTouchDragOutside),
               @"touchDragEnter": @(UIControlEventTouchDragEnter),
               @"touchDragExit": @(UIControlEventTouchDragExit),
               @"touchUpInside": @(UIControlEventTouchUpInside),
               @"touchUpOutside": @(UIControlEventTouchUpOutside),
               @"touchCancel": @(UIControlEventTouchCancel),
               @"valueChanged": @(UIControlEventValueChanged),
               @"primaryActionTriggered": @(UIControlEventPrimaryActionTriggered),
               @"menuActionTriggered": @(UIControlEventMenuActionTriggered),
               @"editingDidBegin": @(UIControlEventEditingDidBegin),
               @"editingChanged": @(UIControlEventEditingChanged),
               @"editingDidEnd": @(UIControlEventEditingDidEnd),
               @"editingDidEndOnExit": @(UIControlEventEditingDidEndOnExit))

// 控件状态。normal 是 0，所以它在掩码里永远拆不出来——
// 读的那一侧单独处理：掩码为 0 时给 ['normal']。
NACRE_MASK_MAP(ControlState, UIControlState,
               @"highlighted": @(UIControlStateHighlighted),
               @"disabled": @(UIControlStateDisabled),
               @"selected": @(UIControlStateSelected),
               @"focused": @(UIControlStateFocused))

NACRE_ENUM_MAP(ControlHorizontalAlignment, UIControlContentHorizontalAlignment,
               @"center": @(UIControlContentHorizontalAlignmentCenter),
               @"left": @(UIControlContentHorizontalAlignmentLeft),
               @"right": @(UIControlContentHorizontalAlignmentRight),
               @"fill": @(UIControlContentHorizontalAlignmentFill),
               @"leading": @(UIControlContentHorizontalAlignmentLeading),
               @"trailing": @(UIControlContentHorizontalAlignmentTrailing))

NACRE_ENUM_MAP(ControlVerticalAlignment, UIControlContentVerticalAlignment,
               @"center": @(UIControlContentVerticalAlignmentCenter),
               @"top": @(UIControlContentVerticalAlignmentTop),
               @"bottom": @(UIControlContentVerticalAlignmentBottom),
               @"fill": @(UIControlContentVerticalAlignmentFill))

// 按钮的外观类型。plain 是 tvOS 专有，roundedRect 是 system 的别名，都不收。
NACRE_ENUM_MAP(ButtonType, UIButtonType,
               @"custom": @(UIButtonTypeCustom),
               @"system": @(UIButtonTypeSystem),
               @"detailDisclosure": @(UIButtonTypeDetailDisclosure),
               @"infoLight": @(UIButtonTypeInfoLight),
               @"infoDark": @(UIButtonTypeInfoDark),
               @"contactAdd": @(UIButtonTypeContactAdd),
               @"close": @(UIButtonTypeClose))

// 按钮的语义角色，影响系统给它的配色
NACRE_ENUM_MAP(ButtonRole, UIButtonRole,
               @"normal": @(UIButtonRoleNormal),
               @"primary": @(UIButtonRolePrimary),
               @"cancel": @(UIButtonRoleCancel),
               @"destructive": @(UIButtonRoleDestructive))

NACRE_ENUM_MAP(BarButtonSystemItem, UIBarButtonSystemItem,
               @"done": @(UIBarButtonSystemItemDone),
               @"cancel": @(UIBarButtonSystemItemCancel),
               @"edit": @(UIBarButtonSystemItemEdit),
               @"save": @(UIBarButtonSystemItemSave),
               @"add": @(UIBarButtonSystemItemAdd),
               @"flexibleSpace": @(UIBarButtonSystemItemFlexibleSpace),
               @"fixedSpace": @(UIBarButtonSystemItemFixedSpace),
               @"compose": @(UIBarButtonSystemItemCompose),
               @"reply": @(UIBarButtonSystemItemReply),
               @"action": @(UIBarButtonSystemItemAction),
               @"organize": @(UIBarButtonSystemItemOrganize),
               @"bookmarks": @(UIBarButtonSystemItemBookmarks),
               @"search": @(UIBarButtonSystemItemSearch),
               @"refresh": @(UIBarButtonSystemItemRefresh),
               @"stop": @(UIBarButtonSystemItemStop),
               @"camera": @(UIBarButtonSystemItemCamera),
               @"trash": @(UIBarButtonSystemItemTrash),
               @"play": @(UIBarButtonSystemItemPlay),
               @"pause": @(UIBarButtonSystemItemPause),
               @"rewind": @(UIBarButtonSystemItemRewind),
               @"fastForward": @(UIBarButtonSystemItemFastForward),
               @"undo": @(UIBarButtonSystemItemUndo),
               @"redo": @(UIBarButtonSystemItemRedo),
               @"pageCurl": @(UIBarButtonSystemItemPageCurl),
               @"close": @(UIBarButtonSystemItemClose),
               @"writingTools": @(UIBarButtonSystemItemWritingTools))

// 第二个带别名的枚举。iOS 26 的头文件：
//   UIBarButtonItemStyleProminent = 2
//   UIBarButtonItemStyleDone      = UIBarButtonItemStyleProminent
// 所以 done 和 prominent 是同一个值。还有一个 Bordered = 1 已经废弃，不暴露。
// 和 UIStackViewAlignment 一样用有序 pairs：主名在前（头文件里 Done 是被赋
// 值的那一侧，所以主名是 prominent），别名在后，读出来只给主名。
static NSArray<NSArray*>* BarButtonItemStylePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"plain", @(UIBarButtonItemStylePlain) ],
      @[ @"prominent", @(UIBarButtonItemStyleProminent) ],
      // 别名：写得进去，读不出来
      @[ @"done", @(UIBarButtonItemStyleDone) ],
    ];
  });
  return pairs;
}

BOOL BarButtonItemStyleFromName(NSString* name, UIBarButtonItemStyle* out) {
  if (![name isKindOfClass:NSString.class]) return NO;
  for (NSArray* pair in BarButtonItemStylePairs()) {
    if ([pair[0] isEqualToString:name]) {
      *out = (UIBarButtonItemStyle)[pair[1] integerValue];
      return YES;
    }
  }
  return NO;
}

NSString* NameForBarButtonItemStyle(UIBarButtonItemStyle value) {
  for (NSArray* pair in BarButtonItemStylePairs()) {
    if ([pair[1] integerValue] == (NSInteger)value) return pair[0];
  }
  return nil;
}

NSString* NamesForBarButtonItemStyle(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in BarButtonItemStylePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// UIBarButtonItem 的事件名。它不是 UIControl，没有控件事件，只有 target/action
// 一个点——但名字沿用 UIButton 那个 primaryActionTriggered：JS 开发者在按钮和
// 导航条按钮之间切换时不该还要记两个名字。
static NSArray<NSString*>* BarButtonEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ names = @[ @"primaryActionTriggered" ]; });
  return names;
}

BOOL IsBarButtonEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [BarButtonEventNamesList() containsObject:name];
}

NSString* NamesForBarButtonEvent(void) {
  return [BarButtonEventNamesList() componentsJoinedByString:@" / "];
}

// 状态作参数：'normal' 是 0，位掩码表里没有它，但它是最常用的写法，
// 所以单独认一下。读 state 的那一侧是反过来的——掩码为 0 时给 ['normal']。
BOOL ControlStateArgFromNames(id value, UIControlState* out, id* bad) {
  *bad = nil;
  if (![value isKindOfClass:NSArray.class]) return NO;
  UIControlState mask = UIControlStateNormal;
  for (id name in (NSArray*)value) {
    if ([name isKindOfClass:NSString.class] && [name isEqualToString:@"normal"]) continue;
    UIControlState bit;
    id inner = nil;
    if (!ControlStateFromNames(@[ name ], &bit, &inner)) {
      *bad = name;
      return NO;
    }
    mask |= bit;
  }
  *out = mask;
  return YES;
}

NSString* NamesForControlStateArg(void) {
  return [@"normal / " stringByAppendingString:NamesForControlState()];
}

// 哪些控件事件带触点。
//
// 按事件**类型**分，和 Web 一样——MouseEvent 有 clientX，KeyboardEvent
// 根本没有这个字段，不是「有但为 null」。
//
// 三类：
//   touch*        带。九个
//   editing*      文本编辑，没有触点
//   valueChanged / primaryActionTriggered / menuActionTriggered
//                 **和触点没有固定关系**：多数来自一次拖动或点击，但程序
//                 改 slider.value、或者 sendActionsForControlEvents 也会发。
//                 不确定就不承诺
//
// 表只在这里有一份，JS 侧不镜像——原生只给这九个带负载，JS 那边「收到
// 负载就挂上」，不用知道名单。
BOOL IsTouchControlEvent(NSString* name) {
  static NSSet<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = [NSSet setWithArray:@[
      @"touchDown", @"touchDownRepeat", @"touchDragInside", @"touchDragOutside",
      @"touchDragEnter", @"touchDragExit", @"touchUpInside", @"touchUpOutside",
      @"touchCancel",
    ]];
  });
  return [name isKindOfClass:NSString.class] && [names containsObject:name];
}

}  // namespace nacre_bridge
