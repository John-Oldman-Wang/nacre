<script setup>
// 站点首页。中英两份 index.md 都只放这一个组件，文案在 copy.mjs
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { withBase } from 'vitepress';
import copy, { caps, commands } from './copy.mjs';
import { data as stats } from './stats.data.mjs';
import Waves from './Waves.vue';
import LiveDemo from './LiveDemo.vue';
import RuntimeLayers from './RuntimeLayers.vue';

const props = defineProps({ lang: { type: String, default: 'en' } });
const t = computed(() => copy[props.lang] ?? copy.en);
const prefix = computed(() => (props.lang === 'zh' ? '/zh' : ''));
const href = (p) => withBase(prefix.value + p);
// 页脚里站外的链接原样用，站内的加语言前缀
const link = (p) => (p.startsWith('http') ? p : href(p));

const statList = computed(() => [stats.classes, stats.members, stats.guides, stats.capabilities].map((n, i) => ({ n, label: t.value.stats[i] })));
const shown = ref(statList.value.map((s) => s.n));

const copied = ref(-1);
function copyCmd(i) {
  navigator.clipboard?.writeText(commands[i]).catch(() => {});
  copied.value = i;
  setTimeout(() => (copied.value = -1), 1200);
}

const root = ref(null);
let ios = [];
onMounted(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = root.value.querySelectorAll('.reveal');
  if (reduce) { items.forEach((n) => n.classList.add('in')); return; }
  // 进入视野时淡入一次，同一组里依次错开一点
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sib = [...e.target.parentElement.children].filter((n) => n.classList.contains('reveal'));
    e.target.style.transitionDelay = Math.min(sib.indexOf(e.target), 8) * 60 + 'ms';
    e.target.classList.add('in');
    rio.unobserve(e.target);
  }), { threshold: 0.12 });
  items.forEach((n) => rio.observe(n));
  // 数字从 0 数上去
  shown.value = statList.value.map(() => 0);
  const sio = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    sio.disconnect();
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 1400);
      shown.value = statList.value.map((s) => Math.round(s.n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.5 });
  sio.observe(root.value.querySelector('.stats'));
  ios = [rio, sio];
});
onBeforeUnmount(() => ios.forEach((o) => o.disconnect()));
</script>

<template>
  <div class="nh" ref="root">
    <!-- 全页共用的渐变和 logo -->
    <svg width="0" height="0" style="position: absolute" aria-hidden="true">
      <defs>
        <linearGradient id="nh-pearl-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#c7d2fe" /><stop offset=".35" stop-color="#bae6fd" /><stop offset=".6" stop-color="#a7f3d0" /><stop offset=".85" stop-color="#fbcfe8" /><stop offset="1" stop-color="#c7d2fe" />
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="10s" repeatCount="indefinite" />
        </linearGradient>
        <radialGradient id="nh-pearl-body" cx=".38" cy=".34" r=".75">
          <stop offset="0" stop-color="#ffffff" /><stop offset=".55" stop-color="#eef2ff" stop-opacity=".6" /><stop offset="1" stop-color="#c7d2fe" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="nh-wave-stroke" x1="0" x2="1">
          <stop offset="0" stop-color="#a5b4fc" /><stop offset=".33" stop-color="#7dd3fc" /><stop offset=".66" stop-color="#6ee7b7" /><stop offset="1" stop-color="#f9a8d4" />
        </linearGradient>
        <symbol id="nh-logo" viewBox="0 0 120 120">
          <path d="M38 20 Q24 20 24 36 L24 48 Q24 60 13 60 Q24 60 24 72 L24 84 Q24 100 38 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M82 20 Q96 20 96 36 L96 48 Q96 60 107 60 Q96 60 96 72 L96 84 Q96 100 82 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="60" cy="60" r="21" fill="url(#nh-pearl-shine)" />
          <circle cx="60" cy="60" r="21" fill="url(#nh-pearl-body)" />
        </symbol>
      </defs>
    </svg>

    <!-- 1 首屏 -->
    <header class="hero">
      <Waves />
      <div class="wrap inner">
        <svg class="logo" width="96" height="96" aria-hidden="true"><use href="#nh-logo" /></svg>
        <h1>{{ t.hero.title1 }}<br />{{ t.hero.title2 }}<span class="sheen">{{ t.hero.titleSheen }}</span></h1>
        <p class="lead">{{ t.hero.lead }}</p>
        <div class="cta">
          <a class="btn primary" :href="href('/guides/your-own-app')">{{ t.hero.primary }}</a>
          <a class="btn ghost" :href="href('/api/')">{{ t.hero.secondary }}</a>
        </div>
      </div>
    </header>

    <!-- 2 演示 -->
    <section class="band">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.demo.eyebrow }}</div>
        <h2 class="reveal">{{ t.demo.title }}</h2>
        <p class="sub reveal">{{ t.demo.sub }}</p>
        <LiveDemo :t="t.demo" />
      </div>
    </section>

    <!-- 3 三个支柱 -->
    <section class="band alt">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.pillars.eyebrow }}</div>
        <h2 class="reveal">{{ t.pillars.title }}</h2>
        <p class="sub reveal">{{ t.pillars.sub }}</p>
        <div class="pillars">
          <div v-for="(p, i) in t.pillars.items" :key="i" class="pillar nh-pillar reveal">
            <span class="tag">{{ p.tag }}</span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
            <pre v-if="i === 0"><span class="k">const</span> view = <span class="k">new</span> <span class="ty">UIView</span>();
view.layer.cornerRadius = <span class="n">16</span>;
view.backgroundColor = <span class="s">'systemTeal'</span>;</pre>
            <pre v-else-if="i === 1"><span class="k">const</span> res = <span class="k">await</span> fetch(<span class="s">'https://api.example.com/me'</span>);
<span class="k">const</span> me = <span class="k">await</span> res.json();
label.text = <span class="s">`Hi, ${</span>me.name<span class="s">}`</span>;</pre>
            <pre v-else>button.<span class="err">titel</span> = <span class="s">'Save'</span>;<span class="hint">Property 'titel' does not exist on type 'UIButton'.</span></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 4 运行时 -->
    <section class="band">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.runtime.eyebrow }}</div>
        <h2 class="reveal">{{ t.runtime.title }}</h2>
        <p class="sub reveal">{{ t.runtime.sub }}</p>
        <RuntimeLayers :t="t.runtime" />
      </div>
    </section>

    <!-- 5 能力地图 -->
    <section class="band alt">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.caps.eyebrow }}</div>
        <h2 class="reveal">{{ t.caps.title }}</h2>
        <p class="sub reveal">{{ t.caps.sub }}</p>
        <div class="cap-head reveal"><h3>{{ t.caps.core }}</h3><span>{{ t.caps.coreNote }}</span></div>
        <div class="caps">
          <a v-for="c in caps.core" :key="c.link" class="cap reveal" :href="href(c.link)"><b>{{ c[lang] ?? c.en }}</b><code>{{ lang === 'zh' && c.zhApi ? c.zhApi : c.api }}</code></a>
        </div>
        <div class="cap-head reveal"><h3>{{ t.caps.pkgs }}</h3><span>{{ t.caps.pkgsNote }}</span></div>
        <div class="caps">
          <a v-for="c in caps.pkgs" :key="c.link" class="cap pkg reveal" :href="href(c.link)"><b>{{ c[lang] ?? c.en }}</b><code>{{ c.api }}</code></a>
        </div>
      </div>
    </section>

    <!-- 6 三步开始 -->
    <section class="band">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.start.eyebrow }}</div>
        <h2 class="reveal">{{ t.start.title }}</h2>
        <p class="sub reveal">{{ t.start.sub }}</p>
        <div class="steps">
          <div v-for="(s, i) in t.start.steps" :key="i" class="step reveal">
            <span class="no">{{ i + 1 }}</span>
            <h3>{{ s[0] }}</h3>
            <p>{{ s[1] }}</p>
            <div class="term"><code>{{ commands[i] }}</code><button type="button" class="copy" @click="copyCmd(i)">{{ copied === i ? t.start.copied : t.start.copy }}</button></div>
          </div>
        </div>
        <p class="more reveal"><a :href="href('/guides/your-own-app')">{{ t.start.guide }} →</a></p>
      </div>
    </section>

    <!-- 7 验证和数字 -->
    <section class="band alt">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.proof.eyebrow }}</div>
        <h2 class="reveal">{{ t.proof.title }}</h2>
        <p class="sub reveal">{{ t.proof.sub }}</p>
        <div class="stats">
          <div v-for="(s, i) in statList" :key="i" class="stat reveal"><b>{{ shown[i].toLocaleString('en-US') }}</b><span>{{ s.label }}</span></div>
        </div>
      </div>
    </section>

    <!-- 7.5 性能：只放自己实测的数 -->
    <section class="band">
      <div class="wrap">
        <div class="eyebrow reveal">{{ t.perf.eyebrow }}</div>
        <h2 class="reveal">{{ t.perf.title }}</h2>
        <div class="perf">
          <div v-for="(p, i) in t.perf.items" :key="i" class="perf-item reveal"><b>{{ p[0] }}</b><span>{{ p[1] }}</span></div>
        </div>
        <p class="perf-note reveal">{{ t.perf.note }}</p>
      </div>
    </section>

    <!-- 8 收尾 -->
    <section class="end">
      <Waves :count="6" :top="120" :gap="60" />
      <div class="wrap inner">
        <svg class="reveal" width="64" height="64" aria-hidden="true"><use href="#nh-logo" /></svg>
        <h2 class="reveal">{{ t.end.title }}</h2>
        <p class="sub reveal">{{ t.end.sub }}</p>
        <div class="cta reveal">
          <a class="btn primary" :href="href('/guides/your-own-app')">{{ t.hero.primary }}</a>
          <a class="btn ghost" :href="href('/api/')">{{ t.hero.secondary }}</a>
        </div>
      </div>
    </section>

    <!-- 9 页脚 -->
    <footer class="foot">
      <div class="wrap">
        <div class="foot-cols">
          <div v-for="c in t.footer.cols" :key="c.title" class="foot-col">
            <h4>{{ c.title }}</h4>
            <a v-for="l in c.links" :key="l[1]" :href="link(l[1])" :target="l[1].startsWith('http') ? '_blank' : undefined" :rel="l[1].startsWith('http') ? 'noopener' : undefined">{{ l[0] }}</a>
          </div>
        </div>
        <p class="foot-note">
          <svg width="20" height="20" aria-hidden="true"><use href="#nh-logo" /></svg>
          <span>{{ t.footer.note }}</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nh { color: var(--vp-c-text-1); }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
.inner { position: relative; z-index: 1; }
.logo, .end svg { color: var(--vp-c-text-1); display: block; margin: 0 auto; }

.hero { position: relative; overflow: hidden; padding: 88px 0 96px; text-align: center; }
h1 { font-size: 64px; line-height: 1.05; letter-spacing: -0.035em; margin: 24px 0 0; font-weight: 700; }
.sheen { background: linear-gradient(100deg, #6366f1, #0ea5e9 35%, #10b981 60%, #ec4899 85%, #6366f1); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: nh-slide 9s linear infinite; }
@keyframes nh-slide { to { background-position: -200% 0; } }
.lead { font-size: 21px; color: var(--vp-c-text-2); max-width: 640px; margin: 20px auto 0; line-height: 1.5; }
.cta { display: flex; justify-content: center; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
.btn { padding: 11px 22px; border-radius: 980px; font-size: 15px; font-weight: 500; text-decoration: none; transition: background .2s, border-color .2s; }
.btn.primary { background: var(--vp-button-brand-bg); color: var(--vp-button-brand-text); }
.btn.primary:hover { background: var(--vp-button-brand-hover-bg); }
.btn.ghost { border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); background: var(--vp-c-bg); }
.btn.ghost:hover { border-color: var(--vp-c-text-3); }

.band { padding: 96px 0; }
.band.alt { background: var(--vp-c-bg-alt); }
.eyebrow { font-size: 13px; letter-spacing: .06em; text-transform: uppercase; color: var(--vp-c-text-3); text-align: center; }
h2 { font-size: 40px; line-height: 1.15; letter-spacing: -0.03em; text-align: center; margin: 10px 0 0; font-weight: 700; border: 0; padding: 0; }
.sub { text-align: center; color: var(--vp-c-text-2); font-size: 17px; margin: 12px auto 36px; max-width: 680px; line-height: 1.5; }

.reveal { opacity: 0; transform: translateY(16px); transition: opacity .7s ease, transform .7s cubic-bezier(.2, .8, .2, 1); }
.reveal.in { opacity: 1; transform: none; }

.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.pillar { min-width: 0; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 22px; padding: 26px 24px 24px; display: flex; flex-direction: column; }
.tag { font: 12px var(--vp-font-family-mono); color: var(--vp-c-text-3); }
.pillar h3 { font-size: 21px; letter-spacing: -0.02em; margin: 10px 0 8px; }
.pillar p { margin: 0 0 18px; color: var(--vp-c-text-2); font-size: 15px; line-height: 1.55; flex: 1; }
.pillar pre { margin: 0; background: var(--vp-c-bg-alt); border-radius: 12px; padding: 14px 16px; font: 12.5px/1.65 var(--vp-font-family-mono); color: var(--vp-c-text-1); overflow-x: auto; white-space: pre; }
.pillar .k { color: #ad3da4; } .pillar .ty { color: #0b6bcb; } .pillar .s { color: #c41a16; } .pillar .n { color: #1c00cf; }
.err { text-decoration: underline wavy #ff3b30; text-underline-offset: 3px; }
.hint { display: block; margin-top: 6px; font-size: 11.5px; color: #ff3b30; white-space: normal; }

.cap-head { display: flex; align-items: baseline; gap: 12px; margin: 40px 0 14px; }
.cap-head h3 { margin: 0; font-size: 19px; }
.cap-head span { color: var(--vp-c-text-2); font-size: 14px; }
.caps { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
.cap { background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 16px; padding: 16px 18px; text-decoration: none; color: inherit; transition: border-color .2s, transform .2s, opacity .7s ease; }
.cap:hover { border-color: var(--vp-c-text-3); }
.cap b { display: block; font-size: 15px; font-weight: 600; }
.cap code { display: block; margin-top: 6px; font: 12px var(--vp-font-family-mono); color: var(--vp-c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: none; padding: 0; }
.cap.pkg { background: transparent; border-style: dashed; }
.cap.pkg code { color: var(--vp-c-brand-1); }

.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.step { min-width: 0; border: 1px solid var(--vp-c-divider); border-radius: 22px; padding: 24px; background: var(--vp-c-bg); display: flex; flex-direction: column; }
.no { font: 13px var(--vp-font-family-mono); color: var(--vp-c-text-3); }
.step h3 { margin: 8px 0 6px; font-size: 19px; }
.step p { margin: 0 0 16px; color: var(--vp-c-text-2); font-size: 14.5px; line-height: 1.55; flex: 1; }
.term { position: relative; background: #1f1f24; border-radius: 12px; padding: 14px 52px 14px 16px; }
.term code { display: block; font: 12.5px/1.6 var(--vp-font-family-mono); color: #e8e8ec; white-space: pre-wrap; word-break: break-word; background: none; padding: 0; }
.term code::before { content: '$ '; color: #6b6b74; }
.copy { position: absolute; top: 10px; right: 10px; font-size: 11px; color: #9a9aa2; background: #2a2a30; border-radius: 6px; padding: 4px 7px; cursor: pointer; }
.more { text-align: center; margin-top: 28px; font-size: 15px; }
.more a { color: var(--vp-c-brand-1); text-decoration: none; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
.stat b { display: block; font-size: 52px; line-height: 1.1; letter-spacing: -0.04em; font-weight: 700; font-variant-numeric: tabular-nums; }
.stat:first-child b { background: linear-gradient(100deg, #6366f1, #0ea5e9); -webkit-background-clip: text; background-clip: text; color: transparent; }
.stat span { display: block; margin-top: 6px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.45; }

.perf { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
.perf-item { min-width: 0; border: 1px solid var(--vp-c-divider); border-radius: 22px; padding: 28px 24px 24px; background: var(--vp-c-bg); text-align: center; }
.perf-item b { display: block; font-size: 48px; line-height: 1.1; letter-spacing: -0.04em; font-weight: 700; font-variant-numeric: tabular-nums; }
.perf-item span { display: block; margin-top: 10px; color: var(--vp-c-text-2); font-size: 14.5px; line-height: 1.5; }
.perf-note { text-align: center; margin: 20px 0 0; font-size: 12.5px; color: var(--vp-c-text-3); }

.end { position: relative; overflow: hidden; text-align: center; padding: 110px 0 120px; }
.end h2 { font-size: 48px; }

.foot { border-top: 1px solid var(--vp-c-divider); padding: 48px 0 40px; }
.foot-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.foot-col h4 { margin: 0 0 12px; font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.foot-col a { display: block; margin: 0 0 8px; font-size: 13.5px; color: var(--vp-c-text-2); text-decoration: none; }
.foot-col a:hover { color: var(--vp-c-brand-1); }
.foot-note { display: flex; align-items: center; gap: 8px; margin: 32px 0 0; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); font-size: 12.5px; color: var(--vp-c-text-3); }
.foot-note svg { color: var(--vp-c-text-2); flex: none; }

@media (max-width: 860px) {
  h1 { font-size: 42px; }
  .lead { font-size: 17px; }
  h2, .end h2 { font-size: 30px; }
  .band { padding: 64px 0; }
  .pillars, .steps { grid-template-columns: 1fr; }
  .stats { grid-template-columns: repeat(2, 1fr); row-gap: 32px; }
  .stat b { font-size: 40px; }
  .foot-cols { grid-template-columns: repeat(2, 1fr); row-gap: 28px; }
  .perf { grid-template-columns: 1fr; }
  .perf-item b { font-size: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .sheen { animation: none; }
  .reveal { transition: none; }
}
</style>

<style>
/* 深色模式下代码的配色。Vue 的 scoped 样式里写不了「祖先是 .dark」，放这里 */
.dark .nh-pillar .k { color: #ff7ab2; }
.dark .nh-pillar .ty { color: #5dd8ff; }
.dark .nh-pillar .s { color: #fc6a5d; }
.dark .nh-pillar .n { color: #d0bf69; }
</style>
