let toStr = Object.prototype.toString
let _hasOwnProperty = Object.prototype.hasOwnProperty

export function isEmpty(value) {
  if (!value) {
    return true
  }
  if (isArray(value) && value.length === 0) {
    return true
  } else if (!isString(value)) {
    for (let i in value) {
      if (_hasOwnProperty.call(value, i)) {
        return false
      }
    }
    return true
  }
  return false
}

export function toString(type) {
  return toStr.call(type)
}

export function isNumber(value) {
  return typeof value === 'number' || toString(value) === '[object Number]'
}

export function isString(obj) {
  return typeof obj === 'string' || toString(obj) === '[object String]'
}

export function isObject(obj) {
  return typeof obj === 'object' && toString(obj) === '[object Object]'
}

export const isArray = Array.isArray || function(obj) {
  return toStr.call(obj) === '[object Array]'
}

export function isBoolean(obj) {
  return typeof obj === 'boolean' || toString(obj) === '[object Boolean]'
}
