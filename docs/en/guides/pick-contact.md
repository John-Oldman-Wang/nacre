# Letting the user pick a contact

This guide covers how to use [`CNContactPickerViewController`](../api/contacts.md) to let the user pick a contact, a phone number, an email address, or several people from their contacts, and how to display the [`CNContact`](../api/cn-contact.md) you get. Details of each member are on each class's reference page.

Before you start, install `@nacrejs/contacts`; see [Installation](../api/contacts.md#installation). This package needs no usage description.

What the picker does after it is presented requires someone to operate it, so every effect involving it in this guide is **not verified in the simulator**.

## Recommended approach

- **Create a new picker for each pick.** What happens when a used picker is presented a second time hasn't been verified.
- **Listen before presenting, and listen for only one of the three "selected" events.** Which event you listen for decides how the picker picks; see [Ways of picking](../api/contacts.md#selection-modes).
- **When you need only one number, use "pick one property", not single selection.** A contact can have several phone numbers. Single selection gives you the whole contact, and the app still has to ask which number the user meant; "pick one property" lets the user tap that number directly in the system's detail view. For how, see [Letting the user pick a phone number](#letting-the-user-pick-a-phone-number).
- **To display names, use [`CNContactFormatter.stringFromContact()`](../api/cn-contact-formatter/stringfromcontact.md); don't join the family and given names yourself.** Chinese and Japanese put the family name first, English puts the given name first, and whether there is a space between them differs too. This method joins them based on the script of the name itself and the user's settings.
- **Before displaying a phone label, convert it with [`CNLabeledValue.localizedStringForLabel()`](../api/cn-labeled-value/localizedstringforlabel.md).** The system's built-in labels are stored as tokens (the Mobile label is stored as `_$!<Mobile>!$_`) and can't be shown to the user directly.
- **Normalize numbers yourself before using them.** `stringValue` is the raw text the user entered in Contacts, and may include spaces, hyphens, parentheses, and country codes.
- **After picking, first show the result on the current view controller.** Whether the picker has fully closed when the event fires hasn't been verified, so presenting another view controller immediately after picking may not work.

## First example

Starting from a blank app, put a button on the view; tapping it presents the picker, and after the user picks a contact, the name and first phone number are shown on the view.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

/** @type {UIViewController} */
let page;
/** @type {UILabel} */
let result;

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Pick Contact', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  result = new UILabel();
  result.frame = new CGRect(40, 180, 300, 60);
  result.numberOfLines = 0;
  page.view.addSubview(result);

  button.addEventListener('click', () => {
    // 1. Create a new picker for each pick
    const picker = new CNContactPickerViewController();

    // 2. Listen for contactselect: the picker uses single selection
    picker.addEventListener('contactselect', (event) => {
      const contact = event.contact;
      const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
      const phones = contact.phoneNumbers;
      const phone = phones.length > 0 ? phones[0].value.stringValue : 'No phone';
      result.text = (name === null ? 'No name' : name) + '\n' + phone;
    });

    // 3. The user closed it without picking
    picker.addEventListener('cancel', () => {
      result.text = 'Nothing picked';
    });

    // 4. Present it from the current view controller
    page.presentViewController(picker, { animated: true });
  });
});
```

**Effect**:

- A button with blue text, "Pick Contact", appears at the top left of the view.
- Tapping it slides the system contact list up from the bottom of the screen, with a search field and "Cancel" at the top. The system doesn't ask for permission.
- Tapping the contact Alex Chen closes the list, and the view shows two lines: `Alex Chen` and his first phone number, such as `555-0100`.
- Tapping "Cancel" closes the list, and the view shows `Nothing picked`.

The examples below reuse `page` and `result` from here; each is written as a function to call from the button's `click`.

## Letting the user pick a phone number

```js
function pickPhoneNumber() {
  const picker = new CNContactPickerViewController();
  // Show only phone numbers in the contact details
  picker.displayedPropertyKeys = ['phoneNumbers'];
  // Listen for contactpropertyselect: tap a contact to open the details, then tap a number
  picker.addEventListener('contactpropertyselect', (event) => {
    const property = event.contactProperty;
    if (property.value instanceof CNPhoneNumber) {
      const name = CNContactFormatter.stringFromContact(property.contact, { style: 'fullName' });
      result.text = (name === null ? '' : name + ': ') + property.value.stringValue;
    }
  });
  page.presentViewController(picker, { animated: true });
}
```

**Effect**:

- Tapping a contact opens their details, which contain only the phone number rows.
- Tapping one of the numbers closes the picker, and the view shows `Alex Chen: 555-0100`.

The type of `property.value` depends on which kind of field the user tapped, so check with `instanceof` first. `displayedPropertyKeys` restricts the details to phone numbers only, so the user can't tap other fields.

## Letting the user pick an email address

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

**Effect**: Tapping a contact shows details with only email addresses; tapping one shows that address on the view, such as `alex@example.com`.

An email address's value is a string; a phone number's value is a `CNPhoneNumber`.

## Picking several contacts at once

```js
function pickSeveral() {
  const picker = new CNContactPickerViewController();
  // Listen for contactsselect: the picker uses multiple selection
  picker.addEventListener('contactsselect', (event) => {
    const names = event.contacts.map((contact) =>
      CNContactFormatter.stringFromContact(contact, { style: 'fullName' }));
    result.text = 'Picked ' + names.length + ': ' + names.join(', ');
  });
  page.presentViewController(picker, { animated: true });
}
```

**Effect**:

- Each contact in the list has a checkbox in front of it, and there is "Done" at the top right.
- Checking two and tapping "Done" closes the picker, and the view shows `Picked 2: Alex Chen, Sam Rivera`.

## Listing a contact's phone numbers with their labels

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

**Effect**: The view shows one phone number per line, preceded by the label as written in the current language; for example, on a system set to Chinese it is `手机 555-0100` and `工作 555-0199`.

`label` can be `null` (the number has no label), so check first.

## A contact with only a company and no name

```js
function pickAndShowName() {
  const picker = new CNContactPickerViewController();
  picker.addEventListener('contactselect', (event) => {
    const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
    result.text = name === null ? '(No name)' : name;
  });
  page.presentViewController(picker, { animated: true });
}
```

**Effect**:

- For a contact with a name, the name is shown.
- For a contact with only a company, the company name is shown.
- For a contact with neither a name nor a company, `stringFromContact()` gives `null`, and `(No name)` is shown.

## See also

- [`CNContactPickerViewController`](../api/contacts.md): ways of picking, events, when it ends
- [`CNContact`](../api/cn-contact.md): the fields of a contact you can read
- [`CNLabeledValue`](../api/cn-labeled-value.md): labels on phone numbers and email addresses
- [`CNContactProperty`](../api/cn-contact-property.md): the property tapped in the details
- [`CNContactFormatter`](../api/cn-contact-formatter.md): joining a name into one line
