// 验收用的预加载脚本。在网页自己的脚本之前执行，只进主文档。
// ipcRenderer 和 contextBridge 是运行时给的，不是全局。

contextBridge.exposeInMainWorld('app', {
  version: '1.0',
  // 单向：告诉 App 一件事
  say: (text) => ipcRenderer.send('say', text, { at: 1 }),
  // 请求-响应：问 App 要一个结果
  ask: (question) => ipcRenderer.invoke('ask', question),
  askNobody: () => ipcRenderer.invoke('nobody'),
  // 带不过去的值：应该当场抛
  sayFunction: () => ipcRenderer.send('bad', () => 1),
  // 不再收 App 发来的 to-page
  mute: () => { ipcRenderer.removeAllListeners('to-page'); },
});

// 预加载脚本执行时，文档才刚开始：还没有 <body>
window.preloadSawBody = !!document.body;

// App 发来的消息
window.received = [];
ipcRenderer.on('to-page', (event, a, b) => { window.received.push([a, b]); });
ipcRenderer.once('only-once', (event, value) => { window.received.push(['once', value]); });
// 加了又去掉的监听：不该收到任何东西
const removed = () => { window.received.push(['不该出现']); };
ipcRenderer.on('to-page', removed);
ipcRenderer.off('to-page', removed);
