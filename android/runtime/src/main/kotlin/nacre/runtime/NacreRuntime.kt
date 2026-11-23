// 运行时在 Kotlin 这一侧的入口。只负责建引擎、执行脚本、关掉引擎，
// 不做任何调度：App 做什么全由 JS 决定。
package nacre.runtime

import android.os.Looper

class NacreRuntime private constructor(private var handle: Long) : AutoCloseable {

    // 执行一段脚本。有没捕获的异常时，错误已经打进 logcat，返回 false
    fun evaluate(name: String, source: ByteArray): Boolean {
        checkThread()
        check(handle != 0L) { "NacreRuntime is closed" }
        return nativeEvaluate(handle, name.toByteArray(Charsets.UTF_8), source)
    }

    override fun close() {
        checkThread()
        if (handle == 0L) return
        nativeDestroy(handle)
        handle = 0L
    }

    companion object {
        init {
            System.loadLibrary("nacre")
        }

        // JS 跑在主线程上，引擎的每个方法都只能在主线程调
        fun create(): NacreRuntime {
            checkThread()
            return NacreRuntime(nativeCreate())
        }

        val v8Version: String
            get() = nativeV8Version()

        private fun checkThread() {
            check(Looper.myLooper() == Looper.getMainLooper()) {
                "NacreRuntime must be used on the main thread"
            }
        }

        @JvmStatic private external fun nativeCreate(): Long
        @JvmStatic private external fun nativeEvaluate(handle: Long, name: ByteArray, source: ByteArray): Boolean
        @JvmStatic private external fun nativeDestroy(handle: Long)
        @JvmStatic private external fun nativeV8Version(): String
    }
}
