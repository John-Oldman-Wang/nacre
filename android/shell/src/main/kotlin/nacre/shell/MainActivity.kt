// 开发用的最小壳：只负责建运行时、执行包里的 main.js。
// 以后有了 CLI，它挪进 CLI 的模板；生命周期和系统事件那时再转给 JS。
package nacre.shell

import android.os.Bundle
import androidx.activity.ComponentActivity
import nacre.runtime.NacreRuntime

class MainActivity : ComponentActivity() {
    private var runtime: NacreRuntime? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val rt = NacreRuntime.create(this)
        runtime = rt
        val source = assets.open("main.js").use { it.readBytes() }
        rt.evaluate("main.js", source)
    }

    override fun onDestroy() {
        runtime?.close()
        runtime = null
        super.onDestroy()
    }
}
