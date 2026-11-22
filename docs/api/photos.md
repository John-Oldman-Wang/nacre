---
type: reference
native: PHPickerViewController
status: partial
---

# `PHPickerViewController`

**`PHPickerViewController`** 表示系统的选图界面。它从屏幕底部升起来，显示用户相册里的照片和视频；用户选好或者取消之后，它派发 [`pick`](photos/pick-event.md) 事件，把选中的那几项交给 App。

选图界面是一个[页面](ui-view-controller.md)：用页面的 `presentViewController()` 弹出来，用 `dismissViewController()` 关掉。它在系统自己的进程里运行，App 看不到相册，只拿到用户选中的那几项，所以**选图不需要相册权限**，不弹权限提示框。

它属于 `@nacrejs/photos` 这个包。包里的六个类分工如下：

| 类 | 表示什么 |
| --- | --- |
| `PHPickerViewController` | 选图界面，就是这一页 |
| [`PHPickerConfiguration`](ph-picker-configuration.md) | 选图界面的配置：最多选几项、显示哪些类型、选中的方式 |
| [`PHPickerFilter`](ph-picker-filter.md) | 选图界面里显示哪些类型：图片、视频、截屏…… |
| [`PHPickerResult`](ph-picker-result.md) | 用户选中的一项 |
| [`NSItemProvider`](ns-item-provider.md) | 一项内容的提供者，图片从它身上取 |
| [`PHPhotoLibrary`](ph-photo-library.md) | 系统的相册。App 可以往里面存一张新照片 |

选图和存图对权限的要求不一样：

| | 要不要权限 | 原因 |
| --- | --- | --- |
| 选图 | **不要**，不弹权限提示框 | 选图界面在系统自己的进程里运行，App 只拿到用户选中的那几项 |
| 存图 | 要「添加照片」的权限，第一次存时系统弹提示框问用户 | App 在往用户的相册里写东西 |

App 读不到相册里已有的照片。让用户挑照片用选图界面。

对象的创建、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air）的验收里验过。选图界面弹出来之后的效果、权限提示框、存图的结果要有人操作，目前**未在模拟器验证**，各成员页在涉及的地方逐处标出。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `PHPickerViewController`

怎么选图、取图、存图，见指南[从相册选图、把图存进相册](../guides/pick-photos.md)。

## 要先安装

相册不在核心里，要先装 `@nacrejs/photos` 这个包才有。没装的时候全局上没有 `PHPickerViewController`、`PHPhotoLibrary` 这些类，读这些名字抛 `ReferenceError`，类型检查也报找不到名字。

**1. 装包。**

```bash
npm install @nacrejs/photos
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacrePhotos.framework`。不装的项目，产物里没有它。

**2. 让类型进来。** 在入口文件顶上加一行：

```
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/photos" />
```

**效果**：编辑器里这六个类有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'PHPickerViewController'`。

**3. 写存图的权限文案。** 在项目的 `nacre.config.json` 里写一句话。系统问用户「是否允许这个 App 添加照片」时，提示框里显示的就是它：

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

**效果**：生成工程时这句话被写进 App 的配置。没写的话生成停下来并报错：

```
nacre: @nacrejs/photos needs NSPhotoLibraryAddUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

只用选图、不存图的 App 也要写这一句：App Store 审核上传的包时检查的是包里有没有相册的功能，不看代码有没有用到。文案按语言写的方法见[配置 App](../guides/project-config.md#写权限文案)。

## 构造函数

[`PHPickerViewController()`](photos/constructor.md)

用一份 [`PHPickerConfiguration`](ph-picker-configuration.md) 创建一个选图界面。建出来不弹出任何东西。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性，比如 `view`、`presentingViewController`、`modalPresentationStyle`。

| 属性 | 说明 |
| --- | --- |
| [`configuration`](photos/configuration.md) <small>只读</small> | 构造时复制的那一份配置 |

## 实例方法

没有自己的方法。弹出和关闭用继承自 [`UIViewController`](ui-view-controller.md) 的 `presentViewController()` 和 `dismissViewController()`。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`pick`](photos/pick-event.md) | 用户选好了，或者点了取消 |
| [`dismiss`](ui-view-controller/dismiss-event.md)（来自 `UIViewController`） | 选图界面被关掉，包括用户向下拖走 |
| [`appear`](ui-view-controller/appear-event.md) 等（来自 `UIViewController`） | 页面出现、消失 |

## 示例

### 选一张图显示出来

从空白 App 开始：页面上有一个图片视图和一个按钮，点按钮让用户从相册选一张图显示出来。

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
  pickButton.setTitle('选一张图', { forState: ['normal'] });
  pickButton.frame = new CGRect(40, 360, 240, 44);
  page.view.addSubview(pickButton);

  pickButton.addEventListener('click', () => {
    const config = new PHPickerConfiguration();
    config.filter = PHPickerFilter.imagesFilter;

    const picker = new PHPickerViewController(config);
    picker.addEventListener('pick', async (event) => {
      const { results } = event;
      picker.dismissViewController({ animated: true });
      if (results.length === 0) {
        console.log('用户取消了');
        return;
      }
      try {
        imageView.image = await results[0].itemProvider.loadObjectOfClass(UIImage);
      } catch (err) {
        console.log('取不出图片：' + /** @type {Error} */ (err).message);
      }
    });
    page.presentViewController(picker, { animated: true });
  });
});
```

**效果**（**未在模拟器验证**）

- 页面上方有一块灰色的方形区域，下面是蓝色文字的按钮「选一张图」。
- 点按钮，屏幕底部升起系统的选图界面，里面只有图片。没有弹权限提示框。
- 点一张图，选图界面消失，那张图显示在灰色区域里。
- 点选图界面左上角的「取消」，选图界面消失，控制台输出 `用户取消了`。

把图存回相册、一次选多张，见指南[从相册选图、把图存进相册](../guides/pick-photos.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[PHPickerViewController alloc] initWithConfiguration:config]` | `new PHPickerViewController(config)` |
| `picker.configuration` | `picker.configuration` |
| `picker.delegate = self` 加上实现 `picker:didFinishPicking:` | `picker.addEventListener('pick', (e) => { e.results })` |
| `[page presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |

## 参见

- [从相册选图、把图存进相册](../guides/pick-photos.md)：选图、取图、存图的完整做法
- [`UIViewController`](ui-view-controller.md)：选图界面的父类。弹出、关闭、`dismiss`
- [`UIImage`](ui-image.md)：取出来的图片的类型
- [核心和能力包](capabilities.md)：哪些能力要单独装
- [系统分享面板](ui-activity-view-controller.md)：让用户自己决定把图片存到哪
