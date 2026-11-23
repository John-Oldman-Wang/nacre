// 运行时在 Kotlin 这一侧的入口：建引擎、跑内置脚本、执行 App 的脚本、关掉引擎，
// 外加事件循环的那几根线（定时器的唤醒、投递的任务、主线程空闲时的 GC）。
// 不做任何调度：App 做什么全由 JS 决定。
package nacre.runtime

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.os.MessageQueue
import kotlin.math.ceil

class NacreRuntime private constructor(activity: Activity) : AutoCloseable {
    private var handle = 0L

    // 原生对象和引擎之间那一层。系统的回调（比如点击）进来，排到下一轮再派发给 JS：
    // 原生的通知不当场进 JS，和 iOS 一样
    private val bridge: NativeBridge = NativeBridge(activity) { target, type ->
        handler.post {
            if (handle != 0L) {
                nativeEmitObjectEvent(handle, bridge.intern(target), bridge.className(target), type)
            }
        }
    }

    // 引擎的唤醒和投递都排在主线程的这个 Handler 上，和别的主线程消息在同一个队列里，
    // 先后是确定的（iOS 那边是主队列，道理一样）
    private val handler = Handler(Looper.getMainLooper())

    // 定时器唤醒的「代数」。到期顺序由引擎的堆决定，这里只管叫醒。每次重新约定都让
    // 旧的作废：旧的消息到点醒来，发现代数不对就什么都不做
    private var wakeupGeneration = 0L

    // 主线程的消息队列空下来时，把这段空闲交给 V8 做增量 GC。返回 true 是一直留着，
    // 队列每空一次叫一次
    private val idleHandler = MessageQueue.IdleHandler {
        if (handle != 0L) {
            nativeRunIdleTasks(handle, IDLE_SECONDS)
            bridge.sweep()
        }
        true
    }

    // 执行一段脚本。有没捕获的异常时，错误已经打进 logcat，返回 false
    fun evaluate(name: String, source: ByteArray): Boolean {
        checkOpen()
        return nativeEvaluate(handle, name.toByteArray(Charsets.UTF_8), source)
    }

    override fun close() {
        checkThread()
        if (handle == 0L) return
        Looper.myQueue().removeIdleHandler(idleHandler)
        handler.removeCallbacksAndMessages(null)
        nativeDestroy(handle)
        handle = 0L
    }

    private fun checkOpen() {
        checkThread()
        check(handle != 0L) { "NacreRuntime is closed" }
    }

    // ---- 原生回调进来的两条（JNI 按名字找，改名要连 NacreJni.cpp 一起改）----

    @Suppress("unused")
    private fun scheduleWakeup(delayMs: Double) {
        val generation = ++wakeupGeneration
        if (delayMs < 0) return  // 堆空了，只作废不排新的
        val wake = Runnable {
            if (handle != 0L && generation == wakeupGeneration) nativeFireDueTimers(handle)
        }
        // 0 延迟直接排到队尾，不走 postDelayed。毫秒向上取整：早醒了那一轮什么都到不了期
        if (delayMs <= 0) handler.post(wake) else handler.postDelayed(wake, ceil(delayMs).toLong())
    }

    @Suppress("unused")
    private fun postTask(id: Long) {
        handler.post { if (handle != 0L) nativeRunTask(handle, id) }
    }

    companion object {
        init {
            System.loadLibrary("nacre")
        }

        // 内置脚本在包里的位置：core/builtin/parts/ 里 Android 用的那几个，加上
        // runtime/src/main/builtin/parts/，构建时合到这一个目录（见 runtime/build.gradle.kts）
        private const val PARTS_DIR = "nacre/parts"
        private const val IDLE_SECONDS = 0.005

        // 建一个运行时，并按文件名顺序跑完全部内置脚本。JS 跑在主线程上，
        // 引擎的每个方法都只能在主线程调
        fun create(activity: Activity): NacreRuntime {
            checkThread()
            val assets = activity.assets
            val runtime = NacreRuntime(activity)
            runtime.handle = nativeCreate(runtime, runtime.bridge)
            val names = assets.list(PARTS_DIR).orEmpty().filter { it.endsWith(".js") }.sorted()
            for (name in names) {
                val source = assets.open("$PARTS_DIR/$name").use { it.readBytes() }
                // 脚本名和 iOS 一样，调用栈里看得到
                val scriptName = "nacre:internal/parts/$name"
                // 任何一个失败都是致命的：后面的会在半加载的状态上继续跑
                check(nativeRunBuiltinPart(runtime.handle, scriptName.toByteArray(Charsets.UTF_8), source)) {
                    "Nacre builtin script failed: $scriptName"
                }
            }
            nativeFinishBuiltinParts(runtime.handle)
            Looper.myQueue().addIdleHandler(runtime.idleHandler)
            return runtime
        }

        val v8Version: String
            get() = nativeV8Version()

        private fun checkThread() {
            check(Looper.myLooper() == Looper.getMainLooper()) {
                "NacreRuntime must be used on the main thread"
            }
        }

        @JvmStatic private external fun nativeCreate(self: NacreRuntime, bridge: NativeBridge): Long
        @JvmStatic private external fun nativeRunBuiltinPart(handle: Long, name: ByteArray, source: ByteArray): Boolean
        @JvmStatic private external fun nativeFinishBuiltinParts(handle: Long)
        @JvmStatic private external fun nativeEvaluate(handle: Long, name: ByteArray, source: ByteArray): Boolean
        @JvmStatic private external fun nativeFireDueTimers(handle: Long)
        @JvmStatic private external fun nativeRunTask(handle: Long, id: Long)
        @JvmStatic private external fun nativeRunIdleTasks(handle: Long, seconds: Double)
        @JvmStatic private external fun nativeEmitObjectEvent(handle: Long, id: Long, className: String, type: String)
        @JvmStatic private external fun nativeDestroy(handle: Long)
        @JvmStatic private external fun nativeV8Version(): String
    }
}
