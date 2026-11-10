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
    table = @{
               @"addressCity": UITextContentTypeAddressCity,
               @"addressCityAndState": UITextContentTypeAddressCityAndState,
               @"addressState": UITextContentTypeAddressState,
               @"birthdate": UITextContentTypeBirthdate,
               @"birthdateDay": UITextContentTypeBirthdateDay,
               @"birthdateMonth": UITextContentTypeBirthdateMonth,
               @"birthdateYear": UITextContentTypeBirthdateYear,
               @"cellularEID": UITextContentTypeCellularEID,
               @"cellularIMEI": UITextContentTypeCellularIMEI,
               @"cellularIMEI1": UITextContentTypeCellularIMEI1,
               @"cellularIMEI2": UITextContentTypeCellularIMEI2,
               @"cellularNAL": UITextContentTypeCellularNAL,
               @"countryName": UITextContentTypeCountryName,
               @"creditCardExpiration": UITextContentTypeCreditCardExpiration,
               @"creditCardExpirationMonth": UITextContentTypeCreditCardExpirationMonth,
               @"creditCardExpirationYear": UITextContentTypeCreditCardExpirationYear,
               @"creditCardFamilyName": UITextContentTypeCreditCardFamilyName,
               @"creditCardGivenName": UITextContentTypeCreditCardGivenName,
               @"creditCardMiddleName": UITextContentTypeCreditCardMiddleName,
               @"creditCardName": UITextContentTypeCreditCardName,
               @"creditCardNumber": UITextContentTypeCreditCardNumber,
               @"creditCardSecurityCode": UITextContentTypeCreditCardSecurityCode,
               @"creditCardType": UITextContentTypeCreditCardType,
               @"dateTime": UITextContentTypeDateTime,
               @"emailAddress": UITextContentTypeEmailAddress,
               @"familyName": UITextContentTypeFamilyName,
               @"flightNumber": UITextContentTypeFlightNumber,
               @"fullStreetAddress": UITextContentTypeFullStreetAddress,
               @"givenName": UITextContentTypeGivenName,
               @"jobTitle": UITextContentTypeJobTitle,
               @"location": UITextContentTypeLocation,
               @"middleName": UITextContentTypeMiddleName,
               @"name": UITextContentTypeName,
               @"namePrefix": UITextContentTypeNamePrefix,
               @"nameSuffix": UITextContentTypeNameSuffix,
               @"newPassword": UITextContentTypeNewPassword,
               @"nickname": UITextContentTypeNickname,
               @"oneTimeCode": UITextContentTypeOneTimeCode,
               @"organizationName": UITextContentTypeOrganizationName,
               @"password": UITextContentTypePassword,
               @"postalCode": UITextContentTypePostalCode,
               @"shipmentTrackingNumber": UITextContentTypeShipmentTrackingNumber,
               @"streetAddressLine1": UITextContentTypeStreetAddressLine1,
               @"streetAddressLine2": UITextContentTypeStreetAddressLine2,
               @"sublocality": UITextContentTypeSublocality,
               @"telephoneNumber": UITextContentTypeTelephoneNumber,
               @"url": UITextContentTypeURL,
               @"username": UITextContentTypeUsername,
    };
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
