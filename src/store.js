export class Store {
  constructor() {
    this.modelTypes = {}
    this.models = {}
  }

  addModelType(modelConstructor) {
    this.modelTypes[modelConstructor.type] = modelConstructor
  }

  removeModelType(modelConstructor) {
    delete this.modelTypes[modelConstructor.type]
  }
}

export const createStore = (props) => {
  return new Store()
}
