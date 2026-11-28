<script setup>
// 首屏的 logo。括号和珍珠是镂空的窗口，底下一整片颜色在慢慢流动。
//
// 点一下：镜头推进到珍珠里，括号散开淡出，颜色铺满整个首屏，再收成一部手机的
// 屏幕，屏幕上浮出几块卡片——运行时下面透出来的是一个个 App。再点一下或按 Esc
// 倒回去。放动画的那一层盖住整个首屏，标题和按钮由 NacreHome 淡出（playing 事件）。
//
// 这个浏览器第一次打开首页时自动播一次：等页面在前台、logo 在屏幕上，再停半秒
// 开始（在后台标签页里打开的，切过来之后才播），在手机上停一会儿再倒回。
// 自动播的时候点一下、滚动、按键，都马上快速倒回，不挡着人去点按钮。记没记过
// 放在 localStorage 里，读写不了（隐私模式）就当没播过
//
// 形状和颜色和静态的 nh-logo 是同一套，渐变和遮罩定义在 NacreHome 里（nh-blob-*、
// nh-sheen、nh-logo-mask）。所有尺寸都在 logo 自己的 120×120 坐标里写，放动画时
// 用一个「镜头」把它放到首屏上：镜头的位置和倍数从 logo 的地方移到首屏中间
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({ label: { type: String, required: true } });
const emit = defineEmits(['playing']);

const BRACES = [
  'M38 20 Q24 20 24 36 L24 48 Q24 60 13 60 Q24 60 24 72 L24 84 Q24 100 38 100',
  'M82 20 Q96 20 96 36 L96 48 Q96 60 107 60 Q96 60 96 72 L96 84 Q96 100 82 100',
];
// 三团颜色：位置和半径和静态 logo 一样，各自绕着原位漂（振幅、角速度、相位）。
// 振幅要够大，在 96 像素的 logo 里才看得出颜色在动
const BLOBS = [
  { id: 'nh-blob-sky', x: 104, y: 16, r: 78, ax: 30, ay: 26, fx: 0.8, fy: 0.62, ph: 0 },
  { id: 'nh-blob-green', x: 14, y: 108, r: 80, ax: 28, ay: 26, fx: 0.72, fy: 0.9, ph: 1.6 },
  { id: 'nh-blob-pink', x: 114, y: 112, r: 70, ax: 26, ay: 28, fx: 0.56, fy: 0.68, ph: 2.4 },
];
// 屏幕上那几块卡片，按屏幕的宽高比例摆：x、y、宽、高；最后一个是不是标题那一条
const CARDS = [
  [0.1, 0.12, 0.51, 0.031, true],
  [0.1, 0.182, 0.8, 0.19, false],
  [0.1, 0.397, 0.378, 0.174, false],
  [0.522, 0.397, 0.378, 0.174, false],
  [0.1, 0.597, 0.8, 0.113, false],
  [0.1, 0.736, 0.8, 0.113, false],
];
const CARD_ALPHA = [0.9, 0.26, 0.26, 0.26, 0.22, 0.16];
const DURATION = 2000; // 从 logo 到手机（或倒回来）一趟，毫秒
const SKIP_DURATION = 900; // 自动播放时被打断，倒回去用的时间
const INTRO_KEY = 'nacre.heroIntroPlayed';
const INTRO_DELAY = 500; // 页面到前台、logo 在屏幕上之后，等多久开始自动播
const INTRO_HOLD = 1400; // 在手机上停多久

const btn = ref(null);
const logo = ref(null);
const stage = ref(null);
const cam = ref(null);
const braces = ref(null);
const win = ref(null);
const sheen = ref(null);
const phoneLayer = ref(null);
const cards = ref(null);
const idleBlobs = [];
const stageBlobs = [];

const mounted = ref(false);
const active = ref(false); // 放动画的那一层在不在
const open = ref(false); // 停在手机那一头（或正往那一头走）
// 首屏的大小、放动画那一层相对父元素的位置、logo 的中心和倍数，单位都是像素
const geo = reactive({ W: 0, H: 0, left: 0, top: 0, lx: 0, ly: 0, s0: 0.8 });

const phone = computed(() => {
  const h = Math.max(220, Math.min(390, geo.H - 64));
  const w = h * 0.4615;
  const cx = geo.W / 2;
  const cy = geo.H / 2;
  return { w, h, cx, cy, x: cx - w / 2, y: cy - h / 2, rx: h * 0.092 };
});
const cardRects = computed(() => {
  const p = phone.value;
  return CARDS.map(([fx, fy, fw, fh, title], i) => ({
    x: p.x + fx * p.w, y: p.y + fy * p.h, w: fw * p.w, h: fh * p.h,
    rx: title ? (fh * p.h) / 2 : p.h * 0.041, alpha: CARD_ALPHA[i],
  }));
});

// 动画的状态不放进响应式：每帧直接改属性，不让 Vue 重新渲染
let p = 0; // 0 是 logo，1 是手机
let from = 0;
let target = 0;
let t0 = 0;
let dur = DURATION;
let animating = false;
let playing = false;
let raf = 0;
let visible = false;
let reduce = false;
let io = null;
let autoplaying = false; // 这一遍是第一次打开时的自动播放
let introTimer = 0;
let introPending = false; // 还等着自动播：这一次打开还没播，用户也还没自己点过
let holdTimer = 0;

const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k], b[k], t)]));
const n = (x) => x.toFixed(3);

function measure() {
  const hero = btn.value.closest('.hero');
  if (!hero) return;
  const hr = hero.getBoundingClientRect();
  const pr = (btn.value.offsetParent ?? hero).getBoundingClientRect();
  const lr = logo.value.getBoundingClientRect();
  geo.W = hr.width;
  geo.H = hr.height;
  geo.left = hr.left - pr.left;
  geo.top = hr.top - pr.top;
  geo.lx = lr.left + lr.width / 2 - hr.left;
  geo.ly = lr.top + lr.height / 2 - hr.top;
  geo.s0 = lr.width / 120;
}

function setBlobs(seconds) {
  BLOBS.forEach((b, i) => {
    const x = n(b.x + b.ax * Math.sin(seconds * b.fx + b.ph));
    const y = n(b.y + b.ay * Math.cos(seconds * b.fy + b.ph));
    for (const el of [idleBlobs[i], stageBlobs[i]]) {
      if (!el) continue;
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
    }
  });
}

// 三段：A 镜头推进、珍珠这扇窗铺满首屏；B 收成手机屏幕、手机边框出现、转一个侧角；
// C 屏幕上浮出卡片
function render() {
  const eA = ease(clamp(p / 0.42));
  const eB = ease(clamp((p - 0.42) / 0.4));
  const eC = ease(clamp((p - 0.78) / 0.22));
  const ph = phone.value;
  const s1 = Math.max((Math.max(geo.W, geo.H) * 0.55) / 120, geo.s0 * 3);
  // 镜头：logo 坐标里的 (60, 60) 落在 (x, y)，放大 s 倍
  const C0 = { x: geo.lx, y: geo.ly, s: geo.s0 };
  const C1 = { x: geo.W / 2, y: geo.H / 2, s: s1 };
  const C2 = { x: ph.cx, y: ph.cy, s: ph.h / 150 };
  // 窗口（一开始就是珍珠那个圆），像素
  const W0 = { x: geo.lx, y: geo.ly, w: 42 * geo.s0, h: 42 * geo.s0, r: 21 * geo.s0 };
  const W1 = { x: geo.W / 2, y: geo.H / 2, w: geo.W * 1.3, h: geo.H * 1.3, r: 48 };
  const W2 = { x: ph.cx, y: ph.cy, w: ph.w, h: ph.h, r: ph.rx };
  const c = eB > 0 ? mix(C1, C2, eB) : mix(C0, C1, eA);
  const w = eB > 0 ? mix(W1, W2, eB) : mix(W0, W1, eA);
  const tx = c.x - 60 * c.s;
  const ty = c.y - 60 * c.s;
  cam.value.setAttribute('transform', `translate(${n(tx)} ${n(ty)}) scale(${n(c.s)})`);
  // 窗口写在镜头里面，换回 logo 坐标
  win.value.setAttribute('x', n((w.x - w.w / 2 - tx) / c.s));
  win.value.setAttribute('y', n((w.y - w.h / 2 - ty) / c.s));
  win.value.setAttribute('width', n(w.w / c.s));
  win.value.setAttribute('height', n(w.h / c.s));
  win.value.setAttribute('rx', n(w.r / c.s));
  braces.value.setAttribute('opacity', n(1 - eA));
  sheen.value.setAttribute('opacity', n(1 - ease(clamp(eA / 0.25))));
  phoneLayer.value.setAttribute('opacity', n(eB));
  cards.value.setAttribute('opacity', n(eC));
  const rx = 10 * Math.sin(Math.PI * eA) * (1 - eB) + 6 * eB;
  const ry = -16 * eB;
  const sc = 1 + 0.05 * Math.sin(Math.PI * eA);
  stage.value.style.transform = `rotateX(${n(rx)}deg) rotateY(${n(ry)}deg) scale(${n(sc)})`;

  // 标题和按钮：往手机走的一开始就淡出；倒回来时等颜色开始缩回 logo 再淡入
  const nowPlaying = target === 1 ? p > 0 || animating : p > 0.42;
  if (nowPlaying !== playing) {
    playing = nowPlaying;
    emit('playing', playing);
  }
}

function frame(now) {
  raf = 0;
  setBlobs(reduce ? 0 : now / 1000);
  if (animating) {
    const k = clamp((now - t0) / dur);
    p = lerp(from, target, k);
    if (k >= 1) {
      animating = false;
      p = target;
      if (autoplaying && p === 1) holdTimer = setTimeout(() => autoplaying && play(0), INTRO_HOLD);
      if (autoplaying && p === 0) stopAutoplay();
    }
  }
  if (active.value) render();
  if (!animating && p === 0) active.value = false;
  if (animating || (visible && !reduce)) raf = requestAnimationFrame(frame);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}

// 往 to 那一头放（0 是 logo，1 是手机）。full 是从一头到另一头要多久
function play(to, full = DURATION) {
  if (!active.value) {
    measure();
    active.value = true;
  }
  from = p;
  target = to;
  open.value = to === 1;
  if (reduce) {
    // 减少动态效果：不放过程，直接到那一头
    p = target;
    animating = false;
    render();
    if (p === 0) active.value = false;
    return;
  }
  t0 = performance.now();
  dur = Math.max(300, full * Math.abs(target - from));
  animating = true;
  kick();
}

function toggle() {
  cancelIntro();
  if (autoplaying) {
    skip();
    return;
  }
  play((animating ? target : p) > 0.5 ? 0 : 1);
}

function onKey(e) {
  if (autoplaying) skip();
  else if (e.key === 'Escape' && open.value) toggle();
}

// 自动播放时用户动了（点、滚、按键）：马上快速倒回
function skip() {
  stopAutoplay();
  if (open.value || p > 0) play(0, SKIP_DURATION);
}

function stopAutoplay() {
  autoplaying = false;
  clearTimeout(holdTimer);
  removeEventListener('wheel', skip);
  removeEventListener('touchstart', skip);
  removeEventListener('scroll', skip);
}

function introPlayed() {
  try {
    return localStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

// 页面在前台、logo 在屏幕上时，停一秒再开播；条件一不满足就把计时作废，等下次满足
function scheduleIntro() {
  clearTimeout(introTimer);
  introTimer = 0;
  if (!introPending || !visible || document.visibilityState !== 'visible') return;
  introTimer = setTimeout(startIntro, INTRO_DELAY);
}

function cancelIntro() {
  introPending = false;
  clearTimeout(introTimer);
  removeEventListener('visibilitychange', scheduleIntro);
}

function startIntro() {
  if (!introPending || !visible || active.value || document.visibilityState !== 'visible') return;
  cancelIntro();
  try {
    localStorage.setItem(INTRO_KEY, '1');
  } catch {
    // 记不下就算了：下次再打开还会自动播
  }
  autoplaying = true;
  addEventListener('wheel', skip, { passive: true });
  addEventListener('touchstart', skip, { passive: true });
  addEventListener('scroll', skip, { passive: true });
  play(1);
}

function onResize() {
  if (!active.value) return;
  measure();
  render();
}

onMounted(() => {
  mounted.value = true;
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 不在屏幕上时不画，省电
  io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
    scheduleIntro();
  });
  io.observe(btn.value);
  addEventListener('keydown', onKey);
  addEventListener('resize', onResize);
  if (!reduce && !introPlayed()) {
    introPending = true;
    addEventListener('visibilitychange', scheduleIntro);
  }
});

onBeforeUnmount(() => {
  io?.disconnect();
  if (raf) cancelAnimationFrame(raf);
  cancelIntro();
  stopAutoplay();
  removeEventListener('keydown', onKey);
  removeEventListener('resize', onResize);
  if (playing) emit('playing', false);
});
</script>

<template>
  <div class="hl">
    <button ref="btn" type="button" class="hl-btn" :aria-label="label" :title="label" :aria-pressed="open ? 'true' : 'false'" @click="toggle">
      <svg ref="logo" viewBox="0 0 120 120" width="96" height="96" aria-hidden="true" :style="{ visibility: active ? 'hidden' : 'visible' }">
        <g mask="url(#nh-logo-mask)">
          <rect x="-60" y="-60" width="240" height="240" fill="#6366f1" />
          <circle v-for="(b, i) in BLOBS" :key="b.id" :ref="(el) => (idleBlobs[i] = el)" :cx="b.x" :cy="b.y" :r="b.r" :fill="`url(#${b.id})`" />
        </g>
        <circle cx="60" cy="60" r="21" fill="url(#nh-sheen)" />
      </svg>
    </button>

    <!-- 放动画的那一层：盖住整个首屏，平时不在 -->
    <div
      v-if="mounted"
      v-show="active"
      class="hl-stage"
      :style="{ left: geo.left + 'px', top: geo.top + 'px', width: geo.W + 'px', height: geo.H + 'px' }"
      @click="toggle"
    >
      <svg ref="stage" :viewBox="`0 0 ${geo.W} ${geo.H}`" :width="geo.W" :height="geo.H" aria-hidden="true">
        <defs>
          <mask id="nh-hero-mask" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000">
            <rect x="-4000" y="-4000" width="8000" height="8000" fill="#000000" />
            <g ref="braces" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="d in BRACES" :key="d" :d="d" />
            </g>
            <rect ref="win" fill="#ffffff" />
          </mask>
        </defs>
        <!-- 镜头：底色、括号、窗口、高光都在 logo 的坐标里，一起推进 -->
        <g ref="cam">
          <g mask="url(#nh-hero-mask)">
            <rect x="-60" y="-60" width="240" height="240" fill="#6366f1" />
            <circle v-for="(b, i) in BLOBS" :key="b.id" :ref="(el) => (stageBlobs[i] = el)" :cx="b.x" :cy="b.y" :r="b.r" :fill="`url(#${b.id})`" />
          </g>
          <circle ref="sheen" cx="60" cy="60" r="21" fill="url(#nh-sheen)" />
        </g>
        <g ref="phoneLayer" opacity="0">
          <rect :x="phone.x - 5" :y="phone.y - 5" :width="phone.w + 10" :height="phone.h + 10" :rx="phone.rx + 5" fill="none" stroke="#18181b" stroke-width="9" />
          <rect :x="phone.x - 10" :y="phone.y - 10" :width="phone.w + 20" :height="phone.h + 20" :rx="phone.rx + 10" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="1" />
          <rect :x="phone.cx - phone.w * 0.165" :y="phone.y + phone.h * 0.022" :width="phone.w * 0.33" :height="phone.h * 0.044" :rx="phone.h * 0.022" fill="#18181b" />
          <text :x="phone.x + phone.w * 0.11" :y="phone.y + phone.h * 0.054" :font-size="phone.h * 0.031" font-weight="600" fill="#ffffff">9:41</text>
          <rect :x="phone.cx - phone.w * 0.25" :y="phone.y + phone.h * 0.962" :width="phone.w * 0.5" height="4" rx="2" fill="#ffffff" fill-opacity=".8" />
        </g>
        <g ref="cards" opacity="0">
          <rect v-for="(r, i) in cardRects" :key="i" :x="r.x" :y="r.y" :width="r.w" :height="r.h" :rx="r.rx" fill="#ffffff" :fill-opacity="r.alpha" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hl { display: flex; justify-content: center; }
.hl-btn { display: block; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 24px; }
.hl-btn svg { display: block; transition: transform .3s cubic-bezier(.2, .8, .2, 1); }
.hl-btn:hover svg { transform: scale(1.04); }
.hl-btn:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 6px; }
.hl-stage { position: absolute; z-index: 2; perspective: 1200px; cursor: pointer; }
.hl-stage svg { display: block; transform-origin: 50% 50%; overflow: visible; }
</style>
