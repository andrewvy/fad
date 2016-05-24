import { isEmpty, toString, isNumber, isString, isObject, isArray, isBoolean, isFunction } from './utils/types'
import { getKey, set, del } from './utils/path'
import { Store } from './store'
import { HasOne, HasMany } from './relation'
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
  array: Symbol(),
  hasOne: (model, options) => new HasOne(model, options),
  hasMany: (model, options) => new HasMany(model, options)
}

export default class Model {
  deserialize() {}
  serialize() {}
  validate() {}

  /**
   * Sets a deeply nested value on the model.
   * @param {string} path - The stringified path of the property
   * @param {*} value - The value to set at this path.
   * @param {Boolean} doNotReplace - Whether or not we should replace the value at this property with the given one.
   */
  set(path, value, doNotReplace) {
    return set(this, path, value, doNotReplace)
  }

  /**
   * Gets a deeply nested value from the model.
   * @param {string} path - The stringified path of the property
   * @param {*} defaultValue - The default value returned in the event no property is found.
   * @return {*} The property value
   */
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

  /**
   * Pushes an element into an array at a deeply nested path.
   * @param {string} path - The stringified path of the property
   * @param {*} element - The element to insert into the property.
   */
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
  let defaults = instance.__$defaultProps || {}

  for (let name in defaults) {
    let propTypeDefined = proto.hasOwnProperty(name)

    if (propTypeDefined || name === 'id') {
      instance[name] = defaults[name]
    }
  }

  for (let name in props) {
    let propTypeDefined = proto.hasOwnProperty(name)

    if (propTypeDefined || name === 'id') {
      instance[name] = props[name]
    }
  }
}

function calculateDefaultProps(Constructor) {
  let proto = Constructor.prototype.propTypes || {}
  let defaults = isFunction(Constructor.prototype.getDefaultProps) ? Constructor.prototype.getDefaultProps() : {}

  for (let name in proto) {
    let propType = proto[name]
    let propertyDefined = defaults.hasOwnProperty(name)

    if (propertyDefined) continue

    switch (propType) {
      case ModelTypes.bool:
        defaults[name] = false
        break
      case ModelTypes.number:
        defaults[name] = 0
        break
      case ModelTypes.string:
        defaults[name] = ''
        break
      case ModelTypes.array:
        defaults[name] = []
        break
    }
  }

  Constructor.prototype.__$defaultProps = defaults
}

export function createModelType(type, store, spec) {
  let isUsingStore = store instanceof Store

  let Constructor = function(props) {
    applyProps(this, props)

    if (this.reducer) this.reducer(this)
  }

  if (!isUsingStore && isObject(store)) {
    spec = store
  }

  if (!isString(arguments[0])) {
    throw new Error('[fad] Expected first argument to createModelType to be name of model type')
  }

  Constructor.type = type
  Constructor.constructor = Constructor

  Constructor.prototype = new Model()
  Constructor.prototype.propTypes = isObject(store) === true ? spec.propTypes : {}
  Constructor.prototype.__$modeltype = Constructor.type
  Constructor.prototype.reducer = store.reducer

  if (spec.propTypes) {
    delete spec.propTypes
  }

  if (isUsingStore) {
    store.addModelType(Constructor)
  }

  mixSpecificationIntoModelType(Constructor, spec)
  calculateDefaultProps(Constructor)

  return Constructor
}
