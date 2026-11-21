// 网络状态：application.network。连没连上、走的是什么网络、是不是按流量计费，
// 以及变了的 change 事件。
//
// 模拟器跟着 Mac 的网络走，自动跑的验收改不了网络，所以这里只断言读得到、
// 类型对、前后一致；断网、换网络时 change 来不来要在设备上切网络看。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepNetwork(ctx) {
  const { assert } = ctx;
  console.log('--- 网络状态 ---');
  const network = application.network;
  assert('网络：application.network 是 Network', network instanceof Network, true);
  assert('网络：每次读到同一个对象', application.network === network, true);
  assert('网络：不能 new', thrown(() => new /** @type {any} */ (Network)()), 'TypeError');
  assert('网络：isConnected 是布尔', typeof network.isConnected, 'boolean');
  assert('网络：type 是五个名字之一',
         ['wifi', 'cellular', 'wired', 'other', 'none'].includes(network.type), true);
  assert('网络：isExpensive 是布尔', typeof network.isExpensive, 'boolean');
  assert('网络：连着时 type 不是 none，断着时是 none',
         network.isConnected ? network.type !== 'none' : network.type === 'none', true);
  console.log('  网络：此刻 isConnected = ' + network.isConnected + '，type = ' + network.type +
              '，isExpensive = ' + network.isExpensive + '（模拟器跟着 Mac 的网络）');
  assert('网络：模拟器连着网', network.isConnected, true);
  const onChange = () => {};
  assert('网络：监听 change 不抛', thrown(() => network.addEventListener('change', onChange)), '没抛');
  network.removeEventListener('change', onChange);
  console.log('  ! 网络：断网、换网络时 change 来不来，自动跑的验收改不了网络，未验证');
}
