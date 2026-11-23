// 首页的文案，中英两份。键一一对应，改一边就改另一边。
// 首页是组件拼的，check-translation.py 核对不到这里，靠这个文件自己对齐。

export default {
  en: {
    hero: {
      title1: 'Write native apps',
      title2: 'in ',
      titleSheen: 'JavaScript',
      lead: 'Call the platform’s native classes straight from JavaScript. Every view on screen is a real native view.',
      primary: 'Get started',
      secondary: 'API reference',
    },
    demo: {
      eyebrow: 'How it feels',
      title: 'Write JS. See native.',
      sub: 'Each line on the left becomes a real native view on the right.',
      captions: {
        page: 'The page background is a system color. It turns dark in dark mode.',
        label: 'A label is a real native text view.',
        button: 'The pressed look of the button comes from the system.',
        tap: 'A tap is an event, delivered to your listener in JS.',
      },
      replay: 'Replay',
    },
    pillars: {
      eyebrow: 'Why Nacre',
      title: 'Nothing new to learn twice',
      sub: 'Native capabilities, with the JavaScript you already write.',
      items: [
        { tag: '01 · native', title: 'Native classes, directly', text: 'Native classes keep their own names, so the platform’s own docs still apply. No wrapper components in between.' },
        { tag: '02 · web', title: 'The web APIs you know', text: 'fetch, URL, WebSocket, TextEncoder, Intl, console. The same APIs you use in the browser.' },
        { tag: '03 · types', title: 'Typed end to end', text: 'Every class, property, and event comes with TypeScript types. Autocomplete in the editor, typos caught before you run.' },
      ],
    },
    runtime: {
      eyebrow: 'Under the hood',
      title: 'One runtime between your code and the platform',
      sub: 'Layer on layer, the way nacre builds a pearl.',
      layers: [['Your JavaScript', 'main.js'], ['Nacre runtime', 'engine · web APIs · bridge'], ['Native UI', 'the platform’s own views']],
      steps: [
        ['Your JavaScript', 'Bundled into the app and run on the device. No server, no web page.'],
        ['Nacre runtime', 'A JavaScript engine, the web APIs, and a bridge to the native classes.'],
        ['The platform’s native UI', 'What appears on screen is the system’s own views, with the system’s own feel.'],
        ['Events come back as JS events', 'Taps, the keyboard, the app lifecycle. You listen with addEventListener.'],
      ],
    },
    caps: {
      eyebrow: 'What you can build',
      title: 'Everything a real app needs',
      sub: 'The core comes with the runtime. Capabilities that need a permission are separate packages: install the ones you use.',
      core: 'Built in',
      coreNote: 'no extra install',
      pkgs: 'Capability packages',
      pkgsNote: 'install only what you use',
    },
    start: {
      eyebrow: 'Get started',
      title: 'Three commands to a running app',
      sub: 'A plain npm project with a src/main.js.',
      steps: [
        ['Install', 'The runtime, the CLI, the types, and a bundler.'],
        ['Generate', 'Creates the native project from your package. Delete it any time and generate it again.'],
        ['Run', 'Bundles your JavaScript and launches the app.'],
      ],
      copy: 'Copy',
      copied: 'Copied',
      guide: 'Read the full walkthrough',
    },
    proof: {
      eyebrow: 'Tested',
      title: 'Checked on a real iPhone before every release',
      sub: 'More than 7,000 assertions, run on a real device in both Debug and Release builds.',
    },
    // 一次实测的结果，写死在这里：iPhone 14、iOS 27.2、Release 包，一个 1000 行的
    // UICollectionView 列表页；内存和滚动卡顿用 Instruments 量。数变了要手动改
    perf: {
      eyebrow: 'Performance',
      title: 'A 1,000-row list on an iPhone 14',
      items: [
        ['19 MB', 'Memory with the list at rest; it stays at 18–20 MB through 30 seconds of scrolling'],
        ['60 fps', 'Scrolling steadily for 30 seconds, with one dropped frame'],
        ['14.8 MB', 'Install size of the whole app, runtime included'],
      ],
      note: 'iPhone 14, iOS 27.2, Release build.',
    },
    stats: ['native classes with a full reference', 'member pages, one per property, method, and event', 'step-by-step guides', 'capability packages, installed only when you need them'],
    end: { title: 'Build your first app', sub: 'Start with one button.' },
    footer: {
      cols: [
        { title: 'Docs', links: [['Get started', '/guides/your-own-app'], ['API reference', '/api/'], ['Guides', '/guides/'], ['Core and packages', '/api/capabilities']] },
        { title: 'Community', links: [['GitHub', 'https://github.com/John-Oldman-Wang/nacre'], ['Ask a question or report a bug', 'https://github.com/John-Oldman-Wang/nacre/issues']] },
        { title: 'Packages', links: [['@nacrejs/ios', 'https://www.npmjs.com/package/@nacrejs/ios'], ['@nacrejs/cli', 'https://www.npmjs.com/package/@nacrejs/cli'], ['@nacrejs/types', 'https://www.npmjs.com/package/@nacrejs/types']] },
        { title: 'Project', links: [['Versions on npm', 'https://www.npmjs.com/package/@nacrejs/ios?activeTab=versions'], ['License', 'https://github.com/John-Oldman-Wang/nacre/blob/main/LICENSE.md']] },
      ],
      note: '© 2026 John-Oldman-Wang · Released under FSL-1.1-MIT',
    },
  },

  zh: {
    hero: {
      title1: '用 JavaScript',
      title2: '写',
      titleSheen: '原生 App',
      lead: '在 JavaScript 里直接调用平台的原生类，屏幕上的每个视图都是真的原生视图。',
      primary: '开始',
      secondary: 'API 参考',
    },
    demo: {
      eyebrow: '写起来是什么样',
      title: '写 JS，出原生。',
      sub: '左边写下的每一句，右边都是一个真的原生视图。',
      captions: {
        page: '页面的背景是系统颜色，深色模式下自动变黑',
        label: '标签是一个真正的原生文字视图',
        button: '按钮按下去的样子是系统给的',
        tap: '点击是一个事件，交给 JS 里的监听器',
      },
      replay: '重新播放',
    },
    pillars: {
      eyebrow: '为什么是 Nacre',
      title: '不用再学一遍',
      sub: '原生的能力，你已经会的写法。',
      items: [
        { tag: '01 · native', title: '直接用原生类', text: '原生类保留自己的名字，平台的官方文档照样能查。中间没有一层封装的组件。' },
        { tag: '02 · web', title: '熟悉的 Web API', text: 'fetch、URL、WebSocket、TextEncoder、Intl、console，和浏览器里用的是同一套。' },
        { tag: '03 · types', title: '从头到尾有类型', text: '每个类、属性、事件都有 TypeScript 类型。编辑器里有补全，写错了运行之前就知道。' },
      ],
    },
    runtime: {
      eyebrow: '底下是什么',
      title: '你的代码和平台之间，只隔一层运行时',
      sub: '一层层叠起来，像珍珠层包出一颗珍珠。',
      layers: [['你的 JavaScript', 'main.js'], ['Nacre 运行时', '引擎 · Web API · 桥'], ['原生界面', '平台自己的视图']],
      steps: [
        ['你的 JavaScript', '打包进 App，在设备上运行。没有服务器，也不是网页。'],
        ['Nacre 运行时', 'JavaScript 引擎、Web 标准的 API，和通到原生类的桥。'],
        ['平台的原生界面', '屏幕上出现的是系统自己的视图，手感也是系统的。'],
        ['事件回到 JS', '点击、键盘、App 的生命周期，用 addEventListener 监听。'],
      ],
    },
    caps: {
      eyebrow: '能做什么',
      title: '一个真正的 App 需要的，都有',
      sub: '核心随运行时提供；要权限的能力做成单独的包，用到哪个装哪个。',
      core: '核心',
      coreNote: '不用另装',
      pkgs: '能力包',
      pkgsNote: '用到哪个装哪个',
    },
    start: {
      eyebrow: '开始',
      title: '三条命令，跑起一个 App',
      sub: '一个普通的 npm 项目，加一个 src/main.js。',
      steps: [
        ['安装', '运行时、命令行工具、类型和打包工具。'],
        ['生成', '从你的项目生成原生工程。随时可以删掉重新生成。'],
        ['运行', '打包你的 JavaScript，启动 App。'],
      ],
      copy: '复制',
      copied: '已复制',
      guide: '看完整的步骤',
    },
    proof: {
      eyebrow: '验证',
      title: '每次发布前，在真机上跑一遍',
      sub: '七千多条断言，在真机上 Debug 和 Release 各跑一遍。',
    },
    perf: {
      eyebrow: '性能',
      title: '一个 1000 行的列表，跑在 iPhone 14 上',
      items: [
        ['19 MB', '内存：列表静止时；滚动 30 秒也保持在 18–20 MB'],
        ['60 帧', '匀速滚动 30 秒，只掉了 1 帧'],
        ['14.8 MB', '安装大小：整个 App，包括运行时'],
      ],
      note: 'iPhone 14，iOS 27.2，Release 包。',
    },
    stats: ['个原生类有完整的参考', '个成员页，每个属性、方法、事件一页', '篇按步骤写的指南', '个能力包，用到才装'],
    end: { title: '做你的第一个 App', sub: '从一个按钮开始。' },
    footer: {
      cols: [
        { title: '文档', links: [['开始用', '/guides/your-own-app'], ['API 参考', '/api/'], ['指南', '/guides/'], ['核心和能力包', '/api/capabilities']] },
        { title: '社区', links: [['GitHub', 'https://github.com/John-Oldman-Wang/nacre'], ['提问和报 bug', 'https://github.com/John-Oldman-Wang/nacre/issues']] },
        { title: '包', links: [['@nacrejs/ios', 'https://www.npmjs.com/package/@nacrejs/ios'], ['@nacrejs/cli', 'https://www.npmjs.com/package/@nacrejs/cli'], ['@nacrejs/types', 'https://www.npmjs.com/package/@nacrejs/types']] },
        { title: '项目', links: [['npm 上的版本', 'https://www.npmjs.com/package/@nacrejs/ios?activeTab=versions'], ['许可证', 'https://github.com/John-Oldman-Wang/nacre/blob/main/LICENSE.md']] },
      ],
      note: '© 2026 John-Oldman-Wang · 以 FSL-1.1-MIT 许可发布',
    },
  },
};

// 能力地图：名字两种语言，链接指向对应的指南（不带语言前缀）
export const caps = {
  core: [
    { en: 'Views & layout', zh: '视图和布局', api: 'UIView · Auto Layout · UIStackView', link: '/guides/views' },
    { en: 'Text & images', zh: '文字和图片', api: 'UILabel · UIImage · attributed text', link: '/guides/labels' },
    { en: 'Animation', zh: '动画', api: 'CALayer · Core Animation', link: '/guides/animation' },
    { en: 'Touch & gestures', zh: '触摸和手势', api: 'UIControl · gesture recognizers', link: '/guides/gestures' },
    { en: 'Pages & navigation', zh: '页面和导航', api: 'UINavigationController · tabs', link: '/guides/navigation' },
    { en: 'Text input', zh: '文字输入', api: 'UITextField · keyboard events', link: '/guides/text-fields' },
    { en: 'Networking', zh: '网络', api: 'fetch · WebSocket · streams', link: '/guides/fetch' },
    { en: 'Storage & files', zh: '存储和文件', api: 'application.storage · fileSystem', link: '/guides/save-settings' },
    { en: 'Web views', zh: '网页', api: 'WebView · webContents', link: '/guides/web-pages' },
    { en: 'Formatting', zh: '按地区格式化', api: 'Intl.NumberFormat · DateTimeFormat', link: '/guides/format-numbers' },
    { en: 'Device bits', zh: '设备上的小能力', api: 'clipboard · haptics · crypto', link: '/guides/haptics' },
    { en: 'Native modules', zh: '原生模块', api: 'bring in third-party SDKs', zhApi: '接入第三方 SDK', link: '/guides/native-modules' },
  ],
  pkgs: [
    { en: 'Face ID', zh: '面容 ID', api: '@nacrejs/local-authentication', link: '/guides/face-id' },
    { en: 'Camera', zh: '拍照', api: '@nacrejs/camera', link: '/guides/take-photo' },
    { en: 'Barcode scanning', zh: '扫码', api: '@nacrejs/av-capture', link: '/guides/scanning' },
    { en: 'Location', zh: '定位', api: '@nacrejs/core-location', link: '/guides/get-location' },
    { en: 'Photos', zh: '照片', api: '@nacrejs/photos', link: '/guides/pick-photos' },
    { en: 'Contacts', zh: '联系人', api: '@nacrejs/contacts', link: '/guides/pick-contact' },
    { en: 'Local notifications', zh: '本地通知', api: '@nacrejs/user-notifications', link: '/guides/local-notifications' },
    { en: 'Push', zh: '远程推送', api: '@nacrejs/push', link: '/guides/push-notifications' },
    { en: 'Keychain', zh: '钥匙串', api: '@nacrejs/keychain', link: '/guides/save-secrets' },
    { en: 'Tracking consent', zh: '跟踪授权', api: '@nacrejs/app-tracking-transparency', link: '/guides/tracking-authorization' },
  ],
};

export const commands = [
  'npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types esbuild typescript',
  'npx nacre generate .',
  'npm run ios',
];
