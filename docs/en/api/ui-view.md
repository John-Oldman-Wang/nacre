---
type: reference
native: UIView
status: partial
---

# `UIView`

**`UIView`** represents a rectangular area on the screen, called a view. A view does three things: it displays content (a background color, plus text or images that subclasses provide), it contains other views, and it receives touches. Buttons, text, images, and scrolling areas are all subclasses of `UIView`, and the members on this page work on every view.

Views form a tree. Each view has at most one superview and any number of subviews, and the root of the tree is a window ([`UIWindow`](ui-window.md)). A view appears on screen only after it is connected to a window. A view that isn't connected to a window can still be created, have its properties set, and get subviews; it just isn't visible.

A view's position and size aren't worked out automatically. The app's code supplies them: either by writing a rectangle directly (`frame`), or by writing constraints and letting the system compute it. Lengths are in points (pt); one point covers 2 × 2 or 3 × 3 pixels on screen. See [Units](units.md).

Appearance is set through properties such as `backgroundColor` and `alpha`. Corner radius, borders, and shadows are on the view's layer, `view.layer`. See [`CALayer`](ca-layer.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → `UIView`

Subclasses of `UIView`: [`UIWindow`](ui-window.md), [`UILabel`](ui-label.md), [`UIImageView`](ui-image.md), [`UIControl`](ui-control.md) ([`UIButton`](ui-button.md), [`UITextField`](ui-text-field.md)), [`UIScrollView`](ui-scroll-view.md), [`UIStackView`](ui-stack-view.md).

For creating, positioning, hiding, and removing views, see the guide [Placing views on screen](../guides/views.md). For animation, see [Animating views](../guides/view-animations.md). For constraints, see [Laying out with constraints](../guides/auto-layout.md).

## Constructor

[`UIView()`](ui-view/constructor.md)

Creates a view. A new view's `frame` is `(0, 0, 0, 0)`, with no background color and no superview. `UIView` can't be subclassed.

## Static methods

| Method | Description |
| --- | --- |
| [`UIView.animateWithDuration()`](ui-view/animatewithduration.md) | Changes view properties with animation. Returns a Promise that fulfills when the animation ends |
| [`UIView.performWithoutAnimation()`](ui-view/performwithoutanimation.md) | Runs a block of code whose changes aren't animated |

## Instance properties

Also inherits `isFirstResponder` and `canBecomeFirstResponder` from `UIResponder`. See [Text fields and the keyboard](ui-text-field.md).

Position and size. All in [pt](units.md):

| Property | Description |
| --- | --- |
| [`frame`](ui-view/frame.md) | Position and size in the superview's coordinate system |
| [`bounds`](ui-view/bounds.md) | The rectangle in the view's own coordinate system |
| [`center`](ui-view/center.md) | Position of the center point in the superview's coordinate system |
| [`transform`](ui-view/transform.md) | 2D affine transform |
| [`anchorPoint`](ui-view/anchorpoint.md) | The point the transform is applied around, as a ratio |
| [`safeAreaInsets`](ui-view/safeareainsets.md) <small>read-only</small> | Distances from the four edges of the safe area to the four edges of the view |
| [`directionalLayoutMargins`](ui-view/directionallayoutmargins.md) | Layout margins, with left and right determined by text direction |
| [`layoutMargins`](ui-view/layoutmargins.md) | The same layout margins, with fixed left and right |
| [`insetsLayoutMarginsFromSafeArea`](ui-view/insetslayoutmarginsfromsafearea.md) | Whether the safe area is added to the layout margins |
| [`preservesSuperviewLayoutMargins`](ui-view/preservessuperviewlayoutmargins.md) | Whether to use the superview's layout margins when they are larger |
| [`intrinsicContentSize`](ui-view/intrinsiccontentsize.md) <small>read-only</small> | The intrinsic size computed from the content |
| [`alignmentRectInsets`](ui-view/alignmentrectinsets.md) <small>read-only</small> | How far the alignment rectangle is inset from `frame` |
| [`contentScaleFactor`](ui-view/contentscalefactor.md) | How many pixels 1 pt covers |
| [`autoresizingMask`](ui-view/autoresizingmask.md) | How a view positioned by `frame` follows when the superview's size changes |
| [`autoresizesSubviews`](ui-view/autoresizessubviews.md) | Whether subviews are adjusted when the size changes |

View hierarchy:

| Property | Description |
| --- | --- |
| [`superview`](ui-view/superview.md) <small>read-only</small> | The superview |
| [`subviews`](ui-view/subviews.md) <small>read-only</small> | Subviews, in drawing order |
| [`window`](ui-view/window.md) <small>read-only</small> | The window the view is in |
| [`tag`](ui-view/tag.md) | An integer you assign yourself |

Appearance:

| Property | Description |
| --- | --- |
| [`backgroundColor`](ui-view/backgroundcolor.md) | Background color |
| [`alpha`](ui-view/alpha.md) | Opacity, 0 to 1 |
| [`isHidden`](ui-view/ishidden.md) | Whether the view is hidden |
| [`clipsToBounds`](ui-view/clipstobounds.md) | Whether subviews that extend outside are clipped |
| [`isOpaque`](ui-view/isopaque.md) | A drawing hint for the system: whether the content is fully opaque |
| [`contentMode`](ui-view/contentmode.md) | How content is placed when its size differs from the view's |
| [`layer`](ui-view/layer.md) <small>read-only</small> | The view's layer: corner radius, borders, shadows |
| [`maskView`](ui-view/maskview.md) | Mask view |
| [`tintColor`](ui-view/tintcolor.md) | Tint color |
| [`tintAdjustmentMode`](ui-view/tintadjustmentmode.md) | Whether the tint color is shown normally or dimmed |
| [`clearsContextBeforeDrawing`](ui-view/clearscontextbeforedrawing.md) | Whether existing content is cleared before redrawing |

Traits and writing direction:

| Property | Description |
| --- | --- |
| [`traitCollection`](ui-view/traitcollection.md) <small>read-only</small> | Traits of the environment: light or dark, screen scale, text size |
| [`overrideUserInterfaceStyle`](ui-view/overrideuserinterfacestyle.md) | Forces light or dark |
| [`semanticContentAttribute`](ui-view/semanticcontentattribute.md) | Whether to flip left and right in right-to-left languages |
| [`effectiveUserInterfaceLayoutDirection`](ui-view/effectiveuserinterfacelayoutdirection.md) <small>read-only</small> | The writing direction actually in use |
| [`appliedContentSizeCategoryLimitsDescription`](ui-view/appliedcontentsizecategorylimitsdescription.md) <small>read-only</small> | For debugging: which text sizes are limited |

Touch and focus:

| Property | Description |
| --- | --- |
| [`isUserInteractionEnabled`](ui-view/isuserinteractionenabled.md) | Whether the view receives touches |
| [`isMultipleTouchEnabled`](ui-view/ismultipletouchenabled.md) | Whether the view receives multiple fingers |
| [`isExclusiveTouch`](ui-view/isexclusivetouch.md) | Whether the view takes touches exclusively while touched |
| [`gestureRecognizers`](ui-view/gesturerecognizers.md) <small>read-only</small> | The gesture recognizers on the view |
| [`canBecomeFocused`](ui-view/canbecomefocused.md) <small>read-only</small> | Whether the view can get focus |
| [`isFocused`](ui-view/isfocused.md) <small>read-only</small> | Whether the view has focus right now |
| [`focusGroupIdentifier`](ui-view/focusgroupidentifier.md) | Name of the focus group |

Constraints (Auto Layout). Anchors are used to build constraints; see [`NSLayoutAnchor`](ns-layout-anchor.md):

| Property | Description |
| --- | --- |
| [`translatesAutoresizingMaskIntoConstraints`](ui-view/translatesautoresizingmaskintoconstraints.md) | Positioned by `frame` or by constraints. Must be `false` on views that use constraints |
| [`leadingAnchor`](ui-view/leadinganchor.md) <small>read-only</small> | Leading edge |
| [`trailingAnchor`](ui-view/trailinganchor.md) <small>read-only</small> | Trailing edge |
| [`leftAnchor`](ui-view/leftanchor.md) <small>read-only</small> | Left edge |
| [`rightAnchor`](ui-view/rightanchor.md) <small>read-only</small> | Right edge |
| [`centerXAnchor`](ui-view/centerxanchor.md) <small>read-only</small> | Horizontal center line |
| [`topAnchor`](ui-view/topanchor.md) <small>read-only</small> | Top edge |
| [`bottomAnchor`](ui-view/bottomanchor.md) <small>read-only</small> | Bottom edge |
| [`centerYAnchor`](ui-view/centeryanchor.md) <small>read-only</small> | Vertical center line |
| [`firstBaselineAnchor`](ui-view/firstbaselineanchor.md) <small>read-only</small> | Baseline of the first line of text |
| [`lastBaselineAnchor`](ui-view/lastbaselineanchor.md) <small>read-only</small> | Baseline of the last line of text |
| [`widthAnchor`](ui-view/widthanchor.md) <small>read-only</small> | Width |
| [`heightAnchor`](ui-view/heightanchor.md) <small>read-only</small> | Height |
| [`safeAreaLayoutGuide`](ui-view/safearealayoutguide.md) <small>read-only</small> | The layout guide that represents the safe area |
| [`layoutMarginsGuide`](ui-view/layoutmarginsguide.md) <small>read-only</small> | The area inset by the layout margins |
| [`readableContentGuide`](ui-view/readablecontentguide.md) <small>read-only</small> | A width range suited to reading long text |
| [`keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md) <small>read-only</small> | The area the keyboard occupies |
| [`layoutGuides`](ui-view/layoutguides.md) <small>read-only</small> | Layout guides you added |
| [`constraints`](ui-view/constraints.md) <small>read-only</small> | Constraints stored on this view |
| [`hasAmbiguousLayout`](ui-view/hasambiguouslayout.md) <small>read-only</small> | Whether there are enough constraints |
| [`viewForFirstBaselineLayout`](ui-view/viewforfirstbaselinelayout.md) <small>read-only</small> | Which view the first baseline comes from |
| [`viewForLastBaselineLayout`](ui-view/viewforlastbaselinelayout.md) <small>read-only</small> | Which view the last baseline comes from |

Accessibility and state restoration. VoiceOver is the screen reader built into iOS; for how to make it read your interface correctly, see the guide [Making VoiceOver read your interface correctly](../guides/accessibility.md):

| Property | Description |
| --- | --- |
| [`isAccessibilityElement`](ui-view/isaccessibilityelement.md) | Whether VoiceOver treats it as one element to stop on and read |
| [`accessibilityLabel`](ui-view/accessibilitylabel.md) | The name VoiceOver reads: what it is |
| [`accessibilityHint`](ui-view/accessibilityhint.md) | The hint VoiceOver reads after the name: what operating it does |
| [`accessibilityValue`](ui-view/accessibilityvalue.md) | The current value VoiceOver reads |
| [`accessibilityTraits`](ui-view/accessibilitytraits.md) | What kind of thing it is and what state it is in: button, heading, selected, and so on |
| [`accessibilityIdentifier`](ui-view/accessibilityidentifier.md) | An identifier automated UI tests use to find elements; VoiceOver doesn't read it |
| [`accessibilityElementsHidden`](ui-view/accessibilityelementshidden.md) | Whether VoiceOver skips all the elements inside it |
| [`accessibilityViewIsModal`](ui-view/accessibilityviewismodal.md) | Whether VoiceOver stays inside it and skips its siblings. Used for overlays |
| [`shouldGroupAccessibilityChildren`](ui-view/shouldgroupaccessibilitychildren.md) | Whether VoiceOver reads the elements inside it as one group, in a row |
| [`accessibilityIgnoresInvertColors`](ui-view/accessibilityignoresinvertcolors.md) | Whether the view stays as-is under Smart Invert |
| [`showsLargeContentViewer`](ui-view/showslargecontentviewer.md) | Whether an enlarged version is shown on long press |
| [`largeContentTitle`](ui-view/largecontenttitle.md) | Text shown in the large content viewer |
| [`largeContentImage`](ui-view/largecontentimage.md) | Image shown in the large content viewer |
| [`scalesLargeContentImage`](ui-view/scaleslargecontentimage.md) | Whether the image is scaled up in the large content viewer |
| [`largeContentImageInsets`](ui-view/largecontentimageinsets.md) | Insets around the image in the large content viewer |
| [`restorationIdentifier`](ui-view/restorationidentifier.md) | The name the system uses to recognize the view when restoring interface state |

## Instance methods

Also inherits `becomeFirstResponder()` and `resignFirstResponder()` from `UIResponder`. See [Text fields and the keyboard](ui-text-field.md).

View hierarchy:

| Method | Description |
| --- | --- |
| [`addSubview()`](ui-view/addsubview.md) | Adds a subview on top |
| [`insertSubview()`](ui-view/insertsubview.md) | Adds a subview at a given position |
| [`removeFromSuperview()`](ui-view/removefromsuperview.md) | Removes the view from its superview |
| [`bringSubviewToFront()`](ui-view/bringsubviewtofront.md) | Moves a subview to the top |
| [`sendSubviewToBack()`](ui-view/sendsubviewtoback.md) | Moves a subview to the bottom |
| [`exchangeSubviewAtIndex()`](ui-view/exchangesubviewatindex.md) | Swaps the positions of two subviews |
| [`isDescendantOfView()`](ui-view/isdescendantofview.md) | Whether the view is a descendant of another view |
| [`viewWithTag()`](ui-view/viewwithtag.md) | Finds a view by tag |

Geometry:

| Method | Description |
| --- | --- |
| [`sizeThatFits()`](ui-view/sizethatfits.md) | How large the view must be to show all its content |
| [`sizeToFit()`](ui-view/sizetofit.md) | Resizes the view to just fit its content |
| [`convertPoint()`](ui-view/convertpoint.md) | Converts a point to another view's coordinate system |
| [`convertRect()`](ui-view/convertrect.md) | Converts a rectangle to another view's coordinate system |
| [`hitTest()`](ui-view/hittest.md) | The topmost view at a location that can receive touches |
| [`alignmentRectForFrame()`](ui-view/alignmentrectforframe.md) | Converts a `frame` to an alignment rectangle |
| [`frameForAlignmentRect()`](ui-view/frameforalignmentrect.md) | Converts an alignment rectangle to a `frame` |
| [`effectiveRadiusForCorner()`](ui-view/effectiveradiusforcorner.md) | The actual corner radius of a given corner |

Gesture recognizers:

| Method | Description |
| --- | --- |
| [`addGestureRecognizer()`](ui-view/addgesturerecognizer.md) | Adds a gesture recognizer |
| [`removeGestureRecognizer()`](ui-view/removegesturerecognizer.md) | Removes a gesture recognizer |

Layout, redrawing, and updates. The system doesn't lay out again immediately after every property change; it sets a flag and handles everything together later. In everyday code you only need `layoutIfNeeded()`:

| Method | Description |
| --- | --- |
| [`layoutIfNeeded()`](ui-view/layoutifneeded.md) | Completes any pending layout immediately. Call it when you need to read `frame` right after activating constraints |
| [`setNeedsLayout()`](ui-view/setneedslayout.md) | Marks the view as needing layout |
| [`setNeedsDisplay()`](ui-view/setneedsdisplay.md) | Marks the view as needing redrawing |
| [`setNeedsDisplayInRect()`](ui-view/setneedsdisplayinrect.md) | Marks a rectangle as needing redrawing |
| [`setNeedsUpdateConstraints()`](ui-view/setneedsupdateconstraints.md) | Marks the constraints as needing an update |
| [`updateConstraintsIfNeeded()`](ui-view/updateconstraintsifneeded.md) | Completes any pending constraint update immediately |
| [`needsUpdateConstraints()`](ui-view/needsupdateconstraints.md) | Whether a constraint update is pending |
| [`setNeedsUpdateProperties()`](ui-view/setneedsupdateproperties.md) | Marks the properties as needing an update |
| [`updatePropertiesIfNeeded()`](ui-view/updatepropertiesifneeded.md) | Completes any pending property update immediately |
| [`updateTraitsIfNeeded()`](ui-view/updatetraitsifneeded.md) | Completes any pending trait update immediately |

Constraints (Auto Layout):

| Method | Description |
| --- | --- |
| [`addLayoutGuide()`](ui-view/addlayoutguide.md) | Adds a layout guide |
| [`removeLayoutGuide()`](ui-view/removelayoutguide.md) | Removes a layout guide |
| [`contentHuggingPriorityForAxis()`](ui-view/contenthuggingpriorityforaxis.md) | Reads the "resist being stretched" priority |
| [`setContentHuggingPriority()`](ui-view/setcontenthuggingpriority.md) | Sets the "resist being stretched" priority |
| [`contentCompressionResistancePriorityForAxis()`](ui-view/contentcompressionresistancepriorityforaxis.md) | Reads the "resist being squeezed" priority |
| [`setContentCompressionResistancePriority()`](ui-view/setcontentcompressionresistancepriority.md) | Sets the "resist being squeezed" priority |
| [`invalidateIntrinsicContentSize()`](ui-view/invalidateintrinsiccontentsize.md) | Tells the system the intrinsic size has changed |
| [`systemLayoutSizeFittingSize()`](ui-view/systemlayoutsizefittingsize.md) | Computes how large the view should be from its constraints |
| [`constraintsAffectingLayoutForAxis()`](ui-view/constraintsaffectinglayoutforaxis.md) | The constraints that actually affect this view |
| [`exerciseAmbiguityInLayout()`](ui-view/exerciseambiguityinlayout.md) | When constraints are insufficient, switches once between the possible results |

Snapshots and the keyboard:

| Method | Description |
| --- | --- |
| [`snapshotViewAfterScreenUpdates()`](ui-view/snapshotviewafterscreenupdates.md) | Takes a snapshot and returns a new view that displays it |
| [`resizableSnapshotViewFromRect()`](ui-view/resizablesnapshotviewfromrect.md) | Takes a stretchable snapshot of a region |
| [`endEditing()`](ui-view/endediting.md) | Makes the text field being edited lose focus and dismisses the keyboard |

## Events

| Event | When it fires |
| --- | --- |
| [`traitchange`](ui-view/traitchange-event.md) | When traits (light or dark, text size, and so on) change |

This is the only event `UIView` itself fires. Touches don't produce `UIView` events. To respond to touches, use a [gesture recognizer](ui-gesture-recognizer.md) or a subclass of [`UIControl`](ui-control.md).

Apart from `traitchange`, none of the properties on this page have change notifications: there is no event when the position, size, or superview changes.

You can listen for and dispatch events with custom names on a plain `UIView`, the same as on a plain `EventTarget`. The same goes for subclasses with their own set of events (such as `UIControl`): any name the system doesn't fire is treated as a custom event.

## Concepts

### `frame`, `bounds`, and `center`

All three properties describe a view's position and size. They differ in which coordinate system they refer to.

| Property | Coordinate system | What it is |
| --- | --- | --- |
| `frame` | The superview's | The rectangle the view occupies in its superview |
| `bounds` | The view's own | The view's own rectangle. The top-left corner is usually `(0, 0)`, and the width and height match `frame` |
| `center` | The superview's | The position of the view's center point |

The origin is at the top-left corner; `x` increases to the right and `y` increases downward.

A subview's `frame` is relative to its superview's top-left corner, not to the screen. When the superview moves, the subview moves with it, and the subview's `frame` doesn't change.

Choose by what you want to do:

| Task | Use | Why |
| --- | --- | --- |
| Put a view at a position in its superview | Write its `frame` | `frame` uses the superview's coordinate system |
| Find out how large a view is, or make a subview fill it | Read its `bounds` | Subview coordinates are relative to its top-left corner, and `bounds` is exactly the rectangle in that coordinate system. Reading the superview's `frame` brings in the superview's own position |
| Move without resizing | Write `center` | No need to repeat the width and height |
| The view has a `transform` | Use `bounds` and `center`, not `frame` | See [Transforms and `frame`](#transforms-and-frame) |

The three properties are the same data: write one, and the other two read back changed accordingly. For a view positioned by constraints, all three are read-only in practice; see [Two ways to position views](#two-ways-to-position-views).

### View hierarchy and stacking order

Views form a tree. Each view has at most one superview (`superview`) and any number of subviews (`subviews`).

- The order of `subviews` is the drawing order: later views are drawn on top. Stacking order is determined only by this order; there is no separate z-index value. For two views under different superviews, which one is on top is determined by the order of their respective ancestors within their common superview.
- A view can have only one superview at a time. Adding a view that already has a superview to another superview removes it from the original one; it doesn't appear in two places. **Not verified in the simulator.**
- The root of the tree is a window ([`UIWindow`](ui-window.md)). A view is displayed only after it is added under a window; its `window` property then has a value. Otherwise it is `null`.
- A view controller ([`UIViewController`](ui-view-controller.md)) comes with a root view, `page.view`, and all of the view controller's content is added under it.

The view hierarchy can't contain cycles. Adding a view as its own subview throws `TypeError`, the hierarchy stays unchanged, and the view remains usable afterward:

```js
const lone = new UIView();
try {
  lone.addSubview(lone);
} catch (err) {
  console.log(String(err));
}
console.log(lone.subviews.length);
```

**Effect**: The console prints `TypeError: addSubview: raised NSInvalidArgumentException: Can't add self as subview`, then `0`.

What happens when you add a view to one of its own descendants (for example `dot.addSubview(card)`, where `dot` is a subview of `card`) is **not verified in the simulator**. You can check first with `isDescendantOfView()`.

Once a view is added to the hierarchy, its superview keeps it alive, so you don't need to hold it in a variable. For whether it is collected after removal, see [Who keeps a view alive](../guides/views.md#who-keeps-a-view).

### Two ways to position views

| Approach | How | Characteristics |
| --- | --- | --- |
| Write `frame` directly | `view.frame = new CGRect(…)` | Position and size are fixed numbers. When the superview's size changes, code has to assign them again |
| Constraints (Auto Layout) | `NSLayoutConstraint.activateConstraints([…])` | Describe relationships between views; the system computes `frame` and recomputes it when sizes change |

Constraints are recommended; see [Recommended approach](../guides/views.md#recommended-approach) in the guide for why.

Use only one approach per view:

- For a view that uses constraints, first set `translatesAutoresizingMaskIntoConstraints = false`. This property defaults to `true`, meaning "position by `frame`". If you don't change it, the constraints the system generates from `frame` conflict with the constraints your code writes, and the symptom is that the constraints are correct but the position doesn't change. The system prints nothing to the console when this conflict happens.
- For a view that uses constraints, you can read `frame`, but don't write it. Writing doesn't throw, but on the next layout pass the system overwrites it with the result of the constraints. To change the position, change a constraint's `constant` or switch to a different set of constraints. **"The written `frame` gets overwritten" is not verified in the simulator.**
- The view controller's root view `page.view` and windows are positioned by the system. Don't change this property on them, and don't write their `frame`.

The two approaches can be mixed in the same tree: a superview uses constraints while one of its subviews uses `frame`. The subview's `frame` is relative to the superview's top-left corner, and when constraints move the superview, the subview moves with it.

Constraints use two kinds of objects:

- **Anchor**: represents one edge, center line, or the width or height of a view, such as `view.leadingAnchor`. A constraint describes a relationship between two anchors.
- **Layout guide**: an invisible rectangle used only for alignment. `view.safeAreaLayoutGuide` is the one that represents the safe area.

See [`NSLayoutConstraint`](auto-layout.md) and the guide [Laying out with constraints](../guides/auto-layout.md).

### Safe area

The safe area is the part of a view that isn't covered by the notch, the status bar, the screen's rounded corners, or the home indicator.

Each view has its own safe area, computed over that view's extent: a view touching the top of the screen has a strip of safe area inset at its top, while a view entirely in the middle of the screen has 0 pt on all four sides.

There are two ways to read it:

| Approach | Where to use it |
| --- | --- |
| `view.safeAreaInsets` | When positioning by `frame`. Four numbers, in pt |
| `view.safeAreaLayoutGuide` | When positioning by constraints. Align directly to its anchors |

`safeAreaLayoutGuide` is recommended. `safeAreaInsets` reads 0 pt before the view is shown on screen, so reading it too early gives the wrong values; constraints aligned to `safeAreaLayoutGuide` don't have this problem. There is no event when the safe area changes. Constraints are recomputed automatically, but code that reads the numbers has to read them again itself.

Background colors and background images usually fill the whole screen, while text and buttons go inside the safe area.

### Layout margins

Each view has a set of layout margins, which say how far content should be from the view's four edges. There are four things to know about them:

- **They don't inset subviews automatically.** Only two things use them: constraints aligned to `layoutMarginsGuide`, and a [`UIStackView`](ui-stack-view.md) with `isLayoutMarginsRelativeArrangement` turned on. Subviews positioned by `frame` aren't affected.
- **The default isn't 0.** A new view has 8 pt on each side.
- **When a view extends outside the [safe area](#safe-area), the system adds the safe area to the layout margins.** If you write 16 pt and the top safe area is 68 pt, the top margin reads back as 84 pt. To get exactly what you write, set `insetsLayoutMarginsFromSafeArea` to `false`.
- **A view controller's root view has a system-defined minimum margin.** If you write layout margins on `page.view` smaller than the minimum, they read back as the minimum. **Not verified in the simulator.**

There are two layout margin properties. They are two ways of reading the same data; write one and the other changes accordingly:

| Property | Type | Four fields | How left and right work |
| --- | --- | --- | --- |
| `directionalLayoutMargins` | `NSDirectionalEdgeInsets` | `top`, `leading`, `bottom`, `trailing` | `leading` is the side where text starts and `trailing` is the side where text ends. In English and Chinese `leading` is on the left; in right-to-left languages such as Arabic it is on the right |
| `layoutMargins` | `UIEdgeInsets` | `top`, `left`, `bottom`, `right` | Fixed left and right |

Prefer `directionalLayoutMargins`: the interface then swaps left and right automatically in right-to-left languages.

```js
const box = new UIView();
box.directionalLayoutMargins = new NSDirectionalEdgeInsets(1, 2, 3, 4);
String(box.layoutMargins);              // 'UIEdgeInsets(1, 2, 3, 4)' when the language is left-to-right

box.layoutMargins = { top: 5, left: 6, bottom: 7, right: 8 };
String(box.directionalLayoutMargins);   // 'NSDirectionalEdgeInsets(5, 6, 7, 8)'
```

### Transforms and `frame`

`transform` is a 2D affine transform: translation, scaling, rotation, and combinations of them. The transform uses the view's center as its origin and changes only how the view is drawn, not `bounds` or `center`.

When `transform` isn't the identity matrix, `frame` reads back as the bounding rectangle of the transformed shape, no longer the view's original rectangle:

```js
const box = new UIView();
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

box.bounds.width;    // 40, unchanged
box.center.x;        // 44, unchanged
box.frame.width;     // 65.57, equal to 40 × (|a| + |c|), where a and c are fields of the transform matrix
```

So while a transform is applied, use `center` to change the position and `bounds` to change the size, and don't read or write `frame`. After `transform` is set back to `CGAffineTransform.identity`, `frame` returns to 40 × 40.

For constructing transforms, see [`CGAffineTransform`](cg-affine-transform.md).

### Structs are read-only values

The types of `frame`, `bounds`, `center`, `transform`, `safeAreaInsets`, `layoutMargins`, and `directionalLayoutMargins` are structs such as `CGRect` and `CGPoint`. A struct is a value, not a reference to the view:

- Each read of the property returns a new object.
- Fields can't be changed. Writing `view.frame.x = 10` throws `TypeError: x is read-only: structs are values, assign a whole new one instead`.
- To change it, assign a whole new value to the property. You can assign a `new CGRect(…)` or a plain object with all fields present.

See [Structs](structs.md).

### What happens on errors

The result depends on where the mistake is.

| Mistake | Result |
| --- | --- |
| A numeric property gets another type (`view.alpha = '0.5'`) | Converted with `Number()`: `'0.5'` becomes `0.5`, `null` becomes `0`. If it doesn't convert to a finite number, throws `TypeError` and the value stays unchanged |
| A boolean property gets another type (`view.isHidden = 'false'`) | Converted with `Boolean()`. Every non-empty string is `true`, so `'false'` becomes `true` |
| Something other than a view is passed where a view is expected (`view.addSubview(5)`) | Throws `TypeError`; the view hierarchy is unchanged. No conversion happens |
| An invalid color (`view.backgroundColor = '#GGG'`) | Doesn't throw. The console prints a warning and the color keeps its previous value |
| An invalid enum property value (`view.contentMode = 'cover'`) | Doesn't throw. The console prints a warning listing all valid values, and the property keeps its previous value |
| An invalid enum in a method argument (`view.setContentHuggingPriority('defaultHigh', { forAxis: 'diagonal' })`) | Throws `TypeError`; the message lists all valid values |
| Writing a read-only property (`view.superview = null`) | Throws `TypeError` |
| A misspelled property name (`view.backgroundColour = 'red'`) | **No error**; the view doesn't change. Type checking catches it |
| Adding a view as its own subview | Throws `TypeError`; the view hierarchy is unchanged |


| Situation | Error |
| --- | --- |
| Reading or writing a property, or calling a method, on a window not yet bound to a scene (`new UIWindow()` called without an argument, and `windowScene` not yet assigned) | `TypeError: frame: this object is not connected to a scene yet, so no native object exists`, starting with the property or method name |
| Calling on an object not created by the constructor (for example `Object.create(UIView.prototype)`) | `TypeError: frame: Illegal invocation` |
| A parameter that expects a native object gets something else | `TypeError: addSubview needs a UIView`, starting with the method name and ending with the required class. For parameters that can be `null`, it ends with an extra `or null` |
| A numeric parameter or property doesn't convert to a finite number | `TypeError: alpha must be a finite number, got "abc"`, starting with the property or parameter name |
| An enum in a method argument has an unrecognized value | `TypeError: forAxis has no value "diagonal"; expected one of: …` |

On error, the property being written keeps its previous value and the view hierarchy is unchanged. All of these errors can be caught with `try` / `catch`.

Writing an unrecognized value to an enum property (`contentMode`, `overrideUserInterfaceStyle`) isn't an error: it doesn't throw, the property keeps its previous value, and the console prints a warning `[Nacre] contentMode has no value "cover"; expected one of: …, ignored`.

Each member's exact error messages are on its member page. For the various "no native object" errors, see [Native classes](native-classes.md).

> **Note:** A misspelled property name doesn't throw. `view.backgroundColour = 'red'` just adds an ordinary property to the JS object, and the view doesn't change. Type checking catches this kind of mistake: it reports an error with the hint `Did you mean 'backgroundColor'?`.


## Examples

### A small square inside a rectangle

The code below starts from a blank app, puts an indigo rectangle on the screen, and puts a small orange square inside the rectangle.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the view
  const card = new UIView();

  // 2. Set position and size: top-left corner at (40, 120), 200 wide, 120 tall
  card.frame = new CGRect(40, 120, 200, 120);

  // 3. Set the background color
  card.backgroundColor = 'systemIndigo';

  // 4. Put it on the view controller. page.view is the view controller's built-in root view
  page.view.addSubview(card);

  // 5. Put another subview inside card. Its coordinates are relative to card's top-left corner
  const dot = new UIView();
  dot.frame = new CGRect(16, 16, 40, 40);
  dot.backgroundColor = 'systemOrange';
  card.addSubview(dot);

  // 6. Convert dot's top-left corner to the view controller's coordinates
  const p = dot.convertPoint(new CGPoint(0, 0), { toView: page.view });
  console.log(p.x, p.y);
});
```

**Effect**

- An indigo rectangle appears on screen, 200 pt wide and 120 pt tall, with its left edge 40 pt from the left of the screen and its top edge 120 pt from the top of the screen.
- Inside the rectangle's top-left corner is a 40 × 40 pt orange square, 16 pt from the rectangle's left and top edges.
- The console prints `56 176`, that is, 40 + 16 and 120 + 16.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The four basic steps are: create, give it a position and size, set its appearance, and add it to a superview. After the callback ends, the variables `card` and `dot` no longer exist, but both views stay on screen: they are in the view hierarchy, kept alive by their superviews. For more patterns, see the guide [Placing views on screen](../guides/views.md).

## Corresponding iOS API

If you are reading Apple's documentation or iOS sample code, use this table to convert to JS.

| ObjC | JS |
| --- | --- |
| `[[UIView alloc] init]` | `new UIView()` |
| `[[UIView alloc] initWithFrame:rect]` | `new UIView()`, then assign `frame` |
| `view.frame = CGRectMake(40, 120, 200, 120)` | `view.frame = new CGRect(40, 120, 200, 120)` |
| `view.center = CGPointMake(100, 100)` | `view.center = new CGPoint(100, 100)` |
| `view.transform = CGAffineTransformMakeRotation(a)` | `view.transform = CGAffineTransform.rotation(a)` |
| `view.backgroundColor = UIColor.systemIndigoColor` | `view.backgroundColor = 'systemIndigo'` |
| `[view addSubview:box]` | `view.addSubview(box)` |
| `[view insertSubview:box atIndex:0]` | `view.insertSubview(box, { atIndex: 0 })` |
| `[view insertSubview:box belowSubview:other]` | `view.insertSubview(box, { belowSubview: other })` |
| `[view convertPoint:p toView:other]` | `view.convertPoint(p, { toView: other })` |
| `[view convertRect:r fromView:other]` | `view.convertRect(r, { fromView: other })` |
| `view.directionalLayoutMargins = NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `view.directionalLayoutMargins = new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `view.layoutMargins = UIEdgeInsetsMake(8, 16, 8, 16)` | `view.layoutMargins = new UIEdgeInsets(8, 16, 8, 16)` |
| `view.insetsLayoutMarginsFromSafeArea = NO` | `view.insetsLayoutMarginsFromSafeArea = false` |
| `[view sizeThatFits:CGSizeMake(300, 999)]` | `view.sizeThatFits(new CGSize(300, 999))` |
| `[view hitTest:p withEvent:nil]` | `view.hitTest(p)` |
| `[view endEditing:YES]` | `view.endEditing(true)` |
| `[view addGestureRecognizer:tap]` | `view.addGestureRecognizer(tap)` |
| `[UIView animateWithDuration:0.3 animations:^{ view.alpha = 0; }]` | `UIView.animateWithDuration(0.3, { animations() { view.alpha = 0; } })` |
| `[UIView animateWithDuration:0.3 animations:^{ … } completion:^(BOOL finished) { … }]` | `const finished = await UIView.animateWithDuration(0.3, { animations() { … } })` |
| `[UIView animateWithDuration:0.3 delay:0.1 options:UIViewAnimationOptionCurveEaseOut animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.3, { delay: 0.1, options: ['curveEaseOut'], animations() { … } })` |
| `[UIView animateWithDuration:0.5 delay:0 usingSpringWithDamping:0.6 initialSpringVelocity:0 options:0 animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.5, { usingSpringWithDamping: 0.6, initialSpringVelocity: 0, animations() { … } })` |
| `[UIView performWithoutAnimation:^{ … }]` | `UIView.performWithoutAnimation(() => { … })` |
| `view.hidden = YES` | `view.isHidden = true` |
| `view.opaque = NO` | `view.isOpaque = false` |
| `view.userInteractionEnabled = NO` | `view.isUserInteractionEnabled = false` |
| `view.contentMode = UIViewContentModeScaleAspectFit` | `view.contentMode = 'scaleAspectFit'` |
| `[view setContentHuggingPriority:UILayoutPriorityDefaultLow forAxis:UILayoutConstraintAxisHorizontal]` | `view.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |
| `view.accessibilityTraits = UIAccessibilityTraitButton \| UIAccessibilityTraitSelected` | `view.accessibilityTraits = ['button', 'selected']` |

There are three rules:

- For boolean properties declared in ObjC as `getter=isXxx`, JS reads and writes them under the name `isXxx`, such as `isHidden`.
- For a multi-part method name, the first part is the JS method name and the remaining parts are keys of the `options` object.
- The four ObjC `animateWithDuration:…` methods are a single method in JS. The `completion:` parameter is replaced by the returned Promise.

## See also

- [Placing views on screen](../guides/views.md), [Animating views](../guides/view-animations.md), [Laying out with constraints](../guides/auto-layout.md)
- [`NSLayoutConstraint`](auto-layout.md): constraints
- [Structs](structs.md): [`CGRect`](cg-rect.md), [`CGPoint`](cg-point.md), [`CGSize`](cg-size.md), [`UIEdgeInsets`](ui-edge-insets.md), [`CGAffineTransform`](cg-affine-transform.md)
- [Gesture recognizers](ui-gesture-recognizer.md): make a plain view respond to taps, long presses, drags, pinches, rotations, and swipes
- [Core Animation](ca-animation.md): animate layers directly, with keyframes, motion along a path, and animation groups
- [`CALayer`](ca-layer.md): corner radius, borders, shadows, gradients
- [Colors](ui-color.md): which values `backgroundColor` accepts
- [Units](units.md): what pt is
- [`UIWindow`](ui-window.md) and [`UIViewController`](ui-view-controller.md): the root of the view hierarchy and view controllers
- [`UIStackView`](ui-stack-view.md): arranges a group of views in a row or column, optionally inset by the layout margins
- [Traits](ui-trait-collection.md): `traitCollection`, `overrideUserInterfaceStyle`, and the `traitchange` event
- [`UIControl`](ui-control.md) and [`UIButton`](ui-button.md): views with built-in tap events
- [`UIWindowScene`](ui-window-scene.md): how the interface is released after a scene is destroyed
- [Making VoiceOver read your interface correctly](../guides/accessibility.md): labels, hints, values, traits, and overlays
- [Native classes](native-classes.md): why subclassing isn't allowed, and the various "no native object" errors
