export class Relation {
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

export class HasOne extends Relation {
  primaryKey() {
    return this.options.key || `${this.propName}_id`
  }
}

export class HasMany extends Relation {
  primaryKey() {
    return this.options.reverse_key || `${this.modelType}_id`
  }
}

export class UnloadedAssociation {
  constructor(modelType, id) {
    this.modelType = modelType
    this.id = id
  }
}
