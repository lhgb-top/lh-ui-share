---
title: الزخارف الصينية
description: 'ست زخارف SVG مضمَّنة: 柳叶 / 云纹 / 水波 / 雪花 / 梅花 / 竹叶، ومجموعة apply-pattern mixin'
---

النمط الصيني ليس زخرفة في lh-ui، بل أحد مقترحاته التصميمية. ويوفّر
`styles/theme/common/patterns.scss` ست زخارف تقليدية تُحقن كطبقة خلفية اختيارية.

## الزخارف الست

| الزخرفة | متغير CSS | الوصف |
| --- | --- | --- |
| 柳叶纹 (أوراق الصفصاف) | `--lh-pattern-willow` | أوراق صفصاف نحيلة، توزيع متناسق، ترقص مع النسيم |
| 云纹 (السحب) | `--lh-pattern-cloud` | سحب ميمونة (祥云) منبسطة، تلتف وتتمايل |
| 水波纹 (تموجات الماء) | `--lh-pattern-water` | تموجات تتمايل برفق، طبقة فوق طبقة |
| 雪花纹 (رقاقات الثلج) | `--lh-pattern-snow` | بلورات ثلج سداسية الأضلاع بأذرع متفرعة دقيقة |
| 梅花纹 (أزهار البرقوق) | `--lh-pattern-plum` | خمس بتلات منبسطة، أسدية واضحة |
| 竹叶纹 (أوراق الخيزران) | `--lh-pattern-bamboo` | أوراق خيزران رمحية الشكل، عرق وسطي واضح، متناثرة بانسجام |

جميعها مضمَّنة بصيغة `data:image/svg+xml` (**لا موارد خارجية**، دون اعتماد على الشبكة
ولا مشاكل CORS)، وهي `!default` فيستطيع المستخدم تجاوزها. ويوجد أيضًا
`--lh-pattern-none: none` (إلغاء صريح للزخرفة).

## تفعيل الزخارف

الزخارف **غير مُفعَّلة افتراضيًا** (`--lh-bg-pattern: none`). وثلاث طرق لتفعيلها:

### 1. الكتابة مباشرةً داخل مكوّن / صفحة

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. عبر themeVars في ConfigProvider

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

يُحوَّل المفتاح المختصر `'bg-pattern'` تلقائيًا إلى `--lh-bg-pattern`.

### 3. خاصية pattern + القائمة البيضاء

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

تؤثر الزخرفة على الخلفية، وليست كل المكوّنات مناسبة لها (طباعة أزهار البرقوق على
خلفية جدول مزعجة بصريًا). ويتحكم القائمة البيضاء `patternComponents` في المكوّنات
التي تُضاف إليها الزخرفة. لمزيد من التفاصيل انظر
[التخصيص في وقت التشغيل](/ar/theme/customization#ثالثًا-patterncomponents--القائمة-البيضاء-للزخارف).

## رموز التحكم

```scss
:root {
  --lh-bg-pattern: none;                                     // غير مُفعَّل افتراضيًا
  --lh-bg-pattern-repeat: repeat;                            // طريقة التبليط
  --lh-bg-pattern-size: 40px;                                // حجم الوحدة (40px افتراضيًا ليتناسب مع ارتفاع الزر، تفاديًا لقطع الزخرفة)
  --lh-bg-pattern-opacity: 0.15;                             // درجة الشفافية
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // اللون
  --lh-bg-pattern-blend: soft-light;                         // وضع المزج
}
```

جميعها `!default` قابلة للتجاوز. وأكثر مفتاحين استخدامًا:

- **`--lh-bg-pattern-size`**: 40px هو الحجم الذي «يتسع لزخرفة كاملة ضمن ارتفاع الزر»؛
  ويمكن رفعه إلى 80px+ لتتنفس الزخرفة في الخلفيات الكبيرة.
- **`--lh-bg-pattern-opacity`**: 0.15 قيمة افتراضية «حاضرية دون لفت الانتباه»؛ وللحصول
  على جو صيني أوضح يمكن رفعها إلى 0.25.

## apply-pattern mixin

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // له fallback
  @content;
}
```

يكفي `@include` داخل المكوّن لاكتساب قدرة خلفية الزخرفة:

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**لماذا لا تكتب fallback للثلاثة الأولى**: الزخارف غير مُفعَّلة افتراضيًا، ويمرر هذه
الرموز الثلاثة المستخدم / ConfigProvider؛ والغياب يعني عدم وجود زخرفة (يُوفَّر
fallback الخاص بـ `background-image: none` من القيمة الافتراضية للرمز نفسه)، وكتابة
fallback جامدة تجعل «الزخرفة غير المكوَّنة» و«الزخرفة المُلغاة صراحةً» غير قابلين للتمييز.

## الزخارف والوضع الداكن

تشير `--lh-bg-pattern-color` افتراضيًا إلى `--lh-decoration-color` (لون الزخرفة)،
وهو يحمل تجاوزًا داكنًا في `var-dark.scss` —— فيتكيّف لون الزخرفة مع الوضع الداكن
تلقائيًا.

وإذا خصَّصت لون الزخرفة، فتذكَّر ضبطه في الوضع الداكن أيضًا:

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## ملاحظات

- **الإغلاق الافتراضي مقصود**: الزخرفة جو لا معلومة، وتفعيلها افتراضيًا يلوِّث واجهات
  جميع المستخدمين. ومن يريد زخرفة عامة على مستوى العمل فليفعِّلها في ConfigProvider بنفسه.
- **حجم SVG المضمَّن**: الزخارف الست كلها مسارات مبسطة، كلٌّ منها بضع مئات من البايتات،
  ولا يولِّد إدراجها في CSS أي طلبات إضافية.
- **تجاوز `!default`**: لاستبدال زخارفك الخاصة، تجاوز في المشروع
  `--lh-pattern-plum: url('data:image/svg+xml,...')`، أو اضبط `--lh-bg-pattern` مباشرةً.
- **مشاهد الطباعة**: قد لا تظهر الزخارف عند الطباعة (معاملة المتصفحات لطباعة
  `background-image`)، فلا تعتمد طبقة المحتوى على الزخرفة لإيصال المعلومات.

## وثائق ذات صلة

- [نظرة عامة على نظام السمة](/ar/theme/overview)
- [التخصيص في وقت التشغيل](/ar/theme/customization)
- [رموز التصميم](/ar/theme/tokens)
- [مصدر الأنماط](/ar/reference/styles)
