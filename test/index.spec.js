import { ModelTypes, createModelType, createStore } from '../src/index'
import { expect } from 'chai'
import util from 'util'

describe('Model Type Creation', () => {
  it('Can create new model type', () => {
    const CarModel = createModelType({
      propTypes: {
        name: ModelTypes.string
      }
    })

    const Car = new CarModel({
      name: 'Generic Car'
    })

    expect(Car.get('name')).to.equal('Generic Car')
  })

  it('Creating a new model type registers in the store', () => {
    const Store = createStore()

    const CarModel = createModelType(Store, {
      propTypes: {
        name: ModelTypes.string
      }
    })

    const Car = new CarModel({
      name: 'Generic Car'
    })

    expect(Store.modelTypes[CarModel.type]).to.equal(CarModel)
  })
})

describe('Model Attribute Validations', () => {
  it('Throws an error on extra attribute', () => {
    const Store = createStore()

    const CarModel = createModelType(Store, {
      propTypes: {
        name: ModelTypes.string
      }
    })

    const props = {
      name: 'Generic Car',
      type: 'Coupe'
    }

    const createModel = () => {
      return new CarModel(props)
    }

    expect(createModel).to.throw(Error, '[fad] Tried applying non-existent property \'type\' on model')
  })
})

describe('Adding models reflects in the store', () => {
  it('Adding a new model creates an instance in the store', () => {
    const Store = createStore()

    const CarModel = createModelType(Store, {
      propTypes: {
        name: ModelTypes.string
      }
    })

    const Car = new CarModel({
      id: 1,
      name: 'Generic Car'
    })

    expect(Store.where(CarModel, { id: 1 })[0]).to.equal(Car)
    expect(Store.where(CarModel, { name: 'Generic Car' })[0]).to.equal(Car)
  })

  it('Adding a model with the same id throws an error', () => {
    const Store = createStore()

    const CarModel = createModelType(Store, {
      propTypes: {
        name: ModelTypes.string
      }
    })

    const createCar = () => {
      return new CarModel({
        id: 1,
        name: 'Generic Car'
      })
    }

    expect(createCar).to.not.throw()
    expect(createCar).to.throw(Error, '[fad] Model with id 1 already exists in store')
  })
})
