---
type: reference
native: UITextField.textContentType
---

# `UITextField`：`textContentType` 属性

**`textContentType`** 属性说明框里装的是什么内容。系统据此在键盘上方给出建议，或者直接替用户填。它不改变键盘的样子。

## 值

字符串，或者 `null`。一共 48 个取值，下表「系统做什么」一列**未在模拟器验证**，留空的是这里没有可靠的说明：

| 分类 | 取值 | 内容 | 系统做什么 |
| --- | --- | --- | --- |
| 账号 | `'username'` | 用户名 | 和 `'password'` 配对，填充保存过的账号 |
| | `'password'` | 已有的密码 | 同上 |
| | `'newPassword'` | 新设的密码 | 提议生成强密码并保存 |
| | `'oneTimeCode'` | 一次性验证码 | 填充短信里的验证码 |
| 联系方式 | `'emailAddress'` | 邮箱 | 建议用户自己的邮箱 |
| | `'telephoneNumber'` | 电话号码 | 建议用户自己的号码 |
| | `'url'` | 网址 | |
| 姓名 | `'name'` | 全名 | 建议用户自己的姓名 |
| | `'namePrefix'` | 称谓前缀，比如「Dr.」 | |
| | `'givenName'` | 名 | |
| | `'middleName'` | 中间名 | |
| | `'familyName'` | 姓 | |
| | `'nameSuffix'` | 称谓后缀，比如「Jr.」 | |
| | `'nickname'` | 昵称 | |
| | `'jobTitle'` | 职位 | |
| | `'organizationName'` | 公司或组织名 | |
| 地址 | `'location'` | 地点名 | 填充保存过的地址 |
| | `'fullStreetAddress'` | 完整的街道地址 | 同上 |
| | `'streetAddressLine1'` | 街道地址第一行 | 同上 |
| | `'streetAddressLine2'` | 街道地址第二行 | 同上 |
| | `'addressCity'` | 城市 | 同上 |
| | `'addressState'` | 省或州 | 同上 |
| | `'addressCityAndState'` | 城市加省或州 | 同上 |
| | `'sublocality'` | 区 | 同上 |
| | `'countryName'` | 国家 | 同上 |
| | `'postalCode'` | 邮政编码 | 同上 |
| 银行卡 | `'creditCardNumber'` | 卡号 | 填充保存过的卡，或者用相机扫卡号 |
| | `'creditCardName'` | 持卡人全名 | 填充保存过的卡 |
| | `'creditCardGivenName'` | 持卡人的名 | 同上 |
| | `'creditCardMiddleName'` | 持卡人的中间名 | 同上 |
| | `'creditCardFamilyName'` | 持卡人的姓 | 同上 |
| | `'creditCardExpiration'` | 有效期 | 同上 |
| | `'creditCardExpirationMonth'` | 有效期的月 | 同上 |
| | `'creditCardExpirationYear'` | 有效期的年 | 同上 |
| | `'creditCardSecurityCode'` | 安全码 | 同上 |
| | `'creditCardType'` | 卡的类型 | 同上 |
| 日期 | `'birthdate'` | 生日 | |
| | `'birthdateDay'` | 生日的日 | |
| | `'birthdateMonth'` | 生日的月 | |
| | `'birthdateYear'` | 生日的年 | |
| | `'dateTime'` | 日期和时间 | |
| 物流和出行 | `'shipmentTrackingNumber'` | 快递单号 | |
| | `'flightNumber'` | 航班号 | |
| 设备 | `'cellularEID'` | eSIM 的 EID | |
| | `'cellularIMEI'` | 设备的 IMEI | |
| | `'cellularIMEI1'` | 第一个 IMEI | |
| | `'cellularIMEI2'` | 第二个 IMEI | |
| | `'cellularNAL'` | 蜂窝网络的 NAL | |

- 可读，可写。
- 默认值是 `null`，表示没配。
- 写 `null` 清除。
- 不配就没有自动填充，用户得手打。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```

## 示例

### 账号和密码

```js
const account = new UITextField();
account.textContentType = 'username';
const secret = new UITextField();
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
```

**效果**：点其中一个框时，键盘上方多出一栏，列出系统里保存过的账号。用户选一个，两个框一起填好。**未在模拟器验证。**

### 短信验证码

```js
const code = new UITextField();
code.keyboardType = 'numberPad';
code.textContentType = 'oneTimeCode';
```

**效果**：手机收到带验证码的短信后，键盘上方出现这个验证码，用户点一下就填进框里。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.textContentType`。`UITextContentTypeOneTimeCode` 写成 `'oneTimeCode'`，其余同理；`nil` 写成 `null`。

## 参见

- [`isSecureTextEntry`](issecuretextentry.md)
- [`keyboardType`](keyboardtype.md)
