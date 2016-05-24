export default class Relation {
  constructor(modelType, options) {
    this.modelType = modelType
    this.sourceModelType = null
    this.propName = null
    this.options = options || {}
    this.referencingId = null
    this.source = null
  }

  updateSource(model) {
    this.source = model
  }

  updateSourceModelType(modelType) {
    this.sourceModelType = modelType
  }

  updatePropName(propName) {
    this.propName = propName
  }

  updateReferencingId(id) {
    this.referencingId = id
  }
}
