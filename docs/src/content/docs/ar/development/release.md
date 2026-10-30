---
title: عملية الإصدار
description: 'إصدار في ست خطوات: changeset ← الدمج في master ← changeset:version ← الالتزام ← release ← release:push، والأرشفة التلقائية عبر CI'
---

إصدار share هو **خط أنابيب من ست خطوات يحرسه الإنسان**: يتم النشر إلى npm محليًا (وتُجرى خطوات التحقق يدويًا)، بينما تتولى CI أرشفة الوسوم والإصدارات على GitHub / Gitee تلقائيًا.

## الخطوات الست

### 1. كتابة changeset

```bash
pnpm changeset
```

اختيار تفاعلي لنطاق التغيير (major / minor / patch) مع كتابة وصف للتغيير، ليُنشأ `.changeset/<اسم-عشوائي>.md`. **وتُجمَّع قبل الدمج في master**، كل changeset موضوعته مستقلة.

اصطلاح المستويات:

| المستوى | متى يُستخدم |
| --- | --- |
| `major` | تغييرات كارثية (إعادة تسمية، حذف API، تغيير السلوك). ويُؤخذ مأخذ الجد في مرحلة 0.x أيضًا—فالمصب يقرر بناءً عليه ما إذا كان يلزم تعديل كوده |
| `minor` | إضافة ميزات (مكوّن جديد، مفتاح مسبق جديد، تصدير جديد) |
| `patch` | إصلاح الأخطاء، وضبط الأنماط الدقيق |

### 2. الالتزام والدمج في master

```bash
git add -A
git commit -m "feat: ..."      # تُكتب رسالة الالتزام بتفصيل markdown
# ثم PR / دفع مباشر للدمج في master
```

### 3. استهلاك changeset

```bash
pnpm changeset:version
```

يقوم بثلاثة أمور: دمج جميع changesets بانتظار النشر في وصف تغيير الإصدار ← تعديل رقم الإصدار في `package.json` ← كتابة CHANGELOG.md، و**حذف ملفات changeset المستهلكة**.

يُحدَّد رقم الإصدار بأعلى مستوى بين changesets بانتظار النشر (فمثلًا إن كان أعلى مستوى بين 9 changesets هو minor ← `0.3.0` ← `0.4.0`).

### 4. الالتزام برقم الإصدار

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**لماذا التزام يدوي**: فقيمة `commit: false` في `.changeset/config.json`، ولن يقوم changeset بتنفيذ git commit تلقائيًا. ورسالة هذا الالتزام تكتب وفق الاصطلاح `chore(release): x.y.z` مع تفصيل markdown لمحتوى هذا النشر.

### 5. النشر إلى npm وإنشاء tag محلي

```bash
pnpm release
```

أي `changeset publish`، بالترتيب الآتي:

1. تشغيل `prepublishOnly`: `pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. النشر إلى npm (`npm publish`)
3. إنشاء tag `@lh-ui/share@x.y.z` **محليًا** (إنشاء فحسب، بلا دفع)

**الشروط المسبقة**: إكمال `npm login`. وهذه عملية اعتماد، لا يقوم الذكاء الاصطناعي بها نيابة عنك.

**تنبيه: لا يُشغّل prepublishOnly سوى ثلاث خطوات تحقق**—فيجب تشغيل test / lint / typecheck / verify:theme صراحةً يدويًا قبل النشر (راجع [قائمة التحقق الكاملة](/ar/development/verification#تشغيل-التحقق-كاملًا)).

### 6. الدفع والأرشفة

```bash
pnpm release:push
```

يدفع master + tag الحالي إلى `github-lhgb`، مما يُطلق `.github/workflows/release.yml` تلقائيًا.

## الأرشفة التلقائية عبر CI (release.yml)

```
tarball المنشور على npm
  → إنشاء GitHub Release (يُرفق lh-ui-share-<version>.tgz، ويمكن تثبيته دون اتصال عبر npm i ./xxx.tgz)
  → دفع tag إلى Gitee
  → استدعاء Gitee API لإنشاء إصدار (يحتوي النص على رابط تحميل tgz من GitHub)
```

**التصميم الجوهري**: لا يُعيد release.yml **البناء**، بل يأخذ الحزمة مباشرةً من tarball المنشور على npm—مطابق بايتًّا بايتًا لما يثبته المستخدم عبر `npm i`. ويُجري البناء والتحقق المزدوج كلٌّ من `pnpm release` المحلي (prepublishOnly) و`ci.yml` مرة واحدة.

وهكذا فإن إنشاء النسخ التاريخية المبكرة لا يفشل بسبب غياب `pnpm-lock.yaml` أو السكربتات في الشيفرات القديمة—**يكفي دفع tag المفقود إلى GitHub**، وتتولى العملية نفسها الأرشفة تلقائيًا.

## متابعة المصب (الخط الأحمر 5)

**قيد صارم على ترتيب النشر: يُنشر share أولًا، ثم تتبعه مكتبات واجهة المستخدم.**

بعد نشر share 0.4.0:

```bash
# مستودع lh-ui-plus
pnpm up @lh-ui/share@0.4.0
pnpm test          # تحقق الانحدار

# مستودع lh-ui-vue2
pnpm up @lh-ui/share@0.4.0
pnpm test          # تحقق الانحدار
```

وعندها فقط يمر `pnpm verify:versions` من جديد (فقبل النشر يبقى نطاق تبعية المستودعين الشقيقين `^0.3.0`، وهو متوقع).

## ملاحظات

- **يُدفع إلى GitHub محليًا (`github-lhgb`) فقط**، **ولا يُدفع tag يدويًا إلى Gitee**—فوسوم Gitee وإصداراته يتولاها release.yml بشكل موحد، والكتابة المزدوجة تتعارض.
- **`npm login` خطوة يدوية**: فإذا أعاد `npm whoami` الخطأ 401 فهذا يعني عدم تسجيل الدخول، فسجّل الدخول أولًا ثم `pnpm release`.
- **إنشاء النسخ التاريخية**: `git push github-lhgb @lh-ui/share@0.2.0` يكفي، وrelease.yml متطابق ذاتيًا (فإن كان Release موجودًا اكتفى برفع tarball). وإن فشل إنشاء الإصدار يمكن إعادة تشغيل سير العمل من صفحة Actions عبر `workflow_dispatch` مع تمرير tag.
- **يعتمد إصدار Gitee على Secret باسم `GITEE_TOKEN`** (رمز وصول شخصي لـ Gitee، مع تحديد صلاحية releases)، ويُضبط في Settings ← Secrets لمستودع GitHub.
- **لا تُعدَّل الشيفرة المصدرية أثناء النشر**: سيُعيد prepublishOnly الخاص بـ `pnpm release` البناء، وينبغي أن تكون مساحة العمل نظيفة في تلك اللحظة.
- **تراث 0.3.0**: دُمج رقم الإصدار حينها في التزام إصلاح واحد (`791ff32`)، دون التزام `chore(release)` مستقل. ومن هذا النشر يُستأنف الاصطلاح، دون العودة لتعديل التاريخ.

## النشر (مستودع آخر)

يُنشر موقع الوثائق إلى nginx الخاص بالأسرة، والعقد في `lh-ui/docs/部署/nginx-lhui.conf.md` (**مستودع آخر**): إضافة `location ^~ /lhui/share/`، وتحديث قائمة المواقع الثمانية إلى تسعة. أما مستودع share فمسؤوليته فقط أن يكون ناتج `pnpm docs:build` قابلًا للاستخدام.

## وثائق ذات صلة

- [الأوامر](/ar/development/commands)
- [نظام التحقق](/ar/development/verification)
- [سكربتات البناء والأدوات](/ar/development/scripts)
- [المساهمة](/ar/development/contribution)
- [كيفية الاستهلاك في كل طرف](/ar/guide/consumption) —— كيف يتابع المصب الإصدارات الجديدة
