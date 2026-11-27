// 安全区域：activity.windowInsets 和 windowinsetschange。JS 那一侧在 builtin/parts/09-insets.js
// 和 10-view.js 的 Activity。
package nacre.runtime

import android.app.Activity
import android.view.WindowInsets
import java.util.WeakHashMap

internal class WindowInsetsDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(Activity::class.java to "Activity")

    override fun read(target: Any, name: String): String? =
        if (target is Activity && name == "windowInsets") {
            target.window.decorView.rootWindowInsets?.let(::insetsJson) ?: "null"
        } else null

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target !is Activity || type != "windowinsetschange") return false
        // 系统每次分发窗口边衬都先经过页面最外层的视图。值变了才发事件（同样的值系统会
        // 重复分发好几次）；分发本身原样交给它默认的处理，不替 JS 做任何排版决定
        val decor = target.window.decorView
        lastInsets.remove(target)
        if (on) {
            decor.setOnApplyWindowInsetsListener { v, insets ->
                if (insets != lastInsets[target]) {
                    lastInsets[target] = insets
                    host.emitter.plain(target, "windowinsetschange")
                }
                v.onApplyWindowInsets(insets)
            }
        } else {
            decor.setOnApplyWindowInsetsListener(null)
        }
        return true
    }

    // 每个页面上次发出去的边衬（页面可能同时有几个）。键是弱引用，页面没了这一项跟着没了
    private val lastInsets = WeakHashMap<Activity, WindowInsets>()

    // 各类边衬照 WindowInsets.Type 的名字，每类是 [左, 上, 右, 下]，单位像素
    private fun insetsJson(insets: WindowInsets): String {
        val types = linkedMapOf(
            "systemBars" to WindowInsets.Type.systemBars(),
            "statusBars" to WindowInsets.Type.statusBars(),
            "navigationBars" to WindowInsets.Type.navigationBars(),
            "displayCutout" to WindowInsets.Type.displayCutout(),
            "ime" to WindowInsets.Type.ime(),
            "systemGestures" to WindowInsets.Type.systemGestures(),
            "tappableElement" to WindowInsets.Type.tappableElement(),
        )
        return types.entries.joinToString(",", "{", "}") { (name, type) ->
            val i = insets.getInsets(type)
            "\"$name\":[${i.left},${i.top},${i.right},${i.bottom}]"
        }
    }
}
