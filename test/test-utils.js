import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {render} from '@testing-library/react'
import {ThemeContext, ThemeProvider, createTheme} from 'ThemeContext'

export const renderHookWithTheme = (children, userTheme = {}) => {
  const theme = createTheme(userTheme)
  return renderHook(children, {
    wrapper: ({children}) => (
      <ThemeContext.Provider value={theme} children={children} />
    ),
  })
}

export const renderHookWithThemeProvider = (children, theme = {}) =>
  renderHook(children, {
    wrapper: ({children}) => (
      <ThemeProvider theme={theme} children={children} />
    ),
  })

export const renderWithTheme = (children, theme = {}, options = {}) =>
  render(children, {
    wrapper: ({children}) => (
      <ThemeProvider theme={theme} children={children} />
    ),
    ...options,
  })
