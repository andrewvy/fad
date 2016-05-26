import { isObject } from '../utils/types'

export class Store {
  constructor() {
    this.modelTypes = {}
    this.implicitRelations = {}
    this.unresolvedRelations = {}

    this.models = {}
    this.instanceRelations = {}
  }

  /**
   * Model Instance
   */

  addModel(modelInstance) {
    if (modelInstance === null || modelInstance.id === null || modelInstance.id === undefined) return
    if (this.models[modelInstance.__$modeltype] === null || this.models[modelInstance.__$modeltype] === null) return

    if (this.models[modelInstance.__$modeltype][modelInstance.id] !== undefined) {
      throw new Error(`[fad] Model with id ${modelInstance.id} already exists in store`)
    }

    this.models[modelInstance.__$modeltype][modelInstance.id] = modelInstance
  }

  removeModel(modelInstance) {
    if (modelInstance === null || modelInstance.id === null) return
    if (this.models[modelInstance.__$modeltype] === null || this.models[modelInstance.__$modeltype] === null) return

    delete this.models[modelInstance.__$modeltype][modelInstance.id]
  }

  /**
   * Model Constructor
   */

  addModelType(modelConstructor) {
    this.modelTypes[modelConstructor.type] = modelConstructor
    this.models[modelConstructor.type] = {}
  }

  removeModelType(modelConstructor) {
    delete this.modelTypes[modelConstructor.type]
  }

  findModelType(modelType) {
    return this.modelTypes[modelType]
  }

  /**
   * Relations
   */

  defineImplicitRelation(guid, relation) {
    let from = relation.sourceModelType
    let to = relation.modelType

    let allRelations = this.implicitRelations[`${to}:${from}`] || {}
    let instanceRelations = allRelations[guid] || {}

    instanceRelations[relation.propName] = relation

    allRelations[guid] = instanceRelations
    this.implicitRelations[`${to}:${from}`] = allRelations
  }

  undefineImplicitRelation(relation) {
    let from = relation.sourceModelType
    let to = relation.modelType

    delete this.implicitRelations[`${from}:${to}`]
  }

  getImplicitRelations(modelType) {
    let implicitKeys = Object.keys(this.implicitRelations)
    let modelTypeLength = modelType.length

    return implicitKeys.filter((implicitKey) => {
      return implicitKey.substr(0, modelTypeLength) === modelType
    }).map((implicitKey) => this.implicitRelations[implicitKey])
  }

  defineUnresolvedRelation(guid, relation) {
    let from = relation.sourceModelType
    let to = relation.modelType

    let allRelations = this.unresolvedRelations[`${to}:${from}`] || {}
    let instanceRelations = allRelations[guid] || {}

    instanceRelations[relation.propName] = relation

    allRelations[guid] = instanceRelations
    this.unresolvedRelations[`${to}:${from}`] = allRelations
  }

  undefineUnresolvedRelation(relation) {
    let from = relation.sourceModelType
    let to = relation.modelType

    delete this.unresolvedRelations[`${from}:${to}`]
  }

  getUnresolvedRelations(modelType) {
    let unresolvedKeys = Object.keys(this.unresolvedRelations)
    let modelTypeLength = modelType.length

    return unresolvedKeys.filter((unresolvedKey) => {
      return unresolvedKey.substr(0, modelTypeLength) === modelType
    }).map((unresolvedKey) => this.unresolvedRelations[unresolvedKey])
  }

  /**
   * Query API
   */

  find(modelConstructor, id) {
    if (!isObject(this.models[modelConstructor.type])) return null
    return this.models[modelConstructor.type][id]
  }

  where(modelConstructor, props) {
    if (!isObject(this.models[modelConstructor.type])) return null
    let models = this.models[modelConstructor.type] || {}
    let keys = Object.keys(models)
    let found = []
    let propKeys = Object.keys(props)

    keys.forEach((key) => {
      let model = models[key]
      let matches = true

      propKeys.forEach((propKey) => {
        if (model.get(propKey) !== props[propKey]) {
          matches = false
        }
      })

      if (matches) {
        found.push(model)
      }
    })

    return found
  }
}

export const createStore = (props) => {
  return new Store()
}
