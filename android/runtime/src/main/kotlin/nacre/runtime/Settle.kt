// 异步调用的兑现：fetch、Blob 的读取这些在后台做完之后，回主线程把 JS 那边的
// Promise 兑现掉。实现在 NacreRuntime（它经 JNI 交给引擎）。
//
// 这几个方法哪个线程都能调：实现里一律排到主线程的队列上再进 JS。
package nacre.runtime

internal interface Settle {
    // 用一个 JSON 值兑现
    fun json(callId: Int, json: String)
    // 用一段字节兑现成 ArrayBuffer。数组交出去之后调用方别再改它
    fun bytes(callId: Int, data: ByteArray)
    // 用一个原生对象兑现（比如 Blob）
    fun obj(callId: Int, value: Any)
    // 拒绝。name 是 JS 那边的错误名：TypeError、AbortError……
    fun reject(callId: Int, name: String, message: String)
}
