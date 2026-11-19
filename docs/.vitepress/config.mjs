import { defineConfig } from 'vitepress';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { codeLight, codeDark } from './code-themes.mjs';

// 标题 → 锚点。和 docs/check-links.sh 是同一套规则，三边（网站、GitHub、
// 链接检查脚本）必须一致，否则文档里那三百多处 #锚点 链接会悄悄失效。
//
// VitePress 默认的规则会把标点换成连字符（「键盘避让：一条约束」→
// 「键盘避让-一条约束」），而文档里写的是去掉标点的形式。
function slugify(title) {
  return title
    .replace(/`|\*\*|\*|\[|\]|\(.*?\)/g, '')
    .replace(/[^\p{L}\p{N}_\s-]/gu, '')
    .trim()
    .toLowerCase()
    .replace(/ /g, '-');
}

// 文档里写的是 [..](README.md)，这样在 GitHub 上能点。站点上 README.md 被
// 改写成了目录首页，所以链接也要跟着改，否则会指向不存在的 README.html。
function readmeLinksToIndex(md) {
  const fix = (tokens) => {
    for (const token of tokens) {
      if (token.type === 'link_open') {
        const href = token.attrGet('href');
        if (href && !/^[a-z]+:/i.test(href)) {
          token.attrSet('href', href.replace(/(^|\/)README\.md(?=$|#)/, '$1index.md'));
        }
      }
      if (token.children) fix(token.children);
    }
  };
  md.core.ruler.push('readme_links_to_index', (state) => fix(state.tokens));
}

const guide = (text, file) => ({ text, link: `/guides/${file}` });
// 类页（api/ui-button.md）旁边有同名目录（api/ui-button/）的，目录里是它的成员页。
// 侧边栏把它们收成这个类下面一组可以展开的条目，顺序就是类页里链接出现的
// 顺序，名字取成员页的标题。这样加一个成员只要写成员页、在类页上链一下。
const apiDir = fileURLToPath(new URL('../api/', import.meta.url));

function memberName(file) {
  const h1 = readFileSync(file, 'utf8').match(/^# (.+)$/m);
  if (!h1) return null;
  const spans = [...h1[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (spans.length === 0) return h1[1];
  let name = spans[spans.length - 1];
  const dot = name.indexOf('.');
  if (spans.length === 1 && dot > 0 && !h1[1].includes('构造函数')) name = name.slice(dot + 1);
  return h1[1].trim().endsWith('事件') ? `${name} 事件` : name;
}

function members(file) {
  if (!existsSync(`${apiDir}${file}`)) return null;
  const page = readFileSync(`${apiDir}${file}.md`, 'utf8');
  const seen = new Set();
  const items = [];
  for (const m of page.matchAll(new RegExp(`\\]\\(${file}/([a-z0-9-]+)\\.md`, 'g'))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const path = `${apiDir}${file}/${m[1]}.md`;
    if (!existsSync(path)) continue;
    items.push({ text: memberName(path) ?? m[1], link: `/api/${file}/${m[1]}` });
  }
  return items.length ? items : null;
}

const api = (text, file) => {
  const items = file ? members(file) : null;
  return items ? { text, link: `/api/${file}`, collapsed: true, items } : { text, link: `/api/${file}` };
};

export default defineConfig({
  lang: 'zh-CN',
  title: 'Nacre',
  description: 'App 端的 JavaScript 运行时',

  // GitHub Pages 的项目站点挂在 /<仓库名>/ 下
  base: '/nacre/',

  // 每个目录的 README.md 当那个目录的首页，GitHub 上照常能看
  // 指南里有几处链接指向文档目录之外的仓库文件（比如 packages/ios/ 的说明）。
  // 它们在 GitHub 上点得开，在站点上没有对应页面，构建时不当成死链。
  ignoreDeadLinks: [/\/packages\//],

  // 站上只放 API 和指南。实现原理、项目说明、写法规范是我们自己的，留在仓库里
  // 不发布；docs/README.md 是仓库里的文档目录，站点首页是 docs/index.md
  srcExclude: ['README.md', 'findings.md', 'project.md', 'writing-guide.md', 'internals/**'],

  rewrites: {
    'guides/README.md': 'guides/index.md',
    'api/README.md': 'api/index.md',
  },

  markdown: {
    anchor: { slugify },
    toc: { slugify },
    headers: { slugify },
    config: readmeLinksToIndex,
    // 代码块的配色，浅色和深色各一套
    theme: { light: codeLight, dark: codeDark },
  },

  themeConfig: {
    nav: [
      { text: '指南', link: '/guides/', activeMatch: '^/guides/' },
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
    ],

    sidebar: {
      '/guides/': [
        {
          text: '开始',
          items: [
            guide('总览', ''),
            guide('建一个自己的 App', 'your-own-app'),
            guide('配置 App：名字、语言、权限文案', 'project-config'),
          ],
        },
        {
          text: 'App 和页面',
          items: [
            guide('建窗口和处理场景', 'scenes-and-windows'),
            guide('处理 App 的生命周期', 'app-lifecycle'),
            guide('统一处理错误', 'handle-errors'),
            guide('处理打开 App 的链接', 'open-links'),
            guide('做一个页面', 'pages'),
            guide('在页面之间跳转', 'navigation'),
            guide('弹出一个模态页', 'modal-pages'),
            guide('做一组底部标签', 'tabs'),
            guide('在导航条上放按钮和标题', 'bar-buttons'),
            guide('弹出提示框和菜单', 'alerts'),
            guide('分享内容', 'share'),
          ],
        },
        {
          text: '视图和布局',
          items: [
            guide('在屏幕上摆放视图', 'views'),
            guide('用约束排版', 'auto-layout'),
            guide('把视图排成一行或一列', 'stack-views'),
            guide('做一个能滚动的页面', 'scrolling'),
            guide('做一个列表', 'lists'),
            guide('做模糊和玻璃效果', 'blur-and-glass'),
            guide('显示加载和进度', 'loading-and-progress'),
            guide('做一个工具条', 'toolbars'),
          ],
        },
        {
          text: '文字、图片、颜色',
          items: [
            guide('显示文字', 'labels'),
            guide('设置字体', 'fonts'),
            guide('显示带样式的文字', 'attributed-text'),
            guide('显示图片', 'images'),
            guide('设置颜色', 'colors'),
            guide('适配深色模式', 'dark-mode'),
          ],
        },
        {
          text: '控件、输入和手势',
          items: [
            guide('做一个按钮', 'buttons'),
            guide('处理控件的触摸', 'control-touches'),
            guide('做开关、滑块和步进器', 'switches-sliders-steppers'),
            guide('做分段选择和页码', 'segmented-and-page-controls'),
            guide('让用户选日期和时间', 'date-pickers'),
            guide('做一个输入框', 'text-fields'),
            guide('做一个多行输入框', 'multiline-text'),
            guide('做一个搜索框', 'search'),
            guide('响应手势', 'gestures'),
          ],
        },
        {
          text: '图层和动画',
          items: [
            guide('用图层画圆角、阴影、渐变和形状', 'layers'),
            guide('画一条路径', 'drawing-paths'),
            guide('让视图动起来', 'view-animations'),
            guide('做动画', 'animation'),
            guide('每一帧执行一次代码', 'frame-callback'),
          ],
        },
        {
          text: '网络和网页',
          items: [
            guide('从网络取数据', 'fetch'),
            guide('边下载边读响应', 'streaming-response'),
            guide('拼接和解析网址', 'urls'),
            guide('用 WebSocket 收发消息', 'websocket'),
            guide('显示网页', 'web-pages'),
            guide('让网页和 App 互发消息', 'web-page-messaging'),
            guide('管理网页的登录状态', 'web-login'),
          ],
        },
        {
          text: '数据和工具',
          items: [
            guide('保存用户设置', 'save-settings'),
            guide('读写文件', 'files'),
            guide('保存登录令牌', 'save-secrets'),
            guide('延迟和重复执行代码', 'timers'),
            guide('量一段代码花了多久', 'measure-time'),
            guide('生成随机数和唯一编号', 'random'),
            guide('在文字和字节之间转换', 'text-and-bytes'),
            guide('按地区显示数字和金额', 'format-numbers'),
            guide('按地区显示日期和时间', 'format-dates'),
          ],
        },
        {
          text: '系统能力',
          items: [
            guide('读设备和系统的信息', 'device-info'),
            guide('复制和粘贴文字', 'clipboard'),
            guide('让手机震一下', 'haptics'),
            guide('用面容 ID 确认身份', 'face-id'),
            guide('取用户的位置', 'get-location'),
            guide('发本地通知', 'local-notifications'),
            guide('拍一张照片', 'take-photo'),
            guide('从相册选图、把图存进相册', 'pick-photos'),
            guide('让用户选联系人', 'pick-contact'),
            guide('申请跟踪授权', 'tracking-authorization'),
          ],
        },
        {
          text: '原生模块',
          items: [
            guide('从 JS 调原生模块', 'call-native-modules'),
            guide('写自己的原生模块', 'native-modules'),
          ],
        },
      ],
      '/api/': [
        {
          text: '开始',
          items: [
            api('总览', ''),
            api('运行时怎么工作', 'how-it-works'),
            api('核心和能力包', 'capabilities'),
            api('原生类', 'native-classes'),
            api('单位', 'units'),
            api('结构体', 'structs'),
            api('枚举', 'enums'),
          ],
        },
        {
          text: 'App 和事件',
          items: [
            api('Application', 'application'),
            api('EventTarget', 'event-target'),
            api('Event', 'event'),
            api('ErrorEvent', 'error-event'),
            api('PromiseRejectionEvent', 'promise-rejection-event'),
            api('OpenURLEvent', 'open-url-event'),
            api('application.nativeModules', 'native-modules'),
            api('NativeModule', 'native-module'),
          ],
        },
        {
          text: '窗口和页面',
          items: [
            api('UIWindowScene', 'ui-window-scene'),
            api('UIWindowSceneGeometry', 'ui-window-scene-geometry'),
            api('UIWindowSceneGeometryPreferencesIOS', 'ui-window-scene-geometry-preferences-ios'),
            api('UIStatusBarManager', 'ui-status-bar-manager'),
            api('UISceneSession', 'ui-scene-session'),
            api('UIWindow', 'ui-window'),
            api('UIViewController', 'ui-view-controller'),
            api('UINavigationController', 'ui-navigation-controller'),
            api('UINavigationItem', 'ui-navigation-item'),
            api('UIBarItem', 'ui-bar-item'),
            api('UIBarButtonItem', 'ui-bar-button-item'),
            api('UITabBarController', 'ui-tab-bar-controller'),
            api('UITabBar', 'ui-tab-bar'),
            api('UITabBarItem', 'ui-tab-bar-item'),
            api('UIAlertController', 'ui-alert-controller'),
            api('UIAlertAction', 'ui-alert-action'),
            api('UIActivityViewController', 'ui-activity-view-controller'),
          ],
        },
        {
          text: '视图和布局',
          items: [
            api('UIView', 'ui-view'),
            api('NSLayoutConstraint', 'auto-layout'),
            api('NSLayoutAnchor', 'ns-layout-anchor'),
            api('NSLayoutXAxisAnchor', 'ns-layout-x-axis-anchor'),
            api('NSLayoutYAxisAnchor', 'ns-layout-y-axis-anchor'),
            api('NSLayoutDimension', 'ns-layout-dimension'),
            api('UILayoutGuide', 'ui-layout-guide'),
            api('UIKeyboardLayoutGuide', 'ui-keyboard-layout-guide'),
            api('UIStackView', 'ui-stack-view'),
            api('UIScrollView', 'ui-scroll-view'),
            api('UIVisualEffectView', 'ui-visual-effect-view'),
            api('UIVisualEffect', 'ui-visual-effect'),
            api('UIBlurEffect', 'ui-blur-effect'),
            api('UIVibrancyEffect', 'ui-vibrancy-effect'),
            api('UIGlassEffect', 'ui-glass-effect'),
            api('UIGlassContainerEffect', 'ui-glass-container-effect'),
            api('UIActivityIndicatorView', 'ui-activity-indicator-view'),
            api('UIProgressView', 'ui-progress-view'),
            api('UIToolbar', 'ui-toolbar'),
          ],
        },
        {
          text: '结构体',
          items: [
            api('CGPoint', 'cg-point'),
            api('CGSize', 'cg-size'),
            api('CGRect', 'cg-rect'),
            api('UIEdgeInsets', 'ui-edge-insets'),
            api('NSDirectionalEdgeInsets', 'ns-directional-edge-insets'),
            api('CGAffineTransform', 'cg-affine-transform'),
            api('CAFrameRateRange', 'ca-frame-rate-range'),
            api('NSRange', 'ns-range'),
          ],
        },
        {
          text: '列表',
          items: [
            api('UICollectionView', 'ui-collection-view'),
            api('UICollectionViewDiffableDataSource', 'ui-collection-view-diffable-data-source'),
            api('NSDiffableDataSourceSnapshot', 'ns-diffable-data-source-snapshot'),
            api('NSIndexPath', 'ns-index-path'),
            api('UICollectionViewLayout', 'ui-collection-view-layout'),
            api('UICollectionViewCompositionalLayout', 'ui-collection-view-compositional-layout'),
            api('UICollectionLayoutListConfiguration', 'ui-collection-layout-list-configuration'),
            api('UICollectionReusableView', 'ui-collection-reusable-view'),
            api('UICollectionViewCell', 'ui-collection-view-cell'),
            api('UICollectionViewListCell', 'ui-collection-view-list-cell'),
            api('UIListContentConfiguration', 'ui-list-content-configuration'),
          ],
        },
        {
          text: '文字、图片、颜色',
          items: [
            api('UILabel', 'ui-label'),
            api('UIFont', 'ui-font'),
            api('UIImage', 'ui-image'),
            api('UIImageView', 'ui-image-view'),
            api('UIColor', 'ui-color'),
            api('UITraitCollection', 'ui-trait-collection'),
            api('NSAttributedString', 'ns-attributed-string'),
            api('NSMutableAttributedString', 'ns-mutable-attributed-string'),
            api('NSParagraphStyle', 'ns-paragraph-style'),
            api('NSMutableParagraphStyle', 'ns-mutable-paragraph-style'),
            api('NSShadow', 'ns-shadow'),
            api('NSTextAttachment', 'ns-text-attachment'),
          ],
        },
        {
          text: '控件和输入',
          items: [
            api('UIControl', 'ui-control'),
            api('UIButton', 'ui-button'),
            api('UISwitch', 'ui-switch'),
            api('UISlider', 'ui-slider'),
            api('UIStepper', 'ui-stepper'),
            api('UISegmentedControl', 'ui-segmented-control'),
            api('UIPageControl', 'ui-page-control'),
            api('UIDatePicker', 'ui-date-picker'),
            api('UIColorWell', 'system-controls'),
            api('UITextField', 'ui-text-field'),
            api('UITextView', 'ui-text-view'),
            api('NSTextContainer', 'ns-text-container'),
            api('UISearchBar', 'ui-search-bar'),
          ],
        },
        {
          text: '手势',
          items: [
            api('UIGestureRecognizer', 'ui-gesture-recognizer'),
            api('UITapGestureRecognizer', 'ui-tap-gesture-recognizer'),
            api('UILongPressGestureRecognizer', 'ui-long-press-gesture-recognizer'),
            api('UIPanGestureRecognizer', 'ui-pan-gesture-recognizer'),
            api('UIPinchGestureRecognizer', 'ui-pinch-gesture-recognizer'),
            api('UIRotationGestureRecognizer', 'ui-rotation-gesture-recognizer'),
            api('UISwipeGestureRecognizer', 'ui-swipe-gesture-recognizer'),
            api('UIScreenEdgePanGestureRecognizer', 'ui-screen-edge-pan-gesture-recognizer'),
          ],
        },
        {
          text: '图层和动画',
          items: [
            api('CALayer', 'ca-layer'),
            api('CAGradientLayer', 'ca-gradient-layer'),
            api('CAShapeLayer', 'ca-shape-layer'),
            api('UIBezierPath', 'ui-bezier-path'),
            api('CAAnimation', 'ca-animation'),
            api('CAPropertyAnimation', 'ca-property-animation'),
            api('CABasicAnimation', 'ca-basic-animation'),
            api('CAKeyframeAnimation', 'ca-keyframe-animation'),
            api('CASpringAnimation', 'ca-spring-animation'),
            api('CAAnimationGroup', 'ca-animation-group'),
            api('CAMediaTimingFunction', 'ca-media-timing-function'),
            api('CATransaction', 'ca-transaction'),
            api('CADisplayLink', 'ca-display-link'),
            api('NSRunLoop', 'ns-run-loop'),
          ],
        },
        {
          text: '网络',
          items: [
            api('fetch()', 'fetch'),
            api('Request', 'request'),
            api('Response', 'response'),
            api('Headers', 'headers'),
            api('Blob', 'blob'),
            api('ReadableStream', 'readable-stream'),
            api('ReadableStreamDefaultReader', 'readable-stream-default-reader'),
            api('AbortController', 'abort-controller'),
            api('AbortSignal', 'abort-signal'),
            api('URL', 'url'),
            api('URLSearchParams', 'url-search-params'),
            api('WebSocket', 'websocket'),
          ],
        },
        {
          text: '网页',
          items: [
            api('WebView', 'web-view'),
            api('WebContents', 'web-contents'),
            api('NavigationHistory', 'navigation-history'),
            api('WebContentsIPC', 'web-contents-ipc'),
            api('ipcRenderer', 'ipc-renderer'),
            api('contextBridge', 'context-bridge'),
            api('Session', 'session'),
            api('Cookies', 'cookies'),
            api('Cookie', 'cookie'),
          ],
        },
        {
          text: '运行时的全局',
          items: [
            api('定时器', 'timers'),
            api('performance', 'performance'),
            api('Intl.NumberFormat', 'intl'),
            api('Intl.DateTimeFormat', 'intl-date'),
            api('NSLocale', 'ns-locale'),
            api('crypto', 'crypto'),
            api('TextEncoder', 'text-encoder'),
            api('TextDecoder', 'text-decoder'),
            api('atob、btoa、structuredClone', 'web-globals'),
          ],
        },
        {
          text: '存储',
          items: [
            api('application.storage', 'storage'),
            api('application.fileSystem', 'filesystem'),
            api('NSBundle', 'ns-bundle'),
          ],
        },
        {
          text: '系统能力',
          items: [
            api('UIDevice', 'ui-device'),
            api('UIScreen', 'ui-screen'),
            api('UIScreenMode', 'ui-screen-mode'),
            api('UIPasteboard', 'ui-pasteboard'),
            api('UIFeedbackGenerator', 'ui-feedback-generator'),
            api('UIImpactFeedbackGenerator', 'ui-impact-feedback-generator'),
            api('UISelectionFeedbackGenerator', 'ui-selection-feedback-generator'),
            api('UINotificationFeedbackGenerator', 'ui-notification-feedback-generator'),
          ],
        },
        {
          text: '能力包（要单独安装）',
          items: [
            api('application.keychain', 'keychain'),
            api('LAContext', 'la-context'),
            api('CLLocationManager', 'cl-location-manager'),
            api('CLLocation', 'cl-location'),
            api('CLLocationCoordinate2D', 'cl-location-coordinate-2d'),
            api('CLLocationError', 'cl-location-error'),
            api('UNUserNotificationCenter', 'un-user-notification-center'),
            api('UNNotificationRequest', 'un-notification-request'),
            api('UNNotificationContent', 'un-notification-content'),
            api('UNMutableNotificationContent', 'un-mutable-notification-content'),
            api('UNNotificationSound', 'un-notification-sound'),
            api('UNNotificationTrigger', 'un-notification-trigger'),
            api('UNTimeIntervalNotificationTrigger', 'un-time-interval-notification-trigger'),
            api('UNCalendarNotificationTrigger', 'un-calendar-notification-trigger'),
            api('UNPushNotificationTrigger', 'un-push-notification-trigger'),
            api('UNNotification', 'un-notification'),
            api('UNNotificationResponse', 'un-notification-response'),
            api('UNNotificationSettings', 'un-notification-settings'),
            api('UIImagePickerController', 'ui-image-picker-controller'),
            api('PHPickerViewController', 'photos'),
            api('PHPickerConfiguration', 'ph-picker-configuration'),
            api('PHPickerFilter', 'ph-picker-filter'),
            api('PHPickerResult', 'ph-picker-result'),
            api('NSItemProvider', 'ns-item-provider'),
            api('PHPhotoLibrary', 'ph-photo-library'),
            api('CNContactPickerViewController', 'contacts'),
            api('CNContact', 'cn-contact'),
            api('CNLabeledValue', 'cn-labeled-value'),
            api('CNPhoneNumber', 'cn-phone-number'),
            api('CNContactProperty', 'cn-contact-property'),
            api('CNContactFormatter', 'cn-contact-formatter'),
            api('ATTrackingManager', 'app-tracking-transparency'),
            api('ASIdentifierManager', 'as-identifier-manager'),
          ],
        },
      ],
    },

    // 文档普遍很长，右侧的本页目录显示到三级标题
    outline: { level: [2, 3], label: '本页目录' },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色',
    darkModeSwitchTitle: '切换到深色',
  },
});
