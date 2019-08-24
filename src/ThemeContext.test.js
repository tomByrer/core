// require('browser-env')()
import React from 'react'
import {act} from '@testing-library/react'
import {renderWithTheme} from 'test-utils'
import {
  useStylesContext,
  mergeTheme,
  baseTheme,
  createTheme,
  useTheme,
} from './ThemeContext'

test('createTheme', () => {
  let theme = createTheme({})
  expect(Object.keys(theme)).toEqual(Object.keys(baseTheme))
  theme = createTheme({colors: {blue: '#1d40ab'}})
  expect(Object.keys(theme.colors).length).toBe(1)
  expect(theme.colors.blue).toBe('#1d40ab')
})

test('createTheme breakpoints', () => {
  let theme = createTheme({
    breakpoints: {
      mobile: 0,
      largeMobile: 'only screen and (min-width: 45em)',
      smallDesktop: [
        {
          screen: true,
          minWidth: 1280,
        },
        {orientation: 'landscape'},
      ],
    },
  })

  expect(Object.keys(theme.breakpoints)).toEqual([
    'mobile',
    'largeMobile',
    'smallDesktop',
  ])
  expect(theme.breakpoints.mobile).toBe('only screen and (min-width: 0px)')
  expect(theme.breakpoints.largeMobile).toBe(
    'only screen and (min-width: 45em)'
  )
  expect(theme.breakpoints.smallDesktop).toBe(
    'screen and (min-width: 1280px), (orientation: landscape)'
  )
})

test('mergeTheme object merge', () => {
  let theme = mergeTheme(createTheme({foo: {bar: 'baz'}}), {
    foo: {biz: 'buz'},
  })

  expect(theme.foo).toEqual({bar: 'baz', biz: 'buz'})
})

test('mergeTheme array replace', () => {
  let theme = mergeTheme(createTheme({foo: ['bar', 'baz']}), {
    foo: ['biz'],
  })

  expect(theme.foo).toEqual(['biz'])
})

test('throws "required theme property"', () => {
  expect(() => {
    createTheme({breakpoints: void 0})
  }).toThrow(
    new ReferenceError(`Themes must include a global 'breakpoints' property.`)
  )
})

test('ThemeProvider -> useStyleContext -> theme, setTheme, replaceTheme', () => {
  let setTheme, replaceTheme, theme
  const Curls = () => {
    const curls = useStylesContext()
    setTheme = curls.setTheme
    replaceTheme = curls.replaceTheme
    theme = curls.theme
    return <div />
  }
  renderWithTheme(<Curls />)
  // tests setTheme
  act(() => {
    setTheme({breakpoints: {large: 100}})
  })
  expect(theme).toEqual({
    ...baseTheme,
    breakpoints: {
      ...createTheme({}).breakpoints,
      large: 'only screen and (min-width: 100px)',
    },
  })
  // tests replaceTheme
  act(() => {
    replaceTheme({breakpoints: {large: 100}})
  })
  expect(theme).toEqual({
    ...baseTheme,
    breakpoints: {
      large: 'only screen and (min-width: 100px)',
    },
  })
  // tests theme={theme}
  renderWithTheme(<Curls />, {
    box: {
      kinds: {
        foo: {
          display: 'block',
        },
      },
    },
  })

  expect(theme.box.kinds.foo).toEqual({display: 'block'})
})

test('useTheme w/o name', () => {
  let theme
  const Curls = () => {
    theme = useTheme()
    return <div />
  }
  renderWithTheme(<Curls />)
  // tests theme={theme}
  renderWithTheme(<Curls />, {
    box: {
      kinds: {
        foo: {
          display: 'block',
        },
      },
    },
  })

  expect(theme.box.kinds.foo.display).toBe('block')
})

test('useTheme w/ name', () => {
  let theme
  const Curls = () => {
    theme = useTheme('box')
    return <div />
  }
  renderWithTheme(<Curls />)
  // tests theme={theme}
  renderWithTheme(<Curls />, {
    box: {
      kinds: {
        foo: {
          display: 'block',
        },
      },
    },
  })

  expect(theme.kinds.foo.display).toBe('block')
})
