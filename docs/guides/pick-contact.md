# 让用户选联系人

这一篇讲怎么用 [`CNContactPickerViewController`](../api/contacts.md) 让用户从通讯录里选一个联系人、一个电话、一个邮箱或者几个人，以及怎么把拿到的 [`CNContact`](../api/cn-contact.md) 显示出来。每个成员的细节在各个类的参考页。

开始之前先装 `@nacrejs/contacts`，见[先装上](../api/contacts.md#先装上)。这个包不需要权限文案。

选择器弹出来之后的行为要有人操作，这一篇里涉及它的效果都**未在模拟器验证**。

## 推荐的做法

- **每次选都新建一个选择器。** 选择器用过一次之后再弹第二次会怎样没有验证。
- **在弹出之前监听，三个「选中了」的事件只监听一个。** 监听哪个事件决定选择器怎么选，见[选法](../api/contacts.md#选法)。
- **只要一个号码时，用「选某一项」，不要用单选。** 一个联系人可以有几个电话。单选拿到的是整个联系人，哪个号码才是用户想要的，App 还得自己再问一次；「选某一项」让用户在系统的详情页里直接点那个号码。写法见[让用户选一个电话号码](#让用户选一个电话号码)。
- **显示姓名用 [`CNContactFormatter.stringFromContact()`](../api/cn-contact-formatter/stringfromcontact.md)，不要自己把姓和名拼起来。** 中文、日文的姓在前，英文的名在前，中间有没有空格也不一样。这个方法按姓名本身的文字和用户的设置来拼。
- **显示电话的标签前，用 [`CNLabeledValue.localizedStringForLabel()`](../api/cn-labeled-value/localizedstringforlabel.md) 换一下。** 系统自带的标签存的是一个记号（「手机」存的是 `_$!<Mobile>!$_`），不能直接给用户看。
- **号码用之前自己规整。** `stringValue` 是用户在通讯录里填的原文，可能带空格、横线、括号、国家码。
- **选完先把结果显示在当前页面上。** 事件派发时选择器是不是已经完全关掉没有验证，选完立刻再弹一个页面不一定成。

## 第一个例子

从空白 App 开始，在页面上放一个按钮，点它弹出选择器；用户选了一个联系人之后，把姓名和第一个电话显示在页面上。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

/** @type {UIViewController} */
let page;
/** @type {UILabel} */
let result;

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('选联系人', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  result = new UILabel();
  result.frame = new CGRect(40, 180, 300, 60);
  result.numberOfLines = 0;
  page.view.addSubview(result);

  button.addEventListener('click', () => {
    // 1. 每次选都新建一个选择器
    const picker = new CNContactPickerViewController();

    // 2. 监听 contactselect：选择器是单选的
    picker.addEventListener('contactselect', (event) => {
      const contact = event.contact;
      const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
      const phones = contact.phoneNumbers;
      const phone = phones.length > 0 ? phones[0].value.stringValue : '没有电话';
      result.text = (name === null ? '没有名字' : name) + '\n' + phone;
    });

    // 3. 用户没选就关掉了
    picker.addEventListener('cancel', () => {
      result.text = '没有选';
    });

    // 4. 从当前页面弹出来
    page.presentViewController(picker, { animated: true });
  });
});
```

**效果**：

- 页面左上方有一个蓝色文字的按钮「选联系人」。
- 点它，屏幕底部升起系统的联系人列表，顶上有搜索框和「取消」。系统没有弹出权限询问。
- 点联系人 Alex Chen，列表消失，页面上显示两行：`Alex Chen` 和他的第一个电话，比如 `555-0100`。
- 点「取消」，列表消失，页面上显示 `没有选`。

下面的例子沿用这里的 `page` 和 `result`，各自写成一个函数，在按钮的 `click` 里调用。

## 让用户选一个电话号码

```js
function pickPhoneNumber() {
  const picker = new CNContactPickerViewController();
  // 联系人详情里只显示电话
  picker.displayedPropertyKeys = ['phoneNumbers'];
  // 监听 contactpropertyselect：点联系人进详情，再点一个号码
  picker.addEventListener('contactpropertyselect', (event) => {
    const property = event.contactProperty;
    if (property.value instanceof CNPhoneNumber) {
      const name = CNContactFormatter.stringFromContact(property.contact, { style: 'fullName' });
      result.text = (name === null ? '' : name + '：') + property.value.stringValue;
    }
  });
  page.presentViewController(picker, { animated: true });
}
```

**效果**：

- 点一个联系人，进入他的详情，详情里只有电话那几行。
- 点其中一个号码，选择器关掉，页面上显示 `Alex Chen：555-0100`。

`property.value` 的类型取决于用户点的是哪种字段，所以先用 `instanceof` 判断。`displayedPropertyKeys` 把详情限制成只有电话，用户就点不到别的字段。

## 让用户选一个邮箱

```js
function pickEmail() {
  const picker = new CNContactPickerViewController();
  picker.displayedPropertyKeys = ['emailAddresses'];
  picker.addEventListener('contactpropertyselect', (event) => {
    const value = event.contactProperty.value;
    if (typeof value === 'string') {
      result.text = value;
    }
  });
  page.presentViewController(picker, { animated: true });
}
```

**效果**：点一个联系人，详情里只有邮箱；点其中一个，页面上显示这个邮箱，比如 `alex@example.com`。

邮箱的值是字符串，电话的值是 `CNPhoneNumber`。

## 一次选几个联系人

```js
function pickSeveral() {
  const picker = new CNContactPickerViewController();
  // 监听 contactsselect：选择器是多选的
  picker.addEventListener('contactsselect', (event) => {
    const names = event.contacts.map((contact) =>
      CNContactFormatter.stringFromContact(contact, { style: 'fullName' }));
    result.text = '选了 ' + names.length + ' 个：' + names.join('、');
  });
  page.presentViewController(picker, { animated: true });
}
```

**效果**：

- 列表里每个联系人前面有一个勾选框，右上角有「完成」。
- 勾两个再点「完成」，选择器关掉，页面上显示 `选了 2 个：Alex Chen、Sam Rivera`。

## 把一个联系人的电话连同标签列出来

```js
function listPhones() {
  const picker = new CNContactPickerViewController();
  picker.addEventListener('contactselect', (event) => {
    const lines = event.contact.phoneNumbers.map((item) => {
      const label = item.label === null
        ? ''
        : CNLabeledValue.localizedStringForLabel(item.label) + ' ';
      return label + item.value.stringValue;
    });
    result.text = lines.join('\n');
  });
  page.presentViewController(picker, { animated: true });
}
```

**效果**：页面上每行一个电话，前面是标签在当前语言下的写法，比如中文系统上是 `手机 555-0100`、`工作 555-0199`。

`label` 可能是 `null`（这个电话没有标签），所以先判断。

## 联系人只填了公司，没有名字

```js
function pickAndShowName() {
  const picker = new CNContactPickerViewController();
  picker.addEventListener('contactselect', (event) => {
    const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
    result.text = name === null ? '（没有名字）' : name;
  });
  page.presentViewController(picker, { animated: true });
}
```

**效果**：

- 填了姓名的联系人，显示姓名。
- 只填了公司的联系人，显示公司名。
- 姓名和公司都没填的联系人，`stringFromContact()` 给的是 `null`，显示 `（没有名字）`。

## 参见

- [`CNContactPickerViewController`](../api/contacts.md)：选法、事件、什么时候结束
- [`CNContact`](../api/cn-contact.md)：联系人能读的字段
- [`CNLabeledValue`](../api/cn-labeled-value.md)：电话和邮箱的标签
- [`CNContactProperty`](../api/cn-contact-property.md)：详情里点的那一项
- [`CNContactFormatter`](../api/cn-contact-formatter.md)：把姓名拼成一行
