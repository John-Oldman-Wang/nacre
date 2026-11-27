// 开发用的最小壳：进程一启动就建运行时、执行包里的 main.js。运行时跟着 App 的进程生死
//（project.md 第 1 节），页面来来去去由运行时告诉 JS，壳不管。以后有了 CLI，它挪进 CLI 的模板。
package nacre.shell

import android.app.Application
import nacre.runtime.NacreRuntime

class ShellApplication : Application() {
    // 一个进程一个，进程没了它才没，不关
    private lateinit var runtime: NacreRuntime

    override fun onCreate() {
        super.onCreate()
        runtime = NacreRuntime.create(this)
        val source = assets.open("main.js").use { it.readBytes() }
        runtime.evaluate("main.js", source)
    }
}
