<script setup>
// 左边编辑器一个字一个字写出代码，右边手机跟着出效果；最后模拟点三下按钮
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({ t: { type: Object, required: true } });

const SRC = [
  "const page = new UIViewController();",
  "page.view.backgroundColor = 'systemBackground';",
  "",
  "const title = new UILabel();",
  "title.text = 'Hello, Nacre';",
  "title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });",
  "title.frame = new CGRect(24, 120, 342, 44);",
  "page.view.addSubview(title);",
  "",
  "const button = UIButton.buttonWithType('system');",
  "button.setTitle('Tap me', { forState: ['normal'] });",
  "button.frame = new CGRect(24, 180, 120, 44);",
  "page.view.addSubview(button);",
  "",
  "let count = 0;",
  "button.addEventListener('click', () => {",
  "  count += 1;",
  "  title.text = `Tapped ${count} times`;",
  "});",
];
const LISTENER = [15, 16, 17, 18];

// 够用的高亮：关键字、类名、字符串、数字、方法名
const KW = /^(const|let|new)$/;
const TY = /^(UI[A-Za-z]+|CGRect)$/;
function tokens(line) {
  const out = [];
  const re = /(`[^`]*`|'[^']*'|\d+|[A-Za-z_]+|\s+|.)/g;
  let m;
  while ((m = re.exec(line))) {
    const s = m[0];
    let c = '';
    if (s[0] === "'" || s[0] === '`') c = 's';
    else if (/^\d/.test(s)) c = 'n';
    else if (KW.test(s)) c = 'k';
    else if (TY.test(s)) c = 'ty';
    else if (/^[a-zA-Z]+$/.test(s) && line[m.index + s.length] === '(') c = 'f';
    out.push([s, c]);
  }
  return out;
}
const TOKENS = SRC.map(tokens);
function cut(i, n) {
  const out = [];
  let left = n;
  for (const [s, c] of TOKENS[i]) {
    if (left <= 0) break;
    out.push([s.slice(0, left), c]);
    left -= s.length;
  }
  return out;
}

const lines = ref([]); // [{ parts, ran, caret }]
const lit = ref(false);
const caption = ref('');
const pulse = ref('');
const title = reactive({ text: '', size: 17, weight: 400, frame: null, on: false });
const btn = reactive({ text: '', frame: null, on: false, press: false });
const touch = reactive({ on: false, down: false });
const root = ref(null);

let runId = 0;
let reduce = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function fire(dir) {
  pulse.value = '';
  requestAnimationFrame(() => (pulse.value = dir));
}

function reset() {
  lines.value = [];
  lit.value = false;
  caption.value = '';
  Object.assign(title, { text: '', size: 17, weight: 400, frame: null, on: false });
  Object.assign(btn, { text: '', frame: null, on: false, press: false });
  Object.assign(touch, { on: false, down: false });
}

const effects = {
  1: () => { lit.value = true; caption.value = props.t.captions.page; return true; },
  4: () => { title.text = 'Hello, Nacre'; },
  5: () => { title.size = 34; title.weight = 700; },
  6: () => { title.frame = [24, 120, 342, 44]; },
  7: () => { title.on = true; caption.value = props.t.captions.label; return true; },
  10: () => { btn.text = 'Tap me'; },
  11: () => { btn.frame = [24, 180, 120, 44]; },
  12: () => { btn.on = true; caption.value = props.t.captions.button; return true; },
};

async function tap(id, n) {
  touch.on = true;
  await sleep(350); if (id !== runId) return;
  touch.down = true; btn.press = true;
  await sleep(140);
  touch.down = false; btn.press = false;
  fire('back');
  LISTENER.forEach((i) => (lines.value[i].ran = true));
  await sleep(500); if (id !== runId) return;
  title.text = `Tapped ${n} time${n > 1 ? 's' : ''}`;
  await sleep(300);
  LISTENER.forEach((i) => (lines.value[i].ran = false));
  touch.on = false;
}

async function play() {
  const id = ++runId;
  reset();
  for (let i = 0; i < SRC.length; i++) {
    const line = reactive({ parts: [], ran: false, caret: true });
    lines.value.push(line);
    const text = SRC[i];
    for (let n = 0; n <= text.length; n++) {
      if (id !== runId) return;
      line.parts = cut(i, n);
      await sleep(text[n] === ' ' ? 12 : 26 + Math.random() * 30);
    }
    line.caret = false;
    if (effects[i]) {
      line.ran = true; fire('go');
      await sleep(320); if (id !== runId) return;
      const big = effects[i]();
      await sleep(big ? 900 : 380);
      line.ran = false;
    } else await sleep(text ? 90 : 160);
  }
  lines.value[lines.value.length - 1].caret = true;
  caption.value = props.t.captions.tap;
  await sleep(700);
  for (let n = 1; n <= 3; n++) {
    if (id !== runId) return;
    await tap(id, n);
    await sleep(700);
  }
  await sleep(2600);
  if (id === runId) play();
}

function showFinal() {
  runId++;
  reset();
  lines.value = SRC.map((_, i) => ({ parts: cut(i, SRC[i].length), ran: false, caret: false }));
  lit.value = true;
  Object.assign(title, { text: 'Tapped 3 times', size: 34, weight: 700, frame: [24, 120, 342, 44], on: true });
  Object.assign(btn, { text: 'Tap me', frame: [24, 180, 120, 44], on: true });
}

function replay() { reduce ? showFinal() : play(); }

const box = (f) => (f ? { left: f[0] + 'px', top: f[1] + 'px', width: f[2] + 'px', height: f[3] + 'px', lineHeight: f[3] + 'px' } : {});

let io;
onMounted(() => {
  reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  io = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) { io.disconnect(); replay(); }
  }, { threshold: 0.35 });
  io.observe(root.value);
});
onBeforeUnmount(() => { runId++; io && io.disconnect(); });
</script>

<template>
  <div ref="root">
    <div class="live">
      <div class="editor">
        <div class="bar"><i style="background:#ff5f57" /><i style="background:#febc2e" /><i style="background:#28c840" /><span>src/main.js</span><em>Nacre</em></div>
        <pre><span v-for="(l, i) in lines" :key="i" class="ln" :class="{ ran: l.ran }"><span v-for="(p, j) in l.parts" :key="j" :class="p[1]">{{ p[0] }}</span><span v-if="l.caret" class="caret" />{{ '\n' }}</span></pre>
      </div>
      <div class="bridge" aria-hidden="true"><div class="wire" /><div class="pill">Nacre</div><div class="pulse" :class="pulse" /></div>
      <div class="phone" aria-hidden="true">
        <div class="screen nh-screen" :class="{ lit }">
          <div class="cam" />
          <div class="status"><span>12:00</span><span>●●● ▮</span></div>
          <div class="pt">
            <div class="v title" :class="{ on: title.on }" :style="{ fontSize: title.size + 'px', fontWeight: title.weight, ...box(title.frame) }">{{ title.text }}</div>
            <div class="v btn" :class="{ on: btn.on, press: btn.press }" :style="box(btn.frame)">{{ btn.text }}
              <span class="touch" :class="{ on: touch.on, down: touch.down }" />
            </div>
          </div>
          <div class="home" />
        </div>
      </div>
    </div>
    <div class="cap" aria-live="polite">{{ caption }}</div>
    <button class="replay" type="button" @click="replay">{{ t.replay }}</button>
  </div>
</template>

<style scoped>
.live { display: grid; grid-template-columns: minmax(0, 1fr) 72px 300px; align-items: center; background: var(--vp-c-bg-alt); border-radius: 28px; padding: 28px; }
.editor { min-width: 0; background: #1f1f24; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, .18); align-self: stretch; display: flex; flex-direction: column; }
.bar { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; background: #2a2a30; }
.bar i { width: 12px; height: 12px; border-radius: 50%; }
.bar span { margin-left: 10px; font-size: 12px; color: #9a9aa2; }
.bar em { margin-left: auto; font: 11px var(--vp-font-family-mono); font-style: normal; color: #6b6b74; }
pre { margin: 0; padding: 16px 0; font: 13px/22px var(--vp-font-family-mono); color: #e8e8ec; flex: 1; min-height: 440px; overflow-x: auto; counter-reset: ln; }
.ln { display: block; padding-right: 18px; white-space: pre; transition: background .4s; }
.ln::before { counter-increment: ln; content: counter(ln); display: inline-block; width: 40px; padding-right: 16px; text-align: right; color: #55555e; }
.ln.ran { background: rgba(125, 211, 252, .1); }
.caret { display: inline-block; width: 2px; height: 16px; background: #7dd3fc; vertical-align: -3px; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.k { color: #ff7ab2; } .ty { color: #5dd8ff; } .s { color: #fc6a5d; } .n { color: #d0bf69; } .f { color: #67b7a4; }

.bridge { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; }
.wire { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: linear-gradient(90deg, #c7d2fe, #bae6fd, #a7f3d0, #fbcfe8); opacity: .7; }
.pill { position: relative; z-index: 1; writing-mode: vertical-rl; font-size: 10px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--vp-c-text-2); background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 99px; padding: 12px 5px; }
.pulse { position: absolute; top: 50%; left: 0; width: 10px; height: 10px; margin-top: -5px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff, #bae6fd 60%, #c7d2fe); box-shadow: 0 0 12px 4px rgba(125, 211, 252, .7); opacity: 0; }
.pulse.go { animation: travel .55s ease-in-out; }
.pulse.back { animation: travel-back .55s ease-in-out; }
@keyframes travel { 0% { left: 0; opacity: 0; } 15%, 85% { opacity: 1; } 100% { left: calc(100% - 10px); opacity: 0; } }
@keyframes travel-back { 0% { left: calc(100% - 10px); opacity: 0; } 15%, 85% { opacity: 1; } 100% { left: 0; opacity: 0; } }

.phone { width: 300px; height: 610px; border-radius: 52px; background: #111; padding: 11px; box-shadow: 0 24px 60px rgba(0, 0, 0, .25), inset 0 0 0 2px #3a3a3c; }
.screen { --fg: #000; --bgc: #fff; width: 278px; height: 588px; border-radius: 42px; overflow: hidden; position: relative; background: #000; transition: background .5s; }
.screen.lit { background: var(--bgc); }
.cam { position: absolute; top: 14px; left: 50%; width: 14px; height: 14px; margin-left: -7px; background: #111; border-radius: 50%; z-index: 3; }
.status { position: absolute; top: 14px; left: 30px; right: 26px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--fg); opacity: 0; transition: opacity .5s; z-index: 2; }
.lit .status { opacity: 1; }
.home { position: absolute; bottom: 8px; left: 50%; width: 100px; height: 4px; margin-left: -50px; border-radius: 2px; background: var(--fg); opacity: 0; transition: opacity .5s; }
.lit .home { opacity: .85; }
.pt { position: absolute; left: 0; top: 0; width: 390px; height: 824px; transform: scale(.7128); transform-origin: 0 0; }
.v { position: absolute; opacity: 0; transform: translateY(8px) scale(.98); transition: opacity .45s, transform .45s cubic-bezier(.2, .8, .2, 1); }
.v.on { opacity: 1; transform: none; }
.title { color: var(--fg); white-space: nowrap; }
.btn { font-size: 17px; color: #0a84ff; transition: opacity .45s, transform .45s cubic-bezier(.2, .8, .2, 1), color .1s; }
.btn.press { color: rgba(10, 132, 255, .35); }
.touch { position: absolute; left: 22px; top: 50%; width: 54px; height: 54px; margin-top: -27px; border-radius: 50%; background: rgba(127, 127, 127, .25); border: 2px solid rgba(127, 127, 127, .3); opacity: 0; transition: opacity .2s, transform .2s; }
.touch.on { opacity: 1; }
.touch.down { transform: scale(.82); }
.cap { text-align: center; font-size: 14px; color: var(--vp-c-text-2); margin-top: 14px; min-height: 22px; }
.replay { display: block; margin: 6px auto 0; font-size: 13px; color: var(--vp-c-brand-1); cursor: pointer; }

@media (max-width: 860px) {
  .live { grid-template-columns: 1fr; gap: 20px; padding: 16px; border-radius: 20px; }
  .bridge { height: 40px; }
  .pill { writing-mode: horizontal-tb; padding: 5px 12px; }
  .phone { margin: 0 auto; }
  pre { min-height: 0; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .caret, .pulse { animation: none; }
}
</style>

<style>
/* 深色模式下手机屏幕跟着变黑。Vue 的 scoped 样式里写不了「祖先是 .dark」，放这里 */
.dark .nh-screen { --fg: #fff; --bgc: #000; }
.dark .nh-screen.lit { box-shadow: inset 0 0 0 1px #2c2c2e; }
</style>
