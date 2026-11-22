// 运行时自己的事件类（能力包的在各自的包里）。一种字段组合是一个类，
// 定义的办法见 core 的 05-events.js。原生发事件时带着类名（NacreEmitEvent… 的
// eventClass），哪个事件是哪个类只在原生那边写一份。
//
// 每个字段是 [类型, 默认值]：类型决定 init 里的值怎么转（见 05-events.js），默认值是
// new 的时候不给 init 用的；原生发出来的事件字段都齐。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { Event, defineEventClass } = ctx;

  // ---- 场景 ----
  defineEventClass('SceneEvent', Event, { scene: ['UIWindowScene?', null] });
  defineEventClass('UIWindowSceneGeometryChangeEvent', Event,
                   { previousInterfaceOrientation: ['string', 'unknown'] });
  defineEventClass('UITraitChangeEvent', Event, { previousTraitCollection: ['UITraitCollection?', null] });
  defineEventClass('UIScreenKeyboardEvent', Event, {
    frame: ['CGRect?', null], previousFrame: ['CGRect?', null], duration: ['number', 0],
  });

  // ---- 控件、手势、滚动、列表、文字 ----
  defineEventClass('UIControlTouchEvent', Event, { location: ['CGPoint?', null], tapCount: ['integer', 0] });
  const UIGestureRecognizerEvent = defineEventClass('UIGestureRecognizerEvent', Event, {
    location: ['CGPoint?', null], numberOfTouches: ['integer', 0],
  });
  defineEventClass('UIPanGestureRecognizerEvent', UIGestureRecognizerEvent, {
    translation: ['CGPoint?', null], velocity: ['CGPoint?', null],
  });
  defineEventClass('UIPinchGestureRecognizerEvent', UIGestureRecognizerEvent, {
    scale: ['number', 1], velocity: ['number', 0],
  });
  defineEventClass('UIRotationGestureRecognizerEvent', UIGestureRecognizerEvent, {
    rotation: ['number', 0], velocity: ['number', 0],
  });
  // 松手时停在哪：系统当场要这个值，监听器可以改（targetContentOffset 可写）
  defineEventClass('UIScrollViewDragEndEvent', Event, {
    velocity: ['CGPoint?', null], targetContentOffset: ['CGPoint?', null],
  }, { writable: ['targetContentOffset'] });
  defineEventClass('UICollectionViewItemEvent', Event, { indexPath: ['NSIndexPath?', null] });
  // 单行和多行输入框共用
  defineEventClass('UITextBeforeInputEvent', Event, {
    range: ['NSRange?', null], replacementString: ['string', ''],
  });
  defineEventClass('UITextViewLinkClickEvent', Event, { url: ['string', ''], range: ['NSRange?', null] });

  // ---- 页面 ----
  defineEventClass('UIViewControllerAppearanceEvent', Event, { animated: ['boolean', false] });
  defineEventClass('UINavigationControllerEvent', Event, { viewController: ['UIViewController?', null] });
  defineEventClass('UITabBarControllerEvent', Event, { viewController: ['UIViewController?', null] });
  defineEventClass('UIActivityViewControllerCompletionEvent', Event, {
    activityType: ['string?', null], completed: ['boolean', false], activityError: ['NSError?', null],
  });

  // ---- 动画 ----
  defineEventClass('CAAnimationEvent', Event, { finished: ['boolean', false] });
  defineEventClass('CADisplayLinkEvent', Event, { frame: ['any', null] });

  // ---- 网页（字段名照 Electron） ----
  defineEventClass('WebContentsWillNavigateEvent', Event, {
    url: ['string', ''], isMainFrame: ['boolean', true], navigationType: ['string', 'other'],
  });
  defineEventClass('WebContentsDidNavigateEvent', Event, {
    url: ['string', ''], httpResponseCode: ['integer', -1],
  });
  defineEventClass('WebContentsDidFailLoadEvent', Event, {
    errorCode: ['integer', 0], errorDescription: ['string', ''], validatedURL: ['string', ''],
    isMainFrame: ['boolean', true],
  });
  defineEventClass('WebContentsIpcMessageEvent', Event, { channel: ['string', ''], args: ['array', () => []] });
  defineEventClass('WebContentsPreloadErrorEvent', Event, { preloadPath: ['string', ''], error: ['any', null] });
  defineEventClass('WebContentsPageTitleUpdatedEvent', Event, { title: ['string', ''] });
  defineEventClass('WebContentsConsoleMessageEvent', Event, {
    level: ['string', 'info'], message: ['string', ''], lineNumber: ['integer', 0], sourceId: ['string', ''],
  });
});
