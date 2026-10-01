export function isCheckboxChecked(values: unknown[], value: unknown): boolean {
  return values.some((currentValue) => Object.is(currentValue, value))
}

export function toggleCheckboxValue(values: unknown[], value: unknown, checked: boolean): unknown[] {
  const nextValues = values.filter((currentValue) => !Object.is(currentValue, value))
  return checked ? [...nextValues, value] : nextValues
}
