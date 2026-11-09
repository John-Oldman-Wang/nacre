// 各步共用的支撑函数。

// 断言要能失败：只打印数值的「用例」给不了任何保证
/**
 * @param {string} label
 * @param {unknown} actual
 * @param {unknown} expected
 */
export function assert(label, actual, expected) {
  const passed = String(actual) === String(expected);
  console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + actual +
              (passed ? '' : '（期望 ' + expected + '）'));
}
