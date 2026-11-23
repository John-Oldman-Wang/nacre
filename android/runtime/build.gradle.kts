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

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
