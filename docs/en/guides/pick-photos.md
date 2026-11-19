# Picking photos and saving them to the photo library

This guide shows how to let the user pick photos from their photo library, get the picked images out and display them, and save an image to the photo library. The classes involved are [`PHPickerViewController`](../api/photos.md) (the photo picker), [`PHPickerConfiguration`](../api/ph-picker-configuration.md), [`PHPickerFilter`](../api/ph-picker-filter.md), [`PHPickerResult`](../api/ph-picker-result.md), [`NSItemProvider`](../api/ns-item-provider.md), and [`PHPhotoLibrary`](../api/ph-photo-library.md), all in the `@nacrejs/photos` package. First install the package and write the usage description by following "Installation" on [`PHPickerViewController`](../api/photos.md#installation).

## Recommended approach

- **Create a new picker each time the user picks photos.** What happens when the same picker is presented a second time is **not verified in the simulator**.
- **Set `filter` if you want only images.** By default, the picker shows every kind of item in the library, including videos, and videos can't be loaded at the moment. After `config.filter = PHPickerFilter.imagesFilter`, the photo picker shows only images.
- **Dismiss the picker first, then load the images.** Loading can take several seconds; during that time, don't leave the user facing a photo picker that doesn't respond to taps. In the `pick` listener, call `dismissViewController()` first, then load each item, showing progress in your own view controller while loading.
- **Saving an image doesn't require asking for permission first.** If the user hasn't been asked yet, `performChanges()` shows the prompt itself. Use `authorizationStatusForAccessLevel()` only when you want to know the status before saving (for example, to gray out a button).
- **Once the user has declined, the app can't show the prompt again.** The system asks only once. After that, `performChanges()` is rejected immediately with `name` set to `NotAllowedError`. When that happens, tell the user in your UI to turn the permission on in the system Settings.

## First example

Starting from a blank app: the view controller has an image view and two buttons. One lets the user pick a photo from the library and displays it; the other saves the displayed image back to the library.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
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
  pickButton.setTitle('Pick a photo', { forState: ['normal'] });
  pickButton.frame = new CGRect(40, 360, 110, 44);
  page.view.addSubview(pickButton);

  const saveButton = UIButton.buttonWithType('system');
  saveButton.setTitle('Save to Photos', { forState: ['normal'] });
  saveButton.frame = new CGRect(170, 360, 110, 44);
  page.view.addSubview(saveButton);

  pickButton.addEventListener('click', () => {
    // 1. Configure: show only images, allow picking only one
    const config = new PHPickerConfiguration();
    config.filter = PHPickerFilter.imagesFilter;

    // 2. Create the picker and listen for "done picking"
    const picker = new PHPickerViewController(config);
    picker.addEventListener('pick', async (event) => {
      const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);

      // 3. The photo picker doesn't dismiss itself, so dismiss it first
      picker.dismissViewController({ animated: true });
      if (results.length === 0) {
        console.log('User cancelled');
        return;
      }

      // 4. Load the image from the picked item
      try {
        const image = await results[0].itemProvider.loadObjectOfClass(UIImage);
        imageView.image = image;
        console.log('Picked a ' + image.size.width + ' × ' + image.size.height + ' image');
      } catch (err) {
        console.log('Could not load the image: ' + /** @type {Error} */ (err).message);
      }
    });

    // 5. Present it from the current view controller
    page.presentViewController(picker, { animated: true });
  });

  saveButton.addEventListener('click', async () => {
    const image = imageView.image;
    if (image === null) return;
    try {
      await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
        creationRequestForAssetFromImage: image,
      });
      console.log('Saved');
    } catch (err) {
      console.log('Not saved: ' + /** @type {Error} */ (err).name);
    }
  });
});
```

**Effect** (**not verified in the simulator**)

- At the top of the view controller is a gray square area, with two buttons with blue text side by side below it: "Pick a photo" and "Save to Photos".
- Tap "Pick a photo", and the system photo picker slides up from the bottom of the screen, showing only images. No permission prompt appears.
- Tap an image, and the photo picker disappears; the image is shown in the gray area, and the console prints its size (in [points](../api/units.md)).
- Tap "Cancel" in the upper-left corner of the photo picker, and the photo picker disappears; the console prints `User cancelled`.
- Tap "Save to Photos". The first time, the system shows a prompt with the sentence written in `nacre.config.json`. Tap "Allow", and the console prints `Saved` and a new image appears in the system Photos app. Tap "Don't Allow", and the console prints `Not saved: NotAllowedError`.

The examples below reuse `page`, `imageView`, and `saveButton` from here. `results` is the array received in the `pick` listener, and `result` is one item in it. Snippets that use `await` go inside an `async` function. To try a section on its own, start with these lines:

```js
const page = new UIViewController();
const imageView = new UIImageView();
page.view.addSubview(imageView);
const saveButton = UIButton.buttonWithType('system');
page.view.addSubview(saveButton);
// results and result come from the pick listener; these two lines only declare their types
/** @type {PHPickerResult[]} */
const results = [];
const result = results[0];
```

## When the photo picker finishes

The photo picker can finish in three ways:

- The user finishes picking and taps "Add" in the upper-right corner. When only one item may be picked, tapping that item counts as finishing.
- The user taps "Cancel" in the upper-left corner.
- The user drags the picker down to dismiss it.

In the first two cases, the picker fires the [`pick`](../api/photos/pick-event.md) event. The event object's `results` contains the picked items; when the user taps Cancel, it's an empty array.

- **The photo picker doesn't dismiss itself.** After `pick` fires, it's still on screen; call [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md) in the listener.
- **When dragged down, the picker is dismissed by the system.** In that case, the picker fires the view controller's [`dismiss`](../api/ui-view-controller/dismiss-event.md) event. Whether a `pick` with empty `results` also fires is **not verified in the simulator**; what happens when the listener calls `dismissViewController()` again on an already dismissed picker is also **not verified in the simulator**.
- **When [`selection`](../api/ph-picker-configuration/selection.md) is set to `'continuous'` or `'continuousAndOrdered'`, it fires once every time an item is selected or deselected**, and `results` is everything selected at that moment. In this mode, don't dismiss the picker in the listener.

## Loading an image from a picked item

Each item in `results` is a [`PHPickerResult`](../api/ph-picker-result.md). It isn't an image; its `itemProvider` provides the item's content, and the image is loaded from the provider:

```js
const picked = await result.itemProvider.loadObjectOfClass(UIImage);
```

**Effect**: `picked` is the picked image, a `UIImage`.

Loading an image is asynchronous and returns a Promise:

- **It may take a while.** When the photo is stored in iCloud and only a thumbnail is on the phone, the system downloads the original first. How long that takes is **not verified in the simulator**.
- **It may fail.** If the picked item is a video, no image can be loaded and the Promise is rejected with `name` set to `NotSupportedError`. Check with `canLoadObjectOfClass(UIImage)` first; see [Checking whether a picked item is an image](#checking-whether-a-picked-item-is-an-image).
- **The loaded image isn't decoded.** It's decoded the first time it's displayed; see [Decoding an image before displaying it](#decoding-an-image-before-displaying-it).

## Picking several at once

```js
const multiConfig = new PHPickerConfiguration();
multiConfig.filter = PHPickerFilter.imagesFilter;
multiConfig.selectionLimit = 9;        // at most 9; 0 means no limit
multiConfig.selection = 'ordered';     // numbered in the order picked

const multiPicker = new PHPickerViewController(multiConfig);
multiPicker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  multiPicker.dismissViewController({ animated: true });
  const images = await Promise.all(
    results.map((item) => item.itemProvider.loadObjectOfClass(UIImage)));
  console.log('Loaded ' + images.length + ' images');
});
page.presentViewController(multiPicker, { animated: true });
```

**Effect** (**not verified in the simulator**): In the photo picker, the user can tap to select several images, and each shows its position in the selection order; once 9 are selected, the rest can't be tapped. After the user taps "Add", the console prints the number of images loaded, and the order of `images` is the order in which they were picked.

`Promise.all` rejects as a whole if any image can't be loaded. To get "as many as can be loaded", use `Promise.allSettled` instead.

## Showing only certain kinds of items

```js
const typesConfig = new PHPickerConfiguration();
// Images, but no screenshots
typesConfig.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**Effect** (**not verified in the simulator**): A photo picker created with this configuration shows photos, but no screenshots and no videos.

For the twelve predefined filters and the three ways to combine them, see [`PHPickerFilter`](../api/ph-picker-filter.md).

## Checking whether a picked item is an image

Without a `filter`, the user may pick videos.

```js
for (const item of results) {
  const provider = item.itemProvider;
  if (provider.canLoadObjectOfClass(UIImage)) {
    const one = await provider.loadObjectOfClass(UIImage);
    console.log('Image ' + provider.suggestedName, one.size.width);
  } else if (provider.hasItemConformingToTypeIdentifier('public.movie')) {
    console.log('Video ' + provider.suggestedName + ', cannot be loaded yet');
  }
}
```

**Effect** (**not verified in the simulator**): Prints one line per picked item: images with their width, videos with just their name.

## Decoding an image before displaying it

```js
const decoded = await result.itemProvider.loadObjectOfClass(UIImage);
imageView.image = await decoded.prepareForDisplay();
```

**Effect**: The image is decoded in the background, so the UI doesn't stall at the moment it's displayed. See [`prepareForDisplay()`](../api/ui-image/preparefordisplay.md).

## Saving an image to the photo library

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
    creationRequestForAssetFromImage: photo,
  });
}
```

**Effect** (**not verified in the simulator**): On the first call, the system shows a permission prompt. Once the user agrees, a new photo appears in the library and the Promise fulfills with `undefined`. Later calls don't show the prompt again.

[`UIImage.imageNamed()`](../api/ui-image.md) returns `null` when it can't find the image, so check first. A `UIImage` from any source can be saved: bundled, downloaded, or picked from the library.

## Checking for permission before saving

```js
const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
saveButton.isEnabled = status !== 'denied' && status !== 'restricted';
```

**Effect**: If the user has declined, or the system restricts access, the button is grayed out. Reading the status doesn't show a prompt.

## Telling the user after they decline

```js
const toSave = imageView.image;
if (toSave !== null) {
  try {
    await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
      creationRequestForAssetFromImage: toSave,
    });
  } catch (err) {
    const error = /** @type {PHPhotoLibraryError} */ (err);
    if (error.name === 'NotAllowedError') {
      console.log('Please allow this app to add photos in Settings');
    } else {
      console.log('Save failed: ' + error.message);
    }
  }
}
```

**Effect** (**not verified in the simulator**): If the user tapped "Don't Allow" in the prompt, or declined earlier, the console prints the sentence asking them to go to Settings.

## See also

- [`PHPickerViewController`](../api/photos.md): the photo picker, and how to install this package
- [`PHPickerConfiguration`](../api/ph-picker-configuration.md), [`PHPickerFilter`](../api/ph-picker-filter.md): configuration and filters
- [`NSItemProvider`](../api/ns-item-provider.md): loading images from picked items
- [`PHPhotoLibrary`](../api/ph-photo-library.md): saving images and authorization status
- [`UIImage`](../api/ui-image.md): the type of the loaded images
- [Configuring the app](project-config.md#writing-usage-descriptions): where to write usage descriptions and how to write them per language
