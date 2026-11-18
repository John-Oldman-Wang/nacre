// 通讯录选择器：CNContactPickerViewController，以及它交回来的只读的值
// CNContact、CNLabeledValue、CNPhoneNumber、CNContactProperty，和把姓名拼成
// 一行的 CNContactFormatter。
//
// 这是一个能力包（@nacrejs/contacts），编进的是它自己的 framework，所以只用
// 给能力包的那个头，不碰核心的内部头。
//
// **这个文件里不能出现 CNContactStore。** 选择器在系统自己的进程里运行，
// App 只拿得到用户选中的那一个联系人，不需要通讯录权限，也就不需要
// NSContactsUsageDescription——这个包的清单里 requires.infoPlist 是空的。
// 读整个通讯录的接口（CNContactStore）一用上，那句权限文案就成了必须的。
// 依据和没确认的部分见 docs/internals/contacts.md。
//
// ObjC 这一组的委托方法，各去了哪：
//   contactPickerDidCancel:                 → 选择器上的 cancel 事件
//   contactPicker:didSelectContact:         → contactselect，带 contact
//   contactPicker:didSelectContacts:        → contactsselect，带 contacts
//   contactPicker:didSelectContactProperty: → contactpropertyselect，带 contactProperty
//   contactPicker:didSelectContactProperties: 没接
//
// 系统是看委托**实现了哪几个方法**来决定选择器的模式的（实现了复数的那个
// 就是多选）。这里对应成：JS 监听了哪个事件，委托就答自己实现了哪个方法。
#import <Nacre/NacreExtension.h>

#import <Contacts/Contacts.h>
#import <ContactsUI/ContactsUI.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// 没有现成包装时用哪个 JS 类包选择器
static const char* const kNacrePickerClass = "CNContactPickerViewController";

// 四个事件名。JS 那一侧（contacts.js 的 PICKER_EVENTS）有同一张表，用来在
// 名字写错时把它们补进报错里；两处要一起改
static NSString* const kNacrePickerCancel = @"cancel";
static NSString* const kNacrePickerContact = @"contactselect";
static NSString* const kNacrePickerContacts = @"contactsselect";
static NSString* const kNacrePickerProperty = @"contactpropertyselect";

// 选中的东西是原生对象。带一个对象的事件要走运行时内部的事件（@ 开头，
// 不派发给监听器），由 contacts.js 里登记的处理函数挂到事件对象上再派发：
// 核心的事件汇入口给对象负载起字段名靠一张按事件名写死的表，新的事件名
// 不在里面
static NSString* const kNacrePickerContactInternal = @"@contactpicker:contact";
static NSString* const kNacrePickerContactsInternal = @"@contactpicker:contacts";
static NSString* const kNacrePickerPropertyInternal = @"@contactpicker:property";

// 关联对象的 key：CNContactPickerViewController → NacreContactPickerDelegate。
// 选择器的 delegate 是 weak 的，要有人持有它
static const void* kNacreContactPickerDelegateKey = &kNacreContactPickerDelegateKey;

// 系统自己把选择器关掉了（选中了，或者取消了），替它发一次运行时内部的
// @dismissed。JS 那一侧（核心的事件汇入口）收到之后按原生的真相放开
// 「呈现它的页面持有它」那条边。做法和弹窗那个域一样（NacreAlerts.mm）。
//
// 时机：JS 那一侧是去读 presentedViewController 的，关到一半时读到的还是它，
// 所以要等关完再发。回调来的时候已经关完了就直接发；正在关就等转场结束；
// 还没开始关（头文件只说「选中之后会自动关掉」，没说回调和关闭谁先）就隔
// 一会儿再看，最多看 3 秒
static void NacreNotifyPickerDismissed(UIViewController* page, int attempt) {
  void (^emit)(void) = ^{
    nacre_bridge::NacreEmitEvent(page, kNacrePickerClass, @"@dismissed");
  };
  if (page.presentingViewController == nil) {
    emit();
    return;
  }
  if (page.isBeingDismissed) {
    id<UIViewControllerTransitionCoordinator> coordinator = page.transitionCoordinator;
    BOOL queued = coordinator != nil &&
        [coordinator animateAlongsideTransition:nil
                                     completion:^(id<UIViewControllerTransitionCoordinatorContext> context) {
                                       emit();
                                     }];
    if (!queued) emit();
    return;
  }
  if (attempt >= 30) return;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
                   NacreNotifyPickerDismissed(page, attempt + 1);
                 });
}

// 委托方法在哪个线程上来，头文件没说。事件出口和 UIKit 的状态都只能在主线程碰
static void NacreOnMain(void (^block)(void)) {
  if (NSThread.isMainThread) {
    block();
  } else {
    dispatch_async(dispatch_get_main_queue(), block);
  }
}

// 选择器的委托。每个选择器一个，构造时就装上：取消那个方法总是答「实现了」，
// 因为不管有没有人监听，选择器被系统关掉都要报一声 @dismissed。
// 三个「选中了」的方法答不答，看 JS 那一侧有没有监听对应的事件
@interface NacreContactPickerDelegate : NSObject <CNContactPickerDelegate>
/// JS 那一侧现在监听着哪些事件
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
/// 多选交回来的联系人，等 JS 来取（事件出口一次只能带一个对象）。
/// 一次选择一项，先到的先取
@property(nonatomic, strong) NSMutableArray<NSArray<CNContact*>*>* pendingContacts;
@end

@implementation NacreContactPickerDelegate

- (instancetype)init {
  if ((self = [super init])) {
    _types = [NSMutableSet set];
    _pendingContacts = [NSMutableArray array];
  }
  return self;
}

- (BOOL)respondsToSelector:(SEL)selector {
  if (selector == @selector(contactPicker:didSelectContact:)) {
    return [_types containsObject:kNacrePickerContact];
  }
  if (selector == @selector(contactPicker:didSelectContacts:)) {
    return [_types containsObject:kNacrePickerContacts];
  }
  if (selector == @selector(contactPicker:didSelectContactProperty:)) {
    return [_types containsObject:kNacrePickerProperty];
  }
  return [super respondsToSelector:selector];
}

// 事件先发，@dismissed 后发：两次派发是主队列上相邻的两个任务，先放开持有边
// 的话，中间赶上一次 GC，监听器就跟着选择器的包装一起没了
- (void)contactPickerDidCancel:(CNContactPickerViewController*)picker {
  NacreOnMain(^{
    if ([self.types containsObject:kNacrePickerCancel]) {
      nacre_bridge::NacreEmitEvent(picker, kNacrePickerClass, kNacrePickerCancel);
    }
    NacreNotifyPickerDismissed(picker, 0);
  });
}

- (void)contactPicker:(CNContactPickerViewController*)picker
     didSelectContact:(CNContact*)contact {
  NacreOnMain(^{
    nacre_bridge::NacreEmitEventWithObject(picker, kNacrePickerClass,
                                           kNacrePickerContactInternal, contact, "CNContact");
    NacreNotifyPickerDismissed(picker, 0);
  });
}

- (void)contactPicker:(CNContactPickerViewController*)picker
    didSelectContacts:(NSArray<CNContact*>*)contacts {
  NacreOnMain(^{
    [self.pendingContacts addObject:[contacts copy] ?: @[]];
    nacre_bridge::NacreEmitEvent(picker, kNacrePickerClass, kNacrePickerContactsInternal);
    NacreNotifyPickerDismissed(picker, 0);
  });
}

- (void)contactPicker:(CNContactPickerViewController*)picker
    didSelectContactProperty:(CNContactProperty*)contactProperty {
  NacreOnMain(^{
    nacre_bridge::NacreEmitEventWithObject(picker, kNacrePickerClass,
                                           kNacrePickerPropertyInternal, contactProperty,
                                           "CNContactProperty");
    NacreNotifyPickerDismissed(picker, 0);
  });
}

@end

namespace nacre_bridge {

NACRE_ENUM_MAP(ContactFormatterStyle, CNContactFormatterStyle,
               @"fullName": @(CNContactFormatterStyleFullName),
               @"phoneticFullName": @(CNContactFormatterStylePhoneticFullName))

// 联系人的字段名（CNContact.h 里的 CNContact…Key 常量）。JS 那一侧写的是
// 左边的名字。实测这三十个常量的值就是属性名本身，但那是实现细节，所以
// 还是按常量查，不直接把 JS 给的字符串交给系统。
//
// 用有序的「名字, 常量」数组而不是字典：报错里列可选值要一个稳定的顺序，
// 这里照头文件的顺序
static NSArray<NSArray<NSString*>*>* ContactKeyPairs(void) {
  static NSArray<NSArray<NSString*>*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"identifier", CNContactIdentifierKey ],
      @[ @"namePrefix", CNContactNamePrefixKey ],
      @[ @"givenName", CNContactGivenNameKey ],
      @[ @"middleName", CNContactMiddleNameKey ],
      @[ @"familyName", CNContactFamilyNameKey ],
      @[ @"previousFamilyName", CNContactPreviousFamilyNameKey ],
      @[ @"nameSuffix", CNContactNameSuffixKey ],
      @[ @"nickname", CNContactNicknameKey ],
      @[ @"organizationName", CNContactOrganizationNameKey ],
      @[ @"departmentName", CNContactDepartmentNameKey ],
      @[ @"jobTitle", CNContactJobTitleKey ],
      @[ @"phoneticGivenName", CNContactPhoneticGivenNameKey ],
      @[ @"phoneticMiddleName", CNContactPhoneticMiddleNameKey ],
      @[ @"phoneticFamilyName", CNContactPhoneticFamilyNameKey ],
      @[ @"phoneticOrganizationName", CNContactPhoneticOrganizationNameKey ],
      @[ @"birthday", CNContactBirthdayKey ],
      @[ @"nonGregorianBirthday", CNContactNonGregorianBirthdayKey ],
      @[ @"note", CNContactNoteKey ],
      @[ @"imageData", CNContactImageDataKey ],
      @[ @"thumbnailImageData", CNContactThumbnailImageDataKey ],
      @[ @"imageDataAvailable", CNContactImageDataAvailableKey ],
      @[ @"contactType", CNContactTypeKey ],
      @[ @"phoneNumbers", CNContactPhoneNumbersKey ],
      @[ @"emailAddresses", CNContactEmailAddressesKey ],
      @[ @"postalAddresses", CNContactPostalAddressesKey ],
      @[ @"dates", CNContactDatesKey ],
      @[ @"urlAddresses", CNContactUrlAddressesKey ],
      @[ @"contactRelations", CNContactRelationsKey ],
      @[ @"socialProfiles", CNContactSocialProfilesKey ],
      @[ @"instantMessageAddresses", CNContactInstantMessageAddressesKey ],
    ];
  });
  return pairs;
}

// 名字 → 常量。不认识（或者根本不是字符串）返回 nil
static NSString* ContactKeyFromName(id name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray<NSString*>* pair in ContactKeyPairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

// 常量 → 名字。表里没有的原样给：系统以后加了新字段，用户选中它时不能丢
static NSString* NameForContactKey(NSString* key) {
  for (NSArray<NSString*>* pair in ContactKeyPairs()) {
    if ([pair[1] isEqualToString:key]) return pair[0];
  }
  return key;
}

static NSString* NamesForContactKey(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray<NSString*>* pair in ContactKeyPairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 过桥的标量结果是 JSON 文本。字符串单独一个值也要编（引号、转义）
static std::string JSONText(id value) {
  if (value == nil || value == NSNull.null) return "null";
  NSData* data = [NSJSONSerialization dataWithJSONObject:value
                                                 options:NSJSONWritingFragmentsAllowed
                                                   error:nil];
  if (data == nil) return "null";
  return std::string((const char*)data.bytes, data.length);
}

// 联系人上的一个字符串字段。系统交回来的联系人不一定带着所有字段，读一个
// 没取到的字段系统会抛 CNContactPropertyNotFetchedException；这里先问，
// 没取到给 null，由 JS 那一侧报成 TypeError
static id ContactText(CNContact* contact, NSString* key) {
  if (![contact isKeyAvailable:key]) return NSNull.null;
  id value = [contact valueForKey:key];
  return [value isKindOfClass:NSString.class] ? value : @"";
}

// 「值」只有字符串能直接过桥（邮箱）；电话是 CNPhoneNumber，走对象那条通道；
// 别的类型（地址、日期）还没有暴露，两条通道都给 null
static id TextValueOrNull(id value) {
  return [value isKindOfClass:NSString.class] ? value : NSNull.null;
}
static nacre::NativeObjectRef PhoneNumberOrNull(id value) {
  return {NacreKeep([value isKindOfClass:CNPhoneNumber.class] ? value : nil), "CNPhoneNumber"};
}

// ---- 属性 ----
static id ReadContactsProperty(id object, NSString* key) {
  if ([object isKindOfClass:CNContactPickerViewController.class]) {
    CNContactPickerViewController* picker = (CNContactPickerViewController*)object;
    if ([key isEqualToString:@"displayedPropertyKeys"]) {
      NSArray<NSString*>* keys = picker.displayedPropertyKeys;
      if (keys == nil) return NSNull.null;
      NSMutableArray<NSString*>* names = [NSMutableArray array];
      for (NSString* k in keys) [names addObject:NameForContactKey(k)];
      return names;
    }
    // 别的名字（title、modalPresentationStyle…）是页面的，归核心
    return nil;
  }
  if ([object isKindOfClass:CNContact.class]) {
    CNContact* contact = (CNContact*)object;
    if ([key isEqualToString:@"identifier"]) return contact.identifier ?: @"";
    if ([key isEqualToString:@"givenName"]) return ContactText(contact, CNContactGivenNameKey);
    if ([key isEqualToString:@"familyName"]) return ContactText(contact, CNContactFamilyNameKey);
    if ([key isEqualToString:@"organizationName"]) {
      return ContactText(contact, CNContactOrganizationNameKey);
    }
    return nil;
  }
  if ([object isKindOfClass:CNLabeledValue.class]) {
    CNLabeledValue* item = (CNLabeledValue*)object;
    if ([key isEqualToString:@"identifier"]) return item.identifier ?: @"";
    if ([key isEqualToString:@"label"]) return item.label ?: NSNull.null;
    if ([key isEqualToString:@"value"]) return TextValueOrNull(item.value);
    return nil;
  }
  if ([object isKindOfClass:CNPhoneNumber.class]) {
    if ([key isEqualToString:@"stringValue"]) {
      return ((CNPhoneNumber*)object).stringValue ?: @"";
    }
    return nil;
  }
  if ([object isKindOfClass:CNContactProperty.class]) {
    CNContactProperty* property = (CNContactProperty*)object;
    if ([key isEqualToString:@"key"]) return NameForContactKey(property.key ?: @"");
    if ([key isEqualToString:@"identifier"]) return property.identifier ?: NSNull.null;
    if ([key isEqualToString:@"label"]) return property.label ?: NSNull.null;
    if ([key isEqualToString:@"value"]) return TextValueOrNull(property.value);
    return nil;
  }
  return nil;
}

static BOOL WriteContactsProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:CNContactPickerViewController.class]) return NO;
  CNContactPickerViewController* picker = (CNContactPickerViewController*)object;
  if ([key isEqualToString:@"displayedPropertyKeys"]) {
    if (value == nil || value == NSNull.null) {
      picker.displayedPropertyKeys = nil;
      return YES;
    }
    if (![value isKindOfClass:NSArray.class]) {
      *error = "displayedPropertyKeys must be an array of contact key names or null";
      return YES;
    }
    NSMutableArray<NSString*>* keys = [NSMutableArray array];
    for (id name in (NSArray*)value) {
      NSString* k = ContactKeyFromName(name);
      if (k == nil) {
        *error = EnumError(key, name, NamesForContactKey());
        return YES;
      }
      [keys addObject:k];
    }
    picker.displayedPropertyKeys = keys;
    return YES;
  }
  return NO;
}

static nacre::NativeObjectRef ReadContactsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:CNLabeledValue.class]) {
    if (name == "value") return PhoneNumberOrNull(((CNLabeledValue*)object).value);
    return {};
  }
  if ([object isKindOfClass:CNContactProperty.class]) {
    CNContactProperty* property = (CNContactProperty*)object;
    if (name == "value") return PhoneNumberOrNull(property.value);
    if (name == "contact") return {NacreKeep(property.contact), "CNContact"};
    return {};
  }
  return {};
}

static void ReadContactsObjectArray(id object, const std::string& name,
                                    std::vector<nacre::NativeObjectRef>& refs) {
  if (![object isKindOfClass:CNContact.class]) return;
  CNContact* contact = (CNContact*)object;
  // 没取到的字段不读（读了系统会抛）。JS 那一侧在读之前已经问过 isKeyAvailable
  if (name == "phoneNumbers" && [contact isKeyAvailable:CNContactPhoneNumbersKey]) {
    for (CNLabeledValue* item in contact.phoneNumbers) {
      refs.push_back({NacreKeep(item), "CNLabeledValue"});
    }
  } else if (name == "emailAddresses" && [contact isKeyAvailable:CNContactEmailAddressesKey]) {
    for (CNLabeledValue* item in contact.emailAddresses) {
      refs.push_back({NacreKeep(item), "CNLabeledValue"});
    }
  }
}

// ---- 方法 ----
static bool ContactsCallMethod(id object, NSString* sel, const NacreArgs& args,
                               std::string* out, std::string* error) {
  if (![object isKindOfClass:CNContact.class]) return false;
  if ([sel isEqualToString:@"isKeyAvailable:"]) {
    *out = "null";
    NSString* key = ContactKeyFromName(args.value(0));
    if (key == nil) {
      *error = EnumError(@"isKeyAvailable", args.value(0), NamesForContactKey());
      return true;
    }
    *out = [(CNContact*)object isKeyAvailable:key] ? "true" : "false";
    return true;
  }
  return false;
}

static bool ContactsCallObjectArray(id object, NSString* sel, const NacreArgs& args,
                                    std::vector<nacre::NativeObjectRef>* out,
                                    std::string* error) {
  if (![object isKindOfClass:CNContactPickerViewController.class]) return false;
  // 运行时自己用的：取走多选交回来的那一组联系人。取一次就没了
  if ([sel isEqualToString:@"nacre:takeSelectedContacts"]) {
    NacreContactPickerDelegate* d =
        objc_getAssociatedObject(object, kNacreContactPickerDelegateKey);
    NSArray<CNContact*>* contacts = d.pendingContacts.firstObject;
    if (contacts != nil) [d.pendingContacts removeObjectAtIndex:0];
    for (CNContact* contact in contacts) {
      out->push_back({NacreKeep(contact), "CNContact"});
    }
    return true;
  }
  return false;
}

// ---- 类方法 ----
static bool ContactsClassCall(const std::string& className, NSString* sel,
                              const NacreArgs& args, std::string* out, std::string* error) {
  if (className == "CNLabeledValue" && [sel isEqualToString:@"localizedStringForLabel:"]) {
    *out = "null";
    id label = args.value(0);
    if (![label isKindOfClass:NSString.class]) {
      *error = "localizedStringForLabel needs a string label";
      return true;
    }
    *out = JSONText([CNLabeledValue localizedStringForLabel:label] ?: label);
    return true;
  }
  // nacre:ownership-exempt stringFromContact:style: —— 只读联系人上的字段，不持有它
  if (className == "CNContactFormatter" && [sel isEqualToString:@"stringFromContact:style:"]) {
    *out = "null";
    // 先验样式再验联系人：样式写错和联系人无关，两种错各报各的
    CNContactFormatterStyle style;
    if (!ContactFormatterStyleFromName(args.value(1), &style)) {
      *error = EnumError(@"style", args.value(1), NamesForContactFormatterStyle());
      return true;
    }
    id given = args.object(0);
    if (![given isKindOfClass:CNContact.class]) {
      *error = "stringFromContact needs a CNContact";
      return true;
    }
    CNContact* contact = (CNContact*)given;
    // 拼姓名要用到的那几个字段没取到时，系统会抛。先问
    id<CNKeyDescriptor> required = [CNContactFormatter descriptorForRequiredKeysForStyle:style];
    if (![contact areKeysAvailable:@[required]]) {
      *error = "stringFromContact: this contact does not carry the name fields this style needs";
      return true;
    }
    *out = JSONText([CNContactFormatter stringFromContact:contact style:style]);
    return true;
  }
  return false;
}

// ---- 构造 ----
static bool ContactsConstruct(const std::string& className, const NacreArgs& args,
                              nacre::NativeObjectRef* out, std::string* error) {
  if (className != "CNContactPickerViewController") return false;
  CNContactPickerViewController* picker = [[CNContactPickerViewController alloc] init];
  NacreContactPickerDelegate* d = [NacreContactPickerDelegate new];
  objc_setAssociatedObject(picker, kNacreContactPickerDelegateKey, d,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  picker.delegate = d;
  *out = {NacreKeep(picker), className};
  return true;
}

// ---- 订阅 ----
static NacreSubscribed ContactsSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:CNContactPickerViewController.class]) return false;
  BOOL mine = [type isEqualToString:kNacrePickerCancel] ||
              [type isEqualToString:kNacrePickerContact] ||
              [type isEqualToString:kNacrePickerContacts] ||
              [type isEqualToString:kNacrePickerProperty];
  // 别的名字不认领：它是页面，模态的三个事件、出现和消失的四个事件、外观
  // 变化，以及运行时自己订的 @dismissed，都归核心和别的域。哪边都不认识的
  // 由核心报错，JS 那一侧把这四个名字补进报错里（见 contacts.js）
  if (!mine) return false;
  CNContactPickerViewController* picker = (CNContactPickerViewController*)object;
  NacreContactPickerDelegate* d = objc_getAssociatedObject(picker, kNacreContactPickerDelegateKey);
  if (d == nil) {
    // 不是上面那个构造建的选择器，委托不是我们的，事件发不出来
    *error = "addEventListener: this CNContactPickerViewController was not created by "
             "new CNContactPickerViewController(), so it cannot report selections";
    return true;
  }
  if (on) {
    [d.types addObject:type];
  } else {
    [d.types removeObject:type];
  }
  // 委托实现了哪几个方法变了。重新设一遍，让选择器重新问：头文件没说它在
  // 什么时候问，设委托的那一刻和呈现的那一刻两种都盖得住
  picker.delegate = nil;
  picker.delegate = d;
  return true;
}

}  // namespace nacre_bridge

// ---- 登记 ----
//
// +load 在 framework 被加载时自动调用：项目装了这个包，生成的工程就嵌这个
// framework，宿主不用写任何代码。
@interface NacreContactsDomain : NSObject
@end

@implementation NacreContactsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "contacts";
  d.classes = {CNContactPickerViewController.class, CNContact.class, CNLabeledValue.class,
               CNPhoneNumber.class, CNContactProperty.class};
  d.read = nacre_bridge::ReadContactsProperty;
  d.write = nacre_bridge::WriteContactsProperty;
  d.readObject = nacre_bridge::ReadContactsObjectProperty;
  d.readObjectArray = nacre_bridge::ReadContactsObjectArray;
  d.call = nacre_bridge::ContactsCallMethod;
  d.callObjectArray = nacre_bridge::ContactsCallObjectArray;
  d.construct = nacre_bridge::ContactsConstruct;
  d.classCall = nacre_bridge::ContactsClassCall;
  d.subscribe = nacre_bridge::ContactsSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
  // JS 那一半（六个类）在这个 framework 自己的 Builtin/parts/ 下
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
