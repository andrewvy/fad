import { isEmpty, toString, isNumber, isString, isObject, isArray, isBoolean } from './types'

export function getKey(key) {
  let intKey = parseInt(key)

  if (intKey.toString() === key) {
    return intKey
  }

  return key
}

export function set(obj, path, value, doNotReplace) {
  if (isNumber(path)) {
    path = [path]
  }

  if (isEmpty(path)) {
    return obj
  }

  if (isString(path)) {
    return set(obj, path.split('.').map(getKey), value, doNotReplace)
  }

  let currentPath = path[0]

  if (path.length === 1) {
    let oldVal = obj[currentPath]

    if (oldVal === void 0 || !doNotReplace) {
      obj[currentPath] = value
    }

    return oldVal
  }

  if (obj[currentPath] === void 0) {
    if (isNumber(path[1])) {
      obj[currentPath] = []
    } else {
      obj[currentPath] = {}
    }
  }

  return set(obj[currentPath], path.slice(1), value, doNotReplace)
}

export function del(obj, path) {
  if (isNumber(path)) {
    path = [path]
  }

  if (isEmpty(obj)) {
    return void 0
  }

  if (isEmpty(path)) {
    return obj
  }
  if (isString(path)) {
    return del(obj, path.split('.'))
  }

  let currentPath = getKey(path[0])
  let oldVal = obj[currentPath]

  if (path.length === 1) {
    if (oldVal !== void 0) {
      if (isArray(obj)) {
        obj.splice(currentPath, 1)
      } else {
        delete obj[currentPath]
      }
    }
  } else {
    if (obj[currentPath] !== void 0) {
      return del(obj[currentPath], path.slice(1))
    }
  }

  return obj
}
