import { defineConfig } from 'vitepress';
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
const api = (text, file) => ({ text, link: `/api/${file}` });
const internals = (text, file) => ({ text, link: `/internals/${file}` });

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

  // 工作记录，不发布
  srcExclude: ['findings.md'],

  rewrites: {
    'README.md': 'index.md',
    'guides/README.md': 'guides/index.md',
    'api/README.md': 'api/index.md',
    'internals/README.md': 'internals/index.md',
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
      { text: '实现原理', link: '/internals/', activeMatch: '^/internals/' },
      { text: '项目说明', link: '/project' },
    ],

    sidebar: {
      '/guides/': [
        {
          text: '指南',
          items: [
            guide('总览', ''),
            guide('建一个自己的 App', 'your-own-app'),
            guide('配置 App：名字、语言、权限文案', 'project-config'),
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
            api('application', 'application'),
            api('原生模块', 'native-modules'),
            api('原生类', 'native-classes'),
            api('补上的成员（清单）', 'view-additions'),
            api('取色控件（清单）', 'system-controls'),
            api('单位', 'units'),
            api('结构体', 'structs'),
            api('枚举', 'enums'),
          ],
        },
        {
          text: '窗口和页面',
          items: [
            api('UIWindowScene', 'ui-window-scene'),
            api('UIWindow', 'ui-window'),
            api('UIViewController', 'ui-view-controller'),
            api('UINavigationController', 'ui-navigation-controller'),
            api('UITabBarController', 'ui-tab-bar-controller'),
            api('导航条上的东西', 'ui-bar-button-item'),
            api('系统弹窗', 'ui-alert-controller'),
            api('系统分享面板', 'ui-activity-view-controller'),
          ],
        },
        {
          text: '视图和布局',
          items: [
            api('UIView', 'ui-view'),
            api('Auto Layout', 'auto-layout'),
            api('UIStackView', 'ui-stack-view'),
            api('UIScrollView', 'ui-scroll-view'),
            api('UIActivityIndicatorView', 'ui-activity-indicator-view'),
            api('UIProgressView', 'ui-progress-view'),
            api('毛玻璃（UIVisualEffectView）', 'ui-visual-effect-view'),
            api('UIToolbar', 'ui-toolbar'),
            api('UISearchBar', 'ui-search-bar'),
          ],
        },
        {
          text: '文字、图片、颜色',
          items: [
            api('UILabel', 'ui-label'),
            api('UIFont', 'ui-font'),
            api('UIImage / UIImageView', 'ui-image'),
            api('颜色', 'ui-color'),
            api('外观特征（深浅色）', 'ui-trait-collection'),
          ],
        },
        {
          text: '控件和手势',
          items: [
            api('UIControl', 'ui-control'),
            api('UIButton', 'ui-button'),
            api('输入框和键盘', 'ui-text-field'),
            api('多行输入（UITextView）', 'ui-text-view'),
            api('列表（UICollectionView）', 'ui-collection-view'),
            api('富文本（NSAttributedString）', 'ns-attributed-string'),
            api('手势识别器', 'ui-gesture-recognizer'),
            api('UISwitch', 'ui-switch'),
            api('UISlider', 'ui-slider'),
            api('UIStepper', 'ui-stepper'),
            api('UISegmentedControl', 'ui-segmented-control'),
            api('UIPageControl', 'ui-page-control'),
            api('UIDatePicker', 'ui-date-picker'),
          ],
        },
        {
          text: '图层和动画',
          items: [
            api('CALayer', 'ca-layer'),
            api('UIBezierPath', 'ui-bezier-path'),
            api('动画', 'ca-animation'),
          ],
        },
        {
          text: '网络和时间',
          items: [
            api('fetch', 'fetch'),
            api('URL / Headers', 'url'),
            api('WebSocket', 'websocket'),
            api('WebView（网页）', 'web-view'),
            api('session（网页的 cookie 和数据）', 'session'),
            api('定时器', 'timers'),
            api('performance', 'performance'),
            api('文字、字节和深拷贝', 'web-globals'),
            api('Intl（按地区格式化）', 'intl'),
            api('Intl.DateTimeFormat（日期）', 'intl-date'),
          ],
        },
        {
          text: '存储',
          items: [
            api('本地存储', 'storage'),
            api('文件读写', 'filesystem'),
          ],
        },
        {
          text: '系统能力',
          items: [
            api('UIDevice', 'ui-device'),
            api('UIPasteboard', 'ui-pasteboard'),
            api('触感反馈', 'ui-feedback-generator'),
            api('crypto', 'crypto'),
          ],
        },
        {
          text: '能力包（要单独安装）',
          items: [
            api('Keychain', 'keychain'),
            api('LAContext（面容 ID）', 'la-context'),
            api('定位（CLLocationManager）', 'cl-location-manager'),
            api('通知（UNUserNotificationCenter）', 'un-user-notification-center'),
            api('拍照（UIImagePickerController）', 'ui-image-picker-controller'),
            api('相册', 'photos'),
            api('通讯录选择器', 'contacts'),
            api('跟踪授权和广告标识', 'app-tracking-transparency'),
          ],
        },
      ],
      '/internals/': [
        {
          text: '运行时',
          items: [
            internals('总览', ''),
            internals('运行时', 'runtime'),
            internals('桥的通道', 'bridge'),
            internals('参数转换', 'conversion'),
            internals('包装机制', 'wrapper'),
            internals('事件模型', 'events'),
            internals('定时器', 'timers'),
            internals('Intl', 'intl'),
            internals('Web 标准的五个全局', 'web-globals'),
            internals('隐私清单', 'privacy-manifest'),
            internals('验收怎么判通过', 'acceptance'),
            internals('交付物、工程和类型检查', 'delivery'),
            internals('还没做的设计和没解的问题', 'pending'),
            internals('能力包', 'capabilities'),
            internals('接入一组类', 'adding-classes'),
            internals('bindgen', 'bindgen'),
            internals('原生模块', 'native-modules'),
          ],
        },
        {
          text: '值的表示',
          items: [
            internals('结构体', 'structs'),
            internals('枚举和位掩码', 'enums'),
            internals('颜色', 'ui-color'),
            internals('图片', 'ui-image'),
            internals('动图', 'animated-image'),
          ],
        },
        {
          text: '界面',
          items: [
            internals('Auto Layout', 'auto-layout'),
            internals('滚动', 'scrolling'),
            internals('导航', 'navigation'),
            internals('系统弹窗和分享面板', 'alerts'),
            internals('外观特征', 'traits'),
            internals('毛玻璃', 'effects'),
            internals('输入框', 'text-input'),
            internals('多行输入', 'text-view'),
            internals('列表', 'collection-view'),
            internals('富文本', 'attributed-string'),
            internals('页面的出现和消失', 'appearance'),
            internals('被链接打开', 'open-url'),
            internals('图层', 'ca-layer'),
            internals('动画', 'ca-animation'),
            internals('数值控件', 'value-controls'),
            internals('转圈和进度条', 'indicators'),
            internals('工具条和搜索框', 'bars'),
          ],
        },
        {
          text: '网络和存储',
          items: [
            internals('网络', 'network'),
            internals('WebView', 'web-view'),
            internals('本地存储', 'storage'),
            internals('文件读写', 'filesystem'),
            internals('Keychain', 'keychain'),
          ],
        },
        {
          text: '系统能力',
          items: [
            internals('设备、剪贴板、触感反馈', 'system'),
            internals('跟踪授权和广告标识', 'app-tracking-transparency'),
            internals('随机数', 'crypto'),
            internals('面容 ID 认证', 'local-authentication'),
            internals('拍照', 'camera'),
            internals('相册', 'photos'),
            internals('通讯录选择器', 'contacts'),
            internals('定位', 'core-location'),
            internals('通知', 'user-notifications'),
          ],
        },
      ],
      '/': [
        {
          text: '项目',
          items: [
            { text: '文档首页', link: '/' },
            { text: '项目说明', link: '/project' },
            { text: '文档写法', link: '/writing-guide' },
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
