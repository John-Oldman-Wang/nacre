// crypto：密码学强度的随机数。

/** @param {import("../main.js").StepContext} ctx */
export function stepCrypto(ctx) {
  const { assert } = ctx;
  // ===== crypto =====
  //
  // Math.random() 的输出可以被推算出来，不能用来生成密钥、令牌、订单号。
  // 这个的随机源来自系统。
  console.log('--- crypto ---');

  assert('crypto 是 Crypto 的实例', crypto instanceof Crypto, true);
  try {
    // @ts-expect-error 构造函数是私有的
    new Crypto();
    console.log('  ✗ Crypto 居然能 new');
  } catch (err) {
    console.log('  ✓ Crypto 不能 new:', err.message);
  }

  // ---- 填满，并且返回的就是传进去的那个 ----
  const bytes = new Uint8Array(32);
  const returned = crypto.getRandomValues(bytes);
  assert('返回的就是传进去的数组', returned === bytes, true);
  assert('32 个字节不全是 0', bytes.some((b) => b !== 0), true);
  const again = crypto.getRandomValues(new Uint8Array(32));
  assert('两次的结果不一样', bytes.join(',') !== again.join(','), true);

  // ---- 九种整数类型数组都收 ----
  const kinds = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
                 Int32Array, Uint32Array, BigInt64Array, BigUint64Array];
  let filled = 0;
  for (const Kind of kinds) {
    const arr = new Kind(8);
    crypto.getRandomValues(arr);
    // 8 个元素全是 0 的概率低到可以忽略
    if (Array.from(/** @type {ArrayLike<number|bigint>} */ (arr)).some((v) => v != 0)) {
      filled += 1;
    }
  }
  assert('九种整数类型数组都被填了', filled, 9);

  // ---- 只填视图覆盖的那一段，不碰 buffer 的其余部分 ----
  const whole = new Uint8Array(16);
  crypto.getRandomValues(whole.subarray(4, 12));
  const outside = [0, 1, 2, 3, 12, 13, 14, 15].every((i) => whole[i] === 0);
  const inside = whole.subarray(4, 12).some((b) => b !== 0);
  assert('子视图：范围以外的字节没被碰', outside, true);
  assert('子视图：范围以内被填了', inside, true);

  // ---- 边界 ----
  assert('长度 0 的数组原样返回', crypto.getRandomValues(new Uint8Array(0)).length, 0);
  assert('65536 字节正好可以', crypto.getRandomValues(new Uint8Array(65536)).length, 65536);
  try {
    crypto.getRandomValues(new Uint8Array(65537));
    console.log('  ✗ 65537 字节居然通过了');
  } catch (err) {
    console.log('  ✓ 超过 65536 字节被拒:', err.name + ': ' + err.message);
  }
  try {
    // 按字节算，不按元素算：16385 个 4 字节的元素是 65540 字节
    crypto.getRandomValues(new Uint32Array(16385));
    console.log('  ✗ 65540 字节的 Uint32Array 居然通过了');
  } catch (err) {
    console.log('  ✓ 上限按字节算，不按元素个数:', err.name);
  }
  try {
    // @ts-expect-error 浮点数组不收
    crypto.getRandomValues(new Float32Array(4));
    console.log('  ✗ 浮点数组居然通过了');
  } catch (err) {
    console.log('  ✓ 浮点数组被拒:', err.name + ': ' + err.message);
  }
  try {
    // @ts-expect-error DataView 不收
    crypto.getRandomValues(new DataView(new ArrayBuffer(8)));
    console.log('  ✗ DataView 居然通过了');
  } catch (err) {
    console.log('  ✓ DataView 被拒:', err.name);
  }
  try {
    // @ts-expect-error 普通数组不收
    crypto.getRandomValues([1, 2, 3]);
    console.log('  ✗ 普通数组居然通过了');
  } catch (err) {
    console.log('  ✓ 普通数组被拒:', err.name + ': ' + err.message);
  }

  // ---- 粗略看一眼分布：65536 个字节里 256 个值都该出现，均值在 127.5 附近 ----
  const big = crypto.getRandomValues(new Uint8Array(65536));
  const seen = new Set(big);
  let sum = 0;
  for (const b of big) sum += b;
  const mean = sum / big.length;
  assert('65536 个字节里 256 个取值都出现了', seen.size, 256);
  assert('均值在 127.5 ± 2 以内', Math.abs(mean - 127.5) < 2, true);

  // ---- randomUUID ----
  const uuid = crypto.randomUUID();
  assert('UUID 是第 4 版的格式',
         /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid),
         true);
  assert('两个 UUID 不一样', uuid !== crypto.randomUUID(), true);

  // ---- 花多久 ----
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) crypto.getRandomValues(bytes);
  const t1 = performance.now();
  for (let i = 0; i < 1000; i++) crypto.randomUUID();
  const t2 = performance.now();
  console.log('  实测：填 32 字节每次 ' + ((t1 - t0)).toFixed(2) + ' µs，randomUUID 每次 ' +
              ((t2 - t1)).toFixed(2) + ' µs（各 1000 次的平均）');
}
