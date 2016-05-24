import { isObject } from './utils/types'

export class Store {
  constructor() {
    this.modelTypes = {}
    this.models = {}
    this.reducer = this.addModel.bind(this)
  }

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

  addModelType(modelConstructor) {
    this.modelTypes[modelConstructor.type] = modelConstructor
    this.models[modelConstructor.type] = {}
  }

  removeModelType(modelConstructor) {
    delete this.modelTypes[modelConstructor.type]
  }

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
