---
title: transition-mixins —— أسماء أصناف الانتقال عبر الأطراف
description: 'ثلاثة mixin هي lh-enter-both / lh-leave-both / lh-transition-ends تستوعب اختلافات أسماء أصناف الانتقال بين Vue2 و Vue3/React'
---

ملف `styles/theme/common/transition.scss` هو **المصدر الوحيد** لأسماء أصناف الانتقال عبر
الأطراف. وهو يحل مشكلة حقيقية:

أسماء أصناف الانتقال في Vue2 هي `<name>-enter` / `<name>-leave` (**الحالة الأولية**
للدخول / الخروج)، بينما غُيِّرت في Vue3 و React إلى `<name>-enter-from` /
`<name>-leave-from`. والطرفان يحملان الدلالة نفسها («الحالة الأولية للدخول» / «الحالة
الأولية للخروج») باسمين مختلفين فقط. وكان 16 مكوّنًا تكتب يدويًا نسختين من المحدِّدات
في كل ملف، فيُصحَّح مكان ويُنسى آخر.

## الثلاثة mixin

| Mixin | المعاملات | أسماء الأصناف المُولَّدة | الاستخدام |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector` (إلزامي)، `$child` (اختياري) | `#{$selector}-enter` و `#{$selector}-enter-from` | كتابة مزدوجة للحالة الأولية للدخول |
| `lh-leave-both` | `$selector` و `$child`? | `#{$selector}-leave` و `#{$selector}-leave-from` | كتابة مزدوجة للحالة الأولية للخروج |
| `lh-transition-ends` | `$selector` و `$child`? | `#{$selector}-enter` و `#{$selector}-enter-from` و `#{$selector}-leave-to` | حالتا بداية ونهاية الانتقال (كتابة مزدوجة للحالة الأولية للدخول + الحالة النهائية للخروج بالاسم المشترك بين الطرفين) |

تستقبل الثلاثة كتلة الأنماط عبر `@content`.

### المعامل `$child`

عند الحاجة إلى تعليق حالة الانتقال على **عقدة سليل**، مرِّر المعامل الثاني، فيأخذ
المحدِّد المُولَّد اللاحقة ` #{$child}`:

```scss
// دون $child: الحالة مُعلَّقة على المحدِّد نفسه
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// مع $child: الحالة مُعلَّقة على اللوحة الداخلية
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## لماذا هذه الثلاثة تحديدًا

- `-enter-to` / `-leave-to` **اسمان متطابقان في الطرفين**، فلا حاجة لكتابة مزدوجة.
- وما يحتاج كتابة مزدوجة هو **الحالات الأولية المتقابلة** فقط: `-enter` / `-enter-from`
  و `-leave` / `-leave-from`.
- أما `lh-transition-ends` فللمشهد الشائع حيث «يلتقي ابتداء الدخول مع نهاية الخروج»
  (التلاشي للداخل والخارج: الشفافية 0 → 1 → 0)، فيغطي mixin واحد الكتابة المزدوجة
  للحالة الأولية للدخول + الحالة النهائية للخروج.

## أمثلة استخدام

### انتقال عادي (تلاشي backtop)

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

نتيجة الترجمة:

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### الحالة الأولية للدخول فقط (تلاشي dialog، الحالة النهائية غير مطلوبة)

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### الحالة مُعلَّقة على اللوحة الداخلية (انزلاق drawer)

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

يضيف `<transition name="lh-drawer-fade">` في Vue3 الصنف `lh-drawer-fade-enter-from`
في مرحلة enter إلى **العقدة الجذرية**، فيطابق المحدِّد اللوحة من نسلها فتقوم اللوحة
بالإزاحة — بينما لا تتحرك العقدة الجذرية نفسها، تجنبًا لتأثير transform الخاص بها على
تموضع العقدة الجذرية لـ teleport.

## كيف يُستخدم داخل المكوّن

```scss
// styles/drawer/index.scss
@use 'theme/common/transition' as *;

.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
  @include lh-leave-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

طبقة واجهة المستخدم (Vue3):

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

طبقة واجهة المستخدم (Vue2):

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**يستخدم الطرفان `name` نفسه**، ويصيب كلٌّ منهما أسماء أصناف طرفه عبر المحدِّدات
المزدوجة التي يولِّدها mixin. وهذا هو تجسيد «حقن موزَّع ومحتوى من مصدر واحد» على
أسماء أصناف الانتقال.

## ملاحظات

- **يُمنع إعادة كتابة نسختي أسماء أصناف الانتقال يدويًا** في أنماط المكوّن، بل `@include`
  دائمًا ([الخط الأحمر 2](/ar/development/contribution#الخطوط-الحمراء-الستة)). ويفحص
  البند الخامس من `verify:styles` (المصدر الوحيد لأسماء أصناف الانتقال) القيم الحرفية
  `-enter-from` / `-leave-from` المكتوبة مباشرةً.
- **مسار `@use`**: `@use 'theme/common/transition' as *;` (والمسار النسبي داخل scss كل
  مكوّن أو bare specifier في وقت البناء يحدِّده [استراتيجية الحقن](/ar/guide/injection)).
- **مشهد React**: يستخدم إصدار React انتقالات headless (className مدفوعة بالحالة)،
  وتنطبق أسماء أصناف `-enter-from` التي يولِّدها mixin بشكل مماثل.
- **لاحقة `$child` هي محدِّد سليل**: ليست وصلاً عبر `&`، فالمحدِّد المُولَّد هو
  `.parent-enter .child`، ويعتمد على حمل العقدة الجذرية لاسم صنف الانتقال.

## وثائق ذات صلة

- [استراتيجية الحقن](/ar/guide/injection) —— اختلاف مخرجات الأنماط بين الطرفين
- [الوضع الداكن](/ar/theme/dark-mode) —— الرموز: وقت التشغيل مقابل وقت الترجمة
- [مصدر الأنماط](/ar/reference/styles) —— دليل `styles/` واتفاقيات BEM
