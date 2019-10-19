import {useStyles} from './useStyles'

export default (name, styles) => {
  let hook = props => useStyles(name, styles, props)

  if (typeof name === 'object' && name !== null) {
    styles = name
    name = void 0
    hook = props => useStyles(styles, props)
  }

  if (__DEV__)
    Object.defineProperty(hook, 'name', {
      value: name
        ? `use${name.charAt(0).toUpperCase()}${name.slice(1)}`
        : `useStyleHook({${Object.keys(styles).join(', ')}})`,
    })

  return hook
}
