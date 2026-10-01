import type { LhSelectOption } from './types'

export function findSelectOption(options: LhSelectOption[], value: unknown): LhSelectOption | undefined {
  return options.find((option) => Object.is(option.value, value))
}

export function getNextEnabledIndex(
  options: LhSelectOption[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (!options.length) return -1

  for (let step = 1; step <= options.length; step += 1) {
    const index = (currentIndex + direction * step + options.length) % options.length
    if (!options[index].disabled) return index
  }

  return currentIndex
}
