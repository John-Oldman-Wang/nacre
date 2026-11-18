// 对照用例的类型定义：SampleView 手写出来的样子。和机械规则有意留了几处不一样。
type SampleMode = 'automatic' | 'urlOnly';
type SampleEdge = 'top' | 'left' | 'bottom';

declare class SampleView extends NSObject {
  constructor(options?: { frame?: CGPoint });
  static readonly sharedView: SampleView;

  isOn: boolean;
  readonly mode: SampleMode;
  edges: SampleEdge[];
  get title(): string | null;
  set title(value: string | null);
  /** 手写的把它做成了只读，头文件里是可写的 */
  readonly origin: CGPoint;
  readonly width: number;

  setOn(on: boolean, options?: { animated?: boolean }): void;
  insertItem(item: SampleItem, options?: { atIndex?: number; aboveItem?: SampleItem }): void;
  /** 机械规则给的名字是 itemAtIndex，手写的改了名 */
  item(index: number): SampleItem | null;
  load(): Promise<boolean>;
  sizeToFit(): void;

  /** 我们自己加的，头文件里没有 */
  addEventListener(type: 'change', listener: () => void): void;
}
