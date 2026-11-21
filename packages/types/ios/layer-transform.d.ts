// 图层的 3D 变换和遮罩：CATransform3D，CALayer 的 transform / sublayerTransform /
// isDoubleSided / mask。

/**
 * 4×4 的矩阵，图层的 3D 变换。和 Core Animation 一样用行向量：平移在第四行
 * （`m41` `m42` `m43`），透视在 `m34`（常用 `-1 / 距离`）。字段只读，写了抛 `TypeError`。
 *
 * 写进图层时也可以给带齐 16 个字段的普通对象，比如
 * `{ ...CATransform3D.identity, m34: -1 / 500 }`。
 */
declare class CATransform3D {
  /** 不给的字段按 0。 */
  constructor(
    m11?: number, m12?: number, m13?: number, m14?: number,
    m21?: number, m22?: number, m23?: number, m24?: number,
    m31?: number, m32?: number, m33?: number, m34?: number,
    m41?: number, m42?: number, m43?: number, m44?: number,
  );
  readonly m11: number; readonly m12: number; readonly m13: number; readonly m14: number;
  readonly m21: number; readonly m22: number; readonly m23: number; readonly m24: number;
  readonly m31: number; readonly m32: number; readonly m33: number; readonly m34: number;
  readonly m41: number; readonly m42: number; readonly m43: number; readonly m44: number;

  /** 单位矩阵：什么都不变（`CATransform3DIdentity`）。 */
  static readonly identity: CATransform3D;
  /** 平移，单位 pt。不给 `tz` 是 0（`CATransform3DMakeTranslation`）。 */
  static translation(tx: number, ty: number, tz?: number): CATransform3D;
  /** 缩放，倍数。只给一个时 x、y 相同，不给 `sz` 是 1（`CATransform3DMakeScale`）。 */
  static scale(sx: number, sy?: number, sz?: number): CATransform3D;
  /** 绕 (x, y, z) 这根轴转，弧度，右手定则。轴是零向量抛 `RangeError`（`CATransform3DMakeRotation`）。 */
  static rotation(radians: number, x: number, y: number, z: number): CATransform3D;
  /** 2D 的仿射变换变成 3D 的（`CATransform3DMakeAffineTransform`）。 */
  static fromAffineTransform(transform: CGAffineTransform): CATransform3D;

  /** 先应用自己再应用 `other`（`CATransform3DConcat(self, other)`）。 */
  concat(other: CATransform3DLike): CATransform3D;
  /** 先平移再应用自己（`CATransform3DTranslate`）。 */
  translate(tx: number, ty: number, tz?: number): CATransform3D;
  /** 先缩放再应用自己（`CATransform3DScale`）。 */
  scale(sx: number, sy?: number, sz?: number): CATransform3D;
  /** 先旋转再应用自己（`CATransform3DRotate`）。 */
  rotate(radians: number, x: number, y: number, z: number): CATransform3D;
  /** 逆矩阵。不可逆时返回 `null`。 */
  invert(): CATransform3D | null;
  readonly isIdentity: boolean;
  /** 能不能用 2D 的仿射变换表示（`CATransform3DIsAffine`）。 */
  readonly isAffine: boolean;
  /** 2D 的那一部分（`CATransform3DGetAffineTransform`）。 */
  readonly affineTransform: CGAffineTransform;
  toString(): string;
}

/** 写进去时认的形状：`CATransform3D`，或者带齐 16 个字段的普通对象。 */
type CATransform3DLike = CATransform3D | {
  m11: number; m12: number; m13: number; m14: number;
  m21: number; m22: number; m23: number; m24: number;
  m31: number; m32: number; m33: number; m34: number;
  m41: number; m42: number; m43: number; m44: number;
};

interface CALayer {
  /** 图层的 3D 变换，绕 `anchorPoint` 生效。默认单位矩阵。 */
  get transform(): CATransform3D;
  set transform(value: CATransform3DLike);
  /** 给所有子图层统一加的变换，常用来给一组子图层共同的透视。默认单位矩阵。 */
  get sublayerTransform(): CATransform3D;
  set sublayerTransform(value: CATransform3DLike);
  /** 转到背面时还画不画。默认 `true`。 */
  isDoubleSided: boolean;
  /** 遮罩：只显示遮罩图层不透明的部分。默认 `null`。 */
  mask: CALayer | null;
}
