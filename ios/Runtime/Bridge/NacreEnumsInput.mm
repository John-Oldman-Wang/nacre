// 输入框和键盘
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {


// ---- 输入框 ----
NACRE_ENUM_MAP(KeyboardType, UIKeyboardType,
               @"default": @(UIKeyboardTypeDefault),
               @"asciiCapable": @(UIKeyboardTypeASCIICapable),
               @"numbersAndPunctuation": @(UIKeyboardTypeNumbersAndPunctuation),
               @"url": @(UIKeyboardTypeURL),
               @"numberPad": @(UIKeyboardTypeNumberPad),
               @"phonePad": @(UIKeyboardTypePhonePad),
               @"namePhonePad": @(UIKeyboardTypeNamePhonePad),
               @"emailAddress": @(UIKeyboardTypeEmailAddress),
               @"decimalPad": @(UIKeyboardTypeDecimalPad),
               @"twitter": @(UIKeyboardTypeTwitter),
               @"webSearch": @(UIKeyboardTypeWebSearch),
               @"asciiCapableNumberPad": @(UIKeyboardTypeASCIICapableNumberPad),
               @"alphabet": @(UIKeyboardTypeAlphabet))

NACRE_ENUM_MAP(ReturnKeyType, UIReturnKeyType,
               @"default": @(UIReturnKeyDefault),
               @"go": @(UIReturnKeyGo),
               @"google": @(UIReturnKeyGoogle),
               @"join": @(UIReturnKeyJoin),
               @"next": @(UIReturnKeyNext),
               @"route": @(UIReturnKeyRoute),
               @"search": @(UIReturnKeySearch),
               @"send": @(UIReturnKeySend),
               @"yahoo": @(UIReturnKeyYahoo),
               @"done": @(UIReturnKeyDone),
               @"emergencyCall": @(UIReturnKeyEmergencyCall),
               @"continue": @(UIReturnKeyContinue))

NACRE_ENUM_MAP(TextAutocapitalizationType, UITextAutocapitalizationType,
               @"none": @(UITextAutocapitalizationTypeNone),
               @"words": @(UITextAutocapitalizationTypeWords),
               @"sentences": @(UITextAutocapitalizationTypeSentences),
               @"allCharacters": @(UITextAutocapitalizationTypeAllCharacters))

NACRE_ENUM_MAP(TextAutocorrectionType, UITextAutocorrectionType,
               @"default": @(UITextAutocorrectionTypeDefault),
               @"no": @(UITextAutocorrectionTypeNo),
               @"yes": @(UITextAutocorrectionTypeYes))

NACRE_ENUM_MAP(TextSpellCheckingType, UITextSpellCheckingType,
               @"default": @(UITextSpellCheckingTypeDefault),
               @"no": @(UITextSpellCheckingTypeNo),
               @"yes": @(UITextSpellCheckingTypeYes))

NACRE_ENUM_MAP(KeyboardAppearance, UIKeyboardAppearance,
               @"default": @(UIKeyboardAppearanceDefault),
               @"dark": @(UIKeyboardAppearanceDark),
               @"light": @(UIKeyboardAppearanceLight),
               @"alert": @(UIKeyboardAppearanceAlert))

NACRE_ENUM_MAP(TextBorderStyle, UITextBorderStyle,
               @"none": @(UITextBorderStyleNone),
               @"line": @(UITextBorderStyleLine),
               @"bezel": @(UITextBorderStyleBezel),
               @"roundedRect": @(UITextBorderStyleRoundedRect))

NACRE_ENUM_MAP(TextFieldViewMode, UITextFieldViewMode,
               @"never": @(UITextFieldViewModeNever),
               @"whileEditing": @(UITextFieldViewModeWhileEditing),
               @"unlessEditing": @(UITextFieldViewModeUnlessEditing),
               @"always": @(UITextFieldViewModeAlways))

// 输入框的内容类型。它是 **NSString 常量**不是 NS_ENUM，所以不能走
// NACRE_ENUM_MAP（那个宏的值必须是数字），单独一张表。
//
// 它告诉系统这个框装的是什么：username + password 开启密码自动填充，
// oneTimeCode 开启短信验证码自动填充。不配就全都没有，用户得手打。
NSDictionary<NSString*, UITextContentType>* TextContentTypes() {
  static NSDictionary<NSString*, UITextContentType>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    // **不能用字典字面量。** 其中三个常量（cellularIMEI1 / cellularIMEI2 /
    // cellularNAL）是 API_AVAILABLE(ios(27.0))，在更低的系统上弱链接成
    // nil，往 @{} 里插 nil 当场抛——而且发生在 dispatch_once 里，JS 那边
    // 既捕获不到也看不到任何输出，App 直接段错误退出。
    //
    // 试用报告在 iOS 26.5 上撞到了这个：第一次给任意输入框写
    // textContentType 就崩，不管值是什么。我们自己的验收跑在 iOS 27 的
    // 模拟器上，所以一次都没碰到。
    //
    // 改成逐对加、nil 就跳过：低版本上那三个名字就是「不认识」，写它会
    // 得到一条列出可选值的 TypeError，而不是崩溃。
    NSMutableDictionary<NSString*, UITextContentType>* out =
        [NSMutableDictionary dictionary];
#define NACRE_TCT(key, konst) if ((konst) != nil) out[key] = (konst);
    NACRE_TCT(@"addressCity", UITextContentTypeAddressCity)
    NACRE_TCT(@"addressCityAndState", UITextContentTypeAddressCityAndState)
    NACRE_TCT(@"addressState", UITextContentTypeAddressState)
    NACRE_TCT(@"birthdate", UITextContentTypeBirthdate)
    NACRE_TCT(@"birthdateDay", UITextContentTypeBirthdateDay)
    NACRE_TCT(@"birthdateMonth", UITextContentTypeBirthdateMonth)
    NACRE_TCT(@"birthdateYear", UITextContentTypeBirthdateYear)
    NACRE_TCT(@"cellularEID", UITextContentTypeCellularEID)
    NACRE_TCT(@"cellularIMEI", UITextContentTypeCellularIMEI)
    NACRE_TCT(@"cellularIMEI1", UITextContentTypeCellularIMEI1)
    NACRE_TCT(@"cellularIMEI2", UITextContentTypeCellularIMEI2)
    NACRE_TCT(@"cellularNAL", UITextContentTypeCellularNAL)
    NACRE_TCT(@"countryName", UITextContentTypeCountryName)
    NACRE_TCT(@"creditCardExpiration", UITextContentTypeCreditCardExpiration)
    NACRE_TCT(@"creditCardExpirationMonth", UITextContentTypeCreditCardExpirationMonth)
    NACRE_TCT(@"creditCardExpirationYear", UITextContentTypeCreditCardExpirationYear)
    NACRE_TCT(@"creditCardFamilyName", UITextContentTypeCreditCardFamilyName)
    NACRE_TCT(@"creditCardGivenName", UITextContentTypeCreditCardGivenName)
    NACRE_TCT(@"creditCardMiddleName", UITextContentTypeCreditCardMiddleName)
    NACRE_TCT(@"creditCardName", UITextContentTypeCreditCardName)
    NACRE_TCT(@"creditCardNumber", UITextContentTypeCreditCardNumber)
    NACRE_TCT(@"creditCardSecurityCode", UITextContentTypeCreditCardSecurityCode)
    NACRE_TCT(@"creditCardType", UITextContentTypeCreditCardType)
    NACRE_TCT(@"dateTime", UITextContentTypeDateTime)
    NACRE_TCT(@"emailAddress", UITextContentTypeEmailAddress)
    NACRE_TCT(@"familyName", UITextContentTypeFamilyName)
    NACRE_TCT(@"flightNumber", UITextContentTypeFlightNumber)
    NACRE_TCT(@"fullStreetAddress", UITextContentTypeFullStreetAddress)
    NACRE_TCT(@"givenName", UITextContentTypeGivenName)
    NACRE_TCT(@"jobTitle", UITextContentTypeJobTitle)
    NACRE_TCT(@"location", UITextContentTypeLocation)
    NACRE_TCT(@"middleName", UITextContentTypeMiddleName)
    NACRE_TCT(@"name", UITextContentTypeName)
    NACRE_TCT(@"namePrefix", UITextContentTypeNamePrefix)
    NACRE_TCT(@"nameSuffix", UITextContentTypeNameSuffix)
    NACRE_TCT(@"newPassword", UITextContentTypeNewPassword)
    NACRE_TCT(@"nickname", UITextContentTypeNickname)
    NACRE_TCT(@"oneTimeCode", UITextContentTypeOneTimeCode)
    NACRE_TCT(@"organizationName", UITextContentTypeOrganizationName)
    NACRE_TCT(@"password", UITextContentTypePassword)
    NACRE_TCT(@"postalCode", UITextContentTypePostalCode)
    NACRE_TCT(@"shipmentTrackingNumber", UITextContentTypeShipmentTrackingNumber)
    NACRE_TCT(@"streetAddressLine1", UITextContentTypeStreetAddressLine1)
    NACRE_TCT(@"streetAddressLine2", UITextContentTypeStreetAddressLine2)
    NACRE_TCT(@"sublocality", UITextContentTypeSublocality)
    NACRE_TCT(@"telephoneNumber", UITextContentTypeTelephoneNumber)
    NACRE_TCT(@"url", UITextContentTypeURL)
    NACRE_TCT(@"username", UITextContentTypeUsername)
#undef NACRE_TCT
    table = out;
  });
  return table;
}

BOOL TextContentTypeFromName(NSString* name, UITextContentType* out) {
  if (![name isKindOfClass:NSString.class]) return NO;
  UITextContentType v = TextContentTypes()[name];
  if (v == nil) return NO;
  *out = v;
  return YES;
}

NSString* NameForTextContentType(UITextContentType value) {
  if (value == nil) return nil;
  for (NSString* key in TextContentTypes()) {
    if ([TextContentTypes()[key] isEqualToString:value]) return key;
  }
  return nil;
}

NSString* NamesForTextContentType(void) {
  return [TextContentTypes().allKeys componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
