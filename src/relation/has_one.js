import Relation from './relation'

export default class HasOne extends Relation {
  primaryKey() {
    return this.options.key || `${this.propName}_id`
  }
}
