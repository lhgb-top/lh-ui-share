---
title: سكريبتات البناء والأدوات
description: 'مسؤوليات 13 سكريبت mjs في scripts/: build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` هي طبقة المحرّك للبناء والتحقق. ومعظم أوامر `package.json` تغليفات رقيقة
لهذه السكريبتات، ويمكن تشغيل السكريبت مباشرةً مع معاملات التنقيح.

## نظرة عامة على السكريبتات

| السكريبت | غلاف الأمر | المسؤولية |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | ترجمة scss الخاصة بـ share → `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports` (ضمن `pnpm build`) | توليد exports في `package.json` وفق بنية أدلة المصدر |
| `verify-dts.mjs` | `pnpm verify:dts` | تطابق مخرجات dts مع أنواع المصدر |
| `verify-styles.mjs` | `pnpm verify:styles` | ستة تحققات على scss (انظر [نظام التحقق](/ar/development/verification)) |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | بوابة تباين AA 4.5:1 للسمة |
| `check-version-sync.mjs` | `pnpm verify:versions` | تغطية نطاقات تبعية كل مكتبة واجهة لإصدار share الحالي |
| `gen-docs-data.mjs` | `pnpm docs:data` | تحليل الرموز / الأيقونات / أسماء الأصناف → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | دفع master + الوسم إلى GitHub وإطلاق الأرشفة |
| `release-notes.mjs` | — | توليد ملاحظات الإصدار |
| `extract-from-plus.mjs` | `pnpm extract` | **سكريبت لمرة واحدة**: استخراج الطبقة المشتركة من مستودع plus (استخدام تاريخي) |
| `normalize-styles.mjs` | — | تطبيع الأنماط (لمرة واحدة تاريخيًا) |
| `patch-var-fallbacks.mjs` | — | إضافة قيم fallback لـ `var()` دفعةً (لمرة واحدة تاريخيًا) |

## sync-exports.mjs —— مُولِّد مفاتيح exports

**هو السكريبت الأكثر عرضةً للمشاكل**.

تحمل `package.json` الخاصة بـ `@lh-ui/share` 77 مفتاح exports (مسارات فرعية مثل
`./core/button/*`)، يتولّدها هذا السكريبت جميعًا **بفحص** بنية أدلة `src/` و `styles/`.

**التدفّق**: تُكتب مخرجات `vite build` → يفحص `sync:exports` بنية دليل `es/` → يُعيد
كتابة حقلي `exports` / `files` في `package.json`.

**لماذا هو مهم**:

- عند إضافة `src/core/foo/bar.ts`، يتوفر فورًا في dev (الذي يسلك طريق alias للمصدر)،
  لكن **لا يوجد مفتاح exports مقابل على جانب npm** — فيواجه المستهلك MODULE_NOT_FOUND
  بعد `pnpm up`.
- **يجب تشغيل `pnpm build` كاملًا (الذي يشمل sync:exports) قبل الإصدار**، لا الاكتفاء
  بـ `build:dts`.

**انتبه إلى أنه يُعدِّل `package.json`**: فبعد تشغيله سترى في `git diff` تغيُّر exports،
وهذا طبيعي ويجب إيداعه.

## build-styles.mjs —— مخرجات الأنماط

يُترجم مصدر SCSS في `styles/` إلى css:

```
dist/
├── theme/
│   ├── index.css          # رموز السمة (فاتح)
│   └── index-dark.css     # تجاوزات الوضع الداكن
└── styles/
    └── index.css          # التجميع الكامل (الرموز + جميع المكوّنات)
```

**كما يُولِّد ملف التجميع الكامل `styles/index.scss`** (بفحص `styles/*/index.scss`)،
ويتحقق البند الرابع من `verify:styles` من اتساقه —— **لا تُعدِّل هذا الملف يدويًا**.

ولكل مكتبة واجهة `build-styles.mjs` خاص بها (نسخة plus تفحص وفق `packages/components`،
ونسخة vue2 تفحص وفق `src/components`)، ويُتجاوَز عن المكوّنات التي لا تملك مصدر أنماط
في share بشكل **صامت** — لذا يجب أن يوجد scss مقابل في share، وإلا فلن يكون لذلك
المكوّن أنماط في أحد الأطراف.

## gen-docs-data.mjs —— توليد بيانات التوثيق

```bash
pnpm docs:data
```

يحلِّل أربعة مصادر → `docs/src/data/*.json`:

| المخرَج | المصدر | المحتوى |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185 فاتحًا + 118 داكنًا + 183 متغير SCSS، مجمَّعة حسب المجال الدلالي |
| `icons.json` | `src/.../icon/svgs.ts` | 37 أيقونة مدمجة |
| `classes.json` | `styles/*/index.scss` | 58 قائمة بأسماء أصناف BEM للمكوّنات |

**يحمل تأكيدات على الأعداد**: يُخطئ مباشرةً إذا لم تطابق نتائج التحليل القيم المتوقعة
(185 / 118 / 183 / 37 / 58). وهذا هو الخط الدفاعي الأول ضد «حذف رمز بالخطأ / حذف
مكوّن بالخطأ».

**مُساوٍ (idempotent)**: شغّله بحرية، فهو يُعدِّل json عند تغيُّر المحتوى فقط. وبعد
تعديل رمز أو اسم صنف شغِّله مرة لتحديث بيانات التوثيق.

## push-release.mjs —— دفع الإصدار

```bash
pnpm release:push
```

يُشغَّل بعد `pnpm release` (النشر إلى npm + إنشاء الوسم محليًا):

1. يدفع master إلى `github-lhgb`
2. يدفع وسم هذا الإصدار إلى `github-lhgb`
3. يُطلِق `.github/workflows/release.yml`: يسحب الحزمة المنشورة من npm → ينشئ GitHub
   Release (مُرفَقًا به `lh-ui-share-<version>.tgz`) → يدفع الوسم إلى Gitee ويستدعي
   واجهة Gitee لإنشاء الإصدار

**ادفع إلى GitHub فقط، ولا تدفع الوسم يدويًا إلى Gitee** — فوسوم Gitee وإصداراته
يديرها release.yml بشكل موحَّد، والكتابة المزدوجة تُحدث تعارضًا.

## verify-theme-contrast.mjs —— بوابة التباين

يقرأ مخرجات `es/` (لذا **يجب تشغيل `pnpm build` أولًا**)، ويستخدم الدالتين
`getRelativeLuminance` / `getContrastRatio` المُصدَّرتين من `src/theme/themes/index.ts`
لحساب تباين WCAG لكل زوج «نص / خلفية»، ويفشل عند هبوطه عن 4.5:1.

ولتنقيح لون واحد يمكنك استدعاء الدالتين مباشرةً في node دون تشغيل البوابة كاملةً.

## سكريبتات تاريخية لمرة واحدة

| السكريبت | الوصف |
| --- | --- |
| `extract-from-plus.mjs` | استخرج الطبقة المشتركة من lh-ui-plus عند تأسيس مستودع share. **يُحفَظ كسجل ولا يُشغَّل بعد الآن** — فقد أصبح share هو المصدر الوحيد (الخط الأحمر 2). |
| `normalize-styles.mjs` | تطبيع الأنماط في المراحل المبكرة (توحيد طريقة الإشارة إلى الرموز). وقد أكمل مهمته. |
| `patch-var-fallbacks.mjs` | يضيف قيم fallback لـ `var(--lh-*)` دفعةً. وهو أداة ترحيل سابقة على البند الثاني من verify:styles (var fallback) — **يجب على الكود الجديد كتابة fallback يدويًا، فلا تعتمد على هذا السكريبت كحامل احتياطي**. |

## موقع docs ليس مخرجًا من npm

حقل `files: ["es", "lib", "dist", "styles"]` في `package.json` **لا يشمل `docs/`**.
ويُبنى موقع التوثيق عبر `pnpm docs:build` إلى `docs/dist/`، ثم يُنشَر يدويًا إلى nginx
العائلة (العقد في `lh-ui/docs/部署/nginx-lhui.conf.md`، مستودع آخر). لمزيد من التفاصيل
انظر [سيرورة الإصدار](/ar/development/release).

## وثائق ذات صلة

- [قائمة الأوامر](/ar/development/commands) —— أمر pnpm المقابل لكل سكريبت
- [نظام التحقق](/ar/development/verification) —— منطق فحص كل سكريبت verify
- [سيرورة الإصدار](/ar/development/release) —— push-release وأرشفة CI
- [مداخل الحزمة والمسارات الفرعية](/ar/guide/exports) —— المفاتيح الـ 77 التي يُولِّدها sync-exports
