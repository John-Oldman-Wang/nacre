---
type: reference
native: PHPickerViewController
status: partial
---

# `PHPickerViewController`

**`PHPickerViewController`** represents the system's photo picker. It slides up from the bottom of the screen and shows the photos and videos in the user's library; after the user finishes picking or cancels, it fires the [`pick`](photos/pick-event.md) event and hands the picked items to the app.

The photo picker is a [view controller](ui-view-controller.md): present it with the view controller's `presentViewController()` and dismiss it with `dismissViewController()`. It runs in the system's own process; the app can't see the library and only receives the items the user picked, so **picking photos doesn't need photo library permission** and no permission prompt appears.

It belongs to the `@nacrejs/photos` package. The package's six classes divide the work as follows:

| Class | What it represents |
| --- | --- |
| `PHPickerViewController` | The photo picker; this page |
| [`PHPickerConfiguration`](ph-picker-configuration.md) | The photo picker's configuration: how many items can be picked, which types are shown, how selection works |
| [`PHPickerFilter`](ph-picker-filter.md) | Which types the photo picker shows: images, videos, screenshots, … |
| [`PHPickerResult`](ph-picker-result.md) | One item the user picked |
| [`NSItemProvider`](ns-item-provider.md) | The provider of an item's content; images are loaded from it |
| [`PHPhotoLibrary`](ph-photo-library.md) | The system photo library. The app can save a new photo into it |

Picking and saving have different permission requirements:

| | Permission needed? | Why |
| --- | --- | --- |
| Picking | **No**; no permission prompt | The photo picker runs in the system's own process, and the app only receives the items the user picked |
| Saving | Needs "Add Photos" permission; the system prompts the user the first time you save | The app is writing into the user's library |

The app can't read photos already in the library. To let the user choose photos, use the photo picker.

Creating objects, the default values and reading and writing of properties, and the errors for invalid values have been verified in the acceptance tests in the simulator (iPhone Air). The effects after the photo picker is presented, the permission prompt, and the result of saving require a person to operate them and are currently **not verified in the simulator**; each member page marks this where relevant.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `PHPickerViewController`

For how to pick, load, and save photos, see the guide [Picking photos and saving them to the photo library](../guides/pick-photos.md).

## Installation

The photo library isn't in the core; it is only available after you install the `@nacrejs/photos` package. Without it, classes such as `PHPickerViewController` and `PHPhotoLibrary` don't exist globally, reading these names throws `ReferenceError`, and type checking reports that the names can't be found.

**1. Install the package.**

```bash
npm install @nacrejs/photos
```

**Effect**: The next time `ios/` is generated, the project embeds an additional `NacrePhotos.framework`. Projects that don't install it don't have it in their build output.

**2. Bring in the types.** Add a line at the top of your entry file:

```
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />
```

**Effect**: These six classes get completion and checking in the editor. Without this line, `tsc` reports `Cannot find name 'PHPickerViewController'`.

**3. Write the usage description for saving.** Write a sentence in the project's `nacre.config.json`. It is what the prompt shows when the system asks the user whether to allow this app to add photos:

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSPhotoLibraryAddUsageDescription": "Save product photos to your photo library."
    }
  }
}
```

**Effect**: This sentence is written into the app's configuration when the project is generated. If it's missing, generation stops with an error:

```
nacre: @nacrejs/photos needs NSPhotoLibraryAddUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

Apps that only pick photos and never save them also need this sentence: when App Store review checks an uploaded build, it checks whether the build contains photo library functionality, not whether the code uses it. For how to write the description per language, see [Configuring the app](../guides/project-config.md#writing-usage-descriptions).

## Constructor

[`PHPickerViewController()`](photos/constructor.md)

Creates a photo picker from a [`PHPickerConfiguration`](ph-picker-configuration.md). Creating it doesn't present anything.

## Instance properties

Also inherits properties from [`UIViewController`](ui-view-controller.md), such as `view`, `presentingViewController`, and `modalPresentationStyle`.

| Property | Description |
| --- | --- |
| [`configuration`](photos/configuration.md) <small>read-only</small> | The copy of the configuration made at construction |

## Instance methods

It has no methods of its own. Present and dismiss it with `presentViewController()` and `dismissViewController()`, inherited from [`UIViewController`](ui-view-controller.md).

## Events

| Event | When it fires |
| --- | --- |
| [`pick`](photos/pick-event.md) | The user finished picking, or tapped Cancel |
| [`dismiss`](ui-view-controller/dismiss-event.md) (from `UIViewController`) | The photo picker was dismissed, including when the user dragged it down |
| [`appear`](ui-view-controller/appear-event.md), etc. (from `UIViewController`) | The view controller appears or disappears |

## Examples

### Picking an image and displaying it

Starting from a blank app: the page has an image view and a button; tapping the button lets the user pick an image from the library and displays it.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const imageView = new UIImageView();
  imageView.frame = new CGRect(40, 100, 240, 240);
  imageView.contentMode = 'scaleAspectFit';
  imageView.backgroundColor = 'secondarySystemBackground';
  page.view.addSubview(imageView);

  const pickButton = UIButton.buttonWithType('system');
  pickButton.setTitle('Pick an image', { forState: ['normal'] });
  pickButton.frame = new CGRect(40, 360, 240, 44);
  page.view.addSubview(pickButton);

  pickButton.addEventListener('click', () => {
    const config = new PHPickerConfiguration();
    config.filter = PHPickerFilter.imagesFilter;

    const picker = new PHPickerViewController(config);
    picker.addEventListener('pick', async (event) => {
      const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
      picker.dismissViewController({ animated: true });
      if (results.length === 0) {
        console.log('The user canceled');
        return;
      }
      try {
        imageView.image = await results[0].itemProvider.loadObjectOfClass(UIImage);
      } catch (err) {
        console.log('Couldn\'t load the image: ' + /** @type {Error} */ (err).message);
      }
    });
    page.presentViewController(picker, { animated: true });
  });
});
```

**Effect** (**not verified in the simulator**)

- Near the top of the page is a gray square area, with a button below it with the blue title "Pick an image".
- Tap the button, and the system photo picker slides up from the bottom of the screen, showing only images. No permission prompt appears.
- Tap an image, and the photo picker disappears and that image is shown in the gray area.
- Tap "Cancel" at the top left of the photo picker, and it disappears and the console prints `The user canceled`.

For saving images back to the library and picking several at once, see the guide [Picking photos and saving them to the photo library](../guides/pick-photos.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[PHPickerViewController alloc] initWithConfiguration:config]` | `new PHPickerViewController(config)` |
| `picker.configuration` | `picker.configuration` |
| `picker.delegate = self` plus implementing `picker:didFinishPicking:` | `picker.addEventListener('pick', (e) => { e.results })` |
| `[page presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |

## See also

- [Picking photos and saving them to the photo library](../guides/pick-photos.md): the complete approach to picking, loading, and saving
- [`UIViewController`](ui-view-controller.md): the photo picker's parent class. Presenting, dismissing, `dismiss`
- [`UIImage`](ui-image.md): the type of the loaded image
- [Core and capability packages](capabilities.md): which capabilities must be installed separately
- [System share sheet](ui-activity-view-controller.md): letting the user decide where to save an image
