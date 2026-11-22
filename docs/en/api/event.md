---
type: reference
native: Event
status: partial
---

# `Event`

**`Event`** represents an event: what happened (the event name), whom it was dispatched to, and whether it can be canceled. It is the base class of all event objects; what a listener receives is an `Event` or a subclass. It is provided by the runtime as a global class; you can construct one yourself with `new Event(type, { cancelable })` and dispatch it with [`dispatchEvent()`](event-target/dispatchevent.md).

Events that carry other data are its subclasses, with extra fields on top of it, for example [`ErrorEvent`](error-event.md) and [`UIControlTouchEvent`](ui-control-touch-event.md). For all subclasses, see [Events with fields](#events-with-fields).

**Inheritance**: `Event`

## Constructor

[`Event()`](event/constructor.md)

Creates an event object.

## Instance properties

| Property | Description |
| --- | --- |
| [`type`](event/type.md) <small>read-only</small> | The event name |
| [`cancelable`](event/cancelable.md) <small>read-only</small> | Whether `preventDefault()` has an effect |
| [`target`](event/target.md) <small>read-only</small> | The object the event was dispatched to |
| [`currentTarget`](event/currenttarget.md) <small>read-only</small> | Same as `target`, because there is no bubbling |
| [`defaultPrevented`](event/defaultprevented.md) <small>read-only</small> | Whether a listener called `preventDefault()` and it took effect |

## Instance methods

| Method | Description |
| --- | --- |
| [`preventDefault()`](event/preventdefault.md) | Cancels the event's default action |
| [`stopImmediatePropagation()`](event/stopimmediatepropagation.md) | Listeners later on the same object no longer run |
| [`stopPropagation()`](event/stoppropagation.md) | Does nothing, because there is no bubbling |

## Events fired by the system can't be canceled

For events fired by the system, `cancelable` is always `false`: by the time the callback runs, the thing has already happened, and `preventDefault()` has no effect. The exception is events where the system asks on the spot and needs an answer immediately; each says so on its own page. `application`'s `error` and `unhandledrejection` have `cancelable` set to `true`.

## Events with fields

An event that carries data beyond `type` and `target` is a subclass of `Event`. Each combination of fields is one class: all touch events on a control are [`UIControlTouchEvent`](ui-control-touch-event.md), which carries `location` and `tapCount`; a scroll view's `scroll` carries no data and is a plain `Event`.

- **Every subclass is a global class.** You can check it with `instanceof`, build one with `new`, and fire it with `dispatchEvent()` to try a listener. The second constructor argument gives the field values; fields not given take their defaults. `cancelable` is given there too. The values are converted by each field's type, the same as elsewhere in the API: numbers with `Number()`, strings with `String()`, structs accept a plain object with all their fields, native objects are not converted; a value that can't be converted throws `TypeError`. Each constructor page says how its fields are converted.
- **Fields are read-only.** Assigning to them throws `TypeError`. The only writable one is `targetContentOffset` of [`UIScrollViewDragEndEvent`](ui-scroll-view-drag-end-event.md): the system needs that value on the spot, and the content stops wherever the listener writes.
- **Fields live on the prototype, not on the event object itself.** `Object.keys(event)`, `{ ...event }`, and `JSON.stringify(event)` don't include them. To store or log them, read them one by one.
- **A listener's parameter is typed by the event name.** In `button.addEventListener('touchupinside', (e) => e.location)`, `e` is a `UIControlTouchEvent` with no type conversion needed, and a misspelled event name is a type error. When a variable's type is a union of several classes (such as `UITextField | UITextView`), `addEventListener()` can't be called on it: write the calls separately, or treat it as an `EventTarget` first.

```js
const button = UIButton.buttonWithType('system');
button.addEventListener('touchupinside', (e) => {
  console.log(e instanceof UIControlTouchEvent, Object.keys(e).includes('tapCount'), e.tapCount);
});
button.sendActionsForControlEvents(['touchupinside']);
```

**Effect**: prints `true false 0`: `tapCount` can be read, but isn't in `Object.keys()`.

The subclasses and the events that use them:

| Class | Events |
| --- | --- |
| **Web standard** | |
| [`CustomEvent`](custom-event.md) | Events from native modules |
| [`MessageEvent`](message-event.md) | `message` of `WebSocket` |
| [`CloseEvent`](close-event.md) | `close` of `WebSocket` |
| [`ErrorEvent`](error-event.md) | `error` of `application` and `WebSocket` |
| [`PromiseRejectionEvent`](promise-rejection-event.md) | `unhandledrejection` of `application` |
| **App and scenes** | |
| [`SceneEvent`](scene-event.md) | `sceneconnect` and `scenedisconnect` of `application` |
| [`OpenURLEvent`](open-url-event.md) | `openurl` of `application` |
| [`UIWindowSceneGeometryChangeEvent`](ui-window-scene-geometry-change-event.md) | `geometrychange` of `UIWindowScene` |
| [`UITraitChangeEvent`](ui-trait-change-event.md) | `traitchange` of `UIView`, `UIViewController`, and `UIWindowScene` |
| [`UIScreenKeyboardEvent`](ui-screen-keyboard-event.md) | The three keyboard events of `UIScreen` |
| **Controls, gestures, scrolling, and text** | |
| [`UIControlTouchEvent`](ui-control-touch-event.md) | The nine `touch` events of `UIControl` |
| [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) | `beforebegin` of gesture recognizers, and the four phase events of tap, long press, and swipe |
| [`UIPanGestureRecognizerEvent`](ui-pan-gesture-recognizer-event.md) | The four phase events of the pan recognizer |
| [`UIPinchGestureRecognizerEvent`](ui-pinch-gesture-recognizer-event.md) | The four phase events of the pinch recognizer |
| [`UIRotationGestureRecognizerEvent`](ui-rotation-gesture-recognizer-event.md) | The four phase events of the rotation recognizer |
| [`UIScrollViewDragEndEvent`](ui-scroll-view-drag-end-event.md) | `beforedragend` of `UIScrollView` |
| [`UICollectionViewItemEvent`](ui-collection-view-item-event.md) | The four item events of `UICollectionView` |
| [`UITextBeforeInputEvent`](ui-text-before-input-event.md) | `beforeinput` of `UITextField` and `UITextView` |
| [`UITextViewLinkClickEvent`](ui-text-view-link-click-event.md) | `linkclick` of `UITextView` |
| **View controllers** | |
| [`UIViewControllerAppearanceEvent`](ui-view-controller-appearance-event.md) | The four appearance events of `UIViewController` |
| [`UINavigationControllerEvent`](ui-navigation-controller-event.md) | `beforeshow` and `show` of `UINavigationController` |
| [`UITabBarControllerEvent`](ui-tab-bar-controller-event.md) | `tabselect` of `UITabBarController` |
| [`UIActivityViewControllerCompletionEvent`](ui-activity-view-controller-completion-event.md) | `complete` of `UIActivityViewController` |
| **Animation** | |
| [`CAAnimationEvent`](ca-animation-event.md) | `stop` of `CAAnimation` |
| [`CADisplayLinkEvent`](ca-display-link-event.md) | `tick` of `CADisplayLink` |
| **Web pages** | |
| [`WebContentsWillNavigateEvent`](web-contents-will-navigate-event.md) | `will-navigate` |
| [`WebContentsDidNavigateEvent`](web-contents-did-navigate-event.md) | `did-navigate` |
| [`WebContentsDidFailLoadEvent`](web-contents-did-fail-load-event.md) | `did-fail-load` |
| [`WebContentsIpcMessageEvent`](web-contents-ipc-message-event.md) | `ipc-message` |
| [`WebContentsPreloadErrorEvent`](web-contents-preload-error-event.md) | `preload-error` |
| [`WebContentsPageTitleUpdatedEvent`](web-contents-page-title-updated-event.md) | `page-title-updated` |
| [`WebContentsConsoleMessageEvent`](web-contents-console-message-event.md) | `console-message` |
| **Capability packages** | |
| [`AVCaptureMetadataOutputDetectEvent`](av-capture-metadata-output-detect-event.md) | `detect` of `AVCaptureMetadataOutput` |
| [`AVCaptureSessionInterruptEvent`](av-capture-session-interrupt-event.md) | `interrupt` of `AVCaptureSession` |
| [`AVCaptureSessionRuntimeErrorEvent`](av-capture-session-runtime-error-event.md) | `runtimeerror` of `AVCaptureSession` |
| [`UIImagePickerControllerMediaEvent`](ui-image-picker-controller-media-event.md) | `pick` of `UIImagePickerController` |
| [`CNContactPickerContactEvent`](cn-contact-picker-contact-event.md) | `contactselect` of `CNContactPickerViewController` |
| [`CNContactPickerContactsEvent`](cn-contact-picker-contacts-event.md) | `contactsselect` of `CNContactPickerViewController` |
| [`CNContactPickerContactPropertyEvent`](cn-contact-picker-contact-property-event.md) | `contactpropertyselect` of `CNContactPickerViewController` |
| [`CLLocationUpdateEvent`](cl-location-update-event.md) | `locationupdate` of `CLLocationManager` |
| [`CLLocationErrorEvent`](cl-location-error-event.md) | `locationerror` of `CLLocationManager` |
| [`PHPickerViewControllerFinishEvent`](ph-picker-view-controller-finish-event.md) | `pick` of `PHPickerViewController` |
| [`UNNotificationPresentEvent`](un-notification-present-event.md) | `notification` of `UNUserNotificationCenter` |
| [`UNNotificationResponseEvent`](un-notification-response-event.md) | `notificationclick` of `UNUserNotificationCenter` |
| [`PushEvent`](push-event.md) | `push` of `RemoteNotifications` |

## Examples

```js
application.addEventListener('beforelogout', (e) => {
  console.log(e.type, e.cancelable, e.target === application);
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**Result**: Prints `beforelogout true true` and then `true`.

## See also

- [`EventTarget`](event-target.md)
