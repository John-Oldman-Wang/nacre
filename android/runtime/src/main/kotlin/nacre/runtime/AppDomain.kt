// App 层：application 的包信息、openURL()、trimmemory；页面（activity）的生命周期、返回、配置、
// 被链接打开。JS 那一侧在 builtin/parts/33-app.js。
//
// 运行时跟着 App 生死，页面来来去去，可能同时有几个，也可能一个都没有：
// - 整个 App 的事不经过页面。JS 的 application 绑在这个进程的 Application 对象上（construct 交回
//   App 本身），包信息、openURL()、内存告警都用 App 级的环境。
// - 页面自己的事（生命周期、返回、配置变化、收到链接）按页面分开存。
//
// 页面上的能力都是 AndroidX 的 ComponentActivity 给的（Lifecycle、OnBackPressedDispatcher、
// 配置变化和新 intent 的监听），壳必须继承它（project.md 第 4 节「页面」）。
// 只把系统发生了什么告诉 JS，不替 JS 做任何决定：返回键接不接由 JS 提前写进 handlesBack，
// 原生照着答。
package nacre.runtime

import android.app.Activity
import android.app.Application
import android.content.ActivityNotFoundException
import android.content.ComponentCallbacks2
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Bundle
import android.view.View
import androidx.activity.BackEventCompat
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.util.Consumer
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.WeakHashMap

internal class AppDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        Activity::class.java to "Activity",
        Application::class.java to "Application",
    )

    // 33-app.js 启动时 new 一次，把 JS 的 application 绑在 App 本身上：之后原生发给 App 的事件
    // 就到 application 上，application 上的调用也到这里
    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? =
        if (className == "Application") host.app else null

    // ---- 页面 ----

    // 页面可能同时有几个，也可能一个都没有，这一组的状态按页面分开存。
    // 键是弱引用，Page 也只弱引用着页面：页面销毁、JS 也不再拿着它时，这一项跟着没了
    private val pages = WeakHashMap<Activity, Page>()

    private fun componentOf(target: Activity): ComponentActivity = target as? ComponentActivity
        ?: throw NacreTypeError("the activity must extend androidx.activity.ComponentActivity")

    private fun pageOf(target: Activity): Page = pages.getOrPut(target) { Page(componentOf(target)) }

    private inner class Page(activity: ComponentActivity) {
        private val ref = WeakReference(activity)

        // 原生真的会发的事件：有人订了的才发
        val subscribed = mutableSetOf<String>()

        fun emit(type: String) {
            val a = ref.get() ?: return
            if (type in subscribed) host.emitter.plain(a, type)
        }

        // ---- 返回：handlesBack 就是这个回调开没开 ----
        //
        // 系统要在手势开始之前就知道 App 接不接返回（预测性返回的动画要先选好），所以不能等
        // JS 当场答，由 JS 提前设好。默认关着：系统照它自己的做法处理返回
        val backCallback = object : OnBackPressedCallback(false) {
            override fun handleOnBackStarted(backEvent: BackEventCompat) = emitBack("backstart", backEvent)
            override fun handleOnBackProgressed(backEvent: BackEventCompat) = emitBack("backprogress", backEvent)
            override fun handleOnBackPressed() = emit("back")
            override fun handleOnBackCancelled() = emit("backcancel")
        }
        var backCallbackAdded = false

        // 手指的位置交 dp。按返回键这类没有边的（EDGE_NONE）没有手指，交 null
        private fun emitBack(type: String, e: BackEventCompat) {
            if (type !in subscribed) return
            val a = ref.get() ?: return
            val json = JSONObject().put("progress", num(e.progress))
            if (e.swipeEdge == BackEventCompat.EDGE_NONE) {
                json.put("touchX", JSONObject.NULL).put("touchY", JSONObject.NULL).put("swipeEdge", "none")
            } else {
                val density = num(a.resources.displayMetrics.density)
                json.put("touchX", num(e.touchX) / density)
                    .put("touchY", num(e.touchY) / density)
                    .put("swipeEdge", if (e.swipeEdge == BackEventCompat.EDGE_RIGHT) "right" else "left")
            }
            host.emitter.json(a, type, json.toString(), "BackEvent")
        }

        // ---- 生命周期 ----

        // addObserver 会当场把已经发生过的事件补发给新的观察者，那些不是「现在发生了」，不发
        var addingObserver = false
        val lifecycleObserver = LifecycleEventObserver { _, event ->
            if (!addingObserver) lifecycleEvents[event]?.let(::emit)
        }

        // ---- 配置变化、运行中收到的链接 ----

        val configurationListener = Consumer<Configuration> { emit("configurationchange") }

        val newIntentListener = Consumer<Intent> { intent ->
            val url = intent.data?.toString() ?: return@Consumer
            val a = ref.get() ?: return@Consumer
            if (OPEN_URL_EVENT in subscribed) emitOpenURL(a, url)
        }

        fun close() {
            backCallback.remove()
            ref.get()?.let { a ->
                a.lifecycle.removeObserver(lifecycleObserver)
                a.removeOnConfigurationChangedListener(configurationListener)
                a.removeOnNewIntentListener(newIntentListener)
            }
            subscribed.clear()
        }
    }

    // 收到链接的是哪个页面：发在那个页面上，33-app.js 转成 application 上的 openurl，带上页面
    private fun emitOpenURL(activity: Activity, url: String) {
        host.emitter.json(activity, OPEN_URL_EVENT, JSONObject().put("url", url).toString(), OPEN_URL_CLASS)
    }

    // ---- 页面建好时带着的链接 ----
    //
    // 冷启动（或者没有页面时被链接打开）带着的地址也走 openurl：页面建好时发，排到下一轮，在
    // activitycreate（当场派发）之后，activitycreate 的监听器里订的收得到。那时 JS 还没订，
    // 所以不看订没订，没人订 JS 那边就丢掉。
    // 系统把页面重建出来的不算（进程被杀之后从最近任务回来，带的还是原来那条链接）：
    // savedInstanceState 不是 null，或者 intent 带着 FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY
    private val activityCallbacks = object : Application.ActivityLifecycleCallbacks {
        override fun onActivityPostCreated(activity: Activity, savedInstanceState: Bundle?) {
            if (activity !is NacreActivity || savedInstanceState != null) return
            val intent = activity.intent ?: return
            if (intent.flags and Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY != 0) return
            val url = intent.data?.toString() ?: return
            emitOpenURL(activity, url)
        }
        override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
        override fun onActivityStarted(activity: Activity) {}
        override fun onActivityResumed(activity: Activity) {}
        override fun onActivityPaused(activity: Activity) {}
        override fun onActivityStopped(activity: Activity) {}
        override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
        override fun onActivityDestroyed(activity: Activity) {}
    }

    init {
        host.app.registerActivityLifecycleCallbacks(activityCallbacks)
    }

    // ---- 内存告警：整个 App 的事，订在 App 上，没有页面时也来 ----

    private var trimSubscribed = false
    private val trimCallbacks = object : ComponentCallbacks2 {
        override fun onTrimMemory(level: Int) {
            host.emitter.json(host.app, "trimmemory", JSONObject().put("level", trimLevelName(level)).toString(),
                              "TrimMemoryEvent")
        }
        override fun onConfigurationChanged(newConfig: Configuration) {}
        @Deprecated("Deprecated in Java")
        override fun onLowMemory() {}
    }

    // ---- 属性、方法、事件 ----

    override fun read(target: Any, name: String): String? = when (target) {
        is Activity -> when (name) {
            "lifecycleState" -> JSONObject.quote(componentOf(target).lifecycle.currentState.name.lowercase())
            "configuration" -> configurationJson(target)
            "handlesBack" -> pageOf(target).backCallback.isEnabled.toString()
            else -> null
        }
        is Application -> if (name == "packageInfo") packageInfoJson() else null
        else -> null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target !is Activity || name != "handlesBack") return false
        if (value !is Boolean) throw NacreTypeError("handlesBack: expected a boolean")
        val page = pageOf(target)
        if (!page.backCallbackAdded) {
            componentOf(target).onBackPressedDispatcher.addCallback(page.backCallback)
            page.backCallbackAdded = true
        }
        page.backCallback.isEnabled = value
        return true
    }

    // openURL：用 App 的环境打开，不经过页面
    override fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean {
        if (target !is Application || name != "openURL") return false
        val url = args.getOrNull(0) as? String ?: throw NacreTypeError("openURL: expected a string")
        // 打开的 App 放进它自己的任务，不叠在这个 App 的页面上面（从 App 的环境打开也必须带这个标志）
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        val opened = try {
            target.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            false
        } catch (e: SecurityException) {
            false
        }
        host.settle.json(callId, opened.toString())
        return true
    }

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target is Application) {
            if (type != "trimmemory") return false
            if (on && !trimSubscribed) target.registerComponentCallbacks(trimCallbacks)
            if (!on && trimSubscribed) target.unregisterComponentCallbacks(trimCallbacks)
            trimSubscribed = on
            return true
        }
        if (target !is Activity) return false
        val a = componentOf(target)
        val page = pageOf(target)
        val subscribed = page.subscribed
        when (type) {
            "start", "resume", "pause", "stop" -> {
                val before = subscribed.any { it in lifecycleEvents.values }
                if (on) subscribed += type else subscribed -= type
                val after = subscribed.any { it in lifecycleEvents.values }
                if (!before && after) {
                    page.addingObserver = true
                    try { a.lifecycle.addObserver(page.lifecycleObserver) } finally { page.addingObserver = false }
                } else if (before && !after) {
                    a.lifecycle.removeObserver(page.lifecycleObserver)
                }
            }
            "back", "backstart", "backprogress", "backcancel" -> {
                if (on) subscribed += type else subscribed -= type
            }
            "configurationchange" -> {
                if (on) a.addOnConfigurationChangedListener(page.configurationListener)
                else a.removeOnConfigurationChangedListener(page.configurationListener)
                if (on) subscribed += type else subscribed -= type
            }
            OPEN_URL_EVENT -> {
                if (on) a.addOnNewIntentListener(page.newIntentListener)
                else a.removeOnNewIntentListener(page.newIntentListener)
                if (on) subscribed += type else subscribed -= type
            }
            else -> return false
        }
        return true
    }

    override fun close() {
        host.app.unregisterActivityLifecycleCallbacks(activityCallbacks)
        if (trimSubscribed) host.app.unregisterComponentCallbacks(trimCallbacks)
        trimSubscribed = false
        for (page in pages.values) page.close()
        pages.clear()
    }

    private fun packageInfoJson(): String {
        val app = host.app
        val info = app.packageManager.getPackageInfo(app.packageName, 0)
        return JSONObject()
            .put("packageName", app.packageName)
            .put("versionName", info.versionName ?: JSONObject.NULL)
            .put("versionCode", info.longVersionCode)
            .toString()
    }

    // 长度是 dp（系统给的就是整数 dp）；density 是 1 dp 几个像素，和运行时换算视图长度用的是同一个数。
    // 系统说「没定」的（*_UNDEFINED）给 null
    private fun configurationJson(activity: Activity): String {
        val res = activity.resources
        val c = res.configuration
        val orientation: Any = when (c.orientation) {
            Configuration.ORIENTATION_PORTRAIT -> "portrait"
            Configuration.ORIENTATION_LANDSCAPE -> "landscape"
            else -> JSONObject.NULL
        }
        fun dp(value: Int, undefined: Int): Any = if (value == undefined) JSONObject.NULL else value
        val tags = c.locales.toLanguageTags()
        val locales = JSONArray()
        if (tags.isNotEmpty()) tags.split(',').forEach { locales.put(it) }
        return JSONObject()
            .put("orientation", orientation)
            .put("screenWidth", dp(c.screenWidthDp, Configuration.SCREEN_WIDTH_DP_UNDEFINED))
            .put("screenHeight", dp(c.screenHeightDp, Configuration.SCREEN_HEIGHT_DP_UNDEFINED))
            .put("smallestScreenWidth", dp(c.smallestScreenWidthDp, Configuration.SMALLEST_SCREEN_WIDTH_DP_UNDEFINED))
            .put("density", if (c.densityDpi == Configuration.DENSITY_DPI_UNDEFINED) JSONObject.NULL
                            else num(res.displayMetrics.density))
            .put("fontScale", num(c.fontScale))
            .put("isNightModeActive", c.isNightModeActive)
            .put("locales", locales)
            .put("layoutDirection", if (c.layoutDirection == View.LAYOUT_DIRECTION_RTL) "rtl" else "ltr")
            .toString()
    }

    companion object {
        // 页面上的内部事件：收到了一条链接（33-app.js 转成 application 上的 openurl）
        private const val OPEN_URL_EVENT = "@openurl"
        private const val OPEN_URL_CLASS = "@OpenURLNotice"

        private val lifecycleEvents = mapOf(
            Lifecycle.Event.ON_START to "start",
            Lifecycle.Event.ON_RESUME to "resume",
            Lifecycle.Event.ON_PAUSE to "pause",
            Lifecycle.Event.ON_STOP to "stop",
        )

        // Float 直接转 Double 会带出 1.149999976 这样的尾巴，按它写出来的样子转
        private fun num(f: Float): Double = f.toString().toDouble()

        // 常量去掉 TRIM_MEMORY_ 前缀、首字母小写。系统以后加的级别按落在哪一档归过去
        @Suppress("DEPRECATION")
        fun trimLevelName(level: Int): String = when {
            level >= ComponentCallbacks2.TRIM_MEMORY_COMPLETE -> "complete"
            level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE -> "moderate"
            level >= ComponentCallbacks2.TRIM_MEMORY_BACKGROUND -> "background"
            level >= ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN -> "uiHidden"
            level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL -> "runningCritical"
            level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW -> "runningLow"
            else -> "runningModerate"
        }
    }
}
