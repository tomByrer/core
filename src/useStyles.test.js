import {css} from '@emotion/core'
import {renderHookWithTheme} from 'test-utils'
import createStyleHook from './createStyleHook'

const renderUseStyles = ({name, styles}, props, theme) =>
  renderHookWithTheme(() => createStyleHook(name, styles)(props), theme)
const ws = v =>
  v
    .replace(/\s+/g, ' ')
    .replace('{ ', '{')
    .replace(' }', '}')
    .replace('; ;', ';;')
    .trim()

test('boolean prop', () => {
  const config = {
    name: 'box',
    styles: {
      block: css`
        display: block;
      `,
    },
  }

  // true
  let result = renderUseStyles(config, {block: true}).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.block).toBe(void 0)
  // false
  result = renderUseStyles(config, {block: false}).result.current
  expect(result.css).toBe(void 0)
  expect(result.block).toBe(void 0)
  // undefined
  result = renderUseStyles(config, {block: void 0}).result.current
  expect(result.css).toBe(void 0)
  expect(result.block).toBe(void 0)
  // null
  result = renderUseStyles(config, {block: null}).result.current
  expect(result.css).toBe(void 0)
  expect(result.block).toBe(void 0)
})

test('boolean prop w/ multiple values', () => {
  const config = {
    name: 'box',
    styles: {
      block: [
        css`
          display: noop;
        `,
        css`
          display: block;
        `,
      ],
    },
  }

  // true
  let result = renderUseStyles(config, {block: true}).result.current
  expect(result.css.length).toBe(2)
  expect(ws(result.css[0].styles)).toBe('display: noop;')
  expect(ws(result.css[1].styles)).toBe('display: block;')
  expect(result.block).toBe(void 0)
})

test('boolean prop w/ breakpoints', () => {
  let config = {
    name: 'box',
    styles: {
      block: css`
        display: block;
      `,
      hidden: css`
        display: none;
      `,
    },
  }

  // empty props
  let props = {block: ':desktop :tablet', hidden: ':phone'}
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(3)
  // phone first
  expect(ws(ws(result.css[0].styles))).toBe(
    '@media only screen and (min-width: 0em){display: none;;}'
  )
  // tablet next
  expect(ws(ws(result.css[1].styles))).toBe(
    '@media only screen and (min-width: 35em){display: block;;}'
  )
  // then desktop
  expect(ws(ws(result.css[2].styles))).toBe(
    '@media only screen and (min-width: 80em){display: block;;}'
  )
})

test('enum prop', () => {
  const config = {
    name: 'box',
    styles: {
      display: {
        block: css`
          display: block;
        `,
        none: css`
          display: none;
        `,
        multi: [
          css`
            display: noop;
          `,
          css`
            display: none;
          `,
        ],
      },
    },
  }

  // block
  let result = renderUseStyles(config, {display: 'block'}).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)

  // none
  result = renderUseStyles(config, {display: 'none'}).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(result.hasOwnProperty('display')).toBe(false)

  // multi
  result = renderUseStyles(config, {display: 'multi'}).result.current
  expect(result.css.length).toBe(2)
  expect(ws(result.css[0].styles)).toBe('display: noop;')
  expect(ws(result.css[1].styles)).toBe('display: none;')
  expect(result.hasOwnProperty('display')).toBe(false)

  // undefined enum value
  const fn = () => {
    throw renderUseStyles(config, {display: 'throws'}).result.error
  }

  expect(fn).toThrow(
    new ReferenceError(
      `Error in enum prop 'display'. Value 'throws' not found in: block, none, multi.`
    )
  )

  // false
  result = renderUseStyles(config, {display: false}).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('display')).toBe(false)

  // null
  result = renderUseStyles(config, {display: null}).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('display')).toBe(false)

  // undefined
  result = renderUseStyles(config, {display: void 0}).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('enum prop w/ breakpoints', () => {
  let config = {
    name: 'box',
    styles: {
      display: {
        block: css`
          display: block;
        `,
        none: css`
          display: none;
        `,
      },
    },
  }

  // empty props
  let props = {display: 'block:tablet block:desktop none:phone'}
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(3)
  // phone first
  expect(ws(result.css[0].styles)).toBe(
    '@media only screen and (min-width: 0em){display: none;;}'
  )
  // tablet next
  expect(ws(result.css[1].styles)).toBe(
    '@media only screen and (min-width: 35em){display: block;;}'
  )
  // then desktop
  expect(ws(result.css[2].styles)).toBe(
    '@media only screen and (min-width: 80em){display: block;;}'
  )
})

test('functional prop', () => {
  const config = {
    name: 'box',
    styles: {
      display: value =>
        !value
          ? null
          : css`
              display: ${value};
            `,
    },
  }

  // display: block
  let result = renderUseStyles(config, {display: 'block'}).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)

  // return null
  result = renderUseStyles(config, {display: null}).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('display')).toBe(false)

  // undefined
  result = renderUseStyles(config, {display: void 0}).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('functional prop w/ multiple return values', () => {
  const config = {
    name: 'box',
    styles: {
      display: value =>
        !value
          ? null
          : [
              css`
                display: none;
              `,
              css`
                display: ${value};
              `,
            ],
    },
  }

  let result = renderUseStyles(config, {display: 'block'}).result.current
  expect(result.css.length).toBe(2)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(ws(result.css[1].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('functional prop w/ theme', () => {
  let config = {
      name: 'box',
      styles: {
        display: (value, theme) =>
          css`
            display: ${theme.box.displayOptions[value]};
          `,
      },
    },
    theme = {
      box: {
        displayOptions: {
          block: 'block',
        },
      },
    }

  // display: block
  let result = renderUseStyles(config, {display: 'block'}, theme).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)

  // display: undefined
  result = renderUseStyles(config, {display: 'undefined'}, theme).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: ;')
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('functional prop w/ props', () => {
  let config = {
    name: 'box',
    styles: {
      display: (value, theme, props) =>
        css`
          display: ${props.nonsenseDisplay};
        `,
    },
  }

  // display: block
  let result = renderUseStyles(config, {
    display: 'block',
    nonsenseDisplay: 'nonsense',
  }).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: nonsense;')
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('functional prop w/ breakpoints', () => {
  let config = {
    name: 'box',
    styles: {
      display: value =>
        css`
          display: ${value};
        `,
    },
  }

  // empty props
  let props = {display: 'block:tablet none:phone block:desktop'}
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(3)
  // phone first
  expect(ws(ws(result.css[0].styles))).toBe(
    '@media only screen and (min-width: 0em){display: none;;}'
  )
  // tablet next
  expect(ws(ws(result.css[1].styles))).toBe(
    '@media only screen and (min-width: 35em){display: block;;}'
  )
  // then desktop
  expect(ws(ws(result.css[2].styles))).toBe(
    '@media only screen and (min-width: 80em){display: block;;}'
  )
})

test('kind prop', () => {
  let config = {
      name: 'box',
      styles: {
        display: {
          block: css`
            display: block;
          `,
        },
      },
    },
    theme = {
      box: {
        kinds: {
          block: {
            display: 'block',
          },
          cssPropSingular: {
            css: css`
              display: none;
            `,
          },
          cssPropArray: {
            display: 'block',
            css: [
              css`
                display: none;
              `,
              css`
                display: inline;
              `,
            ],
          },
          cssProp: {
            css: css`
              display: none;
            `,
            display: 'block',
          },
        },
      },
    }

  // block
  let result = renderUseStyles(config, {kind: 'block'}, theme).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
  expect(result.hasOwnProperty('kind')).toBe(false)

  // singular
  result = renderUseStyles(config, {kind: 'cssPropSingular'}, theme).result
    .current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(result.hasOwnProperty('display')).toBe(false)
  expect(result.hasOwnProperty('kind')).toBe(false)

  // array
  result = renderUseStyles(config, {kind: 'cssPropArray'}, theme).result.current
  expect(result.css.length).toBe(3)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(ws(result.css[1].styles)).toBe('display: inline;')
  expect(ws(result.css[2].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
  expect(result.hasOwnProperty('kind')).toBe(false)
  // ensures we write a new array because we reallllly don't want kinds to be mutable
  expect(result.css).not.toBe(theme.box.kinds.cssPropArray)

  // singular
  result = renderUseStyles(config, {kind: 'cssProp'}, theme).result.current
  expect(result.css.length).toBe(2)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(ws(result.css[1].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
  expect(result.hasOwnProperty('kind')).toBe(false)

  // undefined kind
  result = renderUseStyles(config, {kind: 'undefined'}, theme).result.current
  expect(result.css).toBe(void 0)
  expect(result.hasOwnProperty('kind')).toBe(true)
})

test('default props', () => {
  let config = {
      name: 'box',
      styles: {
        display: {
          block: css`
            display: block;
          `,
        },
      },
    },
    theme = {
      box: {
        defaultProps: {
          display: 'block',
        },
      },
    }

  // block
  let result = renderUseStyles(config, {}, theme).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
})

test('default props w/ css prop', () => {
  let config = {
      name: 'box',
      styles: {
        display: {
          block: css`
            display: block;
          `,
        },
      },
    },
    theme = {
      box: {
        defaultProps: {
          display: 'block',
          css: [
            css`
              display: none;
            `,
          ],
        },
      },
    }

  let result = renderUseStyles(config, {}, theme).result.current
  expect(result.css.length).toBe(2)
  expect(ws(result.css[0].styles)).toBe('display: none;')
  expect(ws(result.css[1].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
  expect(result.css).not.toBe(theme.box.defaultProps.css)
})

test('immutable css prop', () => {
  let config = {
    name: 'box',
    styles: {
      display: {
        block: css`
          display: block;
        `,
      },
    },
  }

  // array prop
  let props = {css: [], display: 'block'}
  let result = renderUseStyles(config, props).result.current
  expect(result.css === props.css).toBe(false)

  // object prop
  props = {
    css: css`
      display: none;
    `,
    display: 'block',
  }
  result = renderUseStyles(config, props).result.current
  expect(result.css === props.css).toBe(false)

  // noop
  props = {
    css: css`
      display: none;
    `,
  }
  result = renderUseStyles(config, props).result.current
  expect(result.css === props.css).toBe(true)
})

test('immutable props', () => {
  let config = {
    name: 'box',
    styles: {
      display: {
        block: css`
          display: block;
        `,
      },
    },
  }

  // empty props
  let props = {}
  let result = renderUseStyles(config, props).result.current
  expect(props).not.toBe(result)

  // some props
  props = {display: 'block'}
  result = renderUseStyles(config, props).result.current
  expect(props).not.toBe(result)
})

test('some breakpoint props, some normal props', () => {
  let config = {
    name: 'box',
    styles: {
      padding: value =>
        css`
          padding: ${value};
        `,
    },
  }

  // empty props
  let props = {padding: '[10px 10px]:tablet 16px 18px [20px 20px]'}
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(4)
  expect(ws(result.css[0].styles)).toBe('padding: 16px;')
  expect(ws(result.css[1].styles)).toBe('padding: 18px;')
  expect(ws(result.css[2].styles)).toBe('padding: 20px 20px;')
  // tablet
  expect(ws(result.css[3].styles)).toBe(
    '@media only screen and (min-width: 35em){padding: 10px 10px;;}'
  )
})

test('grouped breakpoint props', () => {
  let config = {
    name: 'box',
    styles: {
      padding: value =>
        css`
          padding: ${value};
        `,
    },
  }

  // empty props
  let props = {
    padding:
      '[10px 10px]:tablet [16px 12px 16px]:phone [20px 21px 22px 23px]:desktop',
  }
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(3)
  // phone first
  expect(ws(result.css[0].styles)).toBe(
    '@media only screen and (min-width: 0em){padding: 16px 12px 16px;;}'
  )
  // tablet next
  expect(ws(result.css[1].styles)).toBe(
    '@media only screen and (min-width: 35em){padding: 10px 10px;;}'
  )
  // then desktop
  expect(ws(result.css[2].styles)).toBe(
    '@media only screen and (min-width: 80em){padding: 20px 21px 22px 23px;;}'
  )
})

test('grouped breakpoint props w/ functions', () => {
  let config = {
    name: 'box',
    styles: {
      padding: value =>
        css`
          padding: ${value};
        `,
    },
  }

  // empty props
  let props = {
    padding: '[10px 10px]:tablet [calc(10vh + 36px) 21px 22px 23px]:desktop',
  }
  let result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(2)
  // tablet
  expect(ws(result.css[0].styles)).toBe(
    '@media only screen and (min-width: 35em){padding: 10px 10px;;}'
  )
  // desktop
  expect(ws(result.css[1].styles)).toBe(
    '@media only screen and (min-width: 80em){padding: calc(10vh + 36px) 21px 22px 23px;;}'
  )
})

test('grouped breakpoint props w/ funky multiline spacing', () => {
  let config = {
    name: 'box',
    styles: {
      padding: value =>
        css`
          padding: ${value};
        `,
    },
  }

  // empty props
  let props = {
      padding: `
      
        [10px 10px]:tablet    
           [calc(10vh + 36px) 21px 22px 23px]:desktop
      `,
    },
    result = renderUseStyles(config, props).result.current

  expect(result.css.length).toBe(2)
  // tablet
  expect(ws(result.css[0].styles)).toBe(
    '@media only screen and (min-width: 35em){padding: 10px 10px;;}'
  )
  // desktop
  expect(ws(result.css[1].styles)).toBe(
    '@media only screen and (min-width: 80em){padding: calc(10vh + 36px) 21px 22px 23px;;}'
  )
})

test('undefined breakpoint', () => {
  let config = {
      name: 'box',
      styles: {
        padding: value =>
          css`
            padding: ${value};
          `,
      },
    },
    props = {
      padding: `[10px 10px]:does-not-exist`,
    }

  expect(() => {
    throw renderUseStyles(config, props).result.error
  }).toThrow(
    new ReferenceError(
      `A breakpoint for 'does-not-exist' was not found in: phone, tablet, desktop`
    )
  )
})

test('undefined name', () => {
  let theme = {
    box: {
      defaultProps: {
        display: 'block',
      },
    },
  }

  // block
  let result = renderHookWithTheme(
    () =>
      createStyleHook({
        display: {
          block: css`
            display: block;
          `,
        },
      })({display: 'block'}),
    theme
  ).result.current
  expect(result.css.length).toBe(1)
  expect(ws(result.css[0].styles)).toBe('display: block;')
  expect(result.hasOwnProperty('display')).toBe(false)
})
