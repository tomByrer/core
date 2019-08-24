import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react'
import emptyArr from 'empty/array'
import emptyObj from 'empty/object'
import json2mq from 'json2mq'
import memoize from 'trie-memoize'
import {ThemeContext as ThemeContext_} from '@emotion/core'
import {fastMemoize, deepMerge} from './utils'

const getMediaQuery = fastMemoize(
  'getMediaQuery',
  bp =>
    isNaN(bp) === false
      ? `only screen and (min-width: ${bp}px)`
      : typeof bp === 'string'
      ? bp
      : json2mq(bp),
  Map
)

export const defaultBreakpoints = {
  // 0px
  phone: 'only screen and (min-width: 0em)',
  // 560px
  tablet: 'only screen and (min-width: 35em)',
  // 1280px
  desktop: 'only screen and (min-width: 80em)',
}

export const baseTheme = {
  breakpoints: defaultBreakpoints,
  breakpointsDelimiter: ':',
}

const throwThemeError = theme => {
  for (let key in baseTheme)
    if (theme[key] === void 0 || theme[key] === null || theme[key] === false)
      throw new ReferenceError(
        `Themes must include a global '${key}' property.`
      )
}

const parseBreakpoints = fastMemoize(
  'parseBreakpoints',
  breakpoints => {
    const parsed = {}
    for (let key in breakpoints) parsed[key] = getMediaQuery(breakpoints[key])
    return parsed
  },
  WeakMap
)

const merge = memoize([WeakMap, WeakMap], deepMerge)

export const getTheme = (defaultTheme = emptyObj, userTheme) => {
  if (userTheme === void 0) return defaultTheme
  else if (defaultTheme === emptyObj) return userTheme
  return merge(defaultTheme, userTheme)
}

export const mergeTheme = (prevTheme, theme) => {
  theme = getTheme(prevTheme, theme)
  if (__DEV__) throwThemeError(theme)
  theme.breakpoints = parseBreakpoints(theme.breakpoints)
  return theme
}

export const createTheme = theme => {
  let nextTheme = Object.assign({}, baseTheme, theme)
  if (__DEV__) throwThemeError(nextTheme)
  nextTheme.breakpoints = parseBreakpoints(nextTheme.breakpoints)
  return nextTheme
}

export const StylesContext = React.createContext()
export const StylesConsumer = StylesContext.Consumer
export const ThemeContext = ThemeContext_
export const useStylesContext = () => useContext(StylesContext)
export const ThemeProvider = ({theme, children}) => {
  const [userTheme, setUserTheme] = useState(() => createTheme(theme)),
    setTheme = useCallback(
      nextUserTheme => setUserTheme(mergeTheme(userTheme, nextUserTheme)),
      [userTheme]
    ),
    replaceTheme = useCallback(
      nextUserTheme => setUserTheme(createTheme(nextUserTheme)),
      emptyArr
    )

  useEffect(() => {
    replaceTheme(theme)
  }, [theme])

  const childContext = useMemo(
    () => ({
      theme: Object.assign({}, userTheme),
      setTheme,
      replaceTheme,
    }),
    [userTheme, setTheme, replaceTheme]
  )

  return (
    <ThemeContext.Provider
      value={childContext.theme}
      children={
        <StylesContext.Provider value={childContext} children={children} />
      }
    />
  )
}

export const ThemeConsumer = props => (
  <ThemeContext.Consumer
    children={theme => props.children(props.name ? theme[props.name] : theme)}
  />
)

export const useTheme = name => {
  const theme = useContext(ThemeContext)
  return name === void 0 ? theme : theme[name]
}

if (__DEV__) {
  const PropTypes = require('prop-types')
  ThemeProvider.displayName = 'ThemeProvider'
  ThemeProvider.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.element.isRequired,
  }
  ThemeConsumer.propTypes = {
    name: PropTypes.string,
    children: PropTypes.func.isRequired,
  }
}
