---
type: reference
native: CNContactPickerViewController
status: partial
---

# `CNContactPickerViewController`

**`CNContactPickerViewController`** represents the system's contact picker. It lists every contact in the user's address book; the user picks one (or several), and the app receives the ones picked. Picking a phone number for a top-up, picking a payee for a transfer, picking a few people to invite: all of these use it.

This interface is provided by the system and runs in the system's own process. The app can't see the other contacts in the address book, only the ones the user picks. So it **doesn't need contacts permission**: the system doesn't show an "Allow access to Contacts?" prompt, and the project doesn't need a usage description.

The picker is a [view controller](ui-view-controller.md), presented with the view controller's [`presentViewController()`](ui-view-controller/presentviewcontroller.md). What the user picks is handed to the app with events. The same package also has these classes; they can only be handed back by the picker and can't be created with `new`:

| Class | What it represents |
| --- | --- |
| [`CNContact`](cn-contact.md) | A contact |
| [`CNLabeledValue`](cn-labeled-value.md) | One phone number or email address of a contact, along with its label |
| [`CNPhoneNumber`](cn-phone-number.md) | A phone number |
| [`CNContactProperty`](cn-contact-property.md) | The item the user tapped in a contact's details |
| [`CNContactFormatter`](cn-contact-formatter.md) | Joins a contact's name into one line |

> **Note:** The contact picker isn't in the core; it is only available after you install the `@nacrejs/contacts` package. Without it, none of the classes above exist globally, and type checking reports `Cannot find name`. For how to install it, see [Installation](#installation) below.

> **Note:** Creating the picker, the default values and reading and writing of its properties, and the errors for invalid values have been verified in the acceptance tests in the simulator (iPhone Air). Everything after the picker is presented (how it looks on screen, when the four events arrive, the contacts the events carry) requires a person to operate it and is **not verified in the simulator**; the pages in this group don't repeat this note item by item.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `CNContactPickerViewController`

For how to let the user pick a contact, a phone number, or several people, see the guide [Letting the user pick a contact](../guides/pick-contact.md).

## Installation

The contact picker is a separate capability package. Install it in your project:

```bash
npm install @nacrejs/contacts
```

**Effect**: The next time `ios/` is generated, the project embeds an additional `NacreContacts.framework`; projects that don't install it don't have it in their build output.

Then add a line at the top of your entry file to bring in the types:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />
```

**Effect**: Classes such as `CNContactPickerViewController` and `CNContact` get completion and checking in the editor.

Nothing needs to be added to `nacre.config.json`. Capability packages that need permissions require the project to write a usage description in [`ios.infoPlist`](../guides/project-config.md#writing-usage-descriptions); this package doesn't, so there is also no "generation fails if it's missing" step.

## Constructor

[`CNContactPickerViewController()`](contacts/constructor.md)

Creates a picker. Each picker is used once; create a new one every time.

## Instance properties

Also inherits properties from [`UIViewController`](ui-view-controller.md), such as `title` and `modalPresentationStyle`.

| Property | Description |
| --- | --- |
| [`displayedPropertyKeys`](contacts/displayedpropertykeys.md) | Which fields are shown in a contact's details |

## Instance methods

It has no methods of its own. To present and dismiss it, use the methods inherited from [`UIViewController`](ui-view-controller.md):

| What you want to do | How |
| --- | --- |
| Present it | [`page.presentViewController(picker, { animated: true })`](ui-view-controller/presentviewcontroller.md) |
| Dismiss it from code | [`picker.dismissViewController({ animated: true })`](ui-view-controller/dismissviewcontroller.md). Whether `cancel` fires when it is dismissed from code is not verified; put whatever should happen after dismissal directly after this line |

## Events

Listen with `addEventListener()`. Which event you listen for determines how the picker selects; see [Selection modes](#selection-modes).

| Event | When it fires |
| --- | --- |
| [`contactselect`](contacts/contactselect-event.md) | In single selection, the user tapped a contact |
| [`contactsselect`](contacts/contactsselect-event.md) | In multiple selection, the user tapped "Done" |
| [`contactpropertyselect`](contacts/contactpropertyselect-event.md) | The user tapped an item in a contact's details |
| [`cancel`](contacts/cancel-event.md) | The user didn't pick anything and tapped "Cancel" |
| `beforedismiss`, `dismiss`, `dismissattempt` | Inherited from `UIViewController`; see [Dismissal events](ui-view-controller.md#dismissal-events) |

- Each time a picker is presented, at most one of its four own events above fires, at most once.
- The events can't be canceled; `preventDefault()` has no effect.
- Listening for another name doesn't throw: it is treated as a custom event and is triggered only when you fire it yourself with `dispatchEvent()`.

## Selection modes

The picker has three selection modes. Which one is used isn't set by a property; it depends on which event the app listens for:

| Event listened for | Selection mode | Data the event carries |
| --- | --- | --- |
| `contactselect` | Single selection. The user taps a contact and the picker closes immediately | `contact`: the picked contact |
| `contactsselect` | Multiple selection. Each contact has a checkbox in front of it; the user checks them and taps "Done", and the picker closes | `contacts`: the checked contacts, an array |
| `contactpropertyselect` | Pick an item. The user taps a contact to open that contact's details, then taps one item in the details (a phone number, an email address), and the picker closes | `contactProperty`: the picked item |

- **Listen for only one of the three events.** When you listen for `contactsselect` together with either of the others, the picker uses multiple selection and the other two events don't arrive. Apple's documentation doesn't say how the system selects when you listen for both `contactselect` and `contactpropertyselect`.
- **Listen before presenting.** There's no basis for whether the selection mode changes if you add a listener after the picker is already on screen.
- **What the picker looks like when none of the three is listened for** is not verified. Listen for at least one of them before presenting the picker.

The fourth event, `cancel`, has nothing to do with the selection mode.

## When the picker finishes

The picker finishes in one of two ways:

- The user picked something. One of the events in the table above fires.
- The user didn't pick anything and tapped "Cancel". `cancel` fires.

In both cases the system dismisses the picker; the app doesn't need to call [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md).

- **Whether the picker is fully dismissed when the event fires is not verified.** A view controller can present only one view controller at a time, so whether presenting another one (such as a confirmation dialog) immediately after picking works can only be known by trying it. An approach that doesn't depend on this is to show the result on the current view controller first.
- **After the user picks, the contact the app holds is a copy from that moment.** If the user later edits this contact in Contacts, the app's copy doesn't change, and the app isn't notified.

## Examples

### Picking a contact

The code below starts from a blank app and places a button on the page; tapping it presents the picker. After the user picks a contact, the name and first phone number are shown on the page.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Pick a contact', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const result = new UILabel();
  result.frame = new CGRect(40, 180, 300, 60);
  result.numberOfLines = 0;
  page.view.addSubview(result);

  button.addEventListener('click', () => {
    const picker = new CNContactPickerViewController();
    picker.addEventListener('contactselect', (event) => {
      const contact = event.contact;
      const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
      const phones = contact.phoneNumbers;
      const phone = phones.length > 0 ? phones[0].value.stringValue : 'No phone';
      result.text = (name === null ? 'No name' : name) + '\n' + phone;
    });
    picker.addEventListener('cancel', () => {
      result.text = 'Nothing picked';
    });
    page.presentViewController(picker, { animated: true });
  });
});
```

**Effect**:

- Near the top left of the page is a button with the blue title "Pick a contact".
- Tap it, and the system's contact list slides up from the bottom of the screen, with a search field and "Cancel" at the top. The system doesn't show a permission prompt.
- Tap the contact Alex Chen, and the list disappears; the page shows two lines: `Alex Chen` and his first phone number, for example `555-0100`.
- Tap "Cancel", and the list disappears; the page shows `Nothing picked`.

For more patterns, see the guide [Letting the user pick a contact](../guides/pick-contact.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[CNContactPickerViewController alloc] init]` | `new CNContactPickerViewController()` |
| `picker.delegate = self`, implementing `contactPicker:didSelectContact:` | `picker.addEventListener('contactselect', (e) => { e.contact })` |
| Implementing `contactPicker:didSelectContacts:` | `picker.addEventListener('contactsselect', (e) => { e.contacts })` |
| Implementing `contactPicker:didSelectContactProperty:` | `picker.addEventListener('contactpropertyselect', (e) => { e.contactProperty })` |
| Implementing `contactPickerDidCancel:` | `picker.addEventListener('cancel', () => { … })` |
| `picker.displayedPropertyKeys = @[CNContactPhoneNumbersKey]` | `picker.displayedPropertyKeys = ['phoneNumbers']` |
| `[self presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |

In ObjC, the picker's selection mode is determined by which delegate methods are implemented; in JS, by which events are listened for, one to one.

## See also

- [Letting the user pick a contact](../guides/pick-contact.md): recommended approach, picking a phone number, picking an email address, picking several at once
- [`CNContact`](cn-contact.md): the picked contact
- [`UIViewController`](ui-view-controller.md): the picker's parent class. Presenting, dismissing, dismissal events
- [Core and capability packages](capabilities.md): `@nacrejs/contacts` is a capability package; how capability packages are used
- [System share sheet](ui-activity-view-controller.md): another view controller provided by the system
- [Native classes](native-classes.md): which classes can be created with `new`, and that they can't be subclassed
