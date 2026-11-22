---
type: reference
native: Event
status: partial
---

# `Event`

**`Event`** 表示一次事件：发生了什么（事件名）、派发给了谁、能不能取消。它是所有事件对象的基类，监听器收到的就是它或它的子类。它由运行时提供，是全局的类，可以用 `new Event(type, { cancelable })` 自己构造，再用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发。

带别的数据的事件是它的子类，在它的基础上多带一些字段，比如 [`ErrorEvent`](error-event.md)、[`UIControlTouchEvent`](ui-control-touch-event.md)。全部子类见[带字段的事件](#带字段的事件)。

**继承关系**：`Event`

## 构造函数

[`Event()`](event/constructor.md)

创建一个事件对象。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`type`](event/type.md) <small>只读</small> | 事件名 |
| [`cancelable`](event/cancelable.md) <small>只读</small> | `preventDefault()` 有没有效果 |
| [`target`](event/target.md) <small>只读</small> | 事件派发到的对象 |
| [`currentTarget`](event/currenttarget.md) <small>只读</small> | 和 `target` 相同，因为没有冒泡 |
| [`defaultPrevented`](event/defaultprevented.md) <small>只读</small> | 有没有监听器调过 `preventDefault()` 并且生效了 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`preventDefault()`](event/preventdefault.md) | 取消事件的默认动作 |
| [`stopImmediatePropagation()`](event/stopimmediatepropagation.md) | 同一个对象上排在后面的监听器不再执行 |
| [`stopPropagation()`](event/stoppropagation.md) | 什么都不做，因为没有冒泡 |

## 系统派发的事件不能取消

系统派发的事件，`cancelable` 一律是 `false`：回调执行时事情已经发生，`preventDefault()` 不起作用。例外是系统当场来问、要立刻给答案的事件，各在自己的页面上写明。`application` 的 `error` 和 `unhandledrejection` 的 `cancelable` 是 `true`。

## 带字段的事件

除了 `type`、`target` 还带别的数据的事件，是 `Event` 的子类。一种字段组合是一个类：控件的触摸事件都是 [`UIControlTouchEvent`](ui-control-touch-event.md)，带 `location` 和 `tapCount`；滚动视图的 `scroll` 不带数据，是普通的 `Event`。

- **每个子类都是全局的类。** 能用 `instanceof` 判断，能用 `new` 建一个，再用 `dispatchEvent()` 派发出去试监听器。构造函数的第二个参数里给字段的值，没给的取默认值；`cancelable` 也从这里给。给的值按字段的类型转换，和别处的 API 一样：数用 `Number()` 转、字符串用 `String()` 转，结构体可以给字段齐的普通对象，原生对象不转；转换不了抛 `TypeError`。每个字段怎么转，见各个构造函数页。
- **字段是只读的。** 给它们赋值抛 `TypeError`。唯一能写的是 [`UIScrollViewDragEndEvent`](ui-scroll-view-drag-end-event.md) 的 `targetContentOffset`：系统当场要这个值，监听器写什么，内容就停在哪里。
- **字段在原型上，不在事件对象自己身上。** `Object.keys(event)`、`{ ...event }`、`JSON.stringify(event)` 拿不到它们。要转存或打日志，一个一个读出来。
- **监听器的参数按事件名定类型。** `button.addEventListener('touchupinside', (e) => e.location)` 里 `e` 就是 `UIControlTouchEvent`，不用转换类型；事件名写错，类型检查会报错。一个变量的类型是几个类的联合（比如 `UITextField | UITextView`）时，在它上面调不了 `addEventListener()`：分开写，或者先把它当成 `EventTarget`。

```js
const button = UIButton.buttonWithType('system');
button.addEventListener('touchupinside', (e) => {
  console.log(e instanceof UIControlTouchEvent, Object.keys(e).includes('tapCount'), e.tapCount);
});
button.sendActionsForControlEvents(['touchupinside']);
```

**效果**：输出 `true false 0`：`tapCount` 读得到，但不在 `Object.keys()` 里。

子类和用到它们的事件：

| 类 | 哪些事件 |
| --- | --- |
| **Web 标准** | |
| [`CustomEvent`](custom-event.md) | 原生模块的事件 |
| [`MessageEvent`](message-event.md) | `WebSocket` 的 `message` |
| [`CloseEvent`](close-event.md) | `WebSocket` 的 `close` |
| [`ErrorEvent`](error-event.md) | `application` 和 `WebSocket` 的 `error` |
| [`PromiseRejectionEvent`](promise-rejection-event.md) | `application` 的 `unhandledrejection` |
| **App 和场景** | |
| [`SceneEvent`](scene-event.md) | `application` 的 `sceneconnect`、`scenedisconnect` |
| [`OpenURLEvent`](open-url-event.md) | `application` 的 `openurl` |
| [`UIWindowSceneGeometryChangeEvent`](ui-window-scene-geometry-change-event.md) | `UIWindowScene` 的 `geometrychange` |
| [`UITraitChangeEvent`](ui-trait-change-event.md) | `UIView`、`UIViewController`、`UIWindowScene` 的 `traitchange` |
| [`UIScreenKeyboardEvent`](ui-screen-keyboard-event.md) | `UIScreen` 的三个键盘事件 |
| **控件、手势、滚动、文字** | |
| [`UIControlTouchEvent`](ui-control-touch-event.md) | `UIControl` 的九个 `touch` 事件 |
| [`UIGestureRecognizerEvent`](ui-gesture-recognizer-event.md) | 手势识别器的 `beforebegin` 和点按、长按、轻扫的四个阶段事件 |
| [`UIPanGestureRecognizerEvent`](ui-pan-gesture-recognizer-event.md) | 拖动识别器的四个阶段事件 |
| [`UIPinchGestureRecognizerEvent`](ui-pinch-gesture-recognizer-event.md) | 捏合识别器的四个阶段事件 |
| [`UIRotationGestureRecognizerEvent`](ui-rotation-gesture-recognizer-event.md) | 旋转识别器的四个阶段事件 |
| [`UIScrollViewDragEndEvent`](ui-scroll-view-drag-end-event.md) | `UIScrollView` 的 `beforedragend` |
| [`UICollectionViewItemEvent`](ui-collection-view-item-event.md) | `UICollectionView` 的四个项事件 |
| [`UITextBeforeInputEvent`](ui-text-before-input-event.md) | `UITextField`、`UITextView` 的 `beforeinput` |
| [`UITextViewLinkClickEvent`](ui-text-view-link-click-event.md) | `UITextView` 的 `linkclick` |
| **页面** | |
| [`UIViewControllerAppearanceEvent`](ui-view-controller-appearance-event.md) | `UIViewController` 的四个出现和消失事件 |
| [`UINavigationControllerEvent`](ui-navigation-controller-event.md) | `UINavigationController` 的 `beforeshow`、`show` |
| [`UITabBarControllerEvent`](ui-tab-bar-controller-event.md) | `UITabBarController` 的 `tabselect` |
| [`UIActivityViewControllerCompletionEvent`](ui-activity-view-controller-completion-event.md) | `UIActivityViewController` 的 `complete` |
| **动画** | |
| [`CAAnimationEvent`](ca-animation-event.md) | `CAAnimation` 的 `stop` |
| [`CADisplayLinkEvent`](ca-display-link-event.md) | `CADisplayLink` 的 `tick` |
| **网页** | |
| [`WebContentsWillNavigateEvent`](web-contents-will-navigate-event.md) | `will-navigate` |
| [`WebContentsDidNavigateEvent`](web-contents-did-navigate-event.md) | `did-navigate` |
| [`WebContentsDidFailLoadEvent`](web-contents-did-fail-load-event.md) | `did-fail-load` |
| [`WebContentsIpcMessageEvent`](web-contents-ipc-message-event.md) | `ipc-message` |
| [`WebContentsPreloadErrorEvent`](web-contents-preload-error-event.md) | `preload-error` |
| [`WebContentsPageTitleUpdatedEvent`](web-contents-page-title-updated-event.md) | `page-title-updated` |
| [`WebContentsConsoleMessageEvent`](web-contents-console-message-event.md) | `console-message` |
| **能力包** | |
| [`AVCaptureMetadataOutputDetectEvent`](av-capture-metadata-output-detect-event.md) | `AVCaptureMetadataOutput` 的 `detect` |
| [`AVCaptureSessionInterruptEvent`](av-capture-session-interrupt-event.md) | `AVCaptureSession` 的 `interrupt` |
| [`AVCaptureSessionRuntimeErrorEvent`](av-capture-session-runtime-error-event.md) | `AVCaptureSession` 的 `runtimeerror` |
| [`UIImagePickerControllerMediaEvent`](ui-image-picker-controller-media-event.md) | `UIImagePickerController` 的 `pick` |
| [`CNContactPickerContactEvent`](cn-contact-picker-contact-event.md) | `CNContactPickerViewController` 的 `contactselect` |
| [`CNContactPickerContactsEvent`](cn-contact-picker-contacts-event.md) | `CNContactPickerViewController` 的 `contactsselect` |
| [`CNContactPickerContactPropertyEvent`](cn-contact-picker-contact-property-event.md) | `CNContactPickerViewController` 的 `contactpropertyselect` |
| [`CLLocationUpdateEvent`](cl-location-update-event.md) | `CLLocationManager` 的 `locationupdate` |
| [`CLLocationErrorEvent`](cl-location-error-event.md) | `CLLocationManager` 的 `locationerror` |
| [`PHPickerViewControllerFinishEvent`](ph-picker-view-controller-finish-event.md) | `PHPickerViewController` 的 `pick` |
| [`UNNotificationPresentEvent`](un-notification-present-event.md) | `UNUserNotificationCenter` 的 `notification` |
| [`UNNotificationResponseEvent`](un-notification-response-event.md) | `UNUserNotificationCenter` 的 `notificationclick` |
| [`PushEvent`](push-event.md) | `RemoteNotifications` 的 `push` |

## 示例

```js
application.addEventListener('beforelogout', (e) => {
  console.log(e.type, e.cancelable, e.target === application);
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**结果**：依次输出 `beforelogout true true` 和 `true`。

## 参见

- [`EventTarget`](event-target.md)
