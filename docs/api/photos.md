---
type: reference
native: PHPickerViewController
status: partial
---

# 相册

`@nacrejs/photos` 这个包提供相册的两件事：

- **选图**：**`PHPickerViewController`** 表示系统的选图界面。它从屏幕底部升起来，显示用户相册里的照片和视频，用户选好之后把选中的那几项交给 App。
- **存图**：**`PHPhotoLibrary`** 表示系统的相册。App 可以往里面存一张新照片。

这两件事对权限的要求不一样：

| | 要不要权限 | 原因 |
| --- | --- | --- |
| 选图 | **不要**，不弹权限提示框 | 选图界面在系统自己的进程里运行，App 看不到相册，只拿到用户选中的那几项 |
| 存图 | 要「添加照片」的权限，第一次存时系统弹提示框问用户 | App 在往用户的相册里写东西 |

App 读不到相册里已有的照片，也不需要读：让用户选图用选图界面。

> **注意**：相册不在核心里，要先装 `@nacrejs/photos` 这个包才有。没装的时候全局上没有 `PHPickerViewController`、`PHPhotoLibrary` 这些类，类型检查也会报找不到名字。怎么装见下面「[先装上](#先装上)」。

> **注意**：对象的创建、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air）的验收里验过。选图界面弹出来之后的效果、权限提示框、存图的结果要有人操作，目前**未在模拟器验证**，下面在涉及的地方逐处标出。

## 先装上

```bash
npm install @nacrejs/photos
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacrePhotos.framework`；不装的项目，产物里没有它。

在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />
```

**效果**：编辑器里 `PHPickerViewController` 等六个类有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'PHPickerViewController'`。

最后在项目的 `nacre.config.json` 里写一句存图的权限文案。系统问用户「是否允许这个 App 添加照片」时，提示框里显示的就是这句话：

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

**效果**：生成工程时这句话被写进 App 的配置。没写的话生成会停下来报错，指出 `@nacrejs/photos` 要这个键。

只用选图、不存图的 App 也要写这一句：App Store 审核上传的包时检查的是包里有没有相册的功能，不看代码有没有用到。文案按语言写的方法见[配置 App](../guides/project-config.md#写权限文案)。

## 选图界面什么时候结束

选图界面有三种结束方式：

- 用户选好了，点右上角的「添加」。只允许选一项时，点中那一项就算选好。
- 用户点左上角的「取消」。
- 用户把界面向下拖走。

前两种情况，选择器派发 `pick` 事件。事件对象的 `results` 是选中的那几项；点取消时是空数组。

- **选图界面不会自己关掉。** 派发 `pick` 之后它还在屏幕上，要在监听器里调 [`dismissViewController()`](ui-view-controller.md#dismissviewcontroller)。
- **向下拖走时界面是系统关的。** 这时选择器派发页面的 [`dismiss`](ui-view-controller.md#事件) 事件。会不会同时派发一次 `results` 为空的 `pick`，**未在模拟器验证**；监听器里对已经关掉的选择器再调一次 `dismissViewController()` 会怎样，也**未在模拟器验证**。
- **`selection` 设成 `'continuous'` 或 `'continuousAndOrdered'` 时，每选中或取消一项就派发一次**，`results` 是当时选中的全部。这种方式下不要在监听器里关界面。

## 选中的不是图片，要再取一次

`results` 里的每一项是一个 `PHPickerResult`。它不是图片，它的 `itemProvider` 是这一项内容的提供者，图片要从提供者身上取：

```js
const image = await result.itemProvider.loadObjectOfClass(UIImage);
```

取图片是异步的，返回 Promise：

- **可能要等。** 照片存在 iCloud 上、手机里只有缩略图时，系统先把原图下载下来。要等多久**未在模拟器验证**。
- **可能失败。** 选中的是视频时取不出图片，Promise 被拒绝。先用 `canLoadObjectOfClass(UIImage)` 判断。
- **取出来的图没有解码。** 第一次显示时才解码，大图在这一刻会占用界面所在的线程。显示之前调一次 [`prepareForDisplay()`](ui-image.md#大图和网络图片)。

## 推荐的做法

**每次选图新建一个选择器。** 同一个选择器弹第二次会怎样**未在模拟器验证**。

**只要图片就设 `filter`。** 默认显示相册里的所有类型，包括视频；而视频现在取不出来。`config.filter = PHPickerFilter.imagesFilter` 之后选图界面里只有图片。

**先关界面，再取图。** 取图可能要等几秒，这段时间不要让用户对着一个点了没反应的选图界面。在监听器里先调 `dismissViewController()`，再逐项取图，取的过程中在自己的页面上显示进度。

**存图不用先申请权限。** `performChanges()` 在没问过用户时自己会先弹提示框。只有想在存之前知道状态（比如把按钮置灰）时才用 `authorizationStatusForAccessLevel()`。

**用户拒绝过之后，App 不能再弹提示框。** 系统只问一次。之后 `performChanges()` 直接被拒绝，`name` 是 `NotAllowedError`。这时在界面上告诉用户到系统的「设置」里打开权限。

## 完整例子

下面的代码从空白 App 开始：页面上有一个图片视图和两个按钮，一个让用户从相册选一张图显示出来，一个把显示着的图存回相册。

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
      const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);

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

**效果**（**未在模拟器验证**）：

- 页面上方有一块灰色的方形区域，下面并排两个蓝色文字的按钮「选一张图」「存进相册」。
- 点「选一张图」，屏幕底部升起系统的选图界面，里面只有图片。没有弹权限提示框。
- 点一张图，选图界面消失，那张图显示在灰色区域里，控制台输出它的尺寸（单位是[点](units.md)）。
- 点选图界面左上角的「取消」，选图界面消失，控制台输出 `用户取消了`。
- 点「存进相册」，第一次时系统弹提示框，上面是 `nacre.config.json` 里写的那句话。点「允许」，控制台输出 `存好了`，系统的「照片」App 里多一张图。点「不允许」，控制台输出 `没存成：NotAllowedError`。

## 常见用法

下面的例子沿用完整例子里的 `page` 和 `imageView`。

### 一次选多张

```js
const config = new PHPickerConfiguration();
config.filter = PHPickerFilter.imagesFilter;
config.selectionLimit = 9;        // 最多 9 张；0 是不限
config.selection = 'ordered';     // 按选的先后编号

const picker = new PHPickerViewController(config);
picker.addEventListener('pick', async (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  picker.dismissViewController({ animated: true });
  const images = await Promise.all(
    results.map((result) => result.itemProvider.loadObjectOfClass(UIImage)));
  console.log('取到 ' + images.length + ' 张');
});
page.presentViewController(picker, { animated: true });
```

**效果**（**未在模拟器验证**）：选图界面里可以点选多张，每张上显示它是第几个选的；选满 9 张之后其余的点不动。点「添加」之后控制台输出取到的张数，`images` 的顺序就是选的顺序。

`Promise.all` 在任何一张取不出来时整个被拒绝。要「取得出几张算几张」，改用 `Promise.allSettled`。

### 只显示某几种类型

```js
// 图片，但不要截屏
config.filter = PHPickerFilter.allFilterMatchingSubfilters([
  PHPickerFilter.imagesFilter,
  PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.screenshotsFilter),
]);
```

**效果**（**未在模拟器验证**）：选图界面里有照片，没有截屏，也没有视频。

现成的筛选条件和三种组合方式见[筛选条件](#筛选条件)。

### 判断选中的是不是图片

没有设 `filter` 时用户可能选中视频。

```js
for (const result of results) {
  const provider = result.itemProvider;
  if (provider.canLoadObjectOfClass(UIImage)) {
    const image = await provider.loadObjectOfClass(UIImage);
    console.log('图片 ' + provider.suggestedName, image.size.width);
  } else if (provider.hasItemConformingToTypeIdentifier('public.movie')) {
    console.log('视频 ' + provider.suggestedName + '，现在取不出来');
  }
}
```

**效果**（**未在模拟器验证**）：选中的每一项输出一行，图片带宽度，视频只有名字。

### 取图之前让它解码好

```js
const image = await result.itemProvider.loadObjectOfClass(UIImage);
imageView.image = await image.prepareForDisplay();
```

**效果**：图片的解码在后台完成，显示的那一刻界面不停顿。见 [`UIImage`](ui-image.md#大图和网络图片)。

### 把图片存进相册

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
    creationRequestForAssetFromImage: photo,
  });
}
```

**效果**（**未在模拟器验证**）：第一次调用时系统弹权限提示框。用户同意之后，相册里多一张新照片，Promise 兑现成 `undefined`。以后再调不再弹提示框。

[`UIImage.imageNamed()`](ui-image.md) 找不到图片时返回 `null`，所以先判断。任何来源的 `UIImage` 都可以存：打包的、下载的、从相册选出来的。

### 存之前先看有没有权限

```js
const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
saveButton.isEnabled = status !== 'denied' && status !== 'restricted';
```

**效果**：用户拒绝过、或者被系统限制时，按钮是灰的。读状态不会弹提示框。

### 用户拒绝之后提示他

```js
try {
  await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
    creationRequestForAssetFromImage: image,
  });
} catch (err) {
  const error = /** @type {PHPhotoLibraryError} */ (err);
  if (error.name === 'NotAllowedError') {
    console.log('请到「设置」里允许这个 App 添加照片');
  } else {
    console.log('保存失败：' + error.message);
  }
}
```

**效果**（**未在模拟器验证**）：用户在提示框里点了「不允许」，或者以前拒绝过，控制台输出提示去设置的那一句。

## 筛选条件

`PHPickerFilter` 表示选图界面里显示哪些类型。它不能用 `new` 创建。

现成的十二个从类上读：

| 属性 | 显示什么 |
| --- | --- |
| `PHPickerFilter.imagesFilter` | 图片，包括实况照片 |
| `PHPickerFilter.videosFilter` | 视频 |
| `PHPickerFilter.livePhotosFilter` | 实况照片（按住会动的照片） |
| `PHPickerFilter.depthEffectPhotosFilter` | 带景深效果的照片（人像模式拍的） |
| `PHPickerFilter.burstsFilter` | 连拍 |
| `PHPickerFilter.panoramasFilter` | 全景照片 |
| `PHPickerFilter.screenshotsFilter` | 截屏 |
| `PHPickerFilter.screenRecordingsFilter` | 屏幕录制 |
| `PHPickerFilter.cinematicVideosFilter` | 电影效果模式拍的视频 |
| `PHPickerFilter.slomoVideosFilter` | 慢动作视频 |
| `PHPickerFilter.timelapseVideosFilter` | 延时摄影 |
| `PHPickerFilter.spatialMediaFilter` | 空间照片和空间视频 |

三个类方法把它们组合起来：

| 方法 | 得到的筛选条件 |
| --- | --- |
| `PHPickerFilter.anyFilterMatchingSubfilters([a, b])` | 符合 `a` 或者 `b` 的 |
| `PHPickerFilter.allFilterMatchingSubfilters([a, b])` | 同时符合 `a` 和 `b` 的 |
| `PHPickerFilter.notFilterOfSubfilter(a)` | 不符合 `a` 的 |

组合可以嵌套。

**比较两个筛选条件用 `isEqual()`。** 现成的十二个每次读是同一个对象，可以用 `===` 比。组合出来的每次是新对象；`config.filter` 读回来的也不是写进去的那个对象，系统存的是一份副本。

```js
config.filter = PHPickerFilter.imagesFilter;
console.log(config.filter === PHPickerFilter.imagesFilter);          // false
console.log(config.filter.isEqual(PHPickerFilter.imagesFilter));     // true
```

**效果**：第一行输出 `false`，第二行输出 `true`。

## 成员说明

### `PHPickerConfiguration`

选图界面的配置。

#### `new PHPickerConfiguration()`

没有参数。建出来的配置用的是系统的相册。

配置在建选择器时被复制一份。之后再改这个对象，已经建好的选择器不受影响。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `selectionLimit` | `number` | 是 | 是 | `1` | 最多选几项（个数）。`0` 是不限。写小数向零取整；写负数抛 `TypeError` |
| `filter` | `PHPickerFilter \| null` | 是 | 是 | `null` | 显示哪些类型。`null` 是全部。读回来的是副本，见[筛选条件](#筛选条件) |
| `preferredAssetRepresentationMode` | 字符串，见下 | 是 | 是 | `'automatic'` | 一项有几种格式时给哪一种 |
| `selection` | 字符串，见下 | 是 | 是 | `'default'` | 选中的方式 |
| `mode` | 字符串，见下 | 是 | 是 | `'default'` | 界面的样子 |

这些属性没有变化通知：只有 App 自己能改它们。

`preferredAssetRepresentationMode` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定 |
| `'current'` | 尽量给原来的格式，不转换。新款手机拍的照片是 HEIC 格式，取到的就是 HEIC |
| `'compatible'` | 尽量给最通用的格式，需要时转换（HEIC 转成 JPEG）。转换要时间 |

取成 `UIImage` 时三种取值看起来没有区别（**未在模拟器验证**）：`UIImage` 两种格式都认。

`selection` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 选中的项上打一个勾 |
| `'ordered'` | 选中的项上显示它是第几个选的，`results` 按这个顺序给 |
| `'continuous'` | 每选中或取消一项就派发一次 `pick`，不等用户点「添加」 |
| `'continuousAndOrdered'` | `'continuous'` 加上编号 |

`mode` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 完整的选图界面 |
| `'compact'` | 只有一行缩略图。给嵌在页面里的选择器用 |

`preferredAssetRepresentationMode`、`selection`、`mode` 写了不认识的值时都不抛异常：属性保持原来的值，控制台输出一条警告，警告里列出可选的值：

```
[Nacre] mode has no value "full"; expected one of: default / compact, ignored
```

### `PHPickerFilter`

见[筛选条件](#筛选条件)。

| 成员 | 说明 |
| --- | --- |
| 十二个静态属性 | 只读。每次读是同一个对象 |
| `PHPickerFilter.anyFilterMatchingSubfilters(subfilters)` | `subfilters` 是 `PHPickerFilter` 的数组（任何可迭代的东西都行）。返回新的 `PHPickerFilter` |
| `PHPickerFilter.allFilterMatchingSubfilters(subfilters)` | 同上 |
| `PHPickerFilter.notFilterOfSubfilter(subfilter)` | `subfilter` 是一个 `PHPickerFilter`。返回新的 `PHPickerFilter` |
| `filter.isEqual(other)` | 返回 `boolean`。`other` 不是 `PHPickerFilter` 时返回 `false`，不抛 |

出错情况：

| 写法 | 抛出的 `TypeError` |
| --- | --- |
| `new PHPickerFilter()` | `Illegal constructor: PHPickerFilter is created by the runtime, not by new` |
| `anyFilterMatchingSubfilters([])` | `anyFilterMatchingSubfilters needs at least one PHPickerFilter` |
| `anyFilterMatchingSubfilters(a)`（不是数组） | `anyFilterMatchingSubfilters needs an array of PHPickerFilter, got an object` |
| `anyFilterMatchingSubfilters([a, 'videos'])` | `anyFilterMatchingSubfilters: subfilters[1] must be a PHPickerFilter, got "videos"` |
| `notFilterOfSubfilter(null)` | `notFilterOfSubfilter needs a PHPickerFilter, got null` |

`allFilterMatchingSubfilters` 的报错和 `anyFilterMatchingSubfilters` 相同，只是开头的名字不同。

### `PHPickerViewController`

选图界面。它是一个[页面](ui-view-controller.md)，页面的成员它都有。

#### `new PHPickerViewController(configuration)`

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `configuration` | `PHPickerConfiguration` | 必填。在这里被复制一份 |

建出来不会弹出任何东西，要用页面的 [`presentViewController()`](ui-view-controller.md#presentviewcontroller) 弹出来。

不给配置，或者给的不是 `PHPickerConfiguration`，抛 `TypeError`：

```
new PHPickerViewController needs a PHPickerConfiguration, got undefined
```

#### 属性

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `configuration` | `PHPickerConfiguration` | 是 | 否 | 构造时复制的那一份配置。不是传进去的那个对象；两次读是同一个对象 |

#### 弹出和关闭

用页面的方法：

| 做什么 | 写法 |
| --- | --- |
| 弹出 | [`page.presentViewController(picker, { animated: true })`](ui-view-controller.md#presentviewcontroller) |
| 关闭 | [`picker.dismissViewController({ animated: true })`](ui-view-controller.md#dismissviewcontroller) |

#### 事件

| 事件 | 什么时候派发 | 事件对象上多出的字段 |
| --- | --- | --- |
| `pick` | 用户选好了，或者点了取消。`selection` 是连续的两种时，每次选中的项变了都派发 | `results`：`PHPickerResult` 的数组，只读。取消时是空数组 |

监听器收到的参数类型是 `Event`，读 `results` 要转一次类型：

```js
picker.addEventListener('pick', (event) => {
  const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
  console.log(results.length);
});
```

**效果**（**未在模拟器验证**）：用户点「添加」之后输出选中的项数。

页面的事件（[`dismiss`](ui-view-controller.md#事件)、`appear` 等）在选择器上照常可以监听。监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

### `PHPickerResult`

用户选中的一项。只出现在 `pick` 的 `results` 里，不能用 `new` 创建。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `itemProvider` | `NSItemProvider` | 是 | 否 | 这一项内容的提供者 |

### `NSItemProvider`

一项内容的提供者。内容可能有几种格式（同一张照片的 HEIC 和 JPEG），提供者按要的类型把它取出来。

#### `new NSItemProvider(object)`

用一个对象建一个提供者。`object` 现在只能是 `UIImage`，别的抛 `TypeError`：

```
new NSItemProvider supports only a UIImage for now, got "hello"
```

选图用不到它：选中的每一项自带提供者。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `registeredTypeIdentifiers` | `string[]` | 是 | 否 | 这一项有哪些格式。值是统一类型标识符，系统用来表示数据类型的字符串：`'public.jpeg'`、`'public.heic'`、`'public.png'`、`'com.apple.quicktime-movie'` |
| `suggestedName` | `string \| null` | 是 | 否 | 系统建议的文件名，不带扩展名。没有是 `null` |

#### `hasItemConformingToTypeIdentifier(typeIdentifier)`

这一项是不是某一类内容。返回 `boolean`。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `typeIdentifier` | `string` | 统一类型标识符。`'public.image'` 是所有图片，`'public.movie'` 是所有视频 |

#### `canLoadObjectOfClass(aClass)`

这一项取不取得出 `aClass` 这个类的对象。返回 `boolean`。

`aClass` 现在只能是 `UIImage` 这个类本身，别的抛 `TypeError`：

```
canLoadObjectOfClass supports only UIImage for now, got UIColor
```

#### `loadObjectOfClass(aClass)`

取出 `aClass` 这个类的对象。返回 `Promise<UIImage>`。

`aClass` 现在只能是 `UIImage`，别的同步抛 `TypeError`，不是拒绝 Promise。

Promise 被拒绝的情况：

| `name` | 什么时候 |
| --- | --- |
| `NotSupportedError` | 这一项取不出图片（选中的是视频）。`canLoadObjectOfClass(UIImage)` 是 `false` 时就是这种 |
| `NotReadableError` | 读的过程出错。错误对象上的 `code` 和 `domain` 是系统给的原值 |

### `PHPhotoLibrary`

系统的相册。不能用 `new` 创建。

#### `PHPhotoLibrary.sharedPhotoLibrary`

只读。整个 App 只有这一个，两次读是同一个对象。

#### `PHPhotoLibrary.authorizationStatusForAccessLevel(accessLevel)`

读现在的授权状态。不会弹提示框。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `accessLevel` | `'addOnly'` | 只有这一个取值：往相册里添加的权限 |

返回值：

| 取值 | 含义 |
| --- | --- |
| `'notDetermined'` | 还没问过用户 |
| `'authorized'` | 用户同意了 |
| `'denied'` | 用户拒绝了 |
| `'restricted'` | 被系统限制了（家长控制一类），用户自己也改不了 |
| `'limited'` | 用户只给了一部分照片。`'addOnly'` 这个级别不会出现 |

状态变了没有事件通知。用户只能在提示框里或者离开 App 到系统的「设置」里改它，所以在要用的时候读一次。

`accessLevel` 写别的值抛 `TypeError`。写 `'readWrite'` 时：

```
accessLevel "readWrite" is not supported: reading the photo library needs a different usage description; expected one of: addOnly. To let the user choose photos, use PHPickerViewController, which needs no permission
```

#### `PHPhotoLibrary.requestAuthorizationForAccessLevel(accessLevel)`

申请权限。返回 `Promise`，兑现成授权状态，取值同上。

- 没问过用户时，系统弹提示框，用户点了之后 Promise 兑现。
- 问过了不再弹，直接兑现成现在的状态。

`accessLevel` 写错是同步抛的 `TypeError`，不是拒绝 Promise。

工程里没写 `NSPhotoLibraryAddUsageDescription` 时 Promise 被拒绝，`name` 是 `InvalidStateError`。用 CLI 生成的工程不会出现这种情况，生成时就拦住了。

#### `library.performChanges(changes)`

修改相册。返回 `Promise<void>`。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `changes` | 对象 | 要做的修改。现在只有一种：`{ creationRequestForAssetFromImage: image }`，把 `image`（`UIImage`）存成一张新照片 |

没问过用户时先弹权限提示框，用户同意之后再存。

参数不对时同步抛 `TypeError`，不是拒绝 Promise：

| 写法 | 报错 |
| --- | --- |
| `performChanges()` | `performChanges needs { creationRequestForAssetFromImage: image }, got undefined` |
| `performChanges({})` | `performChanges needs { creationRequestForAssetFromImage: image }` |
| 图片不是 `UIImage` | `creationRequestForAssetFromImage must be a UIImage, got "dot.png"` |
| 对象里有别的键 | `performChanges does not support "deleteAssets" yet; the only supported change is creationRequestForAssetFromImage` |

Promise 被拒绝时得到一个 `Error`，上面多两个字段 `code`（`number`）和 `domain`（`string`），是系统给的错误码和错误域：

| `name` | 什么时候 |
| --- | --- |
| `NotAllowedError` | 用户没同意，或者被系统限制了 |
| `InvalidStateError` | 工程里没写 `NSPhotoLibraryAddUsageDescription` |
| `PhotosError` | 别的失败，比如存储空间不够。具体原因看 `message` 和 `code` |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[PHPickerConfiguration alloc] init]` | `new PHPickerConfiguration()` |
| `config.selectionLimit = 3` | `config.selectionLimit = 3` |
| `config.filter = PHPickerFilter.imagesFilter` | `config.filter = PHPickerFilter.imagesFilter` |
| `[PHPickerFilter anyFilterMatchingSubfilters:@[a, b]]` | `PHPickerFilter.anyFilterMatchingSubfilters([a, b])` |
| `config.selection = PHPickerConfigurationSelectionOrdered` | `config.selection = 'ordered'` |
| `[[PHPickerViewController alloc] initWithConfiguration:config]` | `new PHPickerViewController(config)` |
| `picker.delegate = self` 加上实现 `picker:didFinishPicking:` | `picker.addEventListener('pick', (e) => { e.results })` |
| `result.itemProvider` | `result.itemProvider` |
| `[provider canLoadObjectOfClass:UIImage.class]` | `provider.canLoadObjectOfClass(UIImage)` |
| `[provider loadObjectOfClass:UIImage.class completionHandler:^(id image, NSError *error) { … }]` | `await provider.loadObjectOfClass(UIImage)` |
| `[[NSItemProvider alloc] initWithObject:image]` | `new NSItemProvider(image)` |
| `PHPhotoLibrary.sharedPhotoLibrary` | `PHPhotoLibrary.sharedPhotoLibrary` |
| `[PHPhotoLibrary authorizationStatusForAccessLevel:PHAccessLevelAddOnly]` | `PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly')` |
| `[PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelAddOnly handler:^(PHAuthorizationStatus status) { … }]` | `await PHPhotoLibrary.requestAuthorizationForAccessLevel('addOnly')` |
| `[library performChanges:^{ [PHAssetChangeRequest creationRequestForAssetFromImage:image]; } completionHandler:^(BOOL success, NSError *error) { … }]` | `await library.performChanges({ creationRequestForAssetFromImage: image })` |

最后一行形状不一样。ObjC 的第一个参数是一段代码，要做的修改写在代码里；JS 这边是一个对象，键是要做的那种修改的名字。原因见[实现原理](../internals/photos.md#performchanges-为什么收一个对象)。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读相册里已有的照片、相簿 | `PHAsset`、`PHAssetCollection`、`PHImageManager`，以及 `PHAccessLevelReadWrite`。要完整的相册权限 |
| 相册变了时得到通知 | `PHPhotoLibraryChangeObserver` |
| 取出选中的视频 | `NSItemProvider` 的 `loadFileRepresentationForTypeIdentifier:completionHandler:` |
| 取出实况照片里会动的那一段 | `PHLivePhoto`、`PHLivePhotoView` |
| 取图片的原始文件数据（不解码成 `UIImage`） | `NSItemProvider` 的 `loadDataRepresentationForTypeIdentifier:completionHandler:` |
| 知道选中的是相册里的哪一张、预先选中几张 | `PHPickerConfiguration` 的 `initWithPhotoLibrary:`、`preselectedAssetIdentifiers`，`PHPickerResult.assetIdentifier` |
| 按播放方式筛选 | `PHPickerFilter` 的 `playbackStyleFilter:` |
| 隐藏选图界面的搜索框等部件、去掉位置信息 | `PHPickerConfiguration` 的 `disabledCapabilities`、`edgesWithoutContentMargins`、`metadataOptions`、`searchText` |
| 选图界面显示着的时候改它 | `PHPickerViewController` 的 `updatePickerUsingConfiguration:`、`deselectAssetsWithIdentifiers:`、`moveAssetWithIdentifier:afterAssetWithIdentifier:`、`scrollToInitialPosition`、`zoomIn`、`zoomOut` |
| 把视频、文件里的图片存进相册，删除和修改照片 | `PHAssetChangeRequest` 的其余方法、`PHAssetCreationRequest` |
| 存进去之后拿到那张新照片 | `PHObjectPlaceholder`。要完整的相册权限才用得上 |
| 用提供者传图片以外的东西 | `NSItemProvider` 的其余成员 |

## 参见

- [`UIViewController`](ui-view-controller.md)：选图界面的父类。弹出、关闭、`dismiss`
- [`UIImage`](ui-image.md)：取出来的图片的类型。显示、解码、缩略图
- [配置 App](../guides/project-config.md)：权限文案写在哪、怎么按语言写
- [系统分享面板](ui-activity-view-controller.md)：让用户自己决定把图片存到哪，不需要权限文案以外的任何东西
- [实现原理：相册](../internals/photos.md)
- [实现原理：能力包](../internals/capabilities.md)
