// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 成员的名字是照已定的写法从头文件套出来的，没写注释的成员用法看 Apple 的文档。

declare class UIColorWell extends UIControl {
  constructor();

  title: string | null;
  supportsAlpha: boolean;
  get selectedColor(): string | null;
  set selectedColor(value: ColorValue | null);
  supportsEyedropper: boolean;
  maximumLinearExposure: number;
}
