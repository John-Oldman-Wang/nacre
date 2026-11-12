import { defineConfig } from 'vitepress';

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

const api = (text, file) => ({ text, link: `/api/${file}` });
const internals = (text, file) => ({ text, link: `/internals/${file}` });

export default defineConfig({
  lang: 'zh-CN',
  title: 'Nacre',
  description: 'App 端的 JavaScript 运行时',

  // GitHub Pages 的项目站点挂在 /<仓库名>/ 下
  base: '/nacre/',

  // 每个目录的 README.md 当那个目录的首页，GitHub 上照常能看
  rewrites: {
    'README.md': 'index.md',
    'api/README.md': 'api/index.md',
    'internals/README.md': 'internals/index.md',
  },

  markdown: {
    anchor: { slugify },
    toc: { slugify },
    headers: { slugify },
    config: readmeLinksToIndex,
  },

  themeConfig: {
    nav: [
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
      { text: '实现原理', link: '/internals/', activeMatch: '^/internals/' },
      { text: '项目说明', link: '/project' },
    ],

    sidebar: {
      '/api/': [
        {
          text: '开始',
          items: [
            api('总览', ''),
            api('运行时怎么工作', 'how-it-works'),
            api('application', 'application'),
            api('原生类', 'native-classes'),
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
          ],
        },
        {
          text: '视图和布局',
          items: [
            api('UIView', 'ui-view'),
            api('Auto Layout', 'auto-layout'),
            api('UIStackView', 'ui-stack-view'),
            api('UIScrollView', 'ui-scroll-view'),
          ],
        },
        {
          text: '文字、图片、颜色',
          items: [
            api('UILabel', 'ui-label'),
            api('UIFont', 'ui-font'),
            api('UIImage / UIImageView', 'ui-image'),
            api('颜色', 'ui-color'),
          ],
        },
        {
          text: '控件和手势',
          items: [
            api('UIControl', 'ui-control'),
            api('UIButton', 'ui-button'),
            api('输入框和键盘', 'ui-text-field'),
            api('手势识别器', 'ui-gesture-recognizer'),
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
            api('定时器', 'timers'),
            api('performance', 'performance'),
          ],
        },
        {
          text: '存储',
          items: [
            api('本地存储', 'storage'),
            api('文件读写', 'filesystem'),
            api('Keychain', 'keychain'),
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
          ],
        },
        {
          text: '值的表示',
          items: [
            internals('结构体', 'structs'),
            internals('枚举和位掩码', 'enums'),
            internals('颜色', 'ui-color'),
            internals('图片', 'ui-image'),
          ],
        },
        {
          text: '界面',
          items: [
            internals('Auto Layout', 'auto-layout'),
            internals('滚动', 'scrolling'),
            internals('导航', 'navigation'),
            internals('输入框', 'text-input'),
            internals('图层', 'ca-layer'),
            internals('动画', 'ca-animation'),
          ],
        },
        {
          text: '网络和存储',
          items: [
            internals('网络', 'network'),
            internals('本地存储', 'storage'),
            internals('文件读写', 'filesystem'),
            internals('Keychain', 'keychain'),
          ],
        },
        {
          text: '系统能力',
          items: [
            internals('设备、剪贴板、触感反馈', 'system'),
            internals('随机数', 'crypto'),
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
