/// <reference types="@nacre/types" />
//
// Nacre 的最小示例。整个 App 就这一个文件——窗口、页面、界面全由 JS 建，
// 原生层一行调度都没有。

// 场景接入时建窗口。一个 iPhone App 平时只有一个场景
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'Hello, Nacre';
  label.font = UIFont.systemFontOfSize(28, { weight: 'semibold' });
  label.textColor = 'label';
  label.textAlignment = 'center';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);

  const button = UIButton.buttonWithType('system');
  button.setTitle('点我', { forState: ['normal'] });
  button.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(button);

  let taps = 0;
  button.addEventListener('primaryActionTriggered', () => {
    taps++;
    label.text = taps === 1 ? '点了 1 次' : '点了 ' + taps + ' 次';
  });

  // 排版用 Auto Layout 的锚点，和原生写法一一对应
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(safe.centerYAnchor),
    button.topAnchor.constraintEqualToAnchor(label.bottomAnchor, { constant: 24 }),
    button.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
  ]);

  console.log('hello 跑起来了');
});
