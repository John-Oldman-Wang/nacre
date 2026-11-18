// 属性分发的顺序表。每个能力域的实现在 NacreProps*.mm 里，这里只决定
// 「按什么顺序问」。
//
// 顺序其实是自由的：实测过所有跨域的子类/父类对（UIButton·UIControl·
// UIScrollView·UIStackView·UIWindow 对 UIView），**没有一个键是两边都处理
// 的**，所以谁先问都一样。仍然把子类所在的域排在 View 前面，是为了让
// 「子类在父类之前」这条规矩在顺序表上一眼可见 —— 域内部的顺序同理，
// 比如 Control 域里 UIButton 的分支就在 UIControl 之前。
//
// 每条通道都**先问登记进来的域**（NacreRegisterDomain，见 NacreExtension.h），
// 再走下面这串写死的。新接的类都走登记，这个文件不用再加行；下面这些是
// 登记机制之前就有的，碰到哪个域再顺手迁。

#import "NacreBridge.h"

namespace nacre_bridge {

std::string ReadNativeProperty(id object, const std::string& name) {
  NSString* key = @(name.c_str());
  id value = NacreDomainRead(object, key);
  if (value == nil) value = ReadFileSystemProperty(object, key);
  if (value == nil) value = ReadSceneProperty(object, key);
  if (value == nil) value = ReadControlProperty(object, key);
  if (value == nil) value = ReadLayoutProperty(object, key);
  if (value == nil) value = ReadLayerProperty(object, key);
  if (value == nil) value = ReadPathProperty(object, key);
  if (value == nil) value = ReadAnimationProperty(object, key);
  if (value == nil) value = ReadDisplayLinkProperty(object, key);
  if (value == nil) value = ReadWebSocketProperty(object, key);
  if (value == nil) value = ReadTraitProperty(object, key);
  if (value == nil) value = ReadDeviceProperty(object, key);
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
// 各个域的处理函数。认领了（写成了，或者填了 error）就返回
static void DispatchWrite(id object, NSString* key, id value, std::string* error) {
  if (NacreDomainWrite(object, key, value, error)) return;
  if (WriteSceneProperty(object, key, value, error)) return;
  if (WriteControlProperty(object, key, value, error)) return;
  if (WriteLayoutProperty(object, key, value, error)) return;
  if (WriteLayerProperty(object, key, value, error)) return;
  if (WritePathProperty(object, key, value, error)) return;
  if (WriteAnimationProperty(object, key, value, error)) return;
  if (WriteDisplayLinkProperty(object, key, value, error)) return;
  if (WriteWebSocketProperty(object, key, value, error)) return;
  if (WriteTraitProperty(object, key, value, error)) return;
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

void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error, std::string* warning) {
  NSString* key = @(name.c_str());
  id value = DecodeJSON(json);
  NacreClearUnknownEnumValue();
  DispatchWrite(object, key, value, error);
  // 枚举属性写了不认识的值（2026-11-17 定）：不抛，值保持不变，那句话改从
  // warning 出去，JS 打成一条警告。这条只管属性：方法参数、options、构造参数
  // 里的枚举不经过这里，照旧抛。
  // 处理函数都是先查名字、查不到就填 error 返回，所以到这里值还没被动过
  if (!error->empty() && NacreSawUnknownEnumValue() && warning != nullptr) {
    *warning = *error;
    error->clear();
  }
}

nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name) {
  {
    nacre::NativeObjectRef ref = NacreDomainReadObject(object, name);
    if (!ref.class_name.empty()) return ref;
  }
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
    nacre::NativeObjectRef ref = ReadAnimationObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadTraitObjectProperty(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  {
    nacre::NativeObjectRef ref = ReadWebViewObjectProperty(object, name);
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
  NacreDomainReadObjectArray(object, name, refs);
  ReadSceneObjectArray(object, name, refs);
  ReadLayerObjectArray(object, name, refs);
  ReadAnimationObjectArray(object, name, refs);
  ReadScrollObjectArray(object, name, refs);
  ReadViewObjectArray(object, name, refs);
  ReadResourceObjectArray(object, name, refs);
  return refs;
}

// 对象值的写入。照 Web IDL：对象不转换，给了对象就得是要求的那个类，
// 不是就抛（各域用 NACRE_OBJECT_OR_NIL 取值）。null 可以，这些属性都可空。
void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr,
                               std::string* error) {
  id value = (__bridge id)valuePtr;
  if (NacreDomainWriteObject(object, name, value, error)) return;
  WriteSceneObjectProperty(object, name, value, error);
  WriteControlObjectProperty(object, name, value, error);
  WriteLayerObjectProperty(object, name, value, error);
  WriteAnimationObjectProperty(object, name, value, error);
  WriteViewObjectProperty(object, name, value, error);
}

// 可写的对象数组属性。目前只有导航栈一个，但通道和读那条是镜像关系，
// 该有的错误出口也有——类型不对直接拒，不当 nil 吞掉。
void WriteNativeObjectArrayProperty(id object, const std::string& name,
                                    const std::vector<void*>& values,
                                    std::string* error) {
  if (NacreDomainWriteObjectArray(object, name, values, error)) return;
  if (WriteSceneObjectArray(object, name, values, error)) return;
  if (WriteLayerObjectArray(object, name, values, error)) return;
  if (WriteAnimationObjectArray(object, name, values, error)) return;
  *error = [NSString stringWithFormat:@"%@ has no writable object array property %s",
                                      NSStringFromClass([object class]), name.c_str()]
               .UTF8String;
}

}  // namespace nacre_bridge
