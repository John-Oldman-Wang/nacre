plugins {
    id("com.android.library")
}

android {
    namespace = "nacre.runtime"
    compileSdk = 37
    // V8 那份预编译库是用 NDK r29 编的，这里必须同一个大版本，见 scripts/fetch-v8.sh
    ndkVersion = "29.0.14206865"

    defaultConfig {
        minSdk = 30
        ndk {
            abiFilters += "arm64-v8a"
        }
        externalNativeBuild {
            cmake {
                arguments += "-DANDROID_STL=c++_static"
            }
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "4.1.2"
        }
    }

    sourceSets {
        getByName("main") {
            assets.directories += layout.buildDirectory.dir("generated/nacre-assets").get().asFile.path
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

// 内置脚本：core/builtin/parts/ 里 Android 现在用的那几个，加上 Android 自己的
// src/main/builtin/parts/，合到包里的 nacre/parts/，运行时按文件名顺序执行。
//
// core 里还没接的：06-websocket（WebSocket 是原生类）、26-intl 和 27-intl-date
//（走调类方法的通道）。
val corePartsInUse = listOf(
    "05-dom-exception.js",
    "05-events.js",
    "22-url.js",
    "23-fetch.js",
    "24-timer.js",
    "25-crypto.js",
    "28-web-globals.js",
)

// 用 Sync 不用 Copy：Copy 不删目标目录里的旧文件，从列表里拿掉的脚本还会留在包里
val copyBuiltinParts by tasks.registering(Sync::class) {
    val coreParts = rootProject.file("../core/builtin/parts")
    val ownParts = file("src/main/builtin/parts")
    from(coreParts) { include(corePartsInUse) }
    from(ownParts) { include("*.js") }
    into(layout.buildDirectory.dir("generated/nacre-assets/nacre/parts"))
    // 两边同名会互相覆盖，执行顺序也就乱了：直接报错
    duplicatesStrategy = DuplicatesStrategy.FAIL
    doFirst {
        val missing = corePartsInUse.filterNot { coreParts.resolve(it).exists() }
        check(missing.isEmpty()) { "core/builtin/parts is missing: $missing" }
    }
}

tasks.named("preBuild") { dependsOn(copyBuiltinParts) }

dependencies {
    // fetch 和 WebSocket 的网络层（project.md 第 4 节「网络」）
    implementation("com.squareup.okhttp3:okhttp:5.5.1")
}
