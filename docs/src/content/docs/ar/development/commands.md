---
title: الأوامر
description: 'جدول شامل لـ pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release'
---

تُعرَض جميع مهام التطوير عبر scripts في `package.json` الجذري، ومدير الحزم مثبَّت على `pnpm`.

## البناء

| المهمة | الأمر | الناتج / الدور |
| --- | --- | --- |
| البناء | `pnpm build` | `es/` + `lib/` (بنية preserveModules المرآة) + الأنماط + dts + `sync:exports` |
| ناتج الأنماط | `pnpm build:styles` | `dist/theme/` (css السمة الفاتحة والداكنة) + `dist/styles/` (تجميع كامل) |
| dts | `pnpm build:dts` | تعريفات الأنواع مُخرَجة مباشرةً من نسخة `tsc` المرآة |
| النسخ المتزامن | `pnpm sync:exports` | إعادة كتابة حقل exports في `package.json` ليتطابق مع بنية الأدلة |

`pnpm build` هو الخط الكامل، وقد تضمَّن داخله `build:styles` و `build:dts`. **تنبيه**: يعيد `sync:exports` **كتابة حقل exports في `package.json`**—فبعد تعديل بنية أدلة الشيفرة المصدرية يجب تشغيل build كامل مرة واحدة، وإلا واجه المصب `MODULE_NOT_FOUND` بعد `pnpm up`.

## الاختبار والجودة

| المهمة | الأمر | الدور |
| --- | --- | --- |
| اختبار الوحدة | `pnpm test` | vitest، و`tests/unit/` (**اختبارات core الوحيدة**، يتشاركها المستودع الثلاثة) |
| Lint | `pnpm lint` | eslint، لا يفحص سوى `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| الأنواع | `pnpm typecheck` | tsc، وinclude يقتصر على `src/**/*` |

## التحقق

| المهمة | الأمر | الدور |
| --- | --- | --- |
| تحقق dts | `pnpm verify:dts` | التأكد من تطابق dts الناتج مع أنواع المصدر |
| تحقق scss | `pnpm verify:styles` | ستة بنود (انظر أدناه) |
| تباين السمة | `pnpm verify:theme` | بوابة AA بنسبة 4.5:1، تقرأ ناتج `es/` (**تتطلب `pnpm build` أولًا**) |
| اتساق الإصدارات | `pnpm verify:versions` | تغطي نطاقات تبعية كل مكتبة واجهة للإصدار الحالي من share |

### بنود verify:styles الستة

1. **لوحة EP** —— مدى اللون / مطابقة القيم الدلالية
2. **fallback للمتغيرات** —— يجب أن تحمل `var(--lh-*)` داخل المكوّن قيمة احتياطية
3. **@use للرموز** —— يجب أن يستحضر scss الخاص بالمكوّن الرموز عبر `@use`، دون الإشارة إلى قيم hex حرفية
4. **اتساق التجميع** —— تطابق `styles/index.scss` مع نتيجة فحص أدلة المكوّنات (تفاديًا لفوات التجميع)
5. **مصدر أصناف الانتقال** —— يُمنع كتابة `-enter-from` / `-leave-from` مكشوفة، بل تستخدم [transition mixin](/ar/reference/transition-mixins) حصرًا
6. **إتاحة الوضع الداكن** —— الرموز المثبَّتة قسرًا في الوضع الفاتح لها تغطية في `var-dark.scss` (راجع [الوضع الداكن](/ar/theme/dark-mode))

## الإصدار

| المهمة | الأمر | الدور |
| --- | --- | --- |
| كتابة التغييرات | `pnpm changeset` | توليد تفاعلي لـ `.changeset/*.md` |
| استهلاك changeset | `pnpm changeset:version` | تعديل رقم الإصدار، وكتابة CHANGELOG، وحذف changesets بانتظار النشر |
| النشر | `pnpm release` | `changeset publish`: يشغّل `prepublishOnly` أولًا (build + verify:dts + verify:styles) ثم ينشر إلى npm، ثم يبني tag محليًا |
| الدفع للأرشفة | `pnpm release:push` | دفع master + tag الحالي إلى GitHub، مما يُطلق الأرشفة التلقائية |

يُرجع إلى [عملية الإصدار](/ar/development/release) للخط الكامل.

## موقع الوثائق

| المهمة | الأمر | الدور |
| --- | --- | --- |
| توليد البيانات | `pnpm docs:data` | يحلل `scripts/gen-docs-data.mjs` الرموز / الأيقونات / أسماء الأصناف ← `docs/src/data/*.json` |
| التطوير المحلي | `pnpm docs:dev` | خادم Astro للتطوير (`http://localhost:5180/lhui/share/`) |
| البناء | `pnpm docs:build` | بناء إنتاجي إلى `docs/dist/` |
| المعاينة | `pnpm docs:preview` | معاينة ناتج البناء |

**تنبيه**: `pnpm docs:data` متطابق ذاتيًا، ويتضمن تأكيدات للكميات (فاتح 185 / داكن 118 / SCSS 183 / أيقونات 37 / أسماء أصناف 58 ملفًا)، فإذا لم تتطابق أعداد التحليل يُرفع خطأً مباشرةً.

## مسارات العمل النموذجية

### تعديل مكوّن core

```bash
pnpm test                                    # تشغيل اختبارات الوحدة (اكتب الاختبار أولًا)
pnpm lint && pnpm typecheck                  # الجودة
pnpm build                                   # بناء كامل (يشمل sync:exports)
pnpm verify:dts && pnpm verify:styles        # التحقق من الناتج والأنماط
pnpm changeset                               # كتابة التغييرات
git add -A && git commit                     # الالتزام (يُدمج لاحقًا في master)
```

### تعديل الأنماط

```bash
# تعديل styles/ فقط، بلا حاجة لتشغيل جزء js من build
pnpm verify:styles                           # التحقق من البنود الستة
pnpm build:styles                            # توليد ناتج dist
pnpm docs:data                               # تحديث بيانات جداول الرموز (فقط عندما تتغير الرموز)
```

### إضافة مكوّن جديد

```bash
# 1. الثلاثي
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. إضافة التصدير في src/core/index.ts
# 3. التحقق
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # يولد sync:exports مفتاح exports جديدًا
pnpm verify:dts && pnpm verify:styles
# 4. changeset (minor: مكوّن جديد)
pnpm changeset
```

**المفتاح**: إن لم يُشغَّل `sync:exports` فلن يكون هناك مفتاح exports مقابل على جهة npm—فيلزم المرور بـ `pnpm build` كاملًا قبل النشر. وبعد إضافة `styles/<name>/index.scss` تتولى سكربتات بناء الأطراف تغطيته تلقائيًا (كلٌّ حسب فحص أدلة مكوّناته)، ولكن يجب أن يوجد scss مقابل في share، وإلا فلا ناتج أنماط للمكوّن في أحد الأطراف (تجاوز صامت).

## ماذا يشغّل CI

يُشغِّل `.github/workflows/ci.yml` عند كل PR / دفع إلى master: install ← lint ← typecheck ← test ← build ← verify:dts ← verify:styles (+ `docs:build` بعد الدفعة E).

**ما لا يُشغَّل**: `verify:theme` (بوابة التباين، يحرسها المرء يدويًا محليًا)، و`verify:versions` (اتساق الإصدارات، يعالجه المصب بعد النشر).

## التبعيات وسلسلة الأدوات

- مدير الحزم: `pnpm` (يجب رفع lockfile)
- البناء: `vite` + `rollup` (preserveModules)
- الأنواع: `tsc` (`tsconfig.build.json` يُخرج dts مباشرةً)
- الاختبار: `vitest`
- الأنماط: `sass` (`api: 'modern'`)
- changeset: `@changesets/cli`
- موقع الوثائق: `astro` + `@astrojs/starlight`

## وثائق ذات صلة

- [نظام التحقق](/ar/development/verification) —— ما الذي يفحصه كل بند من البنود الستة
- [سكربتات البناء](/ar/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` وغيرها
- [عملية الإصدار](/ar/development/release) —— النشر في ست خطوات
- [المساهمة](/ar/development/contribution) —— الخطوط الحمراء وقائمة قبل تقديم PR
