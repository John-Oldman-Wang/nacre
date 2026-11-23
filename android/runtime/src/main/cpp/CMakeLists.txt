# 运行时的原生部分：core/engine（两端共用的引擎）加上 Android 这一侧的 JNI。
cmake_minimum_required(VERSION 3.22)
project(nacre CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 这个文件在 android/runtime/src/main/cpp/，往上五层是仓库根
get_filename_component(REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../../.." ABSOLUTE)
set(CORE_ENGINE "${REPO_ROOT}/core/engine")
set(V8_DIR "${REPO_ROOT}/android/Vendor/v8")
set(V8_LIB "${V8_DIR}/lib/${ANDROID_ABI}/libv8_monolith.a")

if(NOT EXISTS "${V8_LIB}")
  message(FATAL_ERROR "没有找到 ${V8_LIB}，先跑 android/scripts/fetch-v8.sh")
endif()

add_library(v8_monolith STATIC IMPORTED)
set_target_properties(v8_monolith PROPERTIES IMPORTED_LOCATION "${V8_LIB}")

add_library(nacre SHARED
  NacreJni.cpp
  "${CORE_ENGINE}/Engine.cpp"
  "${CORE_ENGINE}/TextCodec.cpp"
  "${CORE_ENGINE}/WebGlobals.cpp"
)

target_include_directories(nacre PRIVATE "${CORE_ENGINE}" "${V8_DIR}/include")

# 这两个宏决定 V8 对象的布局，必须和那份预编译库一致：它开着指针压缩
# （库里定义了 v8::internal::MainCage::base_）。iOS 那份是关的，所以 iOS 不定义。
# 对不上时 V8 在初始化时就会报 "Embedder-vs-V8 build configuration mismatch"。
target_compile_definitions(nacre PRIVATE V8_COMPRESS_POINTERS V8_31BIT_SMIS_ON_64BIT_ARCH)

# V8 是不带 RTTI 编的，和 iOS 一样
target_compile_options(nacre PRIVATE -fno-rtti)

target_link_libraries(nacre PRIVATE v8_monolith log dl)
