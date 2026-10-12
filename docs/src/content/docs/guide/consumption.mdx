---
title: 各端如何消费
description: Vue3 / Vue2 / React / uniapp 四端把 share 纯函数接到各自响应式机制上的接线样例
---

# 各端如何消费

share 的 core 是纯函数，不含任何响应式。各端 UI 库只做一件事：**把纯函数的输出绑到
模板，把用户的输入喂回纯函数**。下面是四端的接线形态。

## 通用模式

每个组件的接线都是这三步：

1. 框架侧持有一份 state（`ref` / `useState` / 响应式 data）
2. 用户交互 → 调 core 纯函数算出新 state → 写回
3. 模板里调类名 / aria 属性包纯函数渲染

```ts
// core 侧（框架无关，本仓）
export function getSwitchClasses(state: LhSwitchState): string
export function getSwitchAria(state: LhSwitchState): Record<string, string>
export function toggleSwitch(state: LhSwitchState, checked: boolean): LhSwitchState
```

## Vue3（lh-ui-plus）

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { getSwitchClasses, getSwitchAria, toggleSwitch } from '@lh-ui/share/core/switch'

const checked = ref(false)
const classes = computed(() => getSwitchClasses({ checked: checked.value, disabled: false }))
const aria = computed(() => getSwitchAria({ checked: checked.value }))

function onToggle() {
  checked.value = toggleSwitch({ checked: checked.value }, !checked.value).checked
}
</script>

<template>
  <button :class="classes" v-bind="aria" @click="onToggle">
    <span class="lh-switch__handle" />
  </button>
</template>

<style lang="scss">
@use '@lh-ui/share/styles/switch';
</style>
```

样式在库入口全量 side-effect 注入，组件里一般不用自己引（见[注入策略](/guide/injection)）。

## Vue2（lh-ui-vue2）

```vue
<script lang="ts">
import { getSwitchClasses, getSwitchAria, toggleSwitch } from '@lh-ui/share/core/switch'

export default {
  name: 'LhSwitch',
  data() {
    return { checked: false }
  },
  computed: {
    classes() {
      return getSwitchClasses({ checked: this.checked, disabled: false })
    },
    aria() {
      return getSwitchAria({ checked: this.checked })
    },
  },
  methods: {
    onToggle() {
      this.checked = toggleSwitch({ checked: this.checked }, !this.checked).checked
    },
  },
}
</script>
```

样式需用户按需引：

```ts
import '@lh-ui/vue2/theme.css'
import '@lh-ui/vue2/style/switch'
```

## React（lh-ui-react）

`useMemo` 替代 `computed`；state 变化触发重渲染天然是响应式的：

```tsx
import { memo, useMemo, useState } from 'react'
import {
  getSwitchClasses,
  getSwitchAria,
  toggleSwitch,
} from '@lh-ui/share/core/switch'
import '@lh-ui/react/style/switch'

export const LhSwitch = memo(function LhSwitch() {
  const [checked, setChecked] = useState(false)

  const classes = useMemo(
    () => getSwitchClasses({ checked, disabled: false }),
    [checked],
  )
  const aria = useMemo(() => getSwitchAria({ checked }), [checked])

  return (
    <button
      type="button"
      className={classes}
      {...aria}
      onClick={() => setChecked((c) => !c)}
    >
      <span className="lh-switch__handle" />
    </button>
  )
})
```

## uniapp（lh-ui-uniapp）

uniapp 的 `<view>` / `<text>` 上不能随意绑 aria 属性，`getSwitchAria` 的产物在
小程序端会被过滤；app / h5 端仍可用。类名绑定走 `:class` 字符串或数组：

```vue
<template>
  <view :class="classes" @tap="onToggle">
    <view class="lh-switch__handle" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getSwitchClasses, toggleSwitch } from '@lh-ui/share/core/switch'

const checked = ref(false)
const classes = computed(() => getSwitchClasses({ checked: checked.value }))
function onToggle() {
  checked.value = !checked.value
}
</script>
```

## 国际化：同一个 emitter，四种订阅

LhLocale 是纯事件发射器，`version` 在任何语言变更时自增。各端把它转成各自的重渲染信号：

| 端 | 接线 |
| --- | --- |
| vue2 / vue3 / uniapp | `ref(lhlocale.version)` + `lhlocale.subscribe(v => version.value = v)` |
| react | `useSyncExternalStore(lhlocale.subscribe, () => lhlocale.version)` |

```ts
import { lhlocale } from '@lh-ui/share/locales'

lhlocale.setLocale('en-US')          // 切换，version 自增并广播
const text = lhlocale.t('input.placeholder')
```

实时演示见[国际化参考](/reference/locales)。

## 本地联动：改 share 源码即时生效

家族布局下，各 UI 库的 dev / test 配置 alias 到同级 `lh-ui-share/`，**dev 期走的是
TS / SCSS 源码而非构建产物**。新增深文件（如 `core/foo/bar.ts`）在 dev 期立即可用，
但 `sync-exports` 未跑则 npm 侧没有对应 exports 键——**发版前务必走完整 `pnpm build`**，
否则下游 `pnpm up` 后 MODULE_NOT_FOUND。
