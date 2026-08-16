export type CategoryColor = {
  name: string
  value: string
}

export const categoryColors: CategoryColor[] = [
  { name: 'Green', value: '#2da44e' },
  { name: 'Blue', value: '#0969da' },
  { name: 'Violet', value: '#8250df' },
  { name: 'Pink', value: '#bf3989' },
  { name: 'Red', value: '#cf222e' },
  { name: 'Yellow', value: '#bf8700' },
  { name: 'Teal', value: '#1b7f83' },
  { name: 'Gray', value: '#57606a' },
  { name: 'Lime', value: '#6f9e2e' },
  { name: 'Indigo', value: '#3b5bdb' },
]

export const defaultCategoryColor = categoryColors[0].value
