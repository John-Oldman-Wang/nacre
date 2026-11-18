// UIDevice：这台设备的静态信息。

/** @param {import("../main.js").StepContext} ctx */
export function stepDevice(ctx) {
  const { assert } = ctx;
  // ===== UIDevice =====
  //
  // 在这之前 JS 读不到系统版本，所以连「只在某个版本以上才用某个能力」
  // 这种降级都写不出来。
  console.log('--- UIDevice ---');

  const device = UIDevice.currentDevice;
  assert('currentDevice 是 UIDevice', device instanceof UIDevice, true);
  assert('每次读是同一个包装', UIDevice.currentDevice === device, true);
  try {
    // @ts-expect-error 构造函数是私有的
    new UIDevice();
    console.log('  ✗ UIDevice 居然能 new');
  } catch (err) {
    console.log('  ✓ UIDevice 不能 new:', err.message);
  }

  assert('systemName', device.systemName, 'iOS');
  assert('systemVersion 是字符串', typeof device.systemVersion, 'string');
  assert('systemVersion 形如 26.1 或 26.1.2', /^\d+\.\d+(\.\d+)?$/.test(device.systemVersion), true);
  const major = Number(device.systemVersion.split('.')[0]);
  // 工程的最低版本是 iOS 26，能跑起来就不该小于它
  assert('主版本号不小于 26（工程的最低版本）', major >= 26, true);
  assert('model', device.model, 'iPhone');
  assert('localizedModel 是非空字符串',
         typeof device.localizedModel === 'string' && device.localizedModel.length > 0, true);
  // 头文件说 iOS 16 起 name 是 model 的同义词。模拟器上实测不是：
  // name 是模拟器的名字（iPhone Air），model 是 iPhone。所以这里只验它
  // 是个非空字符串，具体值打在下面那行日志里
  assert('name 是非空字符串',
         typeof device.name === 'string' && device.name.length > 0, true);
  assert('userInterfaceIdiom', device.userInterfaceIdiom, 'phone');
  const vendor = device.identifierForVendor;
  assert('identifierForVendor 是 UUID',
         vendor !== null && /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(vendor),
         true);
  assert('两次读到的 identifierForVendor 相同', device.identifierForVendor, vendor);
  try {
    // @ts-expect-error 只读
    device.systemVersion = '99.0';
    console.log('  ✗ systemVersion 居然能写');
  } catch (err) {
    console.log('  ✓ systemVersion 只读:', err instanceof TypeError);
  }
  console.log('  实测：' + device.systemName + ' ' + device.systemVersion + '，model = ' +
              device.model + '，localizedModel = ' + device.localizedModel +
              '，name = ' + device.name);
}
