import {useStyles} from './useStyles'

export default (name, styles) => {
  const hook = props => useStyles(name, styles, props)

  if (__DEV__)
    Object.defineProperty(hook, 'name', {
      value: `use${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    })

  return hook
}
