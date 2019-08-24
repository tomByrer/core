import createElement from './createElement'

test('default', () => {
  const element = createElement('div', {})
  expect(element.type).toBe('div')
})

test('override default w/ as prop', () => {
  let props = {as: 'span'},
    element = createElement('div', props)

  expect(element.type).toBe('span')
  expect(element.props.hasOwnProperty('as')).toBe(false)
})

test('override props.children w/ children argument', () => {
  let childElement = createElement('div', {}),
    element = createElement(
      'div',
      {children: createElement('div', {})},
      childElement
    )

  // normal
  expect(element.type).toBe('div')
  expect(element.props.children).toBe(childElement)
  // 'as' override
  element = createElement('div', {as: 'span'}, childElement)
  expect(element.type).toBe('span')
  expect(element.props.children).toBe(childElement)
})
