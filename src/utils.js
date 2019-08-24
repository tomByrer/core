import memoize from 'trie-memoize'
import isMergeableObject from 'is-mergeable-object'

const mergeIfMergeable = value =>
  isMergeableObject(value)
    ? deepMerge(Array.isArray(value) ? [] : {}, value)
    : value

const arrayMergeReplace = (target, source) => {
  if (target === source) return target

  let output = [],
    i = 0
  for (; i < source.length; i++) output.push(mergeIfMergeable(source[i]))

  return output
}

const mergeObject = (target, source) => {
  if (target === source) return target

  let destination = Object.assign({}, target),
    sourceKeys = Object.keys(source),
    i = 0

  for (; i < sourceKeys.length; i++) {
    const key = sourceKeys[i]

    if (isMergeableObject(source[key]) === false || target[key] === void 0) {
      destination[key] = mergeIfMergeable(source[key])
    } else {
      destination[key] = deepMerge(target[key], source[key])
    }
  }

  return destination
}

export const deepMerge = (target, source) => {
  // Adapted from: https://github.com/TehShrike/deepmerge
  // Copyright Nick Fisher
  // License MIT
  const sourceIsArray = Array.isArray(source),
    targetIsArray = Array.isArray(target)

  return (sourceIsArray === targetIsArray) === false
    ? mergeIfMergeable(source)
    : sourceIsArray === true
    ? arrayMergeReplace(target, source)
    : mergeObject(target, source)
}

export const objectWithoutProps = (obj, props) => {
    let next = {},
      keys = Object.keys(obj),
      i = 0,
      len = keys.length
    for (; i < len; i++)
      if (props[keys[i]] === void 0) next[keys[i]] = obj[keys[i]]
    return next
  },
  objectWithoutPropsMemo = memoize([WeakMap, WeakMap], objectWithoutProps)

const fastMemoizeCache = new Map()
export const fastMemoize = (cacheName, fn, CacheMap = Map) => {
  if (fastMemoizeCache.get(cacheName) === void 0)
    fastMemoizeCache.set(cacheName, new CacheMap())

  return arg => {
    let base = fastMemoizeCache.get(cacheName),
      val = base.get(arg)

    if (val === void 0) {
      val = fn(arg)
      base.set(arg, val)
    }

    return val
  }
}
