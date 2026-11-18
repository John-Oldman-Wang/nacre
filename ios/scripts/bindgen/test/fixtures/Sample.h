// bindgen 用例的头文件：自成一体，不引入任何系统框架，clang 一下就解析完。
// 写法照 SDK 的头文件：NS_ENUM / NS_OPTIONS 展开之后就是下面这两个宏的样子。
#define NS_ENUM(_type, _name) enum __attribute__((enum_extensibility(open))) _name : _type _name; enum _name : _type
#define NS_OPTIONS(_type, _name) enum __attribute__((flag_enum, enum_extensibility(open))) _name : _type _name; enum _name : _type
#define NS_TYPED_ENUM __attribute__((swift_newtype(enum)))
#define API_DEPRECATED(...) __attribute__((deprecated(__VA_ARGS__)))
#define API_AVAILABLE(...)
#define NS_UNAVAILABLE __attribute__((unavailable))
#define NS_DESIGNATED_INITIALIZER __attribute__((objc_designated_initializer))

typedef signed char BOOL;
typedef long NSInteger;
typedef unsigned long NSUInteger;
typedef double CGFloat;

struct CGPoint { CGFloat x; CGFloat y; };
typedef struct CGPoint CGPoint;
// JS 那一侧没有对应的类的结构体
struct SampleRange { NSInteger location; NSInteger length; };
typedef struct SampleRange SampleRange;

__attribute__((objc_root_class))
@interface NSObject
- (instancetype _Nonnull)init;
@end

@interface NSString : NSObject
@end

typedef NSString *SampleStyleName NS_TYPED_ENUM;
extern SampleStyleName _Nonnull const SampleStyleNamePlain;
extern SampleStyleName _Nonnull const SampleStyleNameFancy;

typedef NS_ENUM(NSInteger, SampleMode) {
    SampleModeAutomatic = 0,
    SampleModeURLOnly,
    SampleModeDefault = SampleModeAutomatic,
};

typedef NS_OPTIONS(NSUInteger, SampleEdge) {
    SampleEdgeNone = 0,
    SampleEdgeTop = 1 << 0,
    SampleEdgeLeft = 1 << 1,
    SampleEdgeAll = SampleEdgeTop | SampleEdgeLeft,
};

// 手写的那一侧已经有自己的转换的位掩码（照 UIControlState：normal 是 0，但它是一个名字）
typedef NS_OPTIONS(NSUInteger, SampleState) {
    SampleStateNormal = 0,
    SampleStateHighlighted = 1 << 0,
    SampleStateDisabled = 1 << 1,
};

// 值的前缀不是类型名（SDK 里有这种，比如 NSLineBreakMode 的值是 NSLineBreakBy…）
typedef NS_ENUM(NSInteger, SampleBreakMode) {
    SampleBreakByWord = 0,
    SampleBreakByChar,
};

// 单个值标了废弃：标注里自己带着逗号
typedef NS_ENUM(NSInteger, SampleKind) {
    SampleKindNew = 0,
    SampleKindOld API_DEPRECATED("use SampleKindNew, please") = 1,
    SampleKindLast,
    // 这个平台上不可用的值（UITextViewBorderStyleRoundedRect 在 iOS 上就是）：引用它编译不过
    SampleKindGone NS_UNAVAILABLE,
};

@protocol SampleDelegate;
@class SampleItem;

@interface SampleView : NSObject
- (instancetype _Nonnull)initWithFrame:(CGPoint)origin NS_DESIGNATED_INITIALIZER;
+ (instancetype _Nonnull)viewWithName:(NSString * _Nonnull)name;

@property (nonatomic, getter=isOn) BOOL on;
@property (nonatomic, readonly) SampleMode mode;
@property (nonatomic) SampleEdge edges;
@property (nonatomic, copy, nullable) NSString *title;
@property (nonatomic, weak, nullable) id<SampleDelegate> delegate;
@property (nonatomic, strong, nonnull) SampleItem *item;
@property (class, nonatomic, readonly, nonnull) SampleView *sharedView;
@property (nonatomic) CGPoint origin;
@property (nonatomic) CGFloat legacyValue API_DEPRECATED("use origin");

- (void)setOn:(BOOL)on animated:(BOOL)animated;
- (void)insertItem:(SampleItem * _Nonnull)item atIndex:(NSInteger)index;
- (void)insertItem:(SampleItem * _Nonnull)item aboveItem:(SampleItem * _Nonnull)sibling;
- (nullable SampleItem *)itemAtIndex:(NSInteger)index;
- (void)loadWithCompletionHandler:(void (^ _Nonnull)(BOOL finished))completionHandler;
- (void)oldMethod API_DEPRECATED("gone");
- (void)forbidden NS_UNAVAILABLE;
+ (NSInteger)instanceCount;
- (void)addMarker:(SampleItem * _Nonnull)marker;
- (void)removeMarker:(SampleItem * _Nonnull)marker;
- (NSInteger)markerCountWithScale:(CGFloat)scale;
@end

// 一个类实现了、但头文件里只写在协议上的成员（照 UITextInputTraits：键盘的设置）
@protocol SampleTraits
@optional
@property (nonatomic) BOOL secure;
@property (nonatomic) SampleMode traitMode;
@end

@interface SampleView (SampleGeometry)
@property (nonatomic, readonly) CGFloat width;
- (void)sizeToFit;
@end

@interface SampleItem : NSObject
@end

// 生成器的用例用的类：五种简单类型的属性各有，另有几种现在不生成的
@class UIColor;
@interface SampleWell : SampleItem
@property (nonatomic, getter=isEnabled) BOOL enabled;
@property (nonatomic) CGFloat radius;
@property (nonatomic) float ratio;
@property (nonatomic) NSInteger count;
@property (nonatomic, copy, nullable) NSString *title;
@property (nonatomic, copy, nonnull) NSString *name;
@property (nonatomic) SampleMode mode;
@property (nonatomic, readonly) SampleKind kind;
@property (nonatomic, strong, nullable) UIColor *tint;
@property (nonatomic) SampleEdge edges;
@property (nonatomic) CGPoint origin;
@property (nonatomic, strong, nullable) SampleItem *item;
// 对象属性：所有权照头文件里写的
@property (nonatomic, weak, nullable) SampleItem *owner;
@property (nonatomic, readonly, nonnull) SampleItem *currentItem;
@property (nonatomic, copy, nonnull) SampleItem *templateItem;
@property (nonatomic, strong, nullable) SampleView *panel;
@property (nonatomic) CGFloat futureValue API_AVAILABLE(ios(99.0));
@property (nonatomic) CGFloat oldValue API_DEPRECATED("gone");

// 方法：参数和返回值都是简单类型的会生成
- (void)reset;
- (void)setEnabled:(BOOL)enabled animated:(BOOL)animated;
- (void)setRadius:(CGFloat)radius forSegmentAtIndex:(NSUInteger)index;
- (CGFloat)radiusForSegmentAtIndex:(NSUInteger)index;
- (BOOL)isEnabledForSegmentAtIndex:(NSUInteger)index;
- (nullable NSString *)titleForSegmentAtIndex:(NSUInteger)index;
- (void)setTitle:(nullable NSString *)title forSegmentAtIndex:(NSUInteger)index;
- (SampleMode)modeForKind:(SampleKind)kind;
- (float)ratioForCount:(NSInteger)count;
// 位掩码：JS 里是名字的数组
@property (nonatomic, readonly) SampleState state;
@property (nonatomic) SampleRange range;
@property (nonatomic, readonly) CGPoint anchor;
- (void)applyRadius:(CGFloat)radius toEdges:(SampleEdge)edges;
- (SampleEdge)edgesForCount:(NSInteger)count;
- (void)setLabel:(nullable NSString *)label forState:(SampleState)state;
// 带对象的方法：所有权按方法名的动词归类
- (void)setIcon:(nullable SampleItem *)icon forState:(SampleState)state;
- (nullable SampleItem *)iconForState:(SampleState)state;
- (void)setBadge:(nullable SampleItem *)badge forSegmentAtIndex:(NSUInteger)index;
- (nullable SampleItem *)badgeForSegmentAtIndex:(NSUInteger)index;
- (void)addChild:(SampleItem * _Nonnull)child;
- (void)removeChild:(SampleItem * _Nonnull)child;
- (BOOL)containsChild:(SampleItem * _Nonnull)child;
- (void)removeOrphan:(SampleItem * _Nonnull)orphan;
- (nullable SampleItem *)childAtIndex:(NSUInteger)index;
- (void)insertPart:(SampleItem * _Nonnull)part atIndex:(NSUInteger)index;
// 结构体：JS 里是 CGPoint 这样的类，写的时候带同样字段的普通对象也收
- (void)moveTo:(CGPoint)point;
- (CGPoint)pointForCount:(NSInteger)count;
- (CGPoint)convertPoint:(CGPoint)point withScale:(CGFloat)scale;
// 下面这些现在不生成
- (void)attachItem:(SampleItem * _Nonnull)item;
- (void)insertExtra:(SampleItem * _Nonnull)extra atIndex:(NSUInteger)index;
- (nullable SampleView *)panelAtIndex:(NSUInteger)index;
- (void)fillWithColor:(UIColor * _Nonnull)color;
- (void)loadWithCompletionHandler:(void (^ _Nonnull)(BOOL finished))completionHandler;
- (void)insertTitle:(NSString * _Nonnull)title atIndex:(NSUInteger)index;
- (void)insertTitle:(NSString * _Nonnull)title aboveIndex:(NSUInteger)index;
- (void)radius:(CGFloat)value;
+ (NSInteger)wellCount;
- (void)oldReset API_DEPRECATED("gone");
- (void)futureReset API_AVAILABLE(ios(99.0));
// 给子类覆盖用的：系统来调，不是给别人调的。原生类在 JS 里不做继承，这些没有用
- (void)didMoveToParent;
- (void)willRemoveChild;
- (void)titleDidChange;
- (void)drawContentInRect:(CGPoint)origin;
@end

// 给别的框架的类加的分类：归到「分类」里，不并进类
@interface NSString (SampleAdditions)
- (NSInteger)sampleLength;
@end

@protocol SampleDelegate
- (void)sampleViewDidChange:(SampleView * _Nonnull)view;
@optional
- (BOOL)sampleViewShouldClose:(SampleView * _Nonnull)view;
@end

extern CGPoint SamplePointMake(CGFloat x, CGFloat y);
