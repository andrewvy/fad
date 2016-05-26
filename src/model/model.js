import { isEmpty, toString, isNumber, isString, isObject, isArray, isBoolean, isFunction } from '../utils/types'
import { getKey, get, set, del } from '../utils/path'

import { Store } from '../store/store'

import Relation from '../relation/relation'
import UnloadedAssociation from '../relation/unloaded_association'

import PropTypes from './model_types'

/**
 * Heavily inspired by React's createClass and Class Mixin behaviour,
 * this file contains the necessary functions for creating and setting
 * up a new unique model type and validating prop types for serializing
 * and deserializing.
 */

const toJSON = (object) => {
  const PROTECTED_KEYS = ['guid', '__$relations']
  let keys = Object.keys(object)
  let json = {}

  keys.forEach((key) => {
    if (PROTECTED_KEYS.indexOf(key) === -1) {
      let value = object[key]
      if (isObject(value) && value.guid) {
        json[key] = toJSON(value)
      } else if (isArray(value)) {
        json[key] = value.map((elem) => toJSON(elem))
      } else {
        json[key] = object[key]
      }
    }
  })

  return json
}

export default class Model {
  deserialize() {}
  serialize() {
    return JSON.stringify(toJSON(this))
  }

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
    return get(this, path, defaultValue)
  }

  /**
   * Pushes an element into an array at a deeply nested path.
   * @param {string} path - The stringified path of the property
   * @param {*} element - The element to insert into the property.
   */
  push(path) {
    let arr = get(this, path)
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

function calculateDefaultProps(Constructor) {
  let proto = Constructor.prototype.propTypes || {}
  let defaults = isFunction(Constructor.prototype.getDefaultProps) ? Constructor.prototype.getDefaultProps() : {}

  for (let name in proto) {
    let propType = proto[name]
    let propertyDefined = defaults.hasOwnProperty(name)

    if (propertyDefined) continue

    switch (propType) {
      case PropTypes.bool:
        defaults[name] = false
        break
      case PropTypes.number:
        defaults[name] = 0
        break
      case PropTypes.string:
        defaults[name] = ''
        break
      case PropTypes.array:
        defaults[name] = []
        break
    }
  }

  Constructor.prototype.__$defaultProps = defaults
}

/**
 * This sets up the relationships to be set on the model class constructor.
 *
 * We check if there's already implicit relationships defined, in which
 * case we remove the relations where we explicitly define them.
 * (As other model types could have defined their relations ahead of time).
 *
 * After we explicitly store our relations, we then check which relations
 * could possibly be implicit on other models.
 */

function setupClassRelationships(Constructor) {
  let propTypes = Constructor.prototype.propTypes || {}
  let store = Constructor.prototype.store

  for (let propName in propTypes) {
    if (propTypes[propName] instanceof Relation) {
      // Get relation and update it with appropriate
      // metadata around the relationship.
      let relation = propTypes[propName]
      relation.updatePropName(propName)
      relation.updateSourceModelType(Constructor.type)

      store.defineImplicitRelation(relation)
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

function setupRelationships(instance, props) {
  Object.defineProperty(instance, '__$relations', {
    enumerable: false,
    writable: true
  })

  instance.__$relations = {}

  let store = instance.store
  let propTypes = instance.propTypes || {}
  let allUnresolvedRelations = store.getUnresolvedRelations(instance.__$modeltype)

  for (let propName in propTypes) {
    if (propTypes[propName] instanceof Relation) {
      // Get relation and update it with appropriate
      // metadata around the relationship.

      let classRelation = propTypes[propName]
      let relation = new classRelation.constructor(classRelation.modelType, classRelation.options)

      relation.updatePropName(propName)
      relation.updateSourceModelType(instance.__$modeltype)
      relation.updateSource(instance)
      instance.__$relations[propName] = relation

      // @todo(vy): Need to handle implicit HasMany relation
      // if (relation instanceof HasOne) {
      //   let implicitRelation = relation.createImplicitRelation()
      //   store.defineImplicitRelation(instance.guid, implicitRelation)
      // }

      if (props[relation.primaryKey()]) {
        let id = props[relation.primaryKey()]
        relation.updateReferencingId(id)

        let modelConstructor = store.findModelType(relation.modelType)
        let associatedInstance = store.find(modelConstructor, id)

        if (associatedInstance !== undefined) {
          instance[propName] = associatedInstance
        } else {
          // Associated model doesn't exist yet, so we'll
          // create an UnloadedAssociation in place of it.
          // And also create a reverse relationship to
          // connect it back to this model instance.
          instance[propName] = new UnloadedAssociation(relation.modelType, id)
          store.defineUnresolvedRelation(instance.guid, relation)
        }
      }
    }
  }

  // Check for unresolved relations that could be bounded
  // to this model instance.
  allUnresolvedRelations.forEach((unresolveRelation) => {
    for (let referencedInstanceGuid in unresolveRelation) {
      let relations = unresolveRelation[referencedInstanceGuid]

      for (let relationPropName in relations) {
        let relation = relations[relationPropName]

        if (relation.referencingId === instance.id) {
          relation.source[relationPropName] = instance
          store.undefineUnresolvedRelation(relation)
        }
      }
    }
  })
}

let idCounter = 0
function uniqueId(prefix) {
  let id = ++idCounter + ''
  return prefix ? prefix + id : id
}

export function createModelType(type, store, spec) {
  let isUsingStore = store instanceof Store

  let Constructor = function(props) {
    Object.defineProperty(this, 'guid', {
      enumerable: false,
      writable: true
    })

    this.guid = uniqueId('g')

    applyProps(this, props)

    if (this.store instanceof Store) {
      this.store.addModel(this)
      setupRelationships(this, props)
    }
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
  Constructor.prototype.__$isUsingStore = isUsingStore

  if (isUsingStore) {
    Constructor.prototype.store = store
  }

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
