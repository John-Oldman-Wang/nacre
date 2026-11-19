# Guides

Each guide walks through one task step by step. For the details of a specific property or method, see the [API reference](../api/README.md).

## Getting started

| Page | Description |
| --- | --- |
| [Building your own app](your-own-app.md) | Build an iOS App that uses Nacre from scratch: four files, a few packages, two commands, and it shows up in the simulator. |
| [Configuring the app: name, languages, usage descriptions](project-config.md) | The app's name, bundle ID, supported languages, the sentence shown when asking the user for a permission, and which links can open it are all written in `nacre.config.json` at the project root. |

## App and view controllers

| Page | Description |
| --- | --- |
| [Creating windows and handling scenes](scenes-and-windows.md) | This guide covers where an app's interface begins: waiting for the system to hand over a scene (`UIWindowScene`), creating a window (`UIWindow`) on the scene, and what to do with the interface when the system destroys a scene and connects it again. |
| [Handling the app lifecycle](app-lifecycle.md) | This guide shows where code goes as the app moves from launch to the background, back to the foreground, and through low memory: building the UI, saving data, releasing caches, keeping the screen on, and passing messages between parts of the app. |
| [Handling errors in one place](handle-errors.md) | This guide covers how to catch, in one place, every uncaught exception and unhandled Promise rejection in the app. |
| [Handling links that open the app](open-links.md) | This guide shows how, when the user taps a link to your app in another app or a web page, to receive that link and jump to the matching page. |
| [Building a view controller](pages.md) | This guide shows how to use `UIViewController` to build one screen of content: putting things on it, setting its title, doing things when it appears and disappears, and embedding another view controller in it. |
| [Navigating between view controllers](navigation.md) | This guide covers how to use the navigation controller `UINavigationController` to build interfaces that go in level by level and come back level by level, like "list → detail → one level deeper": pushing, going back, knowing which view controller you're on, cleaning up when a view controller leaves, and navigating by path. |
| [Presenting a modal view controller](modal-pages.md) | This guide shows how to present a view controller modally, how to dismiss it, and how to know the user swiped it away. |
| [Building bottom tabs](tabs.md) | This guide covers how to use the tab bar controller `UITabBarController` to build a main interface with a row of tabs at the bottom of the screen, like "Home, Market, Me": setting how tabs look, adding badges, switching, and putting a navigation stack in each tab. |
| [Putting buttons and a title in the navigation bar](bar-buttons.md) | This guide shows how to set up what appears in the navigation bar: the title in the middle, buttons on the right and left, and the back button. |
| [Showing alerts and menus](alerts.md) | This guide shows how to use the system alert controller `UIAlertController` and its buttons, `UIAlertAction`, to notify the user, ask for confirmation, offer a choice among several actions, and collect a line of text. |
| [Sharing content](share.md) | This guide covers how to use the system share sheet `UIActivityViewController` to hand text, links, and images to other apps or system actions, and how to know whether the user shared. |

## Views and layout

| Page | Description |
| --- | --- |
| [Placing views on screen](views.md) | This guide shows how to use `UIView` to put things on screen: creating views, giving them a position and size, setting their appearance, and adding them to the view hierarchy, as well as adjusting stacking order, hiding, removing, rounding corners, clipping, transforming, and responding to taps. |
| [Laying out with constraints](auto-layout.md) | This guide covers how to position views with constraints (Auto Layout): fixed width and height, centering, pinning to edges, avoiding the notch, stacking vertically, equal widths, proportions, minimum and maximum sizes, expanding and collapsing, placeholders, following the keyboard, and how to investigate when constraints are wrong. |
| [Arranging views in a row or column](stack-views.md) | This guide shows how to use `UIStackView` to arrange a group of views in a row or column: dividing space equally, letting one item fill the remaining space, alignment, hiding, inserting and removing, padding, background color and rounded corners, and nesting to make multiple rows. |
| [Building a scrolling view](scrolling.md) | This guide covers how to use `UIScrollView` to build a view that scrolls: setting up the structure, finding out why it won't scroll, reading the scroll position, scrolling from code, horizontal scrolling, carousels, and the keyboard. |
| [Building a list](lists.md) | This guide covers how to use `UICollectionView` to build a list: supplying data, adding, deleting, and changing rows, sections, selection, scrolling to an item, loading more, and placing your own views in cells. |
| [Creating blur and glass effects](blur-and-glass.md) | This guide covers how to use `UIVisualEffectView` to make a translucent blurred panel, make text on the panel more vivid, use iOS 26's glass, and what to check when no effect is visible. |
| [Showing loading and progress](loading-and-progress.md) | This guide covers how to tell the user that "something is in progress": use a spinner, `UIActivityIndicatorView`, when you do not know how long it will take, and a progress bar, `UIProgressView`, when you know how much is done. |
| [Building a toolbar](toolbars.md) | This guide shows how to build a row of buttons with `UIToolbar`: placing it at the bottom of the page, arranging buttons, adding and removing buttons, and putting it above the keyboard. |

## Text, images, and color

| Page | Description |
| --- | --- |
| [Displaying text](labels.md) | This guide shows how to display text with `UILabel`: titles, multi-line descriptions, truncating or shrinking when text doesn't fit, measuring how much space text needs, and shadows. |
| [Setting fonts](fonts.md) | This guide shows how to use `UIFont` to set the font of text: size, weight, italic, monospaced, following the user's text size setting, and using a font by name. |
| [Displaying styled text](attributed-text.md) | This guide covers how to use attributed strings to mix several fonts and colors in one piece of text, add underlines, strikethroughs, and shadows, adjust line spacing and alignment, insert images, measure size, and how attributed strings are read and written on labels, text fields, and buttons. |
| [Displaying images](images.md) | This guide covers how to use `UIImage` and `UIImageView` to display images: images bundled in the app, system icons, images from the network, images in local files, and animated images, as well as how images are positioned, tinted, and stretched. |
| [Setting colors](colors.md) | This guide shows how to set colors on views, text, and layers: fixed colors, translucent colors, colors that follow light and dark mode, colors from an Asset Catalog, and how to read, compare, and remove colors. |
| [Supporting Dark Mode](dark-mode.md) | This guide covers how to make the UI follow light and Dark Mode: when colors alone are enough, how to tell the current appearance, how to build a theme switch in the app, and how to make colors and font sizes on layers follow along. |

## Controls, input, and gestures

| Page | Description |
| --- | --- |
| [Building a button](buttons.md) | This guide shows how to build common buttons with `UIButton`: creating them, responding to taps, changing the appearance, disabling, and adding images. |
| [Handling touches on controls](control-touches.md) | This guide covers how to respond to touches with the control events of `UIControl`: responding to taps, changing the appearance while pressed, telling where the finger was lifted, disabling, simulating taps in code, and making your own tappable area. |
| [Building switches, sliders, and steppers](switches-sliders-steppers.md) | This guide shows how to let the user choose a value with three value controls: `UISwitch` (a switch with two values), `UISlider` (a slider that picks a value in a continuous range), and `UIStepper` (a stepper that increments and decrements one step at a time). |
| [Building segmented controls and page indicators](segmented-and-page-controls.md) | This guide covers common uses of two controls: `UISegmentedControl` (a segmented control, for switching between several side-by-side options) and `UIPageControl` (a page indicator, a row of small dots showing how many pages there are and which one is current). |
| [Letting the user pick a date and time](date-pickers.md) | This guide covers how to use `UIDatePicker` to let the user pick a date, a time, or a duration: choosing a style, limiting the range, picking a duration, and changing the date in code. |
| [Building a text field](text-fields.md) | This guide covers how to use `UITextField` for single-line input: reading the content, responding to input, showing and dismissing the keyboard, staying clear of the keyboard, restricting input, and building a login form. |
| [Building a multiline text view](multiline-text.md) | This guide shows how to use `UITextView` for multiline input: reading and writing the content, showing placeholder text, growing with the content, read-only display, dismissing the keyboard, and staying clear of the keyboard. |
| [Building a search bar](search.md) | This guide covers how to use `UISearchBar` for search: placing it in a view controller, filtering as the user types, submitting a search, the cancel button, scope buttons, and keyboard settings. |
| [Responding to gestures](gestures.md) | This guide covers how to use gesture recognizers to make ordinary views respond to taps, long presses, drags, pinches, rotations, and swipes, and which one takes effect when a recognizer is combined with a button, with another recognizer, or with a scroll view. |

## Layers and animation

| Page | Description |
| --- | --- |
| [Drawing rounded corners, shadows, gradients, and shapes with layers](layers.md) | This guide covers how to use layers to give views rounded corners, borders, and shadows; how to draw gradients with `CAGradientLayer` and polylines, wedges, progress rings, and dashed lines with `CAShapeLayer`; and how to keep sublayer sizes in line with views and colors in line with light and dark mode. |
| [Drawing a path](drawing-paths.md) | This guide shows how to outline shapes with `UIBezierPath` and hand them to `CAShapeLayer` to draw on screen: rectangles, rounded corners, arcs, polylines, curves, pie slices, and testing whether a point falls inside a shape. |
| [Animating views](view-animations.md) | This guide covers how to use `UIView.animateWithDuration()` to animate changes to view properties: fading in and out, moving, scaling, changing constraints, spring effects, and doing the next thing after an animation ends. |
| [Animating layers](animation.md) | This guide covers how to make a layer's properties change continuously over time: fading in and out, moving, blinking, moving along a path, spring bounces, and how to turn off the transitions the system adds automatically. |
| [Running code every frame](frame-callback.md) | This guide shows how to use `CADisplayLink` to run code once every time the screen refreshes a frame, updating the UI frame by frame from code: starting, stopping, computing positions from elapsed time, and controlling the frame rate. |

## Networking and web content

| Page | Description |
| --- | --- |
| [Fetching data from the network](fetch.md) | This guide covers making HTTP requests with `fetch()`: getting JSON, sending data, uploading and downloading files, handling failures, canceling, and timeouts. |
| [Reading a response as it downloads](streaming-response.md) | This guide covers how to use `body` on `Response` to read the content chunk by chunk before it has finished downloading: handling large files, showing download progress, and reading text the server keeps pushing. |
| [Building and parsing URLs](urls.md) | This guide covers how to use `URL` to build and take apart URLs, `URLSearchParams` to change query parameters, and `Headers` to prepare request headers. |
| [Sending and receiving messages with WebSocket](websocket.md) | This guide covers how to keep a long-lived connection to a server with `WebSocket`: connecting, sending and receiving text and binary data, sending and receiving JSON, closing, and automatically reconnecting after a disconnect and checking the connection periodically. |
| [Displaying web pages](web-pages.md) | This guide covers using `WebView` to display web pages in your app: loading addresses and local files, handling load failures, going back and forward, restricting where a page can go, loading ahead of time, destroying a page, and recovering after a crash. |
| [Messaging between a web page and the app](web-page-messaging.md) | This guide covers how a web page calls the app's features, how it asks the app for a result, and how the app notifies the web page. |
| [Managing web page sign-in state](web-login.md) | This guide shows how the app manages the login state of web pages in a `WebView`: write login cookies before opening a page, read the cookies a page gets after it logs in itself, clear data on logout, and keep multiple accounts separate. |

## Data and utilities

| Page | Description |
| --- | --- |
| [Saving user settings](save-settings.md) | This guide shows how to use `application.storage` to save user settings and small amounts of state: registering defaults, storing objects and times, and observing changes. |
| [Reading and writing files](files.md) | This guide covers how to use `application.fileSystem` to save and read files: choosing a directory, storing JSON, caching downloaded content, and handling errors. |
| [Saving login tokens](save-secrets.md) | This guide shows how to use `application.keychain` to save login tokens, passwords, and keys: which kind of storage to choose, which accessibility level to choose, reading them at launch, and removing them at sign-out. |
| [Delaying and repeating code](timers.md) | This guide covers how to use timers to run code after a delay, run code repeatedly, wait for a while in an `async` function, and wait for a condition to become true. |
| [Measuring how long code takes](measure-time.md) | This guide shows how to use `performance.now()` to measure how long a piece of code, a request, or a timer actually takes, and when to use `Date.now()` instead. |
| [Generating random numbers and unique IDs](random.md) | This guide covers how to use `crypto` to generate tokens, unique IDs, and random integers in a range, and when `Math.random()` is good enough. |
| [Converting between text and bytes](text-and-bytes.md) | This guide covers converting between strings and UTF-8 bytes with `TextEncoder` and `TextDecoder`, encoding Base64 with `btoa()` and `atob()`, and deep-copying a value with `structuredClone()`. |
| [Formatting numbers and currency by locale](format-numbers.md) | This guide shows how to use `Intl.NumberFormat` to display numbers, currency amounts, percentages, and large numbers in the user's locale. |
| [Formatting dates and times by locale](format-dates.md) | This guide covers how to use `Intl.DateTimeFormat` and `Date`'s `toLocale*String()` methods to display times according to the user's region and time zone, as well as showing only the time, showing the day of the week, and writing a span of time. |

## System features

| Page | Description |
| --- | --- |
| [Reading device and system information](device-info.md) | This guide shows how to use `UIDevice` to check the system version and to give this device an identifier. |
| [Copying and pasting text](clipboard.md) | This guide shows how to implement copy and paste with `UIPasteboard`: put text on the system clipboard, read text the user copied, and read it without alarming the user. |
| [Making the phone vibrate](haptics.md) | This guide covers how to use haptic feedback to give a short vibration that accompanies a change in the interface: a button pressed, the selection changed, an operation succeeded or failed. |
| [Confirming identity with Face ID](face-id.md) | This guide covers how to use `LAContext` to have the system confirm that the person holding the phone is its owner: confirming before a payment, unlocking when the app opens, and confirming before showing sensitive information. |
| [Getting the user's location](get-location.md) | This guide shows how to get the user's location with `CLLocationManager`: request authorization, get the location once, keep receiving it as the user moves, pick out usable locations, and handle errors. |
| [Sending local notifications](local-notifications.md) | This guide shows how to make an app send notifications: asking the user for permission, scheduling when they're delivered, showing banners while the app is open, opening the matching page after the user taps a notification, and canceling and cleaning up. |
| [Taking a photo](take-photo.md) | This guide covers how to use `UIImagePickerController` to present the system camera interface and get the photo the user takes. |
| [Picking photos and saving them to the photo library](pick-photos.md) | This guide shows how to let the user pick photos from their photo library, get the picked images out and display them, and save an image to the photo library. |
| [Letting the user pick a contact](pick-contact.md) | This guide covers how to use `CNContactPickerViewController` to let the user pick a contact, a phone number, an email address, or several people from their contacts, and how to display the `CNContact` you get. |
| [Requesting tracking authorization](tracking-authorization.md) | This guide shows how to use `ATTrackingManager` to ask the user for tracking authorization at the right moment, and how to get the advertising identifier with `ASIdentifierManager`. |

## Native modules

| Page | Description |
| --- | --- |
| [Calling native modules from JS](call-native-modules.md) | This guide covers how to use native modules from the JS side: checking whether a module exists, calling methods, handling errors reported by native code, passing binary data, listening for events, and wrapping a module in functions. |
| [Writing your own native module](native-modules.md) | Some capabilities in an app can only be implemented in native code: your company's own native libraries, or third-party services that only ship an iOS SDK (risk control, crash reporting, payments). |

---

← Back to the [documentation home](../index.md)
