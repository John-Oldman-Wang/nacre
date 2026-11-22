# 从相册选图、把图存进相册

这一篇讲怎么让用户从相册里选图、把选中的图取出来显示，以及把一张图存进相册。用到的类是 [`PHPickerViewController`](../api/photos.md)（选图界面）、[`PHPickerConfiguration`](../api/ph-picker-configuration.md)、[`PHPickerFilter`](../api/ph-picker-filter.md)、[`PHPickerResult`](../api/ph-picker-result.md)、[`NSItemProvider`](../api/ns-item-provider.md) 和 [`PHPhotoLibrary`](../api/ph-photo-library.md)，它们都在 `@nacrejs/photos` 这个包里。先照 [`PHPickerViewController`](../api/photos.md#要先安装) 的「要先安装」装好包、写好权限文案。

## 推荐的做法

- **每次选图新建一个选择器。** 同一个选择器弹第二次会怎样**未在模拟器验证**。
- **只要图片就设 `filter`。** 默认显示相册里的所有类型，包括视频；而视频现在取不出来。`config.filter = PHPickerFilter.imagesFilter` 之后选图界面里只有图片。
- **先关界面，再取图。** 取图可能要等几秒，这段时间不要让用户对着一个点了没反应的选图界面。在 `pick` 的监听器里先调 `dismissViewController()`，再逐项取图，取的过程中在自己的页面上显示进度。
- **存图不用先申请权限。** `performChanges()` 在没问过用户时自己会先弹提示框。只有想在存之前知道状态（比如把按钮置灰）时才用 `authorizationStatusForAccessLevel()`。
- **用户拒绝过之后，App 不能再弹提示框。** 系统只问一次。之后 `performChanges()` 直接被拒绝，`name` 是 `NotAllowedError`。这时在界面上告诉用户到系统的「设置」里打开权限。

## 第一个例子

从空白 App 开始：页面上有一个图片视图和两个按钮，一个让用户从相册选一张图显示出来，一个把显示着的图存回相册。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
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
  pickButton.setTitle('选一张图', { forState: ['normal'] });
  pickButton.frame = new CGRect(40, 360, 110, 44);
  page.view.addSubview(pickButton);

  const saveButton = UIButton.buttonWithType('system');
  saveButton.setTitle('存进相册', { forState: ['normal'] });
  saveButton.frame = new CGRect(170, 360, 110, 44);
  page.view.addSubview(saveButton);

  pickButton.addEventListener('click', () => {
    // 1. 配置：只显示图片，只能选一张
    const config = new PHPickerConfiguration();
    config.filter = PHPickerFilter.imagesFilter;

    // 2. 建选择器，监听「选完了」
    const picker = new PHPickerViewController(config);
    picker.addEventListener('pick', async (event) => {
      const { results } = event;

      // 3. 选图界面不会自己关，先关掉
      picker.dismissViewController({ animated: true });
      if (results.length === 0) {
        console.log('用户取消了');
        return;
      }

      // 4. 从选中的那一项上取图片
      try {
        const image = await results[0].itemProvider.loadObjectOfClass(UIImage);
        imageView.image = image;
        console.log('选了一张 ' + image.size.width + ' × ' + image.size.height + ' 的图');
      } catch (err) {
        console.log('取不出图片：' + /** @type {Error} */ (err).message);
      }
    });

    // 5. 从当前页面弹出来
    page.presentViewController(picker, { animated: true });
  });

  saveButton.addEventListener('click', async () => {
    const image = imageView.image;
    if (image === null) return;
    try {
      await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
        creationRequestForAssetFromImage: image,
      });
      console.log('存好了');
    } catch (err) {
      console.log('没存成：' + /** @type {Error} */ (err).name);
    }
  });
});
```

**效果**（**未在模拟器验证**）

- 页面上方有一块灰色的方形区域，下面并排两个蓝色文字的按钮「选一张图」「存进相册」。
- 点「选一张图」，屏幕底部升起系统的选图界面，里面只有图片。没有弹权限提示框。
- 点一张图，选图界面消失，那张图显示在灰色区域里，控制台输出它的尺寸（单位是[点](../api/units.md)）。
- 点选图界面左上角的「取消」，选图界面消失，控制台输出 `用户取消了`。
- 点「存进相册」，第一次时系统弹提示框，上面是 `nacre.config.json` 里写的那句话。点「允许」，控制台输出 `存好了`，系统的「照片」App 里多一张图。点「不允许」，控制台输出 `没存成：NotAllowedError`。

下面的例子沿用这里的 `page`、`imageView` 和 `saveButton`。`results` 是 `pick` 监听器里取到的那个数组，`result` 是其中一项。用到 `await` 的片段写在 `async` 函数里。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const imageView = new UIImageView();
page.view.addSubview(imageView);
const saveButton = UIButton.buttonWithType('system');
page.view.addSubview(saveButton);
// results 和 result 来自 pick 监听器，这两行只交代它们的类型
/** @type {PHPickerResult[]} */
const results = [];
const result = results[0];
```

## 选图界面什么时候结束

选图界面有三种结束方式：

- 用户选好了，点右上角的「添加」。只允许选一项时，点中那一项就算选好。
- 用户点左上角的「取消」。
- 用户把界面向下拖走。

前两种情况，选择器派发 [`pick`](../api/photos/pick-event.md) 事件。事件对象的 `results` 是选中的那几项；点取消时是空数组。

- **选图界面不会自己关掉。** 派发 `pick` 之后它还在屏幕上，要在监听器里调 [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md)。
- **向下拖走时界面是系统关的。** 这时选择器派发页面的 [`dismiss`](../api/ui-view-controller/dismiss-event.md) 事件。会不会同时派发一次 `results` 为空的 `pick`，**未在模拟器验证**；监听器里对已经关掉的选择器再调一次 `dismissViewController()` 会怎样，也**未在模拟器验证**。
- **[`selection`](../api/ph-picker-configuration/selection.md) 设成 `'continuous'` 或 `'continuousAndOrdered'` 时，每选中或取消一项就派发一次**，`results` 是当时选中的全部。这种方式下不要在监听器里关界面。

## 从选中的项上取图片

`results` 里的每一项是一个 [`PHPickerResult`](../api/ph-picker-result.md)。它不是图片，它的 `itemProvider` 是这一项内容的提供者，图片要从提供者身上取：

```js
const picked = await result.itemProvider.loadObjectOfClass(UIImage);
```

**效果**：`picked` 是选中的那张图，一个 `UIImage`。

取图片是异步的，返回 Promise：

- **可能要等。** 照片存在 iCloud 上、手机里只有缩略图时，系统先把原图下载下来。要等多久**未在模拟器验证**。
- **可能失败。** 选中的是视频时取不出图片，Promise 被拒绝，`name` 是 `NotSupportedError`。先用 `canLoadObjectOfClass(UIImage)` 判断，见[判断选中的是不是图片](#判断选中的是不是图片)。
- **取出来的图没有解码。** 第一次显示时才解码，见[取图之前让它解码好](#取图之前让它解码好)。

## 一次选多张

```js
const multiConfig = new PHPickerConfiguration();
multiConfig.filter = PHPickerFilter.imagesFilter;
multiConfig.selectionLimit = 9;        // 最多 9 张；0 是不限
multiConfig.selection = 'ordered';     // 按选的先后编号

const multiPicker = new PHPickerViewController(multiConfig);
multiPicker.addEventListener('pick', async (event) => {
  const { results } = event;
  multiPicker.dismissViewController({ animated: true });
  const images = await Promise.all(
    results.map((item) => item.itemProvider.loadObjectOfClass(UIImage)));
  console.log('取到 ' + images.length + ' 张');
});
page.presentViewController(multiPicker, { animated: true });
```

**效果**（**未在模拟器验证**）：选图界面里可以点选多张，每张上显示它是第几个选的；选满 9 张之后其余的点不动。点「添加」之后控制台输出取到的张数，`images` 的顺序就是选的顺序。

`Promise.all` 在任何一张取不出来时整个被拒绝。要「取得出几张算几张」，改用 `Promise.allSettled`。

## 只显示某几种类型

```js
const typesConfig = new PHPickerConfiguration();
// 图片，但不要截屏
typesConfig.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**效果**（**未在模拟器验证**）：用这份配置建的选图界面里有照片，没有截屏，也没有视频。

现成的十二个筛选条件和三种组合方式见 [`PHPickerFilter`](../api/ph-picker-filter.md)。

## 判断选中的是不是图片

没有设 `filter` 时用户可能选中视频。

```js
for (const item of results) {
  const provider = item.itemProvider;
  if (provider.canLoadObjectOfClass(UIImage)) {
    const one = await provider.loadObjectOfClass(UIImage);
    console.log('图片 ' + provider.suggestedName, one.size.width);
  } else if (provider.hasItemConformingToTypeIdentifier('public.movie')) {
    console.log('视频 ' + provider.suggestedName + '，现在取不出来');
  }
}
```

**效果**（**未在模拟器验证**）：选中的每一项输出一行，图片带宽度，视频只有名字。

## 取图之前让它解码好

```js
const decoded = await result.itemProvider.loadObjectOfClass(UIImage);
imageView.image = await decoded.prepareForDisplay();
```

**效果**：图片的解码在后台完成，显示的那一刻界面不停顿。见 [`prepareForDisplay()`](../api/ui-image/preparefordisplay.md)。

## 把图存进相册

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
    creationRequestForAssetFromImage: photo,
  });
}
```

**效果**（**未在模拟器验证**）：第一次调用时系统弹权限提示框。用户同意之后，相册里多一张新照片，Promise 兑现成 `undefined`。以后再调不再弹提示框。

[`UIImage.imageNamed()`](../api/ui-image.md) 找不到图片时返回 `null`，所以先判断。任何来源的 `UIImage` 都可以存：打包的、下载的、从相册选出来的。

## 存之前先看有没有权限

```js
const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
saveButton.isEnabled = status !== 'denied' && status !== 'restricted';
```

**效果**：用户拒绝过、或者被系统限制时，按钮是灰的。读状态不会弹提示框。

## 用户拒绝之后提示他

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
      console.log('请到「设置」里允许这个 App 添加照片');
    } else {
      console.log('保存失败：' + error.message);
    }
  }
}
```

**效果**（**未在模拟器验证**）：用户在提示框里点了「不允许」，或者以前拒绝过，控制台输出提示去设置的那一句。

## 参见

- [`PHPickerViewController`](../api/photos.md)：选图界面，以及怎么安装这个包
- [`PHPickerConfiguration`](../api/ph-picker-configuration.md)、[`PHPickerFilter`](../api/ph-picker-filter.md)：配置和筛选条件
- [`NSItemProvider`](../api/ns-item-provider.md)：从选中的项上取图片
- [`PHPhotoLibrary`](../api/ph-photo-library.md)：存图和授权状态
- [`UIImage`](../api/ui-image.md)：取出来的图片的类型
- [配置 App](project-config.md#写权限文案)：权限文案写在哪、怎么按语言写
