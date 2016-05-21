const Relation = class Relation {
  constructor(toModelName, relatedName) {
    this.toModelName = toModelName
    this.relatedName = relatedName
  }
}

export const ForeignKey = class ForeignKey extends Field {};
export const ManyToMany = class ForeignKey extends Field {};
export const OneToOne = class ForeignKey extends Field {};

const Store = class Store {
  constructor() {
    this.store = {}
  }

  addModelType(modelName) {
    this.store[modelName] = {
      ids: [], // Array of ids
      models: {} // id -> model mapping
    }
  }

  removeModelType(modelName) {
    delete this.store[modelName]
  }

  get(modelName, id) {
  }

  set(modelName, id) {
  }
}
