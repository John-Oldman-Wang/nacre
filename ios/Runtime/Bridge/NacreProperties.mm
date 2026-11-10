// 属性分发的顺序表。每个能力域的实现在 NacreProps*.mm 里，这里只决定
// 「按什么顺序问」。
//
// 顺序其实是自由的：实测过所有跨域的子类/父类对（UIButton·UIControl·
// UIScrollView·UIStackView·UIWindow 对 UIView），**没有一个键是两边都处理
// 的**，所以谁先问都一样。仍然把子类所在的域排在 View 前面，是为了让
// 「子类在父类之前」这条规矩在顺序表上一眼可见 —— 域内部的顺序同理，
// 比如 Control 域里 UIButton 的分支就在 UIControl 之前。

#import "NacreBridge.h"

namespace nacre_bridge {

std::string ReadNativeProperty(id object, const std::string& name) {
  NSString* key = @(name.c_str());
  id value = ReadFileSystemProperty(object, key);
  if (value == nil) value = ReadSceneProperty(object, key);
  if (value == nil) value = ReadControlProperty(object, key);
  if (value == nil) value = ReadLayoutProperty(object, key);
  if (value == nil) value = ReadLayerProperty(object, key);
  if (value == nil) value = ReadScrollProperty(object, key);
  if (value == nil) value = ReadViewProperty(object, key);
  if (value == nil) value = ReadResourceProperty(object, key);
  return EncodeJSON(value);
}

// 写不进去就往 error 里写一句话，引擎据此抛 TypeError——写不进去又不报错
// 是最难查的那种错。两种情况都在域里凑话：这个对象没有这个可写属性，或者
// 枚举给了个不认识的名字。
//
// 错误信息只能在域里凑：可选值列表就在那几张表里，而且那里知道上下文
// （哪个类、哪个属性），所以不会有 UIControl.state 和 UIGestureRecognizer
// .state 这种按属性名索引就会撞的问题。
void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error) {
  NSString* key = @(name.c_str());
  id value = DecodeJSON(json);
  if (WriteSceneProperty(object, key, value, error)) return;
  if (WriteControlProperty(object, key, value, error)) return;
  if (WriteLayoutProperty(object, key, value, error)) return;
  if (WriteLayerProperty(object, key, value, error)) return;
  if (WriteScrollProperty(object, key, value, error)) return;
  if (WriteViewProperty(object, key, value, error)) return;
  // 注意：走正常的 JS 路径到不了这里。JS 侧的属性是一个个显式定义的
  // 取值器，名字不认识的赋值压根不会过桥，而是在包装对象上挂一个普通
  // 属性（JS 包装对象还是可扩展的，见 project.md 的 TODO）。这句话是
  // 给直接调 __nacre_native.setProp 的情况兜底的。
  *error = [NSString stringWithFormat:@"%@ has no writable property %@",
                                      NSStringFromClass([object class]), key]
               .UTF8String;
}

nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name) {
  {
    nacre::NativeObjectRef ref = ReadSceneObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadControlObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadLayoutObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadLayerObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadScrollObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadViewObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  return {};
}

// 属性值是原生对象数组。这一条和别的通道不同：各域只管往 refs 里追加，
// 没有「谁先认领」的问题。
std::vector<nacre::NativeObjectRef> ReadNativeObjectArrayProperty(
    id object, const std::string& name) {
  std::vector<nacre::NativeObjectRef> refs;
  ReadSceneObjectArray(object, name, refs);
  ReadScrollObjectArray(object, name, refs);
  ReadViewObjectArray(object, name, refs);
  return refs;
}

// 对象值的写入。没有错误出口：类型不对就当 nil 处理，这一条是已知的
// TODO（见 project.md「参数类型不对但有句柄」）。
void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr) {
  id value = (__bridge id)valuePtr;
  WriteSceneObjectProperty(object, name, value);
  WriteControlObjectProperty(object, name, value);
  WriteLayerObjectProperty(object, name, value);
  WriteViewObjectProperty(object, name, value);
}

// 可写的对象数组属性。目前只有导航栈一个，但通道和读那条是镜像关系，
// 该有的错误出口也有——类型不对直接拒，不当 nil 吞掉。
void WriteNativeObjectArrayProperty(id object, const std::string& name,
                                    const std::vector<void*>& values,
                                    std::string* error) {
  if (WriteSceneObjectArray(object, name, values, error)) return;
  *error = [NSString stringWithFormat:@"%@ has no writable object array property %s",
                                      NSStringFromClass([object class]), name.c_str()]
               .UTF8String;
}

}  // namespace nacre_bridge
