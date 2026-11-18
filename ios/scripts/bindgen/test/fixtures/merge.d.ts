// 对照用例：一个类的成员可以分在两处声明——类本身，和别的文件里用声明合并加上去的
declare class MergedView extends NSObject {
  title: string;
  reset(): void;
}

// 这是「往已有的类上加成员」在类型里的写法（富文本那一组就是这么给 UILabel 加 attributedText 的）
interface MergedView {
  attributedTitle: NSObject | null;
  readonly isMerged: boolean;
  get tint(): string | null;
  set tint(value: string | null);
  setAttributedTitle(title: NSObject | null, options: { forState: string[] }): void;
}

// 和任何类都不同名的 interface 不是声明合并，是 options 的形状
interface MergedOptions {
  animated?: boolean;
}
