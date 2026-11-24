plugins {
    id("com.android.application")
}

android {
    namespace = "nacre.shell"
    compileSdk = 37
    // 打包时用 NDK 里的工具去掉 .so 的调试符号，版本要和 runtime 的一致
    ndkVersion = "29.0.14206865"

    defaultConfig {
        // 和 iOS 的验收 App 一样，用不带任何标识的包名
        applicationId = "com.test.test"
        minSdk = 30
        targetSdk = 37
        versionCode = 1
        versionName = "0.0.0"
        ndk {
            abiFilters += "arm64-v8a"
        }
    }

    buildTypes {
        release {
            // 开发用的壳，Release 也用调试证书签，装到手机上就能跑
            signingConfig = signingConfigs.getByName("debug")
            isMinifyEnabled = false
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

dependencies {
    implementation(project(":runtime"))
    // 壳继承 ComponentActivity：权限、选图这些结果回调，和 Android 11、12 上的返回键回调，
    // 只有 AndroidX 版。它不带任何样式（AppCompatActivity 才带）
    implementation("androidx.activity:activity:1.12.4")
}

// 壳执行的 main.js。默认是 src/main/js/main.js（只验 console 进 logcat），
// 验收时 scripts/run-device.sh 用 -PnacreMainJs=<路径> 换成验收套件打出来的那个
val mainJs = providers.gradleProperty("nacreMainJs")
    .map { file(it) }
    .orElse(provider { file("src/main/js/main.js") })

val copyMainJs by tasks.registering(Copy::class) {
    from(mainJs) { rename { "main.js" } }
    into(layout.buildDirectory.dir("generated/nacre-assets"))
    inputs.property("mainJsPath", mainJs.map { it.absolutePath })
}

// 项目的 assets/（字体、图片这些）。放到包里 assets 下的 app/，不和 main.js、nacre/ 撞；
// 运行时按这个位置找（Typeface.createFromAsset 的路径相对它）。
// 验收时 scripts/run-device.sh 用 -PnacreAssets=<目录> 传进来；没给就不拷
val projectAssets = providers.gradleProperty("nacreAssets").map { file(it) }

val copyProjectAssets by tasks.registering(Sync::class) {
    if (projectAssets.isPresent) from(projectAssets)
    into(layout.buildDirectory.dir("generated/nacre-project-assets/app"))
}

android.sourceSets.getByName("main").assets.directories +=
    layout.buildDirectory.dir("generated/nacre-project-assets").get().asFile.path

tasks.named("preBuild") { dependsOn(copyMainJs, copyProjectAssets) }
