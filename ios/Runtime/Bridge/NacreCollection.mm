// 列表：UICollectionView、单元格、列表布局、快照和数据源。
//
// 数据用「带标识的快照」给（UICollectionViewDiffableDataSource），不用「按下标
// 问」的经典数据源：改数据时 JS 只交一份新的快照，差异由系统算。经典那一套
// 里下标和数据对不上时，UIKit 在之后的布局里才抛异常，那时已经不在我们的
// 调用里，拦不住。
//
// 这是「系统来要数据」那一类同步回调的第一个使用者。系统要显示一项时调
// cellProvider，要它**返回**单元格。现有的同步出口只带得回一个布尔
// （NacreEmitEventSync），所以单元格是这样带回来的：
//
//   cellProvider（原生的 block）
//     → NacreEmitEventSync(数据源, "@cell", {section, item, id})   当场进 JS
//       → JS 调用户的函数，拿到单元格，调数据源的 nacre:provideCell 把它交回来
//     ← 回到 block，从「当前请求」里取出交回来的那个单元格，返回给系统
//
// 「当前请求」是下面的 gRequest。它只在 cellProvider 执行期间不为空，取单元格
// （dequeue…）也靠它判断是不是在 cellProvider 里面。
//
// 标识（分区的、项的）是字符串或整数，过桥是 JSON，到这里是 NSString 或
// NSNumber，原样交给系统。类型和取值在 JS 一侧已经查过，这里只做判断。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 列表 → 它的委托 trampoline（槽位是和滚动事件共用的，见 NacreAddDelegatePart）
static const void* kNacreCollectionDelegateKey = &kNacreCollectionDelegateKey;
// 列表 → 登记过的复用标识（NSMutableSet）
static const void* kNacreCollectionIdentifiersKey = &kNacreCollectionIdentifiersKey;
// 列表 → 它的数据源。UICollectionView.dataSource 是 weak，靠这个关联持有
static const void* kNacreCollectionSourceKey = &kNacreCollectionSourceKey;

// cellProvider 拿不到单元格时用的那一种（用户的函数抛了，或者没返回）
static NSString* const kNacreFallbackCellIdentifier = @"nacre.fallback";

@interface NacreCollectionDelegate : NSObject <UICollectionViewDelegate>
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreCollectionDelegate

// 事件都带 indexPath：延后一轮才到 JS，那时「刚才是哪一项」已经读不回来了
- (void)emit:(NSString*)type from:(UICollectionView*)view at:(NSIndexPath*)path {
  if (![self.types containsObject:type]) return;
  NSDictionary* fields = @{
    @"indexPath": @{@"section": @(path.section), @"item": @(path.item)},
  };
  nacre_bridge::NacreEmitEventWithJSON(view, "UICollectionView", type,
                                       @(nacre_bridge::EncodeJSON(fields).c_str()));
}

- (void)collectionView:(UICollectionView*)collectionView
    didSelectItemAtIndexPath:(NSIndexPath*)indexPath {
  [self emit:@"itemselect" from:collectionView at:indexPath];
}

- (void)collectionView:(UICollectionView*)collectionView
    didDeselectItemAtIndexPath:(NSIndexPath*)indexPath {
  [self emit:@"itemdeselect" from:collectionView at:indexPath];
}

- (void)collectionView:(UICollectionView*)collectionView
       willDisplayCell:(UICollectionViewCell*)cell
    forItemAtIndexPath:(NSIndexPath*)indexPath {
  [self emit:@"beforedisplay" from:collectionView at:indexPath];
}

- (void)collectionView:(UICollectionView*)collectionView
    didEndDisplayingCell:(UICollectionViewCell*)cell
      forItemAtIndexPath:(NSIndexPath*)indexPath {
  [self emit:@"displayend" from:collectionView at:indexPath];
}

@end

namespace nacre_bridge {

// d.ts 里的联合类型和 ObjC 的类型同名，check-api.sh 会自动核对取值
NACRE_ENUM_MAP(CollectionListAppearance, UICollectionLayoutListAppearance,
               @"plain": @(UICollectionLayoutListAppearancePlain),
               @"grouped": @(UICollectionLayoutListAppearanceGrouped),
               @"insetGrouped": @(UICollectionLayoutListAppearanceInsetGrouped),
               @"sidebar": @(UICollectionLayoutListAppearanceSidebar),
               @"sidebarPlain": @(UICollectionLayoutListAppearanceSidebarPlain))

// supplementary（头是单独的视图）不在表里：分区头尾的视图还没接，写了它
// 系统会在布局时来要那个视图，要不到就抛
NACRE_ENUM_MAP(CollectionListHeaderMode, UICollectionLayoutListHeaderMode,
               @"none": @(UICollectionLayoutListHeaderModeNone),
               @"firstItemInSection": @(UICollectionLayoutListHeaderModeFirstItemInSection))

NACRE_MASK_MAP(CollectionScrollPosition, UICollectionViewScrollPosition,
               @"top": @(UICollectionViewScrollPositionTop),
               @"centeredVertically": @(UICollectionViewScrollPositionCenteredVertically),
               @"bottom": @(UICollectionViewScrollPositionBottom),
               @"left": @(UICollectionViewScrollPositionLeft),
               @"centeredHorizontally": @(UICollectionViewScrollPositionCenteredHorizontally),
               @"right": @(UICollectionViewScrollPositionRight))

static NSArray<NSString*>* CollectionEventNames(void) {
  return @[@"itemselect", @"itemdeselect", @"beforedisplay", @"displayend"];
}

// ---- 当前的单元格请求 ----
// 只在主线程上用。cellProvider 可能嵌套（在里面又触发了另一个列表的布局），
// 所以进出时保存和恢复外面那一层
struct CellRequest {
  UICollectionView* view = nil;
  NSIndexPath* path = nil;
  UICollectionViewCell* dequeued = nil;   // 这次请求里取出来的
  UICollectionViewCell* provided = nil;   // JS 交回来的
};
static CellRequest* gRequest = nullptr;

static const char* CellClassName(UICollectionViewCell* cell) {
  return [cell isKindOfClass:UICollectionViewListCell.class] ? "UICollectionViewListCell"
                                                             : "UICollectionViewCell";
}

// ---- 取参 ----

// 位置：{section, item}，两个非负整数。不是这个形状返回 nil
static NSIndexPath* PathFrom(id value) {
  if (![value isKindOfClass:NSDictionary.class]) return nil;
  id section = ((NSDictionary*)value)[@"section"];
  id item = ((NSDictionary*)value)[@"item"];
  std::string ignored;
  if (!RequireInteger(section, @"section", &ignored) ||
      !RequireInteger(item, @"item", &ignored)) {
    return nil;
  }
  if ([section integerValue] < 0 || [item integerValue] < 0) return nil;
  return [NSIndexPath indexPathForItem:[item integerValue] inSection:[section integerValue]];
}

static id PathToJSON(NSIndexPath* path) {
  if (path == nil) return NSNull.null;
  return @{@"section": @(path.section), @"item": @(path.item)};
}

static NSArray* PathsToJSON(NSArray<NSIndexPath*>* paths) {
  NSMutableArray* out = [NSMutableArray array];
  for (NSIndexPath* path in paths) [out addObject:PathToJSON(path)];
  return out;
}

static bool PathExists(UICollectionView* view, NSIndexPath* path) {
  return path.section < view.numberOfSections &&
         path.item < [view numberOfItemsInSection:path.section];
}

// 取一个位置，并且要求列表里真有这一项。UIKit 对不存在的位置是抛异常
static NSIndexPath* ExistingPath(UICollectionView* view, id value, NSString* what,
                                 std::string* error) {
  NSIndexPath* path = PathFrom(value);
  if (path == nil) {
    *error = [NSString stringWithFormat:
        @"%@ needs an index path: an object with non-negative integers section and item",
        what].UTF8String;
    return nil;
  }
  if (!PathExists(view, path)) {
    *error = [NSString stringWithFormat:@"%@: there is no item at section %ld, item %ld",
                                        what, (long)path.section, (long)path.item].UTF8String;
    return nil;
  }
  return path;
}

// 标识：字符串，或者整数（布尔不算）
static bool IsIdentifier(id value) {
  if ([value isKindOfClass:NSString.class]) return true;
  std::string ignored;
  return RequireInteger(value, @"identifier", &ignored);
}

static NSString* DescribeIdentifier(id value) {
  if ([value isKindOfClass:NSString.class]) return [NSString stringWithFormat:@"\"%@\"", value];
  return [NSString stringWithFormat:@"%@", value];
}

static bool OneIdentifier(id value, NSString* what, std::string* error) {
  if (IsIdentifier(value)) return true;
  *error = [NSString stringWithFormat:@"%@: identifiers must be strings or integers", what]
               .UTF8String;
  return false;
}

// 一组标识。组内不许重复
static NSArray* IdentifierList(id value, NSString* what, NSString* kind, std::string* error) {
  if (![value isKindOfClass:NSArray.class]) {
    *error = [NSString stringWithFormat:@"%@ needs an array of identifiers", what].UTF8String;
    return nil;
  }
  NSMutableSet* seen = [NSMutableSet set];
  for (id one in (NSArray*)value) {
    if (!OneIdentifier(one, what, error)) return nil;
    if ([seen containsObject:one]) {
      *error = [NSString stringWithFormat:@"%@: %@ identifier %@ appears more than once",
                                          what, kind, DescribeIdentifier(one)].UTF8String;
      return nil;
    }
    [seen addObject:one];
  }
  return (NSArray*)value;
}

typedef NSDiffableDataSourceSnapshot<id, id> Snapshot;
typedef UICollectionViewDiffableDataSource<id, id> DataSource;

static bool HasSection(Snapshot* snapshot, id identifier) {
  return [snapshot indexOfSectionIdentifier:identifier] != NSNotFound;
}
static bool HasItem(Snapshot* snapshot, id identifier) {
  return [snapshot indexOfItemIdentifier:identifier] != NSNotFound;
}

// 要求一个已有的分区 / 项。没有就填报错
static bool NeedSection(Snapshot* snapshot, id identifier, NSString* what, std::string* error) {
  if (!OneIdentifier(identifier, what, error)) return false;
  if (HasSection(snapshot, identifier)) return true;
  *error = [NSString stringWithFormat:@"%@: there is no section with identifier %@", what,
                                      DescribeIdentifier(identifier)].UTF8String;
  return false;
}
static bool NeedItem(Snapshot* snapshot, id identifier, NSString* what, std::string* error) {
  if (!OneIdentifier(identifier, what, error)) return false;
  if (HasItem(snapshot, identifier)) return true;
  *error = [NSString stringWithFormat:@"%@: there is no item with identifier %@", what,
                                      DescribeIdentifier(identifier)].UTF8String;
  return false;
}

// 要加进来的一组新标识：不能和快照里已有的重复。系统对重复是抛异常
static NSArray* NewSections(Snapshot* snapshot, id value, NSString* what, std::string* error) {
  NSArray* list = IdentifierList(value, what, @"section", error);
  if (list == nil) return nil;
  for (id one in list) {
    if (HasSection(snapshot, one)) {
      *error = [NSString stringWithFormat:
          @"%@: section identifier %@ is already in the snapshot", what,
          DescribeIdentifier(one)].UTF8String;
      return nil;
    }
  }
  return list;
}
static NSArray* NewItems(Snapshot* snapshot, id value, NSString* what, std::string* error) {
  NSArray* list = IdentifierList(value, what, @"item", error);
  if (list == nil) return nil;
  if (list.count == 0) return list;
  NSSet* existing = [NSSet setWithArray:snapshot.itemIdentifiers];
  for (id one in list) {
    if ([existing containsObject:one]) {
      *error = [NSString stringWithFormat:
          @"%@: item identifier %@ is already in the snapshot", what,
          DescribeIdentifier(one)].UTF8String;
      return nil;
    }
  }
  return list;
}
// 要求全都已经在快照里的一组
static NSArray* KnownItems(Snapshot* snapshot, id value, NSString* what, std::string* error) {
  NSArray* list = IdentifierList(value, what, @"item", error);
  if (list == nil) return nil;
  for (id one in list) {
    if (!NeedItem(snapshot, one, what, error)) return nil;
  }
  return list;
}
static NSArray* KnownSections(Snapshot* snapshot, id value, NSString* what, std::string* error) {
  NSArray* list = IdentifierList(value, what, @"section", error);
  if (list == nil) return nil;
  for (id one in list) {
    if (!NeedSection(snapshot, one, what, error)) return nil;
  }
  return list;
}
// 删除用：只留下快照里真有的那些，不存在的忽略
static NSArray* PresentOnly(NSArray* list, bool (*has)(Snapshot*, id), Snapshot* snapshot) {
  NSMutableArray* out = [NSMutableArray array];
  for (id one in list) {
    if (has(snapshot, one)) [out addObject:one];
  }
  return out;
}

// ---- 构造 ----

static bool CollectionConstruct(const std::string& className, const NacreArgs& args,
                                nacre::NativeObjectRef* out, std::string* error) {
  if (className == "UICollectionLayoutListConfiguration") {
    UICollectionLayoutListAppearance appearance;
    if (!CollectionListAppearanceFromName(args.value(0), &appearance)) {
      *error = EnumError(@"appearance", args.value(0), NamesForCollectionListAppearance());
      return true;
    }
    *out = {NacreKeep([[UICollectionLayoutListConfiguration alloc]
                initWithAppearance:appearance]),
            className};
    return true;
  }
  if (className == "UICollectionView") {
    id layout = args.object(0);
    if (![layout isKindOfClass:UICollectionViewLayout.class]) {
      ObjectTypeError("UICollectionView", "UICollectionViewLayout", false, error);
      return true;
    }
    *out = {NacreKeep([[UICollectionView alloc] initWithFrame:CGRectZero
                                         collectionViewLayout:layout]),
            className};
    return true;
  }
  if (className == "NSDiffableDataSourceSnapshot") {
    *out = {NacreKeep([[NSDiffableDataSourceSnapshot alloc] init]), className};
    return true;
  }
  if (className == "UICollectionViewDiffableDataSource") {
    id target = args.object(0);
    if (![target isKindOfClass:UICollectionView.class]) {
      ObjectTypeError("UICollectionViewDiffableDataSource", "UICollectionView", false, error);
      return true;
    }
    UICollectionView* view = (UICollectionView*)target;
    [view registerClass:UICollectionViewCell.class
        forCellWithReuseIdentifier:kNacreFallbackCellIdentifier];
    // block 要用到数据源自己，而数据源要先有 block 才建得出来：先留一个弱引用的
    // 位置，建完再填。弱的，不然数据源和它自己的 block 互相持有
    __block __weak DataSource* weakSource = nil;
    DataSource* source = [[UICollectionViewDiffableDataSource alloc]
        initWithCollectionView:view
                  cellProvider:^UICollectionViewCell*(UICollectionView* collectionView,
                                                      NSIndexPath* indexPath,
                                                      id itemIdentifier) {
                    CellRequest request;
                    request.view = collectionView;
                    request.path = indexPath;
                    CellRequest* outer = gRequest;
                    gRequest = &request;
                    DataSource* strongSource = weakSource;
                    if (strongSource != nil) {
                      NSDictionary* fields = @{
                        @"section": @(indexPath.section),
                        @"item": @(indexPath.item),
                        @"id": itemIdentifier ?: NSNull.null,
                      };
                      NacreEmitEventSync(strongSource, "UICollectionViewDiffableDataSource",
                                         @"@cell", @(EncodeJSON(fields).c_str()));
                    }
                    gRequest = outer;
                    if (request.provided != nil) return request.provided;
                    // 没拿到：用户的函数抛了，或者没返回单元格（异常已经从 error
                    // 事件报出去了）。系统拿不到单元格会直接抛，所以给一个空的。
                    // 一次请求只能取一个单元格，已经取过就用那一个，把内容清掉
                    UICollectionViewCell* blank = request.dequeued;
                    if (blank == nil) {
                      blank = [collectionView
                          dequeueReusableCellWithReuseIdentifier:kNacreFallbackCellIdentifier
                                                    forIndexPath:indexPath];
                    }
                    blank.contentConfiguration = nil;
                    return blank;
                  }];
    weakSource = source;
    objc_setAssociatedObject(view, kNacreCollectionSourceKey, source,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    *out = {NacreKeep(source), className};
    return true;
  }
  return false;
}

// ---- 类方法 ----

static bool CollectionClassCallObject(const std::string& className, NSString* sel,
                                      const NacreArgs& args, nacre::NativeObjectRef* out,
                                      std::string* error) {
  if (className == "UICollectionViewCompositionalLayout") {
    if (![sel isEqualToString:@"layoutWithListConfiguration:"]) return false;
    // 配置在这一刻被复制进布局，布局不持有交进来的那个对象，所以 JS 一侧不记持有边
    id config = args.object(0);
    if (![config isKindOfClass:UICollectionLayoutListConfiguration.class]) {
      ObjectTypeError("layoutWithListConfiguration", "UICollectionLayoutListConfiguration",
                      false, error);
      return true;
    }
    *out = {NacreKeep([UICollectionViewCompositionalLayout layoutWithListConfiguration:config]),
            "UICollectionViewCompositionalLayout"};
    return true;
  }
  if (className == "UIListContentConfiguration") {
    UIListContentConfiguration* made = nil;
    if ([sel isEqualToString:@"cellConfiguration"]) {
      made = [UIListContentConfiguration cellConfiguration];
    } else if ([sel isEqualToString:@"subtitleCellConfiguration"]) {
      made = [UIListContentConfiguration subtitleCellConfiguration];
    } else if ([sel isEqualToString:@"valueCellConfiguration"]) {
      made = [UIListContentConfiguration valueCellConfiguration];
    } else {
      return false;
    }
    *out = {NacreKeep(made), "UIListContentConfiguration"};
    return true;
  }
  return false;
}

// ---- 订阅 ----
// 只认列表自己的四个名字。别的名字不认领，落到核心的滚动分支：滚动的事件
// 归它，哪边都不认识的也由它报错（它列的是滚动那张表，没有这四个名字）
static NacreSubscribed CollectionSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UICollectionView.class]) return false;
  if (![CollectionEventNames() containsObject:type]) return false;
  UICollectionView* view = (UICollectionView*)object;
  NacreCollectionDelegate* hop = objc_getAssociatedObject(view, kNacreCollectionDelegateKey);
  if (on) {
    if (hop == nil) {
      hop = [NacreCollectionDelegate new];
      hop.types = [NSMutableSet set];
      objc_setAssociatedObject(view, kNacreCollectionDelegateKey, hop,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      NacreAddDelegatePart(view, hop);
    }
    [hop.types addObject:type];
  } else if (hop != nil) {
    [hop.types removeObject:type];
    if (hop.types.count == 0) {
      NacreRemoveDelegatePart(view, hop);
      objc_setAssociatedObject(view, kNacreCollectionDelegateKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

// ---- 标量属性 ----

static id ReadCollectionProperty(id object, NSString* key) {
  if ([object isKindOfClass:UICollectionView.class]) {
    UICollectionView* view = (UICollectionView*)object;
    if ([key isEqualToString:@"allowsSelection"]) return @(view.allowsSelection);
    if ([key isEqualToString:@"allowsMultipleSelection"]) return @(view.allowsMultipleSelection);
    if ([key isEqualToString:@"numberOfSections"]) return @(view.numberOfSections);
    if ([key isEqualToString:@"indexPathsForVisibleItems"]) {
      return PathsToJSON(view.indexPathsForVisibleItems);
    }
    if ([key isEqualToString:@"indexPathsForSelectedItems"]) {
      return PathsToJSON(view.indexPathsForSelectedItems ?: @[]);
    }
    return nil;
  }
  if ([object isKindOfClass:UICollectionReusableView.class]) {
    UICollectionReusableView* reusable = (UICollectionReusableView*)object;
    if ([key isEqualToString:@"reuseIdentifier"]) return reusable.reuseIdentifier ?: NSNull.null;
    if ([object isKindOfClass:UICollectionViewCell.class]) {
      UICollectionViewCell* cell = (UICollectionViewCell*)object;
      if ([key isEqualToString:@"isSelected"]) return @(cell.isSelected);
      if ([key isEqualToString:@"isHighlighted"]) return @(cell.isHighlighted);
    }
    return nil;
  }
  if ([object isKindOfClass:UICollectionLayoutListConfiguration.class]) {
    UICollectionLayoutListConfiguration* config = (UICollectionLayoutListConfiguration*)object;
    if ([key isEqualToString:@"appearance"]) {
      return NameForCollectionListAppearance(config.appearance) ?: NSNull.null;
    }
    if ([key isEqualToString:@"showsSeparators"]) return @(config.showsSeparators);
    if ([key isEqualToString:@"headerMode"]) {
      return NameForCollectionListHeaderMode(config.headerMode) ?: NSNull.null;
    }
    return nil;
  }
  if ([object isKindOfClass:UIListContentConfiguration.class]) {
    UIListContentConfiguration* content = (UIListContentConfiguration*)object;
    if ([key isEqualToString:@"text"]) return content.text ?: NSNull.null;
    if ([key isEqualToString:@"secondaryText"]) return content.secondaryText ?: NSNull.null;
    return nil;
  }
  if ([object isKindOfClass:NSDiffableDataSourceSnapshot.class]) {
    Snapshot* snapshot = (Snapshot*)object;
    if ([key isEqualToString:@"numberOfItems"]) return @(snapshot.numberOfItems);
    if ([key isEqualToString:@"numberOfSections"]) return @(snapshot.numberOfSections);
    if ([key isEqualToString:@"sectionIdentifiers"]) return snapshot.sectionIdentifiers;
    if ([key isEqualToString:@"itemIdentifiers"]) return snapshot.itemIdentifiers;
    return nil;
  }
  return nil;
}

// 可空的字符串：null 或者字符串。别的类型说明 JS 一侧漏了转换
static bool TextOrNull(id value, NSString* what, NSString** out, std::string* error) {
  if (value == nil || value == NSNull.null) {
    *out = nil;
    return true;
  }
  if ([value isKindOfClass:NSString.class]) {
    *out = (NSString*)value;
    return true;
  }
  *error = [NSString stringWithFormat:@"%@ needs a string or null", what].UTF8String;
  return false;
}

static BOOL WriteCollectionProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UICollectionView.class]) {
    UICollectionView* view = (UICollectionView*)object;
    if ([key isEqualToString:@"allowsSelection"]) {
      view.allowsSelection = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"allowsMultipleSelection"]) {
      view.allowsMultipleSelection = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UICollectionViewCell.class]) {
    UICollectionViewCell* cell = (UICollectionViewCell*)object;
    if ([key isEqualToString:@"isSelected"]) {
      cell.selected = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isHighlighted"]) {
      cell.highlighted = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UICollectionLayoutListConfiguration.class]) {
    UICollectionLayoutListConfiguration* config = (UICollectionLayoutListConfiguration*)object;
    if ([key isEqualToString:@"showsSeparators"]) {
      config.showsSeparators = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"headerMode"]) {
      UICollectionLayoutListHeaderMode mode;
      if ([value isEqual:@"supplementary"]) {
        *error = [NSString stringWithFormat:
            @"headerMode \"supplementary\" is not supported yet (section header views are "
            @"not available); expected one of: %@",
            NamesForCollectionListHeaderMode()].UTF8String;
        return YES;
      }
      if (!CollectionListHeaderModeFromName(value, &mode)) {
        *error = EnumError(key, value, NamesForCollectionListHeaderMode());
        return YES;
      }
      config.headerMode = mode;
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UIListContentConfiguration.class]) {
    UIListContentConfiguration* content = (UIListContentConfiguration*)object;
    if ([key isEqualToString:@"text"]) {
      NSString* text = nil;
      if (TextOrNull(value, key, &text, error)) content.text = text;
      return YES;
    }
    if ([key isEqualToString:@"secondaryText"]) {
      NSString* text = nil;
      if (TextOrNull(value, key, &text, error)) content.secondaryText = text;
      return YES;
    }
    return NO;
  }
  return NO;
}

// ---- 对象属性 ----

static nacre::NativeObjectRef ReadCollectionObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UICollectionView.class]) {
    UICollectionView* view = (UICollectionView*)object;
    if (name == "collectionViewLayout") {
      UICollectionViewLayout* layout = view.collectionViewLayout;
      return {NacreKeep(layout),
              [layout isKindOfClass:UICollectionViewCompositionalLayout.class]
                  ? "UICollectionViewCompositionalLayout"
                  : "UICollectionViewLayout"};
    }
    if (name == "dataSource") {
      id source = objc_getAssociatedObject(view, kNacreCollectionSourceKey);
      // 关联着的那个不一定还是现在的数据源（又建了一个新的接上来）
      if (source != nil && view.dataSource != source) source = nil;
      return {NacreKeep(source), "UICollectionViewDiffableDataSource"};
    }
    return {};
  }
  if ([object isKindOfClass:UICollectionViewCell.class]) {
    UICollectionViewCell* cell = (UICollectionViewCell*)object;
    if (name == "contentView") return {NacreKeep(cell.contentView), "UIView"};
    if (name == "contentConfiguration") {
      id content = cell.contentConfiguration;
      if (![content isKindOfClass:UIListContentConfiguration.class]) content = nil;
      return {NacreKeep(content), "UIListContentConfiguration"};
    }
    return {};
  }
  if ([object isKindOfClass:UICollectionLayoutListConfiguration.class]) {
    if (name == "backgroundColor") {
      return {NacreKeep(((UICollectionLayoutListConfiguration*)object).backgroundColor),
              "UIColor"};
    }
    return {};
  }
  if ([object isKindOfClass:UIListContentConfiguration.class]) {
    if (name == "image") {
      return {NacreKeep(((UIListContentConfiguration*)object).image), "UIImage"};
    }
    return {};
  }
  return {};
}

// 对象值：nil 可以，给了就得是要求的那个类。返回 false 表示类型不对，error 已经填好
static bool TypedOrNil(id value, Class cls, const char* className, const std::string& name,
                       std::string* error) {
  if (value == nil || [value isKindOfClass:cls]) return true;
  ObjectTypeError(name, className, true, error);
  return false;
}

static bool WriteCollectionObjectProperty(id object, const std::string& name, id value,
                                          std::string* error) {
  if ([object isKindOfClass:UICollectionViewCell.class]) {
    if (name == "contentConfiguration") {
      // 系统存的是一份副本
      if (TypedOrNil(value, UIListContentConfiguration.class, "UIListContentConfiguration",
                     name, error)) {
        ((UICollectionViewCell*)object).contentConfiguration = (UIListContentConfiguration*)value;
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UICollectionLayoutListConfiguration.class]) {
    if (name == "backgroundColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        ((UICollectionLayoutListConfiguration*)object).backgroundColor = (UIColor*)value;
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIListContentConfiguration.class]) {
    if (name == "image") {
      if (TypedOrNil(value, UIImage.class, "UIImage", name, error)) {
        ((UIListContentConfiguration*)object).image = (UIImage*)value;
      }
      return true;
    }
    return false;
  }
  return false;
}

static void ReadCollectionObjectArray(id object, const std::string& name,
                                      std::vector<nacre::NativeObjectRef>& refs) {
  if (![object isKindOfClass:UICollectionView.class]) return;
  if (name == "visibleCells") {
    for (UICollectionViewCell* cell in ((UICollectionView*)object).visibleCells) {
      refs.push_back({NacreKeep(cell), CellClassName(cell)});
    }
  }
}

// ---- 方法：返回标量 ----

static bool SnapshotCall(Snapshot* snapshot, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error) {
  *out = "null";

  // -- 查询 --
  if ([sel isEqualToString:@"numberOfItemsInSection:"]) {
    if (!NeedSection(snapshot, args.value(0), @"numberOfItemsInSection", error)) return true;
    *out = EncodeJSON(@([snapshot numberOfItemsInSection:args.value(0)]));
    return true;
  }
  if ([sel isEqualToString:@"itemIdentifiersInSectionWithIdentifier:"]) {
    if (!NeedSection(snapshot, args.value(0), @"itemIdentifiersInSectionWithIdentifier", error)) {
      return true;
    }
    *out = EncodeJSON([snapshot itemIdentifiersInSectionWithIdentifier:args.value(0)]);
    return true;
  }
  if ([sel isEqualToString:@"sectionIdentifierForSectionContainingItemIdentifier:"]) {
    id item = args.value(0);
    if (!OneIdentifier(item, @"sectionIdentifierForSectionContainingItemIdentifier", error)) {
      return true;
    }
    if (HasItem(snapshot, item)) {
      *out = EncodeJSON(
          [snapshot sectionIdentifierForSectionContainingItemIdentifier:item] ?: NSNull.null);
    }
    return true;
  }
  if ([sel isEqualToString:@"indexOfItemIdentifier:"]) {
    if (!OneIdentifier(args.value(0), @"indexOfItemIdentifier", error)) return true;
    const NSInteger at = [snapshot indexOfItemIdentifier:args.value(0)];
    *out = EncodeJSON(@(at == NSNotFound ? -1 : at));
    return true;
  }
  if ([sel isEqualToString:@"indexOfSectionIdentifier:"]) {
    if (!OneIdentifier(args.value(0), @"indexOfSectionIdentifier", error)) return true;
    const NSInteger at = [snapshot indexOfSectionIdentifier:args.value(0)];
    *out = EncodeJSON(@(at == NSNotFound ? -1 : at));
    return true;
  }

  // -- 分区 --
  if ([sel isEqualToString:@"appendSectionsWithIdentifiers:"]) {
    NSArray* list = NewSections(snapshot, args.value(0), @"appendSectionsWithIdentifiers", error);
    if (list != nil) [snapshot appendSectionsWithIdentifiers:list];
    return true;
  }
  // [ids, anchor, before]
  if ([sel isEqualToString:@"insertSectionsWithIdentifiers:"]) {
    NSString* what = @"insertSectionsWithIdentifiers";
    NSArray* list = NewSections(snapshot, args.value(0), what, error);
    if (list == nil) return true;
    if (!NeedSection(snapshot, args.value(1), what, error)) return true;
    if (NACRE_BOOL(args.value(2), @"before")) {
      [snapshot insertSectionsWithIdentifiers:list beforeSectionWithIdentifier:args.value(1)];
    } else {
      [snapshot insertSectionsWithIdentifiers:list afterSectionWithIdentifier:args.value(1)];
    }
    return true;
  }
  if ([sel isEqualToString:@"deleteSectionsWithIdentifiers:"]) {
    NSArray* list =
        IdentifierList(args.value(0), @"deleteSectionsWithIdentifiers", @"section", error);
    if (list != nil) {
      [snapshot deleteSectionsWithIdentifiers:PresentOnly(list, HasSection, snapshot)];
    }
    return true;
  }
  // [id, anchor, before]
  if ([sel isEqualToString:@"moveSectionWithIdentifier:"]) {
    NSString* what = @"moveSectionWithIdentifier";
    if (!NeedSection(snapshot, args.value(0), what, error)) return true;
    if (!NeedSection(snapshot, args.value(1), what, error)) return true;
    if ([args.value(0) isEqual:args.value(1)]) {
      *error = "moveSectionWithIdentifier: a section cannot be moved next to itself";
      return true;
    }
    if (NACRE_BOOL(args.value(2), @"before")) {
      [snapshot moveSectionWithIdentifier:args.value(0)
              beforeSectionWithIdentifier:args.value(1)];
    } else {
      [snapshot moveSectionWithIdentifier:args.value(0) afterSectionWithIdentifier:args.value(1)];
    }
    return true;
  }
  if ([sel isEqualToString:@"reloadSectionsWithIdentifiers:"]) {
    NSArray* list =
        KnownSections(snapshot, args.value(0), @"reloadSectionsWithIdentifiers", error);
    if (list != nil) [snapshot reloadSectionsWithIdentifiers:list];
    return true;
  }

  // -- 项 --
  // [ids, section | null]
  if ([sel isEqualToString:@"appendItemsWithIdentifiers:"]) {
    NSString* what = @"appendItemsWithIdentifiers";
    NSArray* list = NewItems(snapshot, args.value(0), what, error);
    if (list == nil) return true;
    id section = args.value(1);
    if (section == nil || section == NSNull.null) {
      if (snapshot.numberOfSections == 0) {
        *error = "appendItemsWithIdentifiers: the snapshot has no sections; "
                 "append a section first";
        return true;
      }
      [snapshot appendItemsWithIdentifiers:list];
    } else {
      if (!NeedSection(snapshot, section, what, error)) return true;
      [snapshot appendItemsWithIdentifiers:list intoSectionWithIdentifier:section];
    }
    return true;
  }
  // [ids, anchor, before]
  if ([sel isEqualToString:@"insertItemsWithIdentifiers:"]) {
    NSString* what = @"insertItemsWithIdentifiers";
    NSArray* list = NewItems(snapshot, args.value(0), what, error);
    if (list == nil) return true;
    if (!NeedItem(snapshot, args.value(1), what, error)) return true;
    if (NACRE_BOOL(args.value(2), @"before")) {
      [snapshot insertItemsWithIdentifiers:list beforeItemWithIdentifier:args.value(1)];
    } else {
      [snapshot insertItemsWithIdentifiers:list afterItemWithIdentifier:args.value(1)];
    }
    return true;
  }
  if ([sel isEqualToString:@"deleteItemsWithIdentifiers:"]) {
    NSArray* list = IdentifierList(args.value(0), @"deleteItemsWithIdentifiers", @"item", error);
    if (list != nil) [snapshot deleteItemsWithIdentifiers:PresentOnly(list, HasItem, snapshot)];
    return true;
  }
  if ([sel isEqualToString:@"deleteAllItems"]) {
    [snapshot deleteAllItems];
    return true;
  }
  // [id, anchor, before]
  if ([sel isEqualToString:@"moveItemWithIdentifier:"]) {
    NSString* what = @"moveItemWithIdentifier";
    if (!NeedItem(snapshot, args.value(0), what, error)) return true;
    if (!NeedItem(snapshot, args.value(1), what, error)) return true;
    if ([args.value(0) isEqual:args.value(1)]) {
      *error = "moveItemWithIdentifier: an item cannot be moved next to itself";
      return true;
    }
    if (NACRE_BOOL(args.value(2), @"before")) {
      [snapshot moveItemWithIdentifier:args.value(0) beforeItemWithIdentifier:args.value(1)];
    } else {
      [snapshot moveItemWithIdentifier:args.value(0) afterItemWithIdentifier:args.value(1)];
    }
    return true;
  }
  if ([sel isEqualToString:@"reloadItemsWithIdentifiers:"]) {
    NSArray* list = KnownItems(snapshot, args.value(0), @"reloadItemsWithIdentifiers", error);
    if (list != nil) [snapshot reloadItemsWithIdentifiers:list];
    return true;
  }
  if ([sel isEqualToString:@"reconfigureItemsWithIdentifiers:"]) {
    NSArray* list = KnownItems(snapshot, args.value(0), @"reconfigureItemsWithIdentifiers", error);
    if (list != nil) [snapshot reconfigureItemsWithIdentifiers:list];
    return true;
  }
  return false;
}

static bool DataSourceCall(DataSource* source, NSString* sel, const NacreArgs& args,
                           std::string* out, std::string* error) {
  *out = "null";
  // cellProvider 里 JS 把单元格交回来。不在请求里（不该发生）就忽略
  // nacre:ownership-exempt nacre:provideCell —— 单元格由列表持有，取出来的那一刻 JS 一侧已经记过边
  if ([sel isEqualToString:@"nacre:provideCell"]) {
    id cell = args.object(0);
    if (gRequest != nullptr && [cell isKindOfClass:UICollectionViewCell.class]) {
      gRequest->provided = (UICollectionViewCell*)cell;
    }
    return true;
  }
  // [snapshot, animating, completion]
  // nacre:ownership-exempt applySnapshot:animatingDifferences:completion: —— 数据源存的是快照的副本
  if ([sel isEqualToString:@"applySnapshot:animatingDifferences:completion:"]) {
    id snapshot = args.object(0);
    if (![snapshot isKindOfClass:NSDiffableDataSourceSnapshot.class]) {
      ObjectTypeError("applySnapshot", "NSDiffableDataSourceSnapshot", false, error);
      return true;
    }
    const BOOL animating = NACRE_BOOL(args.value(1), @"animatingDifferences");
    const NSInteger completion = NACRE_INT(args.value(2), @"completion");
    [source applySnapshot:snapshot
        animatingDifferences:animating
                  completion:^{
                    NacreCallBlockLater(completion, @"[]");
                  }];
    return true;
  }
  // [snapshot, completion]
  // nacre:ownership-exempt applySnapshotUsingReloadData:completion: —— 同上
  if ([sel isEqualToString:@"applySnapshotUsingReloadData:completion:"]) {
    id snapshot = args.object(0);
    if (![snapshot isKindOfClass:NSDiffableDataSourceSnapshot.class]) {
      ObjectTypeError("applySnapshotUsingReloadData", "NSDiffableDataSourceSnapshot", false,
                      error);
      return true;
    }
    const NSInteger completion = NACRE_INT(args.value(1), @"completion");
    [source applySnapshotUsingReloadData:snapshot
                              completion:^{
                                NacreCallBlockLater(completion, @"[]");
                              }];
    return true;
  }
  if ([sel isEqualToString:@"itemIdentifierForIndexPath:"]) {
    NSIndexPath* path = PathFrom(args.value(0));
    if (path == nil) {
      *error = "itemIdentifierForIndexPath needs an index path: an object with non-negative "
               "integers section and item";
      return true;
    }
    *out = EncodeJSON([source itemIdentifierForIndexPath:path] ?: NSNull.null);
    return true;
  }
  if ([sel isEqualToString:@"indexPathForItemIdentifier:"]) {
    if (!OneIdentifier(args.value(0), @"indexPathForItemIdentifier", error)) return true;
    *out = EncodeJSON(PathToJSON([source indexPathForItemIdentifier:args.value(0)]));
    return true;
  }
  if ([sel isEqualToString:@"sectionIdentifierForIndex:"]) {
    const NSInteger index = NACRE_INT(args.value(0), @"index");
    id found = index < 0 ? nil : [source sectionIdentifierForIndex:index];
    *out = EncodeJSON(found ?: NSNull.null);
    return true;
  }
  if ([sel isEqualToString:@"indexForSectionIdentifier:"]) {
    if (!OneIdentifier(args.value(0), @"indexForSectionIdentifier", error)) return true;
    const NSInteger at = [source indexForSectionIdentifier:args.value(0)];
    *out = EncodeJSON(@(at == NSNotFound ? -1 : at));
    return true;
  }
  return false;
}

static bool ViewCall(UICollectionView* view, NSString* sel, const NacreArgs& args,
                     std::string* out, std::string* error) {
  *out = "null";
  // [className, identifier]
  if ([sel isEqualToString:@"registerClass:forCellWithReuseIdentifier:"]) {
    NSString* className = args.value(0);
    NSString* identifier = args.value(1);
    Class cls = Nil;
    if ([className isEqual:@"UICollectionViewCell"]) cls = UICollectionViewCell.class;
    if ([className isEqual:@"UICollectionViewListCell"]) cls = UICollectionViewListCell.class;
    if (cls == Nil) {
      *error = "registerClass needs UICollectionViewCell or UICollectionViewListCell";
      return true;
    }
    if (![identifier isKindOfClass:NSString.class] || identifier.length == 0) {
      *error = "registerClass needs a non-empty forCellWithReuseIdentifier";
      return true;
    }
    [view registerClass:cls forCellWithReuseIdentifier:identifier];
    NSMutableSet* known = objc_getAssociatedObject(view, kNacreCollectionIdentifiersKey);
    if (known == nil) {
      known = [NSMutableSet set];
      objc_setAssociatedObject(view, kNacreCollectionIdentifiersKey, known,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    [known addObject:identifier];
    return true;
  }
  if ([sel isEqualToString:@"numberOfItemsInSection:"]) {
    const NSInteger section = NACRE_INT(args.value(0), @"section");
    if (section < 0 || section >= view.numberOfSections) {
      *error = [NSString stringWithFormat:@"numberOfItemsInSection: there is no section %ld",
                                          (long)section].UTF8String;
      return true;
    }
    *out = EncodeJSON(@([view numberOfItemsInSection:section]));
    return true;
  }
  // nacre:ownership-exempt indexPathForCell: —— 只是拿它来问位置，不持有
  if ([sel isEqualToString:@"indexPathForCell:"]) {
    id cell = args.object(0);
    if (![cell isKindOfClass:UICollectionViewCell.class]) {
      ObjectTypeError("indexPathForCell", "UICollectionViewCell", false, error);
      return true;
    }
    *out = EncodeJSON(PathToJSON([view indexPathForCell:cell]));
    return true;
  }
  if ([sel isEqualToString:@"indexPathForItemAtPoint:"]) {
    *out = EncodeJSON(PathToJSON([view indexPathForItemAtPoint:JSONToPoint(args.value(0))]));
    return true;
  }
  // [path | null, animated, positions]
  if ([sel isEqualToString:@"selectItemAtIndexPath:animated:scrollPosition:"]) {
    NSIndexPath* path = nil;
    id given = args.value(0);
    if (given != nil && given != NSNull.null) {
      path = ExistingPath(view, given, @"selectItemAtIndexPath", error);
      if (path == nil) return true;
    }
    const BOOL animated = NACRE_BOOL(args.value(1), @"animated");
    UICollectionViewScrollPosition position = UICollectionViewScrollPositionNone;
    id bad = nil;
    if (!CollectionScrollPositionFromNames(args.value(2), &position, &bad)) {
      *error = bad != nil
                   ? EnumError(@"scrollPosition", bad, NamesForCollectionScrollPosition())
                   : std::string("scrollPosition needs an array of position names");
      return true;
    }
    [view selectItemAtIndexPath:path animated:animated scrollPosition:position];
    return true;
  }
  // [path, animated]
  if ([sel isEqualToString:@"deselectItemAtIndexPath:animated:"]) {
    NSIndexPath* path = ExistingPath(view, args.value(0), @"deselectItemAtIndexPath", error);
    if (path == nil) return true;
    [view deselectItemAtIndexPath:path animated:NACRE_BOOL(args.value(1), @"animated")];
    return true;
  }
  // [path, positions, animated]
  if ([sel isEqualToString:@"scrollToItemAtIndexPath:atScrollPosition:animated:"]) {
    NSIndexPath* path = ExistingPath(view, args.value(0), @"scrollToItemAtIndexPath", error);
    if (path == nil) return true;
    UICollectionViewScrollPosition position = UICollectionViewScrollPositionNone;
    id bad = nil;
    if (!CollectionScrollPositionFromNames(args.value(1), &position, &bad)) {
      *error = bad != nil
                   ? EnumError(@"atScrollPosition", bad, NamesForCollectionScrollPosition())
                   : std::string("atScrollPosition needs an array of position names");
      return true;
    }
    [view scrollToItemAtIndexPath:path
                 atScrollPosition:position
                         animated:NACRE_BOOL(args.value(2), @"animated")];
    return true;
  }
  return false;
}

static bool CollectionCallMethod(id object, NSString* sel, const NacreArgs& args,
                                 std::string* out, std::string* error) {
  if ([object isKindOfClass:NSDiffableDataSourceSnapshot.class]) {
    return SnapshotCall((Snapshot*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UICollectionViewDiffableDataSource.class]) {
    return DataSourceCall((DataSource*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UICollectionView.class]) {
    return ViewCall((UICollectionView*)object, sel, args, out, error);
  }
  return false;
}

// ---- 方法：返回原生对象 ----

static bool CollectionCallObject(id object, NSString* sel, const NacreArgs& args,
                                 nacre::NativeObjectRef* out, std::string* error) {
  if ([object isKindOfClass:UICollectionViewDiffableDataSource.class]) {
    if ([sel isEqualToString:@"snapshot"]) {
      *out = {NacreKeep([(DataSource*)object snapshot]), "NSDiffableDataSourceSnapshot"};
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UICollectionViewListCell.class] &&
      [sel isEqualToString:@"defaultContentConfiguration"]) {
    *out = {NacreKeep([(UICollectionViewListCell*)object defaultContentConfiguration]),
            "UIListContentConfiguration"};
    return true;
  }
  if (![object isKindOfClass:UICollectionView.class]) return false;
  UICollectionView* view = (UICollectionView*)object;

  // [identifier, path]。UIKit 对这里的每一种用错都是抛异常，所以先自己查
  if ([sel isEqualToString:@"dequeueReusableCellWithReuseIdentifier:forIndexPath:"]) {
    NSString* what = @"dequeueReusableCellWithReuseIdentifier";
    if (gRequest == nullptr || gRequest->view != view) {
      *error = "dequeueReusableCellWithReuseIdentifier can only be called inside the "
               "cellProvider of this collection view's data source";
      return true;
    }
    NSString* identifier = args.value(0);
    NSSet* known = objc_getAssociatedObject(view, kNacreCollectionIdentifiersKey);
    if (![identifier isKindOfClass:NSString.class] || ![known containsObject:identifier]) {
      *error = [NSString stringWithFormat:
          @"%@: no cell class is registered for the reuse identifier %@; call registerClass "
          @"first", what, DescribeIdentifier(identifier ?: @"")].UTF8String;
      return true;
    }
    NSIndexPath* path = PathFrom(args.value(1));
    if (path == nil || ![path isEqual:gRequest->path]) {
      *error = [NSString stringWithFormat:
          @"%@: forIndexPath must be the indexPath that was passed to cellProvider", what]
                   .UTF8String;
      return true;
    }
    if (gRequest->dequeued != nil) {
      *error = [NSString stringWithFormat:
          @"%@: only one cell can be dequeued for each call of cellProvider", what].UTF8String;
      return true;
    }
    UICollectionViewCell* cell = [view dequeueReusableCellWithReuseIdentifier:identifier
                                                                 forIndexPath:path];
    gRequest->dequeued = cell;
    *out = {NacreKeep(cell), CellClassName(cell)};
    return true;
  }
  // 不在屏幕上、或者没有这一项：null
  if ([sel isEqualToString:@"cellForItemAtIndexPath:"]) {
    NSIndexPath* path = PathFrom(args.value(0));
    if (path == nil) {
      *error = "cellForItemAtIndexPath needs an index path: an object with non-negative "
               "integers section and item";
      return true;
    }
    UICollectionViewCell* cell = PathExists(view, path) ? [view cellForItemAtIndexPath:path] : nil;
    *out = {NacreKeep(cell), cell != nil ? CellClassName(cell) : "UICollectionViewCell"};
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreCollectionDomain : NSObject
@end
@implementation NacreCollectionDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "collection";
  d.classes = {
      UICollectionView.class,
      UICollectionReusableView.class,
      UICollectionLayoutListConfiguration.class,
      UIListContentConfiguration.class,
      NSDiffableDataSourceSnapshot.class,
      UICollectionViewDiffableDataSource.class,
  };
  d.read = nacre_bridge::ReadCollectionProperty;
  d.write = nacre_bridge::WriteCollectionProperty;
  d.readObject = nacre_bridge::ReadCollectionObjectProperty;
  d.writeObject = nacre_bridge::WriteCollectionObjectProperty;
  d.readObjectArray = nacre_bridge::ReadCollectionObjectArray;
  d.call = nacre_bridge::CollectionCallMethod;
  d.callObject = nacre_bridge::CollectionCallObject;
  d.construct = nacre_bridge::CollectionConstruct;
  d.classCallObject = nacre_bridge::CollectionClassCallObject;
  d.subscribe = nacre_bridge::CollectionSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
