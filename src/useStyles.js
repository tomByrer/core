import memoize from 'trie-memoize'
import {useTheme} from './ThemeContext'
import {objectWithoutProps, objectWithoutPropsMemo} from './utils'
import {css as emotionCSS} from '@emotion/core'
import {fastMemoize} from './utils'

export const getBreakpointOrder = fastMemoize(
  'breakpointOrder',
  breakpoints => Object.keys(breakpoints),
  WeakMap
)

const splitWs = /(?!\[.*)\s+(?![^[]*?\])/g,
  replaceWs = /^\s+|\s+$|\s+(?=\s)/g

export const splitValue = value => value.replace(replaceWs, '').split(splitWs)
export const parseValue = (originalValue, theme) => {
  let indexOfSplit = originalValue.indexOf(theme.breakpointsDelimiter),
    value = originalValue,
    breakpoint = null
  // handles breakpoint splitting
  if (indexOfSplit > -1) {
    value = originalValue.substring(0, indexOfSplit)
    breakpoint = originalValue.substring(indexOfSplit + 1)
  }
  // removes brackets from value's grouped props if there are any
  if (value.indexOf('[') === 0 && value.indexOf(']') === value.length - 1)
    value = value.substring(1, value.length - 1)
  // empty values are treated as bools
  return {value: value.length === 0 ? true : value, breakpoint}
}

const getCss = (name, fn, value, theme, props) => {
  if (typeof fn === 'object' && (fn.styles !== void 0 || Array.isArray(fn)))
    // boolean prop
    return value === false || value === null ? void 0 : fn
  else if (typeof fn === 'function')
    // functional prop
    return fn(value, theme, props)
  else {
    // enum prop
    const result = fn[value]

    if (__DEV__) {
      // enum value not found
      if (result === void 0 && value !== false && value !== null)
        throw new ReferenceError(
          `Error in enum prop '${name}'. Value '${value}' not found in: ${Object.keys(
            fn
          ).join(', ')}.`
        )
    }

    return result
  }
}

const maybeAddStyles = (css, maybeCss) => {
  if (maybeCss !== void 0 && maybeCss !== null) {
    // we want our CSS array to be as flat as possible since emotion interpolation
    // will be slower the more nested the array is
    if (Array.isArray(maybeCss) === true) css.push.apply(css, maybeCss)
    else css.push(maybeCss)
  }
}

const createStyles = (styles, theme, props) => {
  let propKeys = Object.keys(props)
  if (propKeys.length === 0) return

  let css = [],
    mediaQueries,
    i = 0

  for (; i < propKeys.length; i++) {
    const propName = propKeys[i],
      getter = styles[propName]

    if (getter === void 0) continue
    const propVal = props[propName]

    if (propVal !== void 0) {
      if (
        propVal === null ||
        propVal.indexOf === void 0 ||
        propVal.indexOf(theme.breakpointsDelimiter) === -1
      ) {
        // these are just regular values, no media queries
        maybeAddStyles(css, getCss(propName, getter, propVal, theme, props))
      } else {
        // this parses values with media queries
        let values = splitValue(propVal),
          j = 0

        for (; j < values.length; j++) {
          // <Box p='4@xl 5@xxl [x2 y3]@md' flex='@xxl' justify='center@xxl start@xl'>
          let {value, breakpoint} = parseValue(values[j], theme)
          let cssValue = getCss(propName, getter, value, theme, props)

          if (cssValue !== null && cssValue !== void 0) {
            if (breakpoint === null || breakpoint.length === 0)
              maybeAddStyles(css, cssValue)
            else {
              if (__DEV__) {
                // verifies that this is a real breakpoint, but only in development
                const bps = getBreakpointOrder(theme.breakpoints)
                if (bps.indexOf(breakpoint) === -1)
                  throw new ReferenceError(
                    `A breakpoint for '${breakpoint}' was not found in: ${bps.join(
                      ', '
                    )}`
                  )
              }
              mediaQueries = mediaQueries || {}
              mediaQueries[breakpoint] = mediaQueries[breakpoint] || []
              mediaQueries[breakpoint].push(cssValue)
            }
          }
        }
      }
    }
  }

  if (mediaQueries !== void 0) {
    // ensures that breakpoints are always ordered in a descending fashion so that
    // shorter max-widths don't get cascaded by longer ones
    const breakpoints = getBreakpointOrder(theme.breakpoints)

    for (i = 0; i < breakpoints.length; i++) {
      const breakpoint = breakpoints[i]

      if (mediaQueries[breakpoint] !== void 0) {
        css.push(
          emotionCSS`@media ${theme.breakpoints[breakpoint]}{${mediaQueries[breakpoint]};}`
        )
      }
    }
  }

  return css.length > 0 ? css : void 0
}

const getKind = (kinds, kind) =>
    kinds === void 0 || kind === void 0 ? void 0 : kinds[kind],
  withoutCssProp = {css: 0},
  withoutStyles = memoize([Map], styles => Object.assign({kind: 0}, styles))

const assignOrdered = (defaultProps, kinds, props) => {
  let i = 0,
    output

  if (typeof defaultProps === 'object' && defaultProps !== null) {
    output = {}
    const keys = Object.keys(defaultProps)

    for (; i < keys.length; i++) {
      const key = keys[i]
      if (props[key] === void 0 && (kinds === void 0 || kinds[key] === void 0))
        output[key] = defaultProps[key]
    }
  }

  if (kinds !== void 0) {
    output = output || {}
    const keys = Object.keys(kinds)

    for (i = 0; i < keys.length; i++)
      if (props[keys[i]] === void 0) output[keys[i]] = kinds[keys[i]]
  }

  return output === void 0 ? props : Object.assign(output, props)
}

const maybeUnshiftCssArray = (cssProp, css) => {
  if (typeof cssProp === 'object' && cssProp !== null) css.unshift(cssProp)
  return css
}

const pushCssProp = (nextProps, css) => {
  // clones defaultStyles/kindCss if they are arrays to prevent runaway mutations
  const isCssArray = Array.isArray(css)

  if (Array.isArray(nextProps.css)) {
    // we're trying to keep our css prop a flat array for quicker interpolation in emotion
    if (isCssArray) nextProps.css.push.apply(nextProps.css, css)
    else nextProps.css.push(css)
  } else {
    nextProps.css = maybeUnshiftCssArray(
      nextProps.css,
      isCssArray ? css : [css]
    )
  }
}

export const useStyles = (name, styles, props) => {
  let theme = useTheme(),
    hookTheme = name === void 0 ? void 0 : theme[name],
    defaultProps = hookTheme && hookTheme.defaultProps,
    defaultPropsCss,
    kind = hookTheme && getKind(hookTheme.kinds, props.kind),
    kindCss

  if (kind !== void 0 && kind.css !== void 0) {
    kindCss = Array.isArray(kind.css) ? kind.css.slice(0) : kind.css
    kind = objectWithoutPropsMemo(kind, withoutCssProp)
  }

  if (defaultProps !== void 0 && defaultProps.css !== void 0) {
    defaultPropsCss = Array.isArray(defaultProps.css)
      ? defaultProps.css.slice(0)
      : defaultProps.css
    defaultProps = objectWithoutPropsMemo(defaultProps, withoutCssProp)
  }

  let nextProps = assignOrdered(defaultProps, kind, props),
    derivedStyles =
      typeof styles === 'object'
        ? createStyles(styles, theme, nextProps)
        : void 0,
    styleProps = kind !== void 0 ? withoutStyles(styles) : styles

  nextProps =
    styleProps === void 0
      ? Object.assign({}, nextProps)
      : objectWithoutProps(nextProps, styleProps)

  if (
    defaultPropsCss !== void 0 ||
    kindCss !== void 0 ||
    derivedStyles !== void 0
  ) {
    if (Array.isArray(nextProps.css)) nextProps.css = nextProps.css.slice(0)
    else if (typeof nextProps.css === 'object' && nextProps.css !== null)
      nextProps.css = [nextProps.css]

    if (defaultPropsCss !== void 0) pushCssProp(nextProps, defaultPropsCss)
    if (kindCss !== void 0) pushCssProp(nextProps, kindCss)
    if (derivedStyles !== void 0) {
      // We want our CSS array to be as flat as possible since emotion interpolation will be
      // slower the more nested the array is. More importantly, it makes testing hooks
      // and debugging easier.
      if (Array.isArray(nextProps.css))
        nextProps.css.push.apply(nextProps.css, derivedStyles)
      else nextProps.css = maybeUnshiftCssArray(nextProps.css, derivedStyles)
    }
  }

  return nextProps
}
