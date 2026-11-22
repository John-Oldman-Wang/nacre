<script setup>
// 三片叠起来的薄片：光点往下穿过，到底泛起一圈，再往上回。右边的说明跟着光点亮
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({ t: { type: Object, required: true } });

const CX = 280, HW = 200, HH = 62;
const LAYERS = [110, 220, 330].map((cy, i) => ({ cy, fill: `nh-lay${i + 1}` }));
const poly = (cy) => `${CX - HW},${cy} ${CX},${cy - HH} ${CX + HW},${cy} ${CX},${cy + HH}`;
const edge = (cy) => `${CX - HW},${cy} ${CX},${cy + HH} ${CX + HW},${cy} ${CX + HW},${cy + 8} ${CX},${cy + HH + 8} ${CX - HW},${cy + 8}`;

const dotY = ref(null);
const ripple = ref(0);
const step = ref(-1);
const root = ref(null);

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const Y0 = 40, Y1 = 330, CYCLE = 7200;

let raf = 0, start = null, reduce = false, io;
function frame(now) {
  if (start === null) start = now;
  const t = reduce ? 3200 : (now - start) % CYCLE;
  const d = seg(t, 300, 2700), u = seg(t, 3900, 6300);
  let y = null, s = -1;
  if (d > 0 && d < 1) { y = Y0 + (Y1 - Y0) * ease(d); s = y < 165 ? 0 : y < 275 ? 1 : 2; }
  else if (u > 0 && u < 1) { y = Y1 - (Y1 - Y0) * ease(u) * 0.75; s = 3; }
  else if (t >= 2700 && t < 3900) s = 2;
  dotY.value = y;
  step.value = reduce ? -1 : s;
  ripple.value = reduce ? 0 : seg(t, 2700, 3700);
  if (!reduce) raf = requestAnimationFrame(frame);
}
const near = (cy) => dotY.value !== null && Math.abs(dotY.value - cy) < 34;

onMounted(() => {
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  io = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) { io.disconnect(); raf = requestAnimationFrame(frame); }
  }, { threshold: 0.3 });
  io.observe(root.value);
});
onBeforeUnmount(() => { cancelAnimationFrame(raf); io && io.disconnect(); });
</script>

<template>
  <div class="rt" ref="root">
    <svg viewBox="0 0 560 420" role="img" :aria-label="t.title">
      <defs>
        <linearGradient id="nh-lay1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e0e7ff" /><stop offset="1" stop-color="#e0f2fe" /></linearGradient>
        <linearGradient id="nh-lay2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e0f2fe" /><stop offset="1" stop-color="#d1fae5" /></linearGradient>
        <linearGradient id="nh-lay3" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#d1fae5" /><stop offset="1" stop-color="#fce7f3" /></linearGradient>
        <filter id="nh-blur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <!-- 下面的层先画，上面的盖住 -->
      <g v-for="(l, i) in LAYERS.slice().reverse()" :key="l.cy" class="layer" :class="{ up: near(l.cy) }">
        <polygon :points="edge(l.cy)" fill="#c7d2fe" opacity=".35" />
        <polygon :points="poly(l.cy)" :fill="`url(#${l.fill})`" stroke="#a5b4fc" :stroke-width="near(l.cy) ? 2 : 1" />
        <text :x="CX" :y="l.cy - 4" text-anchor="middle" class="l1">{{ t.layers[2 - i][0] }}</text>
        <text :x="CX" :y="l.cy + 15" text-anchor="middle" class="l2">{{ t.layers[2 - i][1] }}</text>
      </g>
      <ellipse :cx="CX" cy="330" :rx="10 + 150 * ripple" :ry="5 + 46 * ripple" fill="none" stroke="#0ea5e9" stroke-width="1.5" :opacity="ripple > 0 && ripple < 1 ? 0.7 * (1 - ripple) : 0" />
      <template v-if="dotY !== null">
        <circle :cx="CX" :cy="dotY" r="14" fill="#7dd3fc" filter="url(#nh-blur)" opacity=".8" />
        <circle :cx="CX" :cy="dotY" r="7" fill="url(#nh-pearl-shine)" stroke="#fff" stroke-width="1.5" />
      </template>
    </svg>
    <ol>
      <li v-for="(s, i) in t.steps" :key="i" :class="{ on: step === i }"><b>{{ s[0] }}</b>{{ s[1] }}</li>
    </ol>
  </div>
</template>

<style scoped>
.rt { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: center; }
svg { width: 100%; height: auto; display: block; }
.layer { transition: transform .35s; }
.layer.up { transform: translateY(-6px); }
.l1 { font-size: 15px; font-weight: 600; fill: #1d1d1f; }
.l2 { font-size: 12px; fill: #6e6e73; }
ol { list-style: none; padding: 0; margin: 0; counter-reset: s; }
li { position: relative; padding: 0 0 22px 40px; color: var(--vp-c-text-2); font-size: 15px; line-height: 1.55; transition: color .3s; }
li::before { counter-increment: s; content: counter(s); position: absolute; left: 0; top: 0; width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--vp-c-divider); font-size: 12px; display: grid; place-items: center; color: var(--vp-c-text-3); transition: all .3s; }
li b { display: block; color: var(--vp-c-text-1); font-size: 16px; margin-bottom: 2px; }
li.on { color: var(--vp-c-text-1); }
li.on::before { background: var(--vp-c-text-1); border-color: var(--vp-c-text-1); color: var(--vp-c-bg); }
@media (max-width: 860px) { .rt { grid-template-columns: 1fr; gap: 24px; } }
</style>
