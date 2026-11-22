# Nacre API documentation

This is the reference for every API Nacre provides to JS, written for JS developers building apps with Nacre. Each page covers one class or one group of capabilities: what it represents, how to write it, what effect you get, and where it can go wrong.

If you're new to Nacre, read [How the runtime works](how-it-works.md) and [`application`](application.md) first, then look up other pages as needed. To build your own app from scratch, see the [getting started guide](../guides/README.md).

## What APIs there are

The APIs fall into two kinds:

- **Defined by the runtime itself**: `application`, `console`, `fetch`, timers, local storage, `WebView`, and so on. Their names and usage are decided by Nacre.
- **iOS native classes**: `UIView`, `UILabel`, `CALayer`, and so on, using their original iOS names directly; property and method names also correspond to Apple's documentation. The end of every class page and member page shows the corresponding ObjC code, so you can go from Apple's documentation to how to write it in JS.

**Only what is listed under "Reference" below is available.** iOS classes not listed (such as `NSString` or `UITableView`) don't exist in JS; reading their names throws `ReferenceError`, and there is no general way to call them.

Most APIs in the tables are available in every project. A few, such as location, taking photos, and Face ID, require installing a separate package; they are in the "Capability packages (installed separately)" group. For which ones need installing and what else to do after installing, see [Core and capability packages](capabilities.md). Your app's own native code and the capabilities of third-party native SDKs aren't here: they must first be wrapped as native modules and then called from [`application.nativeModules`](native-modules.md); see [Writing your own native module](../guides/native-modules.md).

## How to read these docs

- Each class has a **class page**: what it is, what it inherits from, and a list of all its properties, methods, and events, one sentence each. Each entry links to that member's own page: value, parameters, return value, what it throws, and examples.
- For how to use these classes to get something done, see the [guides](../guides/README.md).
- The "Effect" or "Result" after each code sample describes what you see after running it. Anything marked "**not verified in the simulator**" hasn't been confirmed by actually running it; everything unmarked has been verified or comes directly from the code.
- Lengths and coordinates are in points (pt); see [Units](units.md).

## Reference

Grouped by purpose, in the same order as the sidebar on the left. Each class page lists all members of the class, and each member has its own page.

### Getting started

| Page | Description |
| --- | --- |
| [How the runtime works](how-it-works.md) | Nacre is a JavaScript runtime on iOS. |
| [Core and capability packages](capabilities.md) | Nacre's API is split into two parts: the **core** and **capability packages**. |
| [Native classes](native-classes.md) | **Native classes** represent the classes iOS provides: views (`UIView`), text labels (`UILabel`), view controllers (`UIViewController`), layers (`CALayer`), and so on. |
| [Units](units.md) | In Nacre's APIs, numeric units match iOS: lengths are in points (pt), angles in radians, and animation times in seconds. |
| [Structs](structs.md) | A **struct** represents one value made up of several numbers: a point, a size, a rectangle, a set of insets, a transform matrix. |
| [Enums](enums.md) | An **enum** is a value chosen from a fixed set of options. |

### App and events

| Page | Description |
| --- | --- |
| [Application](application.md) | **`Application`** represents the running app. |
| [EventTarget](event-target.md) | **`EventTarget`** represents an object that can fire events and be listened to. |
| [Event](event.md) | **`Event`** represents an event: what happened (the event name), whom it was dispatched to, and whether it can be canceled. |
| [ErrorEvent](error-event.md) | **`ErrorEvent`** represents an uncaught exception. |
| [PromiseRejectionEvent](promise-rejection-event.md) | **`PromiseRejectionEvent`** represents a Promise rejection that wasn't handled. |
| [OpenURLEvent](open-url-event.md) | **`OpenURLEvent`** represents one occurrence of "this app was opened by a URL". |
| [`application.nativeModules`](native-modules.md) | **`application.nativeModules`** represents all native modules registered in this app. |
| [NativeModule](native-module.md) | **`NativeModule`** represents a native module registered in the app: a piece of code written in ObjC or Swift that provides a set of methods and a set of events under a name. |

### Windows and view controllers

| Page | Description |
| --- | --- |
| [`UIWindowScene`](ui-window-scene.md) | **`UIWindowScene`** represents one instance of the App's UI, called a scene. |
| [`UIWindowSceneGeometry`](ui-window-scene-geometry.md) | **`UIWindowSceneGeometry`** represents a scene's geometry at a given moment: the interface orientation and whether the orientation is locked. |
| [`UIWindowSceneGeometryPreferencesIOS`](ui-window-scene-geometry-preferences-ios.md) | **`UIWindowSceneGeometryPreferencesIOS`** represents the preferences for a rotation request: which orientations you want. |
| [`UIStatusBarManager`](ui-status-bar-manager.md) | **`UIStatusBarManager`** represents how a scene's status bar looks at the moment. |
| [`UISceneSession`](ui-scene-session.md) | **`UISceneSession`** represents a scene's session: the scene's persistent identity. |
| [`UIWindow`](ui-window.md) | **`UIWindow`** represents a window: the outermost view that hosts the interface in a scene. |
| [`UIViewController`](ui-view-controller.md) | **`UIViewController`** represents the manager of one screen of content, called a view controller. |
| [`UINavigationController`](ui-navigation-controller.md) | **`UINavigationController`** represents a stack of view controllers, called a navigation controller. |
| [`UINavigationItem`](ui-navigation-item.md) | **`UINavigationItem`** represents a view controller's configuration for the navigation bar: the title in the center, the subtitle, the text on the next view controller's back button, and which buttons are on the left and right. |
| [`UIBarItem`](ui-bar-item.md) | **`UIBarItem`** represents the shared part of an item on a navigation bar or tab bar: text, icon, whether it can be tapped, and a tag number. |
| [`UIBarButtonItem`](ui-bar-button-item.md) | **`UIBarButtonItem`** represents a button on the navigation bar. |
| [`UITabBarController`](ui-tab-bar-controller.md) | **`UITabBarController`** represents an interface with a tab bar, called a tab bar controller. |
| [`UITabBar`](ui-tab-bar.md) | **`UITabBar`** represents the row of tabs at the bottom of the screen in a tab bar controller. |
| [`UITabBarItem`](ui-tab-bar-item.md) | **`UITabBarItem`** represents one tab in the bottom tab bar: the icon, the text below the icon, and the badge in the top-right corner. |
| [`UIAlertController`](ui-alert-controller.md) | **`UIAlertController`** represents a system alert: a title, a message, and some buttons. |
| [`UIAlertAction`](ui-alert-action.md) | **`UIAlertAction`** represents a button on a system alert. |
| [`UIActivityViewController`](ui-activity-view-controller.md) | **`UIActivityViewController`** represents the system share sheet. |

### Views and layout

| Page | Description |
| --- | --- |
| [`UIView`](ui-view.md) | **`UIView`** represents a rectangular area on the screen, called a view. |
| [`NSLayoutConstraint`](auto-layout.md) | **`NSLayoutConstraint`** represents a constraint: a relationship between two positions or sizes on two views, such as "the card's left edge is 16 pt to the right of the safe area's left edge" or "the two color blocks are equally wide". |
| [`NSLayoutAnchor`](ns-layout-anchor.md) | **`NSLayoutAnchor`** represents a position or size on a view that constraints can refer to, called an anchor: an edge, a center line, a text baseline, a width, or a height. |
| [`NSLayoutXAxisAnchor`](ns-layout-x-axis-anchor.md) | **`NSLayoutXAxisAnchor`** represents a horizontal position anchor: `leadingAnchor`, `trailingAnchor`, `leftAnchor`, `rightAnchor`, or `centerXAnchor` on a view or layout guide. |
| [`NSLayoutYAxisAnchor`](ns-layout-y-axis-anchor.md) | **`NSLayoutYAxisAnchor`** represents a vertical position anchor: `topAnchor`, `bottomAnchor`, `centerYAnchor`, `firstBaselineAnchor`, and `lastBaselineAnchor` on a view or layout guide. |
| [`NSLayoutDimension`](ns-layout-dimension.md) | **`NSLayoutDimension`** represents a dimension anchor: the `widthAnchor` and `heightAnchor` of a view or layout guide, and the distance between two anchors returned by `anchorWithOffsetToAnchor()`. |
| [`UILayoutGuide`](ui-layout-guide.md) | **`UILayoutGuide`** represents a rectangle that takes part in layout but isn't displayed, called a layout guide. |
| [`UIKeyboardLayoutGuide`](ui-keyboard-layout-guide.md) | **`UIKeyboardLayoutGuide`** represents a layout guide for the area the keyboard occupies. |
| [`UIStackView`](ui-stack-view.md) | **`UIStackView`** represents a stack view, a container that arranges the subviews you put in it into a row or a column along one direction and automatically positions and sizes each of them. |
| [`UIScrollView`](ui-scroll-view.md) | **`UIScrollView`** represents a view that can scroll, called a scroll view. |
| [`UIVisualEffectView`](ui-visual-effect-view.md) | **`UIVisualEffectView`** represents an area with an effect. |
| [`UIVisualEffect`](ui-visual-effect.md) | **`UIVisualEffect`** represents a visual effect. |
| [`UIBlurEffect`](ui-blur-effect.md) | **`UIBlurEffect`** represents a blur effect: it blurs what is behind a visual effect view and covers it with a translucent layer of color. |
| [`UIVibrancyEffect`](ui-vibrancy-effect.md) | **`UIVibrancyEffect`** represents a vibrancy effect: it makes text and icons placed over a blur pick up the colors of the content underneath, instead of being a flat layer of gray. |
| [`UIGlassEffect`](ui-glass-effect.md) | **`UIGlassEffect`** represents a glass effect, a new material in iOS 26. |
| [`UIGlassContainerEffect`](ui-glass-container-effect.md) | **`UIGlassContainerEffect`** represents a glass container effect (iOS 26): it draws several pieces of glass as a group, and pieces that are close enough merge together. |
| [`UIActivityIndicatorView`](ui-activity-indicator-view.md) | **`UIActivityIndicatorView`** represents an activity indicator (a spinner): a ring of short lines that keeps rotating, telling the user that something is in progress and has no result yet. |
| [`UIProgressView`](ui-progress-view.md) | **`UIProgressView`** represents a progress bar: a horizontal line with a filled portion starting from the left, whose length shows how much of a task is complete. |
| [`UIToolbar`](ui-toolbar.md) | **`UIToolbar`** represents a toolbar: a horizontal bar with a number of buttons arranged from left to right. |

### Structs

| Page | Description |
| --- | --- |
| [`CGPoint`](cg-point.md) | **`CGPoint`** represents a point on a plane: the x-coordinate `x` and the y-coordinate `y`, in pt. |
| [`CGSize`](cg-size.md) | **`CGSize`** represents a size: a width `width` and a height `height`, in pt. |
| [`CGRect`](cg-rect.md) | **`CGRect`** represents a rectangle: the top-left position `x`, `y` plus the width `width` and height `height`, all in pt. |
| [`UIEdgeInsets`](ui-edge-insets.md) | **`UIEdgeInsets`** represents how far each of the four edges is inset: `top`, `left`, `bottom`, `right`, in pt. |
| [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md) | **`NSDirectionalEdgeInsets`** represents how far each of the four edges is inset, with left and right distinguished by text direction: `top`, `leading`, `bottom`, `trailing`, in pt. |
| [`CGAffineTransform`](cg-affine-transform.md) | **`CGAffineTransform`** represents a two-dimensional affine transform: scaling, rotation, translation, and combinations of them. |
| [`CATransform3D`](ca-transform-3d.md) | **`CATransform3D`** represents a three-dimensional transform: scaling, rotation, and translation along the x, y, and z directions, perspective, and combinations of them. |
| [`CAFrameRateRange`](ca-frame-rate-range.md) | **`CAFrameRateRange`** represents a frame rate range: `minimum`, `maximum`, and `preferred` (the rate you'd most like), all in frames per second. |
| [`NSRange`](ns-range.md) | **`NSRange`** represents a range of text: `length` UTF-16 code units starting at `location`. |

### Lists

| Page | Description |
| --- | --- |
| [`UICollectionView`](ui-collection-view.md) | **`UICollectionView`** represents a scrollable list. |
| [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md) | **`UICollectionViewDiffableDataSource`** represents a list's data source: it decides which items a `UICollectionView` shows and what each item looks like. |
| [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md) | **`NSDiffableDataSourceSnapshot`** represents an inventory of a list's data: which sections there are, which items are in each section, and in what order. |
| [`NSIndexPath`](ns-index-path.md) | **`NSIndexPath`** represents the position of an item in a list: item number `item` in section number `section`, both counted from 0. |
| [`UICollectionViewLayout`](ui-collection-view-layout.md) | **`UICollectionViewLayout`** represents the object that decides how cells are arranged in a `UICollectionView`. |
| [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md) | **`UICollectionViewCompositionalLayout`** represents a compositional layout: a layout object built from sections, groups, and items. |
| [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) | **`UICollectionLayoutListConfiguration`** represents the configuration of a list layout: the list's appearance, whether separators are drawn between rows, the background color, and where section headers come from. |
| [`UICollectionReusableView`](ui-collection-reusable-view.md) | **`UICollectionReusableView`** represents a reusable view in a `UICollectionView`. |
| [`UICollectionViewCell`](ui-collection-view-cell.md) | **`UICollectionViewCell`** represents a cell: the on-screen view for one item in a `UICollectionView`. |
| [`UICollectionViewListCell`](ui-collection-view-list-cell.md) | **`UICollectionViewListCell`** represents the cell used in list layouts. |
| [`UIListContentConfiguration`](ui-list-content-configuration.md) | **`UIListContentConfiguration`** represents the content of one row in a list: primary text, secondary text, and an image on the left. |

### Text, images, and color

| Page | Description |
| --- | --- |
| [`UILabel`](ui-label.md) | **`UILabel`** represents a piece of read-only text on screen, called a label. |
| [`UIFont`](ui-font.md) | **`UIFont`** represents a font. |
| [`UIImage`](ui-image.md) | **`UIImage`** represents an image. |
| [`UIImageView`](ui-image-view.md) | **`UIImageView`** represents a view that displays an image, called an image view. |
| [`BarcodeDetector`](barcode-detector.md) | **`BarcodeDetector`** represents a detector that finds barcodes in an image. |
| [`UIColor`](ui-color.md) | **`UIColor`** represents a color. |
| [`UITraitCollection`](ui-trait-collection.md) | **`UITraitCollection`** represents a set of values describing the environment the UI is currently in: whether it's dark or light, how many pixels 1 pt covers on the screen, which level the user set the system text size to, and so on. |
| [`NSAttributedString`](ns-attributed-string.md) | **`NSAttributedString`** represents styled text, called an attributed string: a string plus a set of attributes on each range. |
| [`NSMutableAttributedString`](ns-mutable-attributed-string.md) | **`NSMutableAttributedString`** represents a mutable attributed string: you can add attributes to a range, remove attributes, and append, insert, replace, and delete text. |
| [`NSParagraphStyle`](ns-paragraph-style.md) | **`NSParagraphStyle`** represents a set of paragraph styles: alignment, line spacing, paragraph spacing, indentation, and line breaking. |
| [`NSMutableParagraphStyle`](ns-mutable-paragraph-style.md) | **`NSMutableParagraphStyle`** represents a set of paragraph styles that can be changed. |
| [`NSShadow`](ns-shadow.md) | **`NSShadow`** represents a text shadow: its offset, blur radius, and color. |
| [`NSTextAttachment`](ns-text-attachment.md) | **`NSTextAttachment`** represents an attachment in an attributed string: an image shown in the position of one character. |

### Controls and input

| Page | Description |
| --- | --- |
| [`UIControl`](ui-control.md) | **`UIControl`** represents a control: a view that receives touches and turns the course of a touch into a set of "control events" that it fires. |
| [`UIButton`](ui-button.md) | **`UIButton`** represents a button: a tappable area on screen that displays a title, an image, or both. |
| [`UISwitch`](ui-switch.md) | **`UISwitch`** represents a switch: a round thumb on a short track, off when the thumb is on the left and on when it is on the right. |
| [`UISlider`](ui-slider.md) | **`UISlider`** represents a slider: a horizontal track with a round thumb that the user drags to pick a number within a range. |
| [`UIStepper`](ui-stepper.md) | **`UIStepper`** represents a stepper: a minus button and a plus button side by side. |
| [`UISegmentedControl`](ui-segmented-control.md) | **`UISegmentedControl`** represents a segmented control: a horizontal row of segments, each showing a title or an image, with at most one segment selected at a time. |
| [`UIPageControl`](ui-page-control.md) | **`UIPageControl`** represents a page indicator: a row of small dots, one per page, with the dot for the current page brighter. |
| [`UIDatePicker`](ui-date-picker.md) | **`UIDatePicker`** represents a date picker: a system-provided control that lets the user choose a date, a time, or a duration. |
| [`UIColorWell`](system-controls.md) | **`UIColorWell`** represents a color well: a small round button showing the current color. |
| [`UITextField`](ui-text-field.md) | **`UITextField`** represents a single-line text field. |
| [`UITextView`](ui-text-view.md) | **`UITextView`** represents an area where the user can type multiple lines of text. |
| [`NSTextContainer`](ns-text-container.md) | **`NSTextContainer`** represents the area where text is laid out in a `UITextView`: how much space each line leaves on the left and right, how many lines at most, and what to do when a line doesn't fit. |
| [`UISearchBar`](ui-search-bar.md) | **`UISearchBar`** represents a search bar: a single-line text field with a magnifying-glass icon and a clear button at its right end. |

### Gestures

| Page | Description |
| --- | --- |
| [`UIGestureRecognizer`](ui-gesture-recognizer.md) | **`UIGestureRecognizer`** represents a gesture recognizer: an object attached to a view that watches the touches on that view and fires events when it recognizes a certain gesture. |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md) | **`UITapGestureRecognizer`** represents a tap recognizer: it recognizes the gesture when a finger goes down and lifts quickly. |
| [`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md) | **`UILongPressGestureRecognizer`** represents a long-press recognizer: it recognizes the gesture when a finger stays down without moving for a period of time, 0.5 seconds by default. |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) | **`UIPanGestureRecognizer`** represents a pan (drag) recognizer: it recognizes the gesture when a finger touches down and moves. |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | **`UIPinchGestureRecognizer`** represents a pinch gesture recognizer: it recognizes two fingers spreading apart or pinching together. |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | **`UIRotationGestureRecognizer`** represents a rotation recognizer: it recognizes the gesture when two fingers turn around each other. |
| [`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | **`UISwipeGestureRecognizer`** represents a swipe recognizer: it recognizes the gesture when a finger moves quickly across the screen in a given direction. |
| [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | **`UIScreenEdgePanGestureRecognizer`** represents a screen-edge pan gesture recognizer: it only recognizes drags that start at the edge of the screen and move inward. |

### Layers and animation

| Page | Description |
| --- | --- |
| [`CALayer`](ca-layer.md) | **`CALayer`** represents a layer: a rectangular area on screen, plus the content drawn in that area. |
| [`CAGradientLayer`](ca-gradient-layer.md) | **`CAGradientLayer`** represents a gradient layer: it draws a color gradient within its own rectangle. |
| [`CAShapeLayer`](ca-shape-layer.md) | **`CAShapeLayer`** represents a shape layer: it draws a path (`UIBezierPath`). |
| [`UIBezierPath`](ui-bezier-path.md) | **`UIBezierPath`** represents a path: a geometric shape made of connected line segments, curve segments, and arcs. |
| [`CAAnimation`](ca-animation.md) | **`CAAnimation`** represents an animation applied to a layer: over a period of time, it changes one of the layer's properties (opacity, position, corner radius, color, path, and so on) continuously from one value to another. |
| [`CAPropertyAnimation`](ca-property-animation.md) | **`CAPropertyAnimation`** represents an animation that changes one property of a layer. |
| [`CABasicAnimation`](ca-basic-animation.md) | **`CABasicAnimation`** represents an animation that changes one property of a layer from one value to another. |
| [`CAKeyframeAnimation`](ca-keyframe-animation.md) | **`CAKeyframeAnimation`** represents an animation that makes one of a layer's properties pass through several values in turn, or that moves a layer along a path. |
| [`CASpringAnimation`](ca-spring-animation.md) | **`CASpringAnimation`** represents an animation that brings a property to its end value the way a spring does: the property overshoots the end value, bounces back a few times, and settles. |
| [`CAAnimationGroup`](ca-animation-group.md) | **`CAAnimationGroup`** represents a group of animations. |
| [`CAMediaTimingFunction`](ca-media-timing-function.md) | **`CAMediaTimingFunction`** represents a timing function. |
| [`CATransaction`](ca-transaction.md) | **`CATransaction`** represents a transaction: a group of layer changes handed to the system together. |
| [`CADisplayLink`](ca-display-link.md) | **`CADisplayLink`** represents a timer synchronized with screen refreshes. |
| [`NSRunLoop`](ns-run-loop.md) | **`NSRunLoop`** represents a thread's event loop. |

### Networking

| Page | Description |
| --- | --- |
| [`fetch()`](fetch.md) | The **`fetch()`** function sends an HTTP request and returns a `Promise`. |
| [Request](request.md) | **`Request`** represents an HTTP request: the URL, method, headers, body, and the signal used to cancel it, kept in one object. |
| [Response](response.md) | **`Response`** represents the response to an HTTP request: the status code, the response headers, and the response body. |
| [Headers](headers.md) | **`Headers`** represents a set of HTTP request or response headers. |
| [Blob](blob.md) | **`Blob`** represents an immutable chunk of binary data. |
| [ReadableStream](readable-stream.md) | **`ReadableStream`** represents data that can be read out one chunk at a time. |
| [ReadableStreamDefaultReader](readable-stream-default-reader.md) | **`ReadableStreamDefaultReader`** represents a reader for a stream: it holds the stream's lock and reads chunk by chunk with `read()`. |
| [AbortController](abort-controller.md) | **`AbortController`** represents the side that issues a cancellation. |
| [AbortSignal](abort-signal.md) | **`AbortSignal`** represents an abort signal: whether it has been aborted and why. |
| [`URL`](url.md) | **`URL`** represents a parsed address. |
| [`URLSearchParams`](url-search-params.md) | **`URLSearchParams`** represents the query parameters after the `?` in a URL. |
| [WebSocket](websocket.md) | **`WebSocket`** represents a persistent connection between the app and a server. |
| [`application.network`](network.md) | **`application.network`** represents the device's network status at this moment: whether it is connected to a network, which kind of network it uses, and whether that network is metered. |

### Web content

| Page | Description |
| --- | --- |
| [WebView](web-view.md) | **`WebView`** represents a view that displays a web page. |
| [WebContents](web-contents.md) | **`WebContents`** represents the web page inside a `WebView`. |
| [NavigationHistory](navigation-history.md) | **`NavigationHistory`** represents a web page's back and forward navigation: whether it can go back or forward, and going back or forward one page. |
| [WebContentsIPC](web-contents-ipc.md) | **`WebContentsIPC`** represents the app's end of a web page's request-response channel. |
| [`ipcRenderer`](ipc-renderer.md) | **`ipcRenderer`** represents the web page's end of the message channel: the page uses it to send messages to the app, ask the app for results, and receive messages from the app. |
| [`contextBridge`](context-bridge.md) | **`contextBridge`** is the entry point a preload script uses to put things on the web page: it attaches a set of methods written in the preload script to the page's `window`, so the page's scripts can call them. |
| [Session](session.md) | **`Session`** represents a storage partition: cookies, `localStorage`, IndexedDB, caches, and other data left by web pages in a `WebView` are all stored in some partition. |
| [Cookies](cookies.md) | **`Cookies`** represents all the cookies in one storage partition. |
| [Cookie](cookie.md) | **`Cookie`** represents a record of a cookie at one moment. |

### Runtime globals

| Page | Description |
| --- | --- |
| [Timers](timers.md) | **Timers** are a set of global functions for running a callback after a period of time, or repeatedly at an interval. |
| [`performance`](performance.md) | **`Performance`** represents a clock used only to measure durations. |
| [`Intl.NumberFormat`](intl.md) | **`Intl.NumberFormat`** represents a formatting object that writes numbers as text according to the conventions of a region. |
| [`Intl.DateTimeFormat`](intl-date.md) | **`Intl.DateTimeFormat`** represents a formatter that writes a moment in time as text, following the conventions of a given locale. |
| [`NSLocale`](ns-locale.md) | **`NSLocale`** represents a locale: a language, plus a country or region, and the formats that go with them — currency, decimal and grouping separators, calendar, quotation marks, and metric or imperial units. |
| [`crypto`](crypto.md) | **`Crypto`** represents the system's source of random numbers. |
| [TextEncoder](text-encoder.md) | **`TextEncoder`** represents an encoder that encodes strings into UTF-8 bytes. |
| [TextDecoder](text-decoder.md) | **`TextDecoder`** represents a decoder that turns UTF-8 bytes into a string. |
| [Text, bytes, and deep copies](web-globals.md) | **Text, bytes, and deep copies**: this group of global APIs converts between strings and bytes, and deep-copies values. |

### Storage

| Page | Description |
| --- | --- |
| [`application.storage`](storage.md) | **`application.storage`** represents the app's key-value storage. |
| [`application.fileSystem`](filesystem.md) | **`application.fileSystem`** represents the app's own file storage. |
| [`NSBundle`](ns-bundle.md) | **`NSBundle`** represents a bundle: a directory on disk that holds a program and its resources. |

### System features

| Page | Description |
| --- | --- |
| [`UIDevice`](ui-device.md) | **`UIDevice`** represents the device the app is running on. |
| [`UIScreen`](ui-screen.md) | **`UIScreen`** represents a screen: its size, pixel density, brightness, refresh rate, and whether it is being recorded right now. |
| [`UIScreenMode`](ui-screen-mode.md) | **`UIScreenMode`** represents one display mode of a screen: a resolution and a pixel shape. |
| [`UIPasteboard`](ui-pasteboard.md) | **`UIPasteboard`** represents the system clipboard. |
| [`UIFeedbackGenerator`](ui-feedback-generator.md) | **`UIFeedbackGenerator`** represents a haptic feedback generator. |
| [`UIImpactFeedbackGenerator`](ui-impact-feedback-generator.md) | **`UIImpactFeedbackGenerator`** represents an impact feedback generator: the tap of vibration when two things collide, such as a button being pressed, a card snapping into place, or a dragged item hitting a boundary. |
| [`UISelectionFeedbackGenerator`](ui-selection-feedback-generator.md) | **`UISelectionFeedbackGenerator`** represents a selection feedback generator: a very light tap of vibration when the selection moves from one item to another, such as a picker wheel turning one notch, a slider passing a tick mark, or the selected row of a list changing. |
| [`UINotificationFeedbackGenerator`](ui-notification-feedback-generator.md) | **`UINotificationFeedbackGenerator`** represents a notification-type haptic feedback generator: the vibration for when something succeeded, needs attention, or failed. |

### Capability packages (installed separately)

| Page | Description |
| --- | --- |
| [`application.keychain`](keychain.md) | **`application.keychain`** represents the app's items in the keychain. |
| [`LAContext`](la-context.md) | **`LAContext`** represents one authentication that confirms "the person holding the phone right now is its owner". |
| [`CLLocationManager`](cl-location-manager.md) | **`CLLocationManager`** represents an entry point through which the app asks the system for location. |
| [`CLLocation`](cl-location.md) | **`CLLocation`** represents a location measured by the system: latitude and longitude, altitude, the error of each measurement, speed, direction of movement, and when the location was measured. |
| [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md) | **`CLLocationCoordinate2D`** represents the latitude and longitude of a point on Earth, in degrees. |
| [`CLLocationError`](cl-location-error.md) | **`CLLocationError`** is the `Error` object you get when location fails. |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | **`UNUserNotificationCenter`** represents the entry point between this app and the system's notification features; there is only one per app. |
| [`UNNotificationRequest`](un-notification-request.md) | **`UNNotificationRequest`** represents a notification to be sent: an identifier, the content, and when to deliver it. |
| [`UNNotificationContent`](un-notification-content.md) | **`UNNotificationContent`** represents the read-only content of a notification, read from a request's `content`, including those of delivered notifications and remote push notifications. |
| [`UNMutableNotificationContent`](un-mutable-notification-content.md) | **`UNMutableNotificationContent`** represents the content of a notification you write yourself: title, subtitle, body, badge, sound, group identifier, and data that travels with the notification. |
| [`UNNotificationSound`](un-notification-sound.md) | **`UNNotificationSound`** represents the sound played when a notification arrives. |
| [`UNNotificationTrigger`](un-notification-trigger.md) | **`UNNotificationTrigger`** represents when a notification is delivered. |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | **`UNTimeIntervalNotificationTrigger`** represents a trigger that delivers "after a number of seconds". |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | **`UNCalendarNotificationTrigger`** represents a trigger that delivers "at the moment matching these date components". |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | **`UNPushNotificationTrigger`** indicates that a notification arrived as a remote push: sent by a server through Apple's push service to the phone. |
| [`UNNotification`](un-notification.md) | **`UNNotification`** represents a notification that has been delivered. |
| [`UNNotificationResponse`](un-notification-response.md) | **`UNNotificationResponse`** represents an action the user took on a notification, such as tapping it. |
| [`UNNotificationSettings`](un-notification-settings.md) | **`UNNotificationSettings`** represents this app's notification settings at a given moment: whether the user allows notifications, and whether each setting — sound, badge, lock screen, Notification Center, and so on — is on. |
| [`RemoteNotifications`](remote-notifications.md) | **`RemoteNotifications`** represents this app's remote notifications: registering with Apple's push service, getting this device's token, and receiving silent pushes. |
| [`PushEvent`](push-event.md) | **`PushEvent`** represents a silent push that has arrived. |
| [`UIImagePickerController`](ui-image-picker-controller.md) | **`UIImagePickerController`** represents the system's camera interface. |
| [`AVCaptureSession`](av-capture-session.md) | **`AVCaptureSession`** represents a capture: it delivers the picture from a camera to the outputs and preview layers attached to it. |
| [`AVCaptureDevice`](av-capture-device.md) | **`AVCaptureDevice`** represents a camera on the phone. |
| [`AVCaptureInput`](av-capture-input.md) | **`AVCaptureInput`** represents an input of an `AVCaptureSession`: where the picture comes from. |
| [`AVCaptureDeviceInput`](av-capture-device-input.md) | **`AVCaptureDeviceInput`** represents an input that connects a camera to an `AVCaptureSession`. |
| [`AVCaptureOutput`](av-capture-output.md) | **`AVCaptureOutput`** represents an output of an `AVCaptureSession`: the session hands the picture to it for processing. |
| [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) | **`AVCaptureMetadataOutput`** represents an output that recognizes codes, faces, and similar things in the captured picture. |
| [`AVMetadataObject`](av-metadata-object.md) | **`AVMetadataObject`** represents one thing that an `AVCaptureMetadataOutput` recognized in a frame. |
| [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md) | **`AVMetadataMachineReadableCodeObject`** represents a code recognized in the captured picture, such as a QR code or a product barcode. |
| [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md) | **`AVCaptureVideoPreviewLayer`** represents a layer that shows the camera's captured picture, called a preview layer. |
| [`PHPickerViewController`](photos.md) | **`PHPickerViewController`** represents the system's photo picker. |
| [`PHPickerConfiguration`](ph-picker-configuration.md) | **`PHPickerConfiguration`** represents the configuration of the photo picker: how many items can be selected at most, which types are shown, how selection works, and what the picker looks like. |
| [`PHPickerFilter`](ph-picker-filter.md) | **`PHPickerFilter`** represents which kinds of items a photo picker shows, for example only images, only videos, or images without screenshots. |
| [`PHPickerResult`](ph-picker-result.md) | **`PHPickerResult`** represents one item the user picked in the photo picker. |
| [`NSItemProvider`](ns-item-provider.md) | **`NSItemProvider`** represents a provider for one item of content. |
| [`PHPhotoLibrary`](ph-photo-library.md) | **`PHPhotoLibrary`** represents the system photo library. |
| [`CNContactPickerViewController`](contacts.md) | **`CNContactPickerViewController`** represents the system's contact picker. |
| [`CNContact`](cn-contact.md) | **`CNContact`** represents a contact in the address book: name, company, phone numbers, email addresses. |
| [`CNLabeledValue`](cn-labeled-value.md) | **`CNLabeledValue`** represents one phone number or one email address of a contact, together with its label. |
| [`CNPhoneNumber`](cn-phone-number.md) | **`CNPhoneNumber`** represents a phone number. |
| [`CNContactProperty`](cn-contact-property.md) | **`CNContactProperty`** represents the item the user selected in a contact's details: which value of which field of which contact. |
| [`CNContactFormatter`](cn-contact-formatter.md) | **`CNContactFormatter`** joins a contact's name into one line. |
| [`ATTrackingManager`](app-tracking-transparency.md) | **`ATTrackingManager`** represents the user's answer to "may this app track me", and is responsible for asking the user for it. |
| [`ASIdentifierManager`](as-identifier-manager.md) | **`ASIdentifierManager`** gives this device's advertising identifier. |

## The current JS global environment

`globalThis` has 65 own properties, and **all of them are non-enumerable** (as ECMAScript requires). So `Object.keys(globalThis)` returning an empty array doesn't mean the environment is empty; use `Object.getOwnPropertyNames` to see them.

**Available**: the complete ES standard library, and a fairly recent version of it — `Iterator` (iterator helpers), `DisposableStack` / `AsyncDisposableStack` / `SuppressedError` (explicit resource management), `Float16Array`, `Atomics`, `SharedArrayBuffer`, `WeakRef`, and `FinalizationRegistry` are all there. `Promise` and the microtask queue work normally. `eval` and `new Function` are available as usual.

**Non-standard globals** installed by the runtime: `console`, `EventTarget` / `Event` (and `ErrorEvent`, `PromiseRejectionEvent`), `application`, and the native classes and struct classes listed above.
