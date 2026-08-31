# AGENTS.md — دليل الوكيل لإنتاج فيديوهات (أي مجال محتوى، حسب ملف الهوية)

> ⚠️ **تنبيه حاسم**: `agent.js` مفيهوش أي subcommand اسمه "render". **ممنوع
> منعًا باتًا تنفّذ `node agent.js`** كأمر terminal من جوه جلستك — ده مش أداة
> رندر، ده نفس العقل اللي بيكلمك دلوقتي، وتشغيله هيبدأ جلسة Agent كاملة تانية
> من الصفر فوق نفس الريبو ونفس الـ Release، وهيضيع تقدمك الحالي بالكامل. الرندر
> سكريبت Node.js منفصل **إنت اللي بتكتبه** (`render-runner.js`) وتشغّله بـ
> `node render-runner.js` — النسخة الكاملة موجودة في القسم 5 تحت، انسخها زي ما هي.

---

## 1. مين انت

انت Agent مسؤول عن إنتاج فيديو كامل من الصفر — صوت وصورة ونص — في أي
مجال محتوى. مفيش مجال "افتراضي": المجال، شكل المحتوى، وطريقة جلب أصوله بالكامل
قرار ملف الهوية اللي المستخدم بيسميه. المستخدم بيقولك: اسم ملف هوية من
`identities/` + طلبه. إنت: تفتح الملف وتفهمه، تكتب `scene.html`، ترندره،
وترفعه على GitHub Release.

**استثناء**: لو المستخدم بعت كود مشهد جاهز (بأي شكل) وطلب استخراج هويته
البصرية كملف جديد جوه `identities/`، ده مش إنتاج فيديو عادي — اقرا `skill.md`
كامل الأول واتبعه بدقة، بدل خطوات القسم 2 تحت.

**استثناء تاني**: لو المستخدم بعت `scene.html` جاهز (مكتوب مسبقًا) وطلب
رندره مباشرة (بيسمّي هوية `build`)، ده مش كتابة هوية من الصفر — اقرا
`identities/build.md` واتبعه بدل خطوات القسم 2 تحت.

**استثناء تالت**: لو المستخدم بعت **قايمة روابط مرتبة** لأكتر من ملف
`scene.html` جاهز (بيسمّي هوية `sequence`)، وطلب رندرهم ودمجهم في فيديو
واحد — أو حتى دمج فيديو نهائي سابق مع مشاهد جديدة بعده — ده مش رندر ملف
واحد ولا كتابة هوية، اقرا `identities/sequence.md` واتبعه بدل خطوات
القسم 2 والقسم 5 تحت.

**قبل أي حاجة تانية، افهم طلب المستخدم الفعلي** — مش كل طلب معناه تنفيذ خط
الأنابيب الكامل (هوية → `scene.html` → رندر → رفع على Release) من الصفر:
- لو طلب تصميم موصوف مباشرة في رسالته، من غير ما يشاور على ملف هوية موجود،
  ده طلب صالح برضه — مفيش إلزام إن كل تصميم لازم يكون له ملف هوية مسبق.
- لو طلبه تعديل بسيط على فيديو أو `scene.html` اشتغلت عليه قبل كده في نفس
  الجلسة، عدّل الموجود بدل ما تعيد الكتابة من الصفر.
- لو طلبه مش عن إنتاج فيديو خالص (سؤال، فحص، أو `scene.html` بس من غير رندر
  فعلي)، نفّذ اللي طلبه بالظبط ولا تكمّل خطوات زيادة (رندر/رفع) ما طلبهاش.
- لو مش متأكد إيه المطلوب بالظبط، اسأل — بدل ما تفترض الحالة الافتراضية
  (فيديو كامل جديد من هوية).

## 2. إزاي تكتب `scene.html`

1. افهم طلب المستخدم، وحدد أي ملف هوية من `identities/` طلبه بالاسم — لو مش
   واضح من طلبه، اسأله بدل ما تفترض أو "تتذكر" هوية استخدمتها قبل كده.
2. افتح الملف المطلوب واقرأه كامل، أكتر من مرة لو محتاج. هو **وصف تفصيلي**
   (أبعاد، ألوان، خطوط، حركة، شكل بيانات المحتوى المطلوبة، وطريقة جلب أي أصول
   محتاجها) — **مش كود جاهز تنسخه**. إنت اللي هتكتب الكود من فهمك له. لو فيه
   قسم "ملاحظات معروفة" في آخره، اقرأه.
3. كل حاجة عن شكل المحتوى المطلوب وطريقة جلب أصوله (صوت/صورة/فيديو) قرار الملف
   ده بس — مفيش افتراض هنا في `AGENTS.md`. أي نص أو بيانات مفروض حقيقيتها،
   مصدرها فعل حقيقي في نفس المهمة، بالطريقة اللي الملف حددها — مش من دماغك،
   
4. اكتب `scene.html`: **طبقة الهوية** (كودك انت، بناءً على فهمك للملف) فوق، ثم
   **الطبقة التقنية الثابتة** (تنسخه زى ما هو و يبقى قابل للتعديل فى حاله وحود اخطاء) تحت
   — الاتنين في نفس `<script type="module">` واحد.
5. طبقة الهوية لازم تعرّف بالاسم ده بالظبط عشان الطبقة التقنية تشتغل:
   `CONFIG` (`{fps, width, height, duration}`)، `OUTPUT_FILENAME`، `audioBuffer`
   (أو `null` صراحة لو من غير صوت)، `async prepareIdentity()`،
   `async drawSceneAtTime(time)` (دايمًا `async`). متاح ليك تلقائيًا من غير
   استيراد أو إعادة تعريف: `ctx`، `layoutArabicParagraph(...)`، `Easing`،
   `clamp01(val)`، `toArabicDigits(input)`، `fetchAndDecodeAudio(url)`،
   `concatenateAudioBuffers(buffers)`، `createBrollFrameSampler(url, options?)`.

6. قارن الكود اللي كتبته بند ببند مقابل كل قسم في ملف الهوية (الهندسة
والإحداثيات، الألوان، الخطوط وأحجامها، صيغ الحركة، الخلفية، الأصول، شكل
المحتوى) — مش بس قيم المحتوى. أي قيمة مكتوبة في ملف الهوية لازم تلاقي مقابلها
الدقيق في الكود، وإلا صححه قبل ما تكمل للرندر الكامل: اعرض `scene.html` بأمر `cat scene.html` واقرأه
   كامل من الملف الفعلي على القرص (**ممنوع `grep` أو فحص جزئي**) — قارن قيم
   بيانات المحتوى بالمطلوب فعليًا واتأكد ان كل المطلوب فى ملف الهويه تم تنفيذه في المهمة، وتأكد `prepareIdentity`/
   `drawSceneAtTime` موجودين بنفس الاسمين. بعد كده افتحه headless لكام ثانية
   واتأكد مفيش `pageerror` **ولا فشل تحضير الهوية نفسها** (فشل جلب صوت/خط/صورة
   داخل `prepareIdentity()` بيتلقط بأدب جوه try/catch ويحط `renderStatus='error'`
   من غير ما يرمي `pageerror` خالص — فحص `pageerror` بس عمى تمامًا عن النوع ده
   من الفشل، ومكانه الصح هنا مش بعد دقايق من رندر كامل). **إلزامي: اكتب الكود
   ده بالحرف عن طريق `cat << 'EOF' > _headless_check.js` في ملف حقيقي على
   القرص، وشغّله بـ `node _headless_check.js` — بالظبط زي `render-runner.js`
   في القسم 5. ممنوع تمامًا تشغيله inline عبر `node -e "..."`: أي `${...}` جوه
   الكود هيتفسّر غلط كمتغيّر bash لأنه جوه علامتي تنصيص مزدوجتين، وده هيكسر
   الرابط بصمت. وممنوع كمان تعيد كتابة الكود من الذاكرة — انسخه زي ما هو
   حرفيًا؛ التعديل المسموح الوحيد هو قيمة `CHECK_TIMEOUT_MS` نفسها لو الهوية
   محتاجة وقت تحضير أطول، أي حاجة تانية في الكود ممنوع تتلمس.**
   ```js
   const { chromium } = require('playwright');
   const http = require('http');
   const fs = require('fs');
   const path = require('path');

   const CHECK_TIMEOUT_MS = 15000; // وقت كافٍ لتحضير الهوية (جلب صوت/خط/صورة حقيقي) — القيمة الوحيدة المسموح تعديلها هنا

   (async () => {
     const server = http.createServer((req, res) => {
       fs.readFile(path.join(process.cwd(), req.url.split('?')[0]), (err, data) => {
         if (err) { res.writeHead(404); res.end(); return; }
         res.writeHead(200); res.end(data);
       });
     });
     await new Promise(r => server.listen(0, r));
     const port = server.address().port;
     const browser = await chromium.launch({ channel: 'chrome' });
     const page = await browser.newPage();

     let pageErr = null;
     const failedRequests = [];
     page.on('pageerror', (err) => { pageErr = err.message; });
     page.on('requestfailed', (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`));
     page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.url()} — HTTP ${res.status()}`); });

     await page.goto(`http://localhost:${port}/scene.html`);

     const start = Date.now();
     let status = null;
     while (Date.now() - start < CHECK_TIMEOUT_MS) {
       status = await page.evaluate(() => window.renderStatus).catch(() => null);
       if (status === 'ready' || status === 'error' || pageErr) break;
       await page.waitForTimeout(200);
     }

     await browser.close();
     server.close();

     if (pageErr) { console.log('SYNTAX_ERROR:', pageErr); process.exit(1); }
     if (status === 'error') {
       const errMsg = await page.evaluate(() => window.__renderError).catch(() => 'غير معروف');
       console.log('SYNTAX_ERROR:', errMsg, '| failed_requests:', JSON.stringify(failedRequests));
       process.exit(1);
     }
     if (status !== 'ready') {
       console.log(`SYNTAX_ERROR: التحضير لم يكتمل خلال ${CHECK_TIMEOUT_MS / 1000} ثانية (renderStatus=${status})`);
       process.exit(1);
     }
     if (failedRequests.length) {
       console.log('SYNTAX_ERROR: طلبات فشلت رغم renderStatus=ready:', JSON.stringify(failedRequests));
       process.exit(1);
     }
     console.log('SCENE_OK');
   })();
   ```
   لو طبع `SYNTAX_ERROR`، رجع اصلح `scene.html` الأول — ممنوع تكمّل على الرندر
   الكامل.

---

## 3. الطبقة التقنية 

هيكل `<head>`/`<body>` الثابت (الأماكن المعلّمة بـ 🎨 بتتملى من ملف الهوية):

```html
<!DOCTYPE html>
<html lang="🎨IDENTITY_LANG🎨" dir="🎨IDENTITY_DIR🎨">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎨 IDENTITY: عنوان مناسب لمحتوى الفيديو 🎨</title>

    <!-- 🎨 IDENTITY: روابط الخطوط -->

    <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />

    <!-- 🎨 IDENTITY: كتلة الـ CSS كاملة -->
    <style>
    </style>
</head>
<body>
    <div id="viewport">
        <!-- 🎨 IDENTITY: width/height من ملف الهوية -->
        <canvas id="videoCanvas"></canvas>
        <div id="hud"><div class="spinner" id="spinner"></div><span id="status-text">جاري تحضير الفيديو...</span></div>
        <div id="controls-overlay">
            <button class="btn btn-preview" id="btn-replay"><i class="ph ph-arrow-counter-clockwise"></i> تشغيل المعاينة</button>
            <button class="btn btn-preview" id="btn-toggle-console"><i class="ph ph-terminal-window"></i> سجل الأخطاء</button>
            <button class="btn btn-render" id="btn-render-start"><i class="ph-fill ph-video-camera"></i> تصدير الفيديو (MP4 + صوت)</button>
        </div>
    </div>

    <div id="console-modal">
        <div id="console-header">
            <span><i class="ph ph-terminal-window"></i> سجل النظام والأخطاء</span>
            <button class="btn btn-preview" id="btn-close-console" style="color:#fff; background:#ff4444; border:none; padding:4px 14px;">إغلاق</button>
        </div>
        <div id="console-output"></div>
    </div>

    <script type="module">
        // ============ 🎨 طبقة الهوية بالكامل — هنا ============

        // ============ ⚙️ الطبقة التقنية الثابتة — من هنا تحت ============
    </script>
</body>
</html>
```

كود الطبقة التقنية الثابتة بالكامل (يحل محل التعليق الأخير فوق):

```js
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const statusText = document.getElementById('status-text');
const spinner = document.getElementById('spinner');

let audioAudioEl = null;
let sharedAudioCtx = null;
let state = { currentTime: 0, isRendering: false, animationFrameId: null };

// --- AI AGENT AUTOMATION HOOKS ---
// renderStatus بقى بس بيعكس حالة التحضير (تجهيز الهوية + الصوت) —
// الترميز والتقدّم فيه بقى Node (render-runner.js) بيتابعه بنفسه محليًا،
// مش عن طريق الصفحة، فمفيش داعي لـ renderProgress/renderResult هنا خالص.
window.renderStatus = 'loading'; // 'loading' | 'ready' | 'error'

function logToConsole(msg, type = 'info') {
    const output = document.getElementById('console-output');
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

// --- أدوات عامة متاحة دايمًا لكود الهوية، من غير ما يعيد تعريفها ---
function clamp01(val) { return Math.max(0, Math.min(1, val)); }

function toArabicDigits(input) {
    const map = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(input).replace(/[0-9]/g, d => map[+d]);
}

const Easing = {
    linear: t => t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

function layoutArabicParagraph(text, font, maxWidth, wordGap, lineHeight, centerY) {
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let currentWords = [], currentWidth = 0;

    words.forEach(w => {
        const wordWidth = ctx.measureText(w).width;
        const testWidth = currentWidth + (currentWords.length > 0 ? wordGap : 0) + wordWidth;
        if (testWidth > maxWidth && currentWords.length > 0) {
            lines.push({ words: currentWords, width: currentWidth });
            currentWords = []; currentWidth = 0;
        }
        currentWords.push({ text: w, width: wordWidth });
        currentWidth += (currentWords.length > 1 ? wordGap : 0) + wordWidth;
    });
    if (currentWords.length) lines.push({ words: currentWords, width: currentWidth });

    const totalHeight = lines.length * lineHeight;
    const startY = centerY - totalHeight / 2 + lineHeight / 2;
    const flatWords = [];

    lines.forEach((line, li) => {
        const lineY = startY + li * lineHeight;
        let currentX = (CONFIG.width / 2) + (line.width / 2);
        line.words.forEach(w => {
            const wx = currentX - w.width;
            flatWords.push({ text: w.text, x: wx + w.width / 2, y: lineY });
            currentX -= (w.width + wordGap);
        });
    });
    return flatWords;
}

// --- تحويل AudioBuffer إلى WAV Blob — بتستخدم لمعاينة الصوت الحية، وكمان
// دلوقتي هي المصدر الوحيد للصوت اللي بيتصدّر لـ render-runner.js. الملف ده
// صغير نسبيًا فتحويله base64 كامل آمن — عكس الفيديو اللي كان زمان بيتجمّع
// بالكامل في ذاكرة المتصفح مع Mediabunny وده كان فيه خطر حقيقي. ---
function audioBufferToWavBlob(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let channels = [], sample, offset = 0, pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

    while (offset < buffer.length) {
        for (let i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([out], { type: "audio/wav" });
}

// --- Shared AudioContext — مستخدم داخليًا من fetchAndDecodeAudio/concatenateAudioBuffers ---
function getSharedAudioContext() {
    if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return sharedAudioCtx;
}

// --- جلب وفكّ أي ملف صوت من أي رابط — أداة عامة، مالهاش علاقة بمصدر معيّن ---
// بترفض روابط http:// (لازم https://)، وبتتحقق إن حجم الملف مش صغير بشكل غير
// طبيعي (أقل من ~1 كيلوبايت، غالبًا صفحة خطأ مش صوت حقيقي) قبل ما تحاول تفكّه.
async function fetchAndDecodeAudio(url) {
    if (!/^https:\/\//i.test(url)) {
        throw new Error(`رابط صوت غير آمن (لازم https://): ${url}`);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`فشل جلب الصوت (HTTP ${res.status}): ${url}`);
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength < 1024) {
        throw new Error(`حجم الملف صغير جدًا (${arrayBuf.byteLength} بايت) — على الأغلب صفحة خطأ مش صوت حقيقي: ${url}`);
    }
    return getSharedAudioContext().decodeAudioData(arrayBuf);
}

// --- تلزيق أكتر من AudioBuffer ورا بعض في واحد، وترجيع توقيتات كل مقطع (المدد الحقيقية) ---
function concatenateAudioBuffers(buffers) {
    if (!buffers || buffers.length === 0) throw new Error("مفيش أي AudioBuffer لتلزيقه");

    const sampleRate = buffers[0].sampleRate;
    const channelsCount = buffers[0].numberOfChannels;
    const totalSamples = buffers.reduce((sum, b) => sum + b.length, 0);
    const combined = getSharedAudioContext().createBuffer(channelsCount, totalSamples, sampleRate);

    let sampleOffset = 0;
    let timeOffset = 0.0;
    const segments = [];

    for (const buf of buffers) {
        for (let ch = 0; ch < channelsCount; ch++) {
            combined.getChannelData(ch).set(buf.getChannelData(ch), sampleOffset);
        }
        const duration = buf.duration;
        segments.push({ start: timeOffset, end: timeOffset + duration, duration });
        sampleOffset += buf.length;
        timeOffset += duration;
    }

    return { buffer: combined, segments };
}

// --- أداة عامة: تجيب فريم فيديو B-roll في أي وقت — بديل بدون أي مكتبة
// خارجية (كان زمان معتمد على Input+CanvasSink من Mediabunny). بيستخدم عنصر
// <video> مخفي + seek دقيق لكل فريم مطلوب، وده كافي تمامًا لأننا محتاجين
// بس فريم ثابت واحد في كل استدعاء لـ drawSceneAtTime(t)، مش تشغيل حي. ---
// استخدام اختياري بالكامل — أي هوية تناديها جوه prepareIdentity() لو محتاجة
// خلفية فيديو (مش صورة ثابتة). نفس قاعدة CORS بتاعة الصور تنطبق هنا: الرابط
// لازم يدعم CORS فعليًا (`crossOrigin='anonymous'` + هيدر السيرفر صحيح)
// وإلا الكانفاس هيتعتبر "tainted" وقت الرسم عليه.
async function createBrollFrameSampler(url, options = {}) {
    const videoEl = document.createElement('video');
    videoEl.crossOrigin = 'anonymous';
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';
    videoEl.src = url;

    await new Promise((resolve, reject) => {
        videoEl.onloadedmetadata = resolve;
        videoEl.onerror = () => reject(new Error(`فشل تحميل فيديو B-roll (تحقق من CORS ورابط الملف): ${url}`));
    });

    const targetW = options.width || videoEl.videoWidth;
    const targetH = options.height || videoEl.videoHeight;
    const fit = options.fit || 'cover';
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = targetW;
    sampleCanvas.height = targetH;
    const sampleCtx = sampleCanvas.getContext('2d');

    return {
        videoEl,
        async getFrameAt(time) {
            const seekTime = Math.min(Math.max(time, 0), Math.max(videoEl.duration - 0.01, 0));
            await new Promise((resolve) => {
                videoEl.onseeked = resolve;
                videoEl.currentTime = seekTime;
            });

            const vw = videoEl.videoWidth, vh = videoEl.videoHeight;
            const scale = fit === 'contain'
                ? Math.min(targetW / vw, targetH / vh)
                : Math.max(targetW / vw, targetH / vh); // 'cover' الافتراضي
            const dw = vw * scale, dh = vh * scale;
            const dx = (targetW - dw) / 2, dy = (targetH - dh) / 2;

            sampleCtx.clearRect(0, 0, targetW, targetH);
            sampleCtx.drawImage(videoEl, dx, dy, dw, dh);
            return sampleCanvas;
        },
    };
}

// --- حلقة المعاينة الحية — بتنادي drawSceneAtTime بس (async دايمًا)، من غير أي منطق تصميم ---
function startPreviewLoop() {
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    if (audioAudioEl) {
        audioAudioEl.currentTime = 0;
        audioAudioEl.play().catch(e => logToConsole("تنبيه الصوت: " + e.message, 'warn'));
    }

    async function loop() {
        if (state.isRendering) return;
        const currTime = audioAudioEl ? audioAudioEl.currentTime : state.currentTime;
        await drawSceneAtTime(currTime);

        if (currTime < CONFIG.duration) {
            state.animationFrameId = requestAnimationFrame(loop);
        } else {
            statusText.textContent = "جاهز للعرض والتصدير ✓";
            spinner.style.display = 'none';
        }
    }
    state.animationFrameId = requestAnimationFrame(loop);
}

// --- الطبقة دي بقت مسؤولة عن *التقاط* الفريمات بس (رسم + تحويل لصورة) —
// الترميز الفعلي للفيديو النهائي بقى مسؤولية render-runner.js عبر ffmpeg،
// مش هنا. الفصل ده بيلغي حاجتين كانوا سبب أغلب هشاشة النظام القديم: تجميع
// الفيديو كله كـ buffer واحد في ذاكرة المتصفح، والاعتماد على AAC WASM
// polyfill بسبب قيود ترخيص AAC في Chrome على لينكس. ---

const OFOQ_FRAME_FORMAT = 'image/png'; // PNG = بلا فقدان — مهم لحدة النص
                                        // العربي. لو الأداء بقى عنق زجاجة
                                        // فعليًا بعد قياس حقيقي، ده المكان
                                        // الوحيد اللي محتاج يتغيّر لـ
                                        // 'image/jpeg' (مع جودة قريبة من 0.95).

window.__ofoqTotalFrames = 0;
window.__ofoqFps = 0;
window.__ofoqOutputFilename = '';
window.__ofoqAudioWavBase64 = null; // null = مفيش صوت في الهوية دي

// بينادى من Node مرة واحدة لكل دفعة فريمات — ده اللي بيفرق فعليًا في السرعة:
// رحلة CDP واحدة (page.evaluate) بتجيب عدة فريمات مرة واحدة، مش رحلة لكل
// فريم لوحده.
async function __ofoqGetFrameBatch(startFrame, count) {
    const frames = [];
    for (let i = 0; i < count; i++) {
        const frameIndex = startFrame + i;
        if (frameIndex >= window.__ofoqTotalFrames) break;
        const timestamp = frameIndex / window.__ofoqFps;
        await drawSceneAtTime(timestamp); // 🎨 من طبقة الهوية، async دايمًا
        const dataUrl = canvas.toDataURL(OFOQ_FRAME_FORMAT);
        frames.push(dataUrl.substring(dataUrl.indexOf(',') + 1)); // شيل الـ prefix، base64 بس
    }
    return frames;
}
window.__ofoqGetFrameBatch = __ofoqGetFrameBatch;

// تحويل ArrayBuffer إلى base64 — دلوقتي بيستخدم بس لملف الصوت (WAV) الصغير
// نسبيًا، مش لفيديو كامل زي زمان مع Mediabunny. الفرق ده حاسم لتفادي تجاوز
// حدود حجم الـ string في V8 أو نفاد الذاكرة على فيديوهات طويلة.
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

// --- أزرار الواجهة (IDs ثابتة، موجودة في هيكل الـ HTML فوق) ---
document.getElementById('btn-replay').addEventListener('click', () => {
    statusText.textContent = "جاري عرض المعاينة...";
    spinner.style.display = 'inline-block';
    startPreviewLoop();
});

document.getElementById('btn-toggle-console').addEventListener('click', () => {
    const modal = document.getElementById('console-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
});

document.getElementById('btn-close-console').addEventListener('click', () => {
    document.getElementById('console-modal').style.display = 'none';
});

document.getElementById('btn-render-start').addEventListener('click', () => {
    logToConsole("التصدير الفعلي بقى بيتم بس عبر render-runner.js (Node + ffmpeg) — الزرار ده للمعاينة الحية بس.", 'warn');
});

async function init() {
    try {
        await prepareIdentity(); // 🎨 من طبقة الهوية بالكامل

        // أبعاد الكانفاس بقت بتتحدد من CONFIG برمجيًا، مش من HTML ثابت —
        // لازم تتحدد هنا قبل أي رسم أو التقاط فريم.
        canvas.width = CONFIG.width;
        canvas.height = CONFIG.height;

        window.__ofoqFps = CONFIG.fps;
        window.__ofoqTotalFrames = Math.ceil(CONFIG.duration * CONFIG.fps);
        window.__ofoqOutputFilename = `${OUTPUT_FILENAME}.mp4`; // امتداد ثابت
                                                                  // دايمًا الآن —
                                                                  // مفيش تعدد
                                                                  // حاويات زي
                                                                  // زمان.

        if (audioBuffer) {
            const wavBlob = audioBufferToWavBlob(audioBuffer);
            audioAudioEl = new Audio(URL.createObjectURL(wavBlob));
            window.__ofoqAudioWavBase64 = arrayBufferToBase64(await wavBlob.arrayBuffer());
        }

        statusText.textContent = "جاهز للعرض والتصدير ✓";
        spinner.style.display = 'none';
        window.renderStatus = 'ready';
        await drawSceneAtTime(0); // 🎨 من طبقة الهوية، async دايمًا
    } catch (err) {
        logToConsole("خطأ أثناء التهيئة: " + err.message, 'error');
        statusText.textContent = "حدث خطأ أثناء التحميل";
        window.__renderError = err.message;
        window.renderStatus = 'error';
    }
}

window.addEventListener('load', init);
```

**قاعدة "canvas tainted"**: `scene.html` لازم يُفتح دايمًا بسيرفر HTTP محلي، مش
`file://` (راجع `render-runner.js` في القسم 5). أي صورة أو فريم B-roll بيترسم
على الـ canvas لازم CORS فعليًا مفعّلة (`crossOrigin='anonymous'` للصور، رابط
بيدعم CORS لـ `createBrollFrameSampler`)، وإلا خطأ
`VideoFrames can't be created from tainted sources`.

---

## 4. قواعد سريعة

- ممنوع منعًا باتًا تنفيذ `node agent.js` — ده وكيل تاني كامل، مش أداة رندر.
- `render-runner.js` سكريبت منفصل تكتبه إنت (القسم 5) وتشغّله بـ `node render-runner.js`.
- `scene.html` يُفتح دايمًا بسيرفر HTTP محلي، مش `file://`.
- `chromium.launch({ channel: 'chrome' })` إلزامي (القناة المثبّتة في الـ CI، مش الافتراضية).
- أي انتظار لحالة الرندر لازم تايم آوت إجمالي صريح 60 دقيقة على الأقل — لا تعتمد على أي default (`render-runner.js` تحت بيعمل ده تلقائيًا).
- ممنوع كتابة أي نص/بيانات مفروض حقيقيتها من الذاكرة — مصدرها فعل حقيقي في نفس المهمة. القاعدة دي سارية حتى في أكواد اختبار أو تجربة مؤقتة (زي سكريبت بتكتبه بس عشان تتأكد من شكل البيانات) — مش `scene.html` النهائي بس؛ أي نص بيتكتب هناك أول مرة من الذاكرة هيتنسخ غالبًا لـ `scene.html` بعد كده.
- لو ملف الهوية حدد مصدر أصل بصيغة رابط معيّنة (نمط URL، API، أو نطاق موقع محدد)، الالتزام بيه إلزامي — أي مصدر بديل، ولو معروف ومشهور، محتاج تسأل المستخدم عليه صراحة الأول، مش قرار منفرد منك.
- أسماء ملفات الهوية دايمًا بامتداد `.md` — لو مش متأكد من الاسم الدقيق، `ls identities/` أول حاجة بدل ما تخمّن.
- لو الهوية فيها صوت: التوقيت من مدة الصوت الحقيقي بعد فكّه (`fetchAndDecodeAudio`/`concatenateAudioBuffers`)، مش تخمين.
- بعد كتابة `scene.html`: `cat scene.html` كامل (لا `grep`)، وقارن قيم المحتوى بالمطلوب فعليًا.
- قبل الرندر الكامل: فحص headless سريع (القسم 2، بند 6) — لو `SYNTAX_ERROR`، رجّع اصلح `scene.html` أولًا.
- لو الرندر فشل: صحّح `scene.html` مباشرة 
- امتداد الفيديو الناتج ثابت دايمًا `.mp4` (من `window.__ofoqOutputFilename`) — مفيش تعدد حاويات (mp4/webm) زي زمان، فمفيش داعي لأي تصحيح يدوي للامتداد.
- لو بتلاقي نفسك بتكرر نفس المحاولة والخطأ أكتر من مرتين على نفس المشكلة، وقف وقارن بنسخة شغالة معروفة بدل ما تكمل تخمين.
- لو ملف الهوية فيه قسم "ملاحظات معروفة" في آخره، اقرأه قبل ما تبدأ.
- ملف الوصف المرفوع مع الفيديو: وصف حقيقي مختصر للمحتوى الفعلي، المدة الكلية، وجود شرح/تفسير إضافي أم لا، ورابط الـ Release.
- الفيديو + ملف الوصف + `scene.html` نفسه — التلاتة يترفعوا كـ assets حقيقية على الـ Release.
- ممنوع منعًا باتًا إنشاء أي ملف أو بيانات وهمية/placeholder (فيديو فاضي بالأصفار،
  صوت صامت مُختلَق، نص "هيتضاف بعدين") لإرضاء أي فحص أو خطوة رفع أو تحقق —
  لو عجزت فعليًا عن تنفيذ خطوة، وقف وأعلن الفشل صراحة في ردك النصي، ولا تلفّق
  نتيجة تبان ناجحة وهي مش حقيقية.
---

## 5. خطوات التنفيذ

1. حدد ملف الهوية المطلوب من طلب المستخدم (اسأله لو غير واضح).
2. افتح الملف واقرأه كامل، وابدأ فعليًا في جلب أي محتوى/بيانات حقيقية محتاجها المهمة بالطريقة اللي الملف حددها.
3. اكتب `scene.html` وراجعه مرتين على الاقل للتأكد انه مطابق تماما للهوية 
4. فحص headless سريع 
5. شغّل `node render-runner.js` (السكريبت تحت).
6. تأكد الرفع الفعلي لكل من: الفيديو، ملف الوصف، `scene.html` (`gh release upload`).
7. اكتب ملف علامة `video_<معرّف فريد>_done.json` يحتوي
   `{"identifier": "...", "release_video_url": "...", "release_md_url": "...", "release_scene_html_url": "..."}`
   لكل فيديو — `agent.js` بيتحقق إن الروابط دي موجودة فعليًا على الـ Release
   (`gh release view`) قبل ما يقبل الملف. بعد آخر فيديو في المهمة، اكتب
   `TASK_COMPLETE.json` يحتوي `{"summary": "...", "videos": [...]}`.

### `render-runner.js`

```js
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// تايم آوت إجمالي إلزامي — رندر فيديو حقيقي بياخد دقايق، مش قابل للحذف أو
// التقليل. لازم يفضل دايمًا أصغر من مهلة تنفيذ الأمر في agent.js (70 دقيقة
// حاليًا) عشان الرندر يقدر يرجّع JSON منظم لو فشل بدل قتل عنيف من برّه —
// لو محتاج تزوّده، زوّد الاتنين مع بعض بالتناسق ده، وراجع مهلة الـ job كله
// في render.yml (90 دقيقة) لو التغيير كبير.
const TIMEOUT_MS = 60 * 60 * 1000;

// عدد الفريمات في كل رحلة page.evaluate واحدة — ده الفرق الحقيقي في السرعة
// بين النسخة دي والالتقاط الساذج (فريم واحد لكل رحلة CDP). رقم أعلى = رحلات
// أقل لكن استهلاك ذاكرة أعلى مؤقتًا لكل دفعة. 24 نقطة بداية معقولة، عدّلها
// بعد قياس فعلي لو محتاج.
const FRAME_BATCH_SIZE = 24;

// سقف عدد أسطر stderr بتاعة ffmpeg المحتفظ بيها في الذاكرة — بيتطبّق أول
// بأول وإحنا بنجمّع، مش بس وقت الطباعة النهائية، عشان رندر طويل ما يراكمش
// آلاف الأسطر من غير داعي.
const FFMPEG_LOG_CAP = 30;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(process.cwd(), decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200); res.end(data);
      });
    });
    server.listen(0, () => resolve(server));
  });
}

// كتابة Buffer على stdin بتاع عملية فرعية مع احترام الـ backpressure — لو
// write() رجعت false، لازم تستنى 'drain' قبل ما تكتب تاني، وإلا ذاكرة
// العملية بتتضخم من غير داعي لو ffmpeg بياخد وقت في الترميز أبطأ من سرعة
// التقاط الفريمات.
function writeWithBackpressure(stream, buffer) {
  return new Promise((resolve, reject) => {
    const ok = stream.write(buffer, (err) => { if (err) reject(err); });
    if (ok) resolve();
    else stream.once('drain', resolve);
  });
}

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ channel: 'chrome' }); // مطابق للقناة المثبّتة في الـ CI
  const page = await browser.newPage();

  const consoleLogs = [];
  const failedRequests = [];
  const ffmpegLog = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`));
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.url()} — HTTP ${res.status()}`); });

  const startTime = Date.now();
  const remainingMs = () => TIMEOUT_MS - (Date.now() - startTime);

  // مسار فشل موحّد واحد بس — أي خطأ في أي مرحلة (توقيت، فشل تحضير، عطل
  // ffmpeg، أو أي استثناء غير متوقع) بيمر من هنا وبيطبع نفس تنسيق JSON
  // التشخيصي دايمًا. قبل كده كان أي عطل في ffmpeg بيكسر Node بـ crash خام
  // (unhandled 'error' event) قبل ما يوصل لأي سطر تشخيص — ده اللي كان بيخفي
  // السبب الحقيقي وراء أي فشل في الرندر.
  async function fail(errMsg) {
    console.log(JSON.stringify({
      success: false,
      error: errMsg,
      console_logs: consoleLogs.slice(-50),
      failed_requests: failedRequests,
      ffmpeg_log: ffmpegLog.slice(-FFMPEG_LOG_CAP),
    }));
    try { await browser.close(); } catch {}
    try { server.close(); } catch {}
    process.exit(1);
  }

  try {
    // من غير أي ?autorender=true — الترميز بقى بيتقاد بالكامل من هنا، مش من
    // جوه الصفحة، فمفيش داعي لأي إشارة تلقائية في رابط الصفحة.
    await page.goto(`http://localhost:${port}/scene.html`);

    // --- انتظار renderStatus='ready' (تحضير الهوية + الصوت) قبل بدء الالتقاط ---
    let prepStatus = null;
    while (true) {
      prepStatus = await page.evaluate(() => window.renderStatus);
      if (prepStatus === 'ready' || prepStatus === 'error') break;
      if (remainingMs() <= 0) { prepStatus = 'timeout'; break; }
      await page.waitForTimeout(200);
    }

    if (prepStatus !== 'ready') {
      const errMsg = prepStatus === 'timeout'
        ? `TimeoutError: التحضير (prepareIdentity) لم يكتمل خلال ${TIMEOUT_MS / 1000} ثانية`
        : await page.evaluate(() => window.__renderError);
      throw new Error(errMsg);
    }

    // --- كتابة ملف الصوت (لو موجود) على القرص مرة واحدة قبل بدء الترميز ---
    const audioBase64 = await page.evaluate(() => window.__ofoqAudioWavBase64);
    const hasAudio = !!audioBase64;
    if (hasAudio) fs.writeFileSync('audio.wav', Buffer.from(audioBase64, 'base64'));

    const totalFrames = await page.evaluate(() => window.__ofoqTotalFrames);
    const fps = await page.evaluate(() => window.__ofoqFps);
    const outputFilename = await page.evaluate(() => window.__ofoqOutputFilename);

    // --- تشغيل ffmpeg مرة واحدة بس، وتغذيته بسلسلة PNG عبر stdin — مفيش ملف
    // أو عملية منفصلة لكل فريم. ده هو "الـ streaming pipe" اللي بيفرق فعليًا
    // عن الالتقاط الساذج (screenshot/ملف لكل فريم). ---
    const ffmpegArgs = [
      '-y',
      '-loglevel', 'warning', '-hide_banner', // يقلل ضوضاء stderr الروتينية عشان أي خطأ حقيقي يبان واضح في ffmpeg_log
      '-thread_queue_size', '512', // الفريمات بتوصل ffmpeg على دفعات (batch) مش بمعدل ثابت — الطابور الافتراضي (8) بيمتلئ وسط كل دفعة ويعلّق شوية؛ رفعه بيمتص التذبذب ده
      '-f', 'image2pipe',
      '-framerate', String(fps),
      '-i', '-',
      ...(hasAudio ? ['-i', 'audio.wav'] : []),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      '-crf', '18',
      ...(hasAudio ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
      outputFilename,
    ];
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    // --- الإصلاح الجوهري: من غير المستمعين دول، أي إغلاق مفاجئ لعملية
    // ffmpeg (سواء عدم وجودها أصلًا على الجهاز، أو كراش داخلي وقت الترميز)
    // كان بيوقّف Node بالكامل بـ crash خام بدل ما يتحول لخطأ عادي نقدر نطبع
    // تفاصيله عبر fail(). بنسجّل السبب في متغيّر ونفحصه بعد كل كتابة/دفعة،
    // بدل ما نكمل نبعت فريمات لـ pipe ميت. ---
    let ffmpegDied = null;
    ffmpeg.on('error', (err) => { ffmpegDied = `ffmpeg process error: ${err.message}`; });
    ffmpeg.stdin.on('error', (err) => { ffmpegDied = `ffmpeg stdin error: ${err.message}`; });
    ffmpeg.stderr.on('data', (d) => {
      ffmpegLog.push(d.toString());
      if (ffmpegLog.length > FFMPEG_LOG_CAP) ffmpegLog.shift();
    });

    let lastPercent = -1;
    for (let start = 0; start < totalFrames; start += FRAME_BATCH_SIZE) {
      if (ffmpegDied) throw new Error(ffmpegDied);
      if (remainingMs() <= 0) {
        ffmpeg.kill('SIGKILL');
        throw new Error(`TimeoutError: تجاوز الرندر ${TIMEOUT_MS / 1000} ثانية (آخر تقدم: ${lastPercent}%)`);
      }

      const count = Math.min(FRAME_BATCH_SIZE, totalFrames - start);
      const batch = await page.evaluate(([s, c]) => window.__ofoqGetFrameBatch(s, c), [start, count]);
      for (const base64Frame of batch) {
        if (ffmpegDied) throw new Error(ffmpegDied);
        await writeWithBackpressure(ffmpeg.stdin, Buffer.from(base64Frame, 'base64'));
      }

      const percent = Math.round(((start + count) / totalFrames) * 100);
      if (percent !== lastPercent) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[+${elapsed}s] frames=${start + count}/${totalFrames} progress=${percent}%`);
        lastPercent = percent;
      }
    }

    if (ffmpegDied) throw new Error(ffmpegDied);
    ffmpeg.stdin.end();
    const ffmpegExitCode = await new Promise((resolve) => ffmpeg.on('close', resolve));
    if (ffmpegDied) throw new Error(ffmpegDied);

    await browser.close();
    server.close();

    const result = {
      success: ffmpegExitCode === 0,
      elapsed_seconds: Number(((Date.now() - startTime) / 1000).toFixed(1)),
      last_progress_percent: lastPercent,
      console_logs: consoleLogs.slice(-50),
      failed_requests: failedRequests,
      ffmpeg_log: ffmpegLog.slice(-FFMPEG_LOG_CAP),
    };

    if (result.success) {
      result.filename = outputFilename;
      result.size = fs.statSync(outputFilename).size;
    } else {
      result.error = `ffmpeg exited with code ${ffmpegExitCode}`;
    }

    console.log(JSON.stringify(result)); // اقرأها من الـ output بتاع run_terminal مباشرة
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    await fail(err.message);
  }
})();
```

**استخدم `console_logs`/`failed_requests`/`ffmpeg_log` مباشرة للتشخيص** — لو
ملف صوت أو خط طلع 404 هتلاقيه صريح في `failed_requests`. لو الترميز نفسه فشل
(تنسيق فريم غلط، مشكلة codec، أو ffmpeg مش موجود على الجهاز خالص) هتلاقيه في
`ffmpeg_log`/رسالة `error`. لو فشل الرندر، `last_progress_percent` بيوريك لحد
فين وصل قبل ما يفشل أو يتوقف. **أي فشل — أيًا كان سببه — دلوقتي بيطبع نفس
تنسيق JSON التشخيصي ده دايمًا، مفيش أي مسار بيوصل لـ crash خام بدون تفسير.**
