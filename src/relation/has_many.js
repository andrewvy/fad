import Relation from './relation'

export default class HasMany extends Relation {
  primaryKey() {
    return this.options.reverse_key || `${this.modelType}_id`
  }
}
