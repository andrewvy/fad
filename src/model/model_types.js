import Relation from '../relation/relation'
import HasOne from '../relation/has_one'
import HasMany from '../relation/has_many'

export default {
  bool: Symbol(),
  number: Symbol(),
  string: Symbol(),
  array: Symbol(),
  hasOne: (modelType, options) => new HasOne(modelType, options),
  hasMany: (modelType, options) => new HasMany(modelType, options)
}
