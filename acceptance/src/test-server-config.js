// 验收用的本机测试服务在哪。服务本身是 scripts/test-server.mjs（Node 跑），
// 验收步骤（打进 App 的 JS）和它都从这里取端口，所以这个文件里只能有常量：
// 它两边都要能加载。
//
// 端口选一个不常用的固定值：验收 App 没有地方读环境变量，只能写死。
// 它不在系统随机分配的范围里（macOS 是 49152 以上）。
export const TEST_SERVER_PORT = 47831;

// 模拟器和 Mac 共用网络，所以 App 里的 127.0.0.1 就是跑服务的那台 Mac。
// 真机上这个地址指向手机自己，连不上，验收步骤会按「服务没起」跳过。
export const TEST_SERVER_ORIGIN = 'http://127.0.0.1:' + TEST_SERVER_PORT;
