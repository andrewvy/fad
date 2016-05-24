class Relation {
  constructor(model, options) {
    this.modelType = model.type
    this.options = options
  }
}

export class HasOne extends Relation {}
export class HasMany extends Relation {}
