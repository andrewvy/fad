import { isObject } from './utils/types'

export class Store {
  constructor() {
    this.modelTypes = {}
    this.models = {}
    this.reducer = this.addModel.bind(this)
  }

  addModel(modelInstance) {
    if (modelInstance === null || modelInstance.id === null) return
    if (this.models[modelInstance.type] === null || this.models[modelInstance.type] === null) return

    this.models[modelInstance.type][modelInstance.id] = modelInstance
  }

  removeModel(modelInstance) {
    if (modelInstance === null || modelInstance.id === null) return
    if (this.models[modelInstance.type] === null || this.models[modelInstance.type] === null) return

    delete this.models[modelInstance.type][modelInstance.id]
  }

  addModelType(modelConstructor) {
    this.modelTypes[modelConstructor.prototype.type] = modelConstructor
    this.models[modelConstructor.prototype.type] = {}
  }

  removeModelType(modelConstructor) {
    delete this.modelTypes[modelConstructor.prototype.type]
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
        if (model.get(propKey) != props[propKey]) {
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
