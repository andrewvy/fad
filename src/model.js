import { isEmpty, toString, isNumber, isString, isObject, isArray, isBoolean } from './utils/types'
import { getKey, set, del } from './utils/path'
import { Store } from './Store'
import util from 'util'

/**
 * Heavily inspired by React's createClass and Class Mixin behaviour,
 * this file contains the necessary functions for creating and setting
 * up a new unique model type and validating prop types for serializing
 * and deserializing.
 */

export const ModelTypes = {
  bool: Symbol(),
  number: Symbol(),
  string: Symbol(),
  array: Symbol()
}

export default class Model {
  deserialize() {}
  serialize() {}
  validate() {}

  set(path, value, doNotReplace) {
    return set(this, path, value, doNotReplace)
  }

  get(path, defaultValue) {
    if (isNumber(path)) {
      path = [path]
    }
    if (isEmpty(path)) {
      return this
    }
    if (isEmpty(this)) {
      return defaultValue
    }
    if (isString(path)) {
      return this.get(path.split('.'), defaultValue)
    }

    let currentPath = getKey(path[0])

    if (path.length === 1) {
      if (this[currentPath] === void 0) {
        return defaultValue
      }
      return this[currentPath]
    }

    return this.get(this[currentPath], path.slice(1), defaultValue)
  }

  push(path) {
    let arr = this.get(this, path)
    if (!isArray(arr)) {
      arr = []
      this.set(path, arr)
    }

    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2))
  }
}

function mixSpecificationIntoModelType(Constructor, spec) {
  if (!spec) { return }

  let proto = Constructor.prototype

  for (let name in spec) {
    if (!spec.hasOwnProperty(name)) {
      continue
    }

    let property = spec[name]
    let isAlreadyDefined = proto.hasOwnProperty(name)

    if (!isAlreadyDefined) {
      proto[name] = property
    }
  }
}

function applyProps(instance, props) {
  let proto = instance.propTypes || {}

  for (let name in props) {
    let propTypeDefined = proto.hasOwnProperty(name)

    if (propTypeDefined || name === 'id') {
      instance[name] = props[name]
    } else {
      throw new Error(`[fad] Tried applying non-existent property '${name}' on model`)
    }
  }
}

export function createModelType(store, spec) {
  let isUsingStore = store instanceof Store

  let Constructor = function(props) {
    applyProps(this, props)

    if (this.reducer) this.reducer(this)
  }

  if (arguments.length === 1 &&
      isObject(store) &&
      !(isUsingStore)) {
    spec = store
  }

  Constructor.constructor = Constructor
  Constructor.type = Symbol()
  Constructor.prototype = new Model()
  Constructor.prototype.propTypes = isObject(store) === true ? spec.propTypes : {}
  Constructor.prototype.type = Constructor.type
  Constructor.prototype.reducer = store.reducer

  if (spec.propTypes) {
    delete spec.propTypes
  }

  if (isUsingStore) {
    store.addModelType(Constructor)
  }

  mixSpecificationIntoModelType(Constructor, spec)

  return Constructor
}
