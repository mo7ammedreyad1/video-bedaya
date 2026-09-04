// ============================================================================
// أوفق AI Agent v2.0 — باذن الله
//
// أداة واحدة بس: run_terminal. الـ AI هو اللي بيعمل كل حاجة بنفسه بالكامل —
// جلب نصوص، تحميل صوت، كتابة ملفات، **وحتى كتابة وتشغيل كود الرندر بالـ Playwright
// بنفسه** (الوصفة موجودة كمرجع في AGENTS.md، مش دالة جاهزة هنا). agent.js
// مفيهوش أي منطق محتوى أو رندر خالص — بس المحرك اللي بيشغّل الأداة الوحيدة.
//
// معمارية التفكير: Plan-and-Solve (خطة نصية كاملة قبل أول أمر) + Reflexion
// (مراجعة نصية إلزامية بعد كل فيديو — دي قاعدة سلوكية مكتوبة في AGENTS.md
// والـ Agent نفسه مسؤول عن الالتزام بيها). agent.js بيتحقق فعليًا (مش بس
// بيفترض) إن كل ملف علامة فيديو، وTASK_COMPLETE.json نفسه في الآخر، بيشيروا
// لأصول موجودة حقًا على الـ Release عن طريق gh release view — ويرفض أي ملف
// مش مطابق برسالة توضح الناقص بالتحديد، مطابق لما هو موثّق في AGENTS.md.
// ============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK_DIR = process.cwd();
const AGENT_LOG_FILE = path.join(WORK_DIR, 'agent_run_log.txt');

function log(msg) {
  const line = `[agent ${new Date().toISOString()}] ${msg}`;
  console.error(line);
  try {
    fs.appendFileSync(AGENT_LOG_FILE, line + '\n');
  } catch (e) {
    // لو الكتابة فشلت (مساحة قرص، صلاحيات...)، ما نوقفش التنفيذ بسببها — اللوج
    // الأساسي في console.error فاضل موجود على أي حال في GitHub Actions.
  }
}

// ============================================================================
// وضع الـ Agent الرئيسي
// ============================================================================
// مفتاح واحد أو أكتر (مفصولين بفاصلة) — GEMINI_API_KEYS الجديد له الأولوية،
// وGEMINI_API_KEY القديم فاضل شغال لو حد بس متاح (توافق خلفي).
const GEMINI_API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
let currentKeyIndex = 0;
// سلسلة نماذج احتياطية — التبديل تلقائي للي بعده لما نستنفد محاولات إعادة الاتصال
// على النموذج الحالي. مرتبة من الأعلى قدرة للأكرم في حدود الخطة المجانية (RPM).
const MODEL_CHAIN = (process.env.GEMINI_MODEL_CHAIN || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemma-4-31b-it')
  .split(',').map((s) => s.trim()).filter(Boolean);
let currentModelIndex = 0;

const TASK_JSON = process.env.TASK_JSON || 'اختر ملف هوية مناسب من identities/ وحدد بنفسك محتوى يناسبها، وأنتج فيديو شورتس واحد بيه.';
const CALLBACK_URL = process.env.CALLBACK_URL || ''; // هيتحدد لاحقًا، اختياري دلوقتي
const GH_REPO = process.env.GITHUB_REPOSITORY || '';
const RELEASE_TAG = `render-${process.env.GITHUB_RUN_NUMBER || Date.now()}`;
// لازم نسجّلهم فعليًا في process.env — مش بس متغيرات JS محلية — عشان يبقوا
// متاحين كـ $RELEASE_TAG و$GH_REPO جوه أي أمر run_terminal (bash child process)
process.env.RELEASE_TAG = RELEASE_TAG;
process.env.GH_REPO = GH_REPO;
const MAX_TURNS = 80;

const TASK_COMPLETE_MARKER = 'TASK_COMPLETE.json';

// ---------------------------------------------------------------------------
// الأداة الوحيدة: تنفيذ أمر شل حقيقي
// ---------------------------------------------------------------------------
async function runTerminal({ command }) {
  const OUTPUT_LIMIT = 40000; // كان 6000 — ده كان بيقطع ملفات كبيرة (scene.html أو ملفات هوية .md) بصمت
  const ERROR_LIMIT = 20000;  // كان 3000 — نفس المشكلة لو الفشل نفسه فيه output كبير

  function withTruncationNotice(text, limit) {
    if (text.length <= limit) return text;
    return (
      text.slice(0, limit) +
      `\n\n...[تنبيه: الناتج اتقطع هنا. الحجم الكلي كان ${text.length} حرف، وده عرض أول ${limit} بس. ` +
      `لو ده ناتج قراءة ملف، متفترضش إنك شفته كامل — كمّل تقرا الباقي بأمر زي ` +
      `'tail -c +${limit + 1} <file>' أو 'sed -n "N,Mp" <file>' قبل ما تعتمد على محتواه.]...`
    );
  }

  try {
    const output = execSync(command, {
      cwd: WORK_DIR,
      env: process.env,
      timeout: 70 * 60 * 1000, // أكبر من مهلة الرندر الداخلية (60 دقيقة) عشان الرندر يقدر يرجّع JSON منظم لو فشل، بدل قتل عنيف من هنا
      maxBuffer: 30 * 1024 * 1024,
      shell: '/bin/bash',
    }).toString();
    return { success: true, exit_code: 0, output: withTruncationNotice(output, OUTPUT_LIMIT) };
  } catch (e) {
    return {
      success: false,
      exit_code: e.status ?? null,
      error: e.message,
      stdout: withTruncationNotice((e.stdout || '').toString(), ERROR_LIMIT),
      stderr: withTruncationNotice((e.stderr || '').toString(), ERROR_LIMIT),
    };
  }
}

const functionDeclarations = [
  {
    name: 'run_terminal',
    description:
      'الأداة الوحيدة المتاحة لك. تنفّذ أي أمر bash حقيقي داخل بيئة GitHub Actions ' +
      '(curl لجلب أي API، cat/heredoc لكتابة أي ملف، node لتشغيل الرندر، gh لرفع الملفات). ' +
      'أنت المسؤول الكامل عن تنفيذ كل خطوة بنفسك عن طريق الأداة دي — مفيش أي أداة تانية.',
    parameters: {
      type: 'OBJECT',
      properties: { command: { type: 'STRING', description: 'أمر bash كامل، ممكن يكون متعدد الأسطر (heredoc مثلاً)' } },
      required: ['command'],
    },
  },
];

// ---------------------------------------------------------------------------
// تحقق حقيقي من أصول الـ Release — مطابق لما هو موثّق في AGENTS.md: أي ملف
// علامة (فيديو أو TASK_COMPLETE) لازم يشير لأصول موجودة فعليًا على الـ Release
// قبل ما يُقبل، مش بس موجود كملف JSON على القرص. باقي التحقق (سلامة محتوى
// scene.html نفسه، الالتزام الفعلي بالـ Reflexion) يفضل مسؤولية الـ Agent
// حسب AGENTS.md — الكود هنا بيتحقق من "الأصول موجودة"، مش من "الكود صحيح".
// ---------------------------------------------------------------------------
const VIDEO_MARKER_REGEX = /^video_.+_done\.json$/;
const verifiedVideoMarkers = new Set();

function listVideoMarkerFiles() {
  return fs.readdirSync(WORK_DIR).filter((f) => VIDEO_MARKER_REGEX.test(f));
}

function getReleaseAssetNames() {
  const output = execSync(
    `gh release view ${RELEASE_TAG} --repo ${GH_REPO} --json assets -q ".assets[].name"`,
    { env: process.env }
  ).toString();
  return output.split('\n').map((s) => s.trim()).filter(Boolean);
}

function urlToAssetName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
  } catch (e) {
    return '';
  }
}

// بيتحقق إن التلات روابط المطلوبة (فيديو/وصف/scene.html) بتشير لأصول موجودة
// فعليًا على الـ Release دلوقتي — مش بس بيقرا الأسماء من ملف JSON على القرص.
function verifyReferencedAssets(entry) {
  const requiredFields = ['release_video_url', 'release_md_url', 'release_scene_html_url'];
  const missingFields = requiredFields.filter((f) => !entry || !entry[f]);
  if (missingFields.length) {
    return { ok: false, problems: [`حقول ناقصة: ${missingFields.join(', ')}`] };
  }

  let assetNames;
  try {
    assetNames = getReleaseAssetNames();
  } catch (e) {
    return { ok: false, problems: [`فشل الاستعلام عن أصول الـ Release عبر gh release view: ${e.message}`] };
  }

  const problems = [];
  for (const field of requiredFields) {
    const expectedName = urlToAssetName(entry[field]);
    if (!expectedName || !assetNames.includes(expectedName)) {
      problems.push(`${field} → "${expectedName || entry[field]}" مش موجود كـ asset حقيقي على الـ Release`);
    }
  }
  return problems.length ? { ok: false, problems } : { ok: true };
}

// فحص أي ملف علامة فيديو جديد ظهر بعد آخر دورة — بيرفضه فعليًا (وبيحذفه) لو
// الأصول المُشار لها غير موجودة، برسالة توضح بالتحديد الناقص.
function verifyNewVideoMarkers() {
  const rejectionMessages = [];
  for (const markerFile of listVideoMarkerFiles()) {
    if (verifiedVideoMarkers.has(markerFile)) continue;

    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(WORK_DIR, markerFile), 'utf-8'));
    } catch (e) {
      fs.unlinkSync(path.join(WORK_DIR, markerFile));
      rejectionMessages.push(`ملف العلامة ${markerFile} فيه JSON غير صالح (${e.message}) — تم رفضه وحذفه، اكتبه تاني صح.`);
      continue;
    }

    const verdict = verifyReferencedAssets(data);
    if (verdict.ok) {
      verifiedVideoMarkers.add(markerFile);
      log(`✅ تحقق ناجح من ملف العلامة: ${markerFile}`);
    } else {
      fs.unlinkSync(path.join(WORK_DIR, markerFile));
      log(`❌ رفض ملف العلامة ${markerFile}: ${verdict.problems.join(' | ')}`);
      rejectionMessages.push(
        `ملف العلامة ${markerFile} مرفوض:\n- ${verdict.problems.join('\n- ')}\nصحّح الرفع الفعلي على الـ Release وأعد كتابة الملف.`
      );
    }
  }
  return rejectionMessages;
}

// فحص نهاية المهمة: TASK_COMPLETE.json لازم يتحقق منه بنفس الصرامة — كل
// فيديو جوه مصفوفة videos لازم أصوله موجودة فعليًا، وإلا يُرفض الملف بالكامل
// (وبيتم حذفه) عشان الحلقة تفضل شغالة لحد ما يتصحح.
function checkTaskCompletion() {
  if (!fs.existsSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER))) return { done: false };

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER), 'utf-8'));
  } catch (e) {
    fs.unlinkSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER));
    return { done: false, rejection: `TASK_COMPLETE.json فيه JSON غير صالح (${e.message}) — تم رفضه وحذفه، اكتبه تاني صح.` };
  }

  if (!Array.isArray(payload.videos) || payload.videos.length === 0) {
    fs.unlinkSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER));
    return { done: false, rejection: 'TASK_COMPLETE.json مرفوض: حقل "videos" لازم يكون مصفوفة فيها فيديو واحد على الأقل.' };
  }

  const problems = [];
  payload.videos.forEach((entry, i) => {
    const verdict = verifyReferencedAssets(entry);
    if (!verdict.ok) problems.push(`videos[${i}] (${entry && entry.identifier}): ${verdict.problems.join(' | ')}`);
  });

  if (problems.length) {
    fs.unlinkSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER));
    return { done: false, rejection: `TASK_COMPLETE.json مرفوض:\n- ${problems.join('\n- ')}\nصحّح الأصول الناقصة على الـ Release وأعد كتابة الملف.` };
  }

  return { done: true, payload };
}

// ---------------------------------------------------------------------------
// Gemini API — REST مباشر مع retry + تبديل نماذج تلقائي
// ---------------------------------------------------------------------------
function parseRetryDelaySeconds(errorBody) {
  try {
    const details = errorBody && errorBody.error && errorBody.error.details;
    const retryInfo = details && details.find((d) => (d['@type'] || '').includes('RetryInfo'));
    if (!retryInfo || !retryInfo.retryDelay) return null;
    const seconds = parseFloat(String(retryInfo.retryDelay).replace('s', ''));
    return Number.isFinite(seconds) ? seconds : null;
  } catch (e) {
    return null;
  }
}

async function callGemini(contents, systemInstruction, attempt = 1, keyRotationsTried = 0) {
  const MAX_ATTEMPTS_PER_MODEL = 3;
  const model = MODEL_CHAIN[currentModelIndex];
  const apiKey = GEMINI_API_KEYS[currentKeyIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents,
    system_instruction: { parts: [{ text: systemInstruction }] },
    tools: [{ functionDeclarations }],
  };

  let res, data;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    data = await res.json();
  } catch (networkErr) {
    if (attempt < MAX_ATTEMPTS_PER_MODEL) {
      const waitSeconds = Math.min(60, 5 * Math.pow(2, attempt));
      log(`خطأ شبكة عند الاتصال بـ Gemini (${networkErr.message}). هستنى ${waitSeconds}s وأعيد المحاولة (${attempt}/${MAX_ATTEMPTS_PER_MODEL})...`);
      await new Promise((r) => setTimeout(r, waitSeconds * 1000));
      return callGemini(contents, systemInstruction, attempt + 1, keyRotationsTried);
    }
    throw new Error(`فشل الاتصال بـ Gemini بعد عدة محاولات: ${networkErr.message}`);
  }

  if (!res.ok) {
    const isRateLimit = res.status === 429;
    const isTransient = isRateLimit || (res.status >= 500 && res.status < 600);
    if (isTransient) {
      // على الليميت بالتحديد (429): بدّل لمفتاح API تاني فورًا من غير أي
      // انتظار، لو فيه مفتاح لسه ما جُرّب في الدورة دي — أسرع حل من الانتظار،
      // لأن مفتاح تاني عنده حصة (quota) منفصلة تمامًا. أخطاء السيرفر (5xx)
      // مفتاح تاني مش هيصلحها، فبتفضل على منطق الانتظار العادي.
      if (isRateLimit && keyRotationsTried < GEMINI_API_KEYS.length - 1) {
        currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
        log(`خطأ ليميت (429) على ${model}. بدّلت فورًا لمفتاح Gemini API رقم ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length} من غير انتظار...`);
        return callGemini(contents, systemInstruction, attempt, keyRotationsTried + 1);
      }

      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        const serverDelay = parseRetryDelaySeconds(data);
        const waitSeconds = serverDelay != null ? serverDelay + 1 : Math.min(60, 5 * Math.pow(2, attempt));
        log(`خطأ مؤقت (${res.status}) على ${model}. هستنى ${waitSeconds.toFixed(1)}s وأعيد المحاولة (${attempt}/${MAX_ATTEMPTS_PER_MODEL})...`);
        await new Promise((r) => setTimeout(r, waitSeconds * 1000));
        // نصفّر عداد تبديل المفاتيح مع كل دورة انتظار جديدة، عشان لو حصل 429
        // تاني بعد الانتظار نقدر نلف على كل المفاتيح فورًا من جديد قبل ما ننتظر تاني
        return callGemini(contents, systemInstruction, attempt + 1, 0);
      }
      if (currentModelIndex < MODEL_CHAIN.length - 1) {
        currentModelIndex++;
        log(`استنفدنا محاولات ${model} (${res.status}). التبديل للنموذج الاحتياطي: ${MODEL_CHAIN[currentModelIndex]}`);
        return callGemini(contents, systemInstruction, 1, 0);
      }
      throw new Error(`استنفدنا كل النماذج في السلسلة (${MODEL_CHAIN.join(', ')}) وكل مفاتيح الـ API بسبب أخطاء متكررة (${res.status}).`);
    }
    throw new Error(`Gemini API error (${res.status}): ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data;
}

function buildSystemPrompt(agentsMd) {
  return `
انت أوفق AI Agent — عقل مستقل بيبني فيديوهات شورتس كاملة من الصفر، في أي مجال
محتوى. المجال وشكل المحتوى وطريقة جلب أصوله بالكامل قرار ملف الهوية اللي هتستخدمه
من identities/ — مفيش مجال افتراضي مفروض عليك.

# هويتك الثابتة والعقد التقني الإلزامي (التزم بيه حرفيًا، بما فيه كود الرندر بالكامل)
${agentsMd}

# الأداة الوحيدة المتاحة لك
run_terminal(command) — ده كل اللي عندك. مفيش أي أداة تانية، ومفيش أي دالة رندر جاهزة.
من خلاله لازم:
- تجيب أي نص/بيانات محتوى عن طريق: curl -s "<url>"
- **الأصول (صوت/صورة/فيديو)**: تُجاب دايمًا وقت التشغيل جوه المتصفح، بالطريقة اللي
  ملف الهوية حددها — ممنوع تحميلها محليًا بـ curl والإشارة لها بمسار محلي. القاعدة
  الكاملة وأمثلتها موجودة فوق في AGENTS.md.
- تكتب أي ملف (scene.html، سكريبت الرندر، ملف .md) عن طريق: cat > path/to/file << 'EOF' ... EOF
- **الرندر نفسه لازم تكتبه إنت بالكامل**: اكتب \`render-runner.js\` بالكود المرجعي
  المُختبَر الموجود فوق في AGENTS.md — انسخه واستخدمه زي ما هو، احفظه بأمر terminal،
  وشغّله بعد كده بأمر terminal تاني.
- ترفع أي ملف على الـ Release عن طريق: gh release upload $RELEASE_TAG <file> --repo $GH_REPO

**مهم جدًا**: لو أي أمر terminal فشل (زي مشكلة quoting في heredoc)، **صحّح نفس المشكلة
بدقة وأعد المحاولة** — ممنوع منعًا باتًا تستبدل المحتوى بنسخة مبسّطة أو منقوصة عشان
"تتجنب" الخطأ. إنت المسؤول الأول عن التأكد بنفسك إن \`scene.html\` فيه المحتوى الحقيقي
والهوية البصرية الصحيحة قبل ما تعتبره جاهز، حسب القواعد المكتوبة في AGENTS.md — لكن
خد بالك: **ملفات العلامة بتاعتك بيتحقق منها فعليًا بالكود** (تفصيل في البند 3 و4 تحت).

# معمارية تفكيرك — إلزامية
1. **Plan-and-Solve**: أول رد منك في المهمة لازم يكون **نص عادي** (من غير أي استدعاء run_terminal)
   فيه خطتك الكاملة خطوة بخطوة، بما فيها أي ملف هوية من identities/ حددت تستخدمه.
   لو حاولت تستخدم run_terminal قبل كده هيترفض تلقائيًا.
2. **التنفيذ**: نفّذ خطوة خطوة عن طريق run_terminal. ممنوع تمامًا تكتب أي نص أو بيانات
   مفروض حقيقيتها (نص، اقتباس، معلومة، إحصائية...) من ذاكرتك الداخلية — لازم يكون
   مصدرها نتيجة فعل حقيقي (زي curl) في نفس الجلسة.
3. **علامة انتهاء كل فيديو**: بعد ما ترفع فيديو وملف وصفه وملف scene.html نفسه بنجاح
   فعلي على الـ Release (الثلاثة كـ assets حقيقية)، اكتب ملف علامة بالأمر:
   cat > video_<معرّف فريد>_done.json << 'EOF'
   {"identifier": "...", "release_video_url": "...", "release_md_url": "...", "release_scene_html_url": "..."}
   EOF
   **تنبيه**: الملف ده بيتحقق فعليًا (كود حقيقي، مش وعد) إن الروابط التلاتة دي أصول
   موجودة فعلًا على الـ Release عن طريق gh release view قبل ما يُقبل — لو رُفض هتوصلك
   رسالة توضح بالتحديد الأصل الناقص، صحّح الرفع وأعد كتابة الملف.
   **بعد ما ملف العلامة يُقبل، إنت المسؤول بنفسك (من غير ما حد يطلب منك) عن كتابة
   رد نصي عادي (Reflexion) يقيّم اللي حصل قبل ما تكمل لأي فيديو تاني** — مفيش كود
   بيراقب الالتزام بالخطوة دي نفسها أو بيجبرك عليها.
4. **علامة انتهاء المهمة كاملة**: لما كل الفيديوهات المطلوبة تخلص، اكتب:
   cat > TASK_COMPLETE.json << 'EOF'
   {"summary": "...", "videos": [{"identifier": "...", "release_video_url": "...", "release_md_url": "...", "release_scene_html_url": "..."}]}
   EOF
   وده كمان بيتحقق منه بنفس الصرامة قبل ما الجلسة تقفل. آخر حاجة تعملها في الجلسة.

# بيئة التشغيل (متاحة كمتغيرات بيئة لأي أمر run_terminal)
- الريبو: $GH_REPO (${GH_REPO})
- Release Tag: $RELEASE_TAG (${RELEASE_TAG}) — الـ Release ده اتعمل فاضي بالفعل قبل ما تبدأ
- curl، gh، node، npm كلهم متاحين مباشرة

# المهمة المطلوبة منك دلوقتي
${TASK_JSON}
`.trim();
}

async function runAgentLoop() {
  const agentsMd = fs.readFileSync(path.join(WORK_DIR, 'AGENTS.md'), 'utf-8');
  const systemInstruction = buildSystemPrompt(agentsMd);

  let contents = [{ role: 'user', parts: [{ text: 'ابدأ المهمة. اكتب خطتك الكاملة كنص عادي أولًا.' }] }];
  let hasPlanned = false;
  let taskComplete = false;
  let finalPayload = null;

  for (let turn = 0; turn < MAX_TURNS && !taskComplete; turn++) {
    log(`--- Turn ${turn + 1}/${MAX_TURNS} ---`);
    const response = await callGemini(contents, systemInstruction);
    const candidate = response.candidates && response.candidates[0];
    if (!candidate) throw new Error('مفيش رد من Gemini: ' + JSON.stringify(response).slice(0, 500));

    contents.push(candidate.content);
    const parts = candidate.content.parts || [];
    const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

    if (functionCalls.length === 0) {
      const textReply = parts.map((p) => p.text || '').join(' ');
      log('رد نصي (خطة/تفكير/مراجعة): ' + textReply);
      hasPlanned = true;
      contents.push({ role: 'user', parts: [{ text: 'تمام. كمّل بأوامر run_terminal الفعلية دلوقتي.' }] });
      continue;
    }

    const functionResponses = [];
    for (const fc of functionCalls) {
      log(`run_terminal: ${JSON.stringify(fc.args)}`);

      let result;
      if (!hasPlanned) {
        result = { success: false, error: 'لازم تكتب خطتك الكاملة كنص عادي الأول قبل أي أمر terminal.' };
      } else {
        result = await runTerminal(fc.args || {});
      }

      log(`نتيجة: ${JSON.stringify(result)}`);
      functionResponses.push({ functionResponse: { name: fc.name, response: result, id: fc.id } });
    }
    // بعد كل دورة: تحقق فعلي من أي ملف علامة فيديو جديد (أصوله موجودة على
    // الـ Release ولا لأ)، وبعدين من TASK_COMPLETE.json نفسه بنفس الصرامة —
    // مطابق لما AGENTS.md بيوثّقه، مش بس تتبّع وجود ملف على القرص. أي رسالة
    // رفض بتتحط في نفس دورة الـ functionResponses عشان يفضل الترتيب متبادل
    // (model ثم user) صحيح بالنسبة لـ Gemini API.
    const rejectionMessages = verifyNewVideoMarkers();
    const completion = checkTaskCompletion();
    if (completion.rejection) rejectionMessages.push(completion.rejection);

    const extraParts = rejectionMessages.map((text) => ({ text }));
    contents.push({ role: 'user', parts: [...functionResponses, ...extraParts] });

    if (completion.done) {
      finalPayload = completion.payload;
      taskComplete = true;
      log('المهمة اكتملت بالكامل (تحقق فعليًا من كل الأصول على الـ Release).');
    }
  }

  if (!taskComplete) {
    throw new Error(`وصلنا للحد الأقصى من الأدوار (${MAX_TURNS}) من غير ما نلاقي ${TASK_COMPLETE_MARKER}.`);
  }
  return finalPayload;
}

// ---------------------------------------------------------------------------
// رفع ملفات التتبع (اللوج الكامل + TASK_COMPLETE.json) على الـ Release —
// مسؤولية agent.js نفسه (مش الموديل)، لأن اللوج ناتج من كوده هو، وعشان يحصل
// مضمون في كل الحالات (نجاح أو فشل)، مش معلّق على تذكّر الموديل ليه.
// ---------------------------------------------------------------------------
function uploadFinalArtifacts({ includeTaskComplete }) {
  const filesToUpload = [];
  if (includeTaskComplete && fs.existsSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER))) {
    filesToUpload.push(TASK_COMPLETE_MARKER);
  }
  if (fs.existsSync(AGENT_LOG_FILE)) {
    filesToUpload.push(AGENT_LOG_FILE);
  }
  if (filesToUpload.length === 0) return;

  try {
    execSync(
      `gh release upload ${RELEASE_TAG} ${filesToUpload.map((f) => `"${f}"`).join(' ')} --repo ${GH_REPO} --clobber`,
      { env: process.env, stdio: 'pipe' }
    );
    log(`تم رفع ملفات التتبع على الـ Release: ${filesToUpload.join(', ')}`);
  } catch (e) {
    log('تحذير: فشل رفع ملفات التتبع (اللوج/TASK_COMPLETE) على الـ Release — ' + e.message.slice(0, 200));
  }
}

async function main() {
  if (GEMINI_API_KEYS.length === 0) {
    console.error('GEMINI_API_KEY أو GEMINI_API_KEYS غير موجودين في متغيرات البيئة. أوقف التنفيذ.');
    process.exit(1);
  }

  log('بسم الله — بدء تشغيل أوفق AI Agent v2.0');

  try {
    execSync(
      `gh release create ${RELEASE_TAG} --repo ${GH_REPO} --title "Ofoq AI Agent Render" --notes "تم الإنشاء تلقائيًا بواسطة agent.js"`,
      { env: process.env, stdio: 'pipe' }
    );
    log(`تم إنشاء Release: ${RELEASE_TAG}`);
  } catch (e) {
    log('ملحوظة: فشل إنشاء الـ Release (يمكن يكون موجود بالفعل) — ' + e.message.slice(0, 200));
  }

  let finalPayload = null;
  try {
    finalPayload = await runAgentLoop();
    log('النتيجة النهائية: ' + JSON.stringify(finalPayload, null, 2));
  } catch (err) {
    log('فشل الـ Agent قبل ما يخلص المهمة: ' + err.message);
    // نرفع اللوج الكامل على الـ Release حتى في حالة الفشل، عشان يفضل التشخيص
    // ممكن من غير الرجوع لصفحة GitHub Actions نفسها.
    uploadFinalArtifacts({ includeTaskComplete: false });
    throw err;
  }

  // نجاح كامل: نرفع TASK_COMPLETE.json + اللوج الكامل على نفس الـ Release،
  // بجانب الفيديو/الوصف/scene.html اللي الموديل رفعهم بنفسه أثناء المهمة.
  uploadFinalArtifacts({ includeTaskComplete: true });

  if (CALLBACK_URL) {
    try {
      await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      log('تم إبلاغ الـ callback endpoint بنجاح.');
    } catch (e) {
      log('تحذير: فشل الاتصال بالـ callback endpoint — ' + e.message);
    }
  }
}

// ============================================================================
// نقطة الدخول
// ============================================================================
main().catch((err) => {
  console.error('خطأ فادح في الـ Agent:', err);
  process.exit(1);
});
