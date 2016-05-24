import fad from '../src/index'
import { expect } from 'chai'
import util from 'util'

describe('Model Type Creation', () => {
  const Store = fad.createStore()

  const CarModel = fad.createModelType('car', Store, {
    propTypes: {
      name: fad.ModelTypes.string
    }
  })

  const PlaneModel = fad.createModelType('plane', Store, {
    propTypes: {
      name: fad.ModelTypes.string
    }
  })

  it('Can create new model type', () => {
    const Car = new CarModel({
      name: 'Generic Car'
    })

    expect(Car.get('name')).to.equal('Generic Car')
  })

  it('Creating a new model type registers in the store', () => {
    const Car = new CarModel({
      name: 'Generic Car'
    })

    expect(Store.modelTypes[CarModel.type]).to.equal(CarModel)
  })

  it('Two different model types do not have the same symbol', () => {
    const FooCar = new CarModel({
      name: 'Foo Car'
    })

    const BarCar = new CarModel({
      name: 'Bar Car'
    })

    expect(CarModel.type).to.not.equal(PlaneModel.type)
    expect(FooCar.type).to.equal(BarCar.type)
  })
})

describe('Model Attribute Validation', () => {
  const Store = fad.createStore()

  const CarModel = fad.createModelType('car', Store, {
    propTypes: {
      name: fad.ModelTypes.string
    }
  })

  it('Ignores extra attributes', () => {
    const props = {
      name: 'Generic Car',
      type: 'Coupe'
    }

    const model = new CarModel(props)
    expect(model.get('type')).to.equal(undefined)
  })

  it('Creates default attributes based on propTypes', () => {
    const EverythingModel = fad.createModelType('everything', {
      propTypes: {
        string: fad.ModelTypes.string,
        bool: fad.ModelTypes.bool,
        number: fad.ModelTypes.number,
        array: fad.ModelTypes.array
      }
    })

    const model = new EverythingModel()

    expect(model.get('string')).to.equal('')
    expect(model.get('bool')).to.equal(false)
    expect(model.get('number')).to.equal(0)
    expect(model.get('array')).to.be.a('array')
  })

  it('getDefaultProps runs', () => {
    const EverythingModel = fad.createModelType('everything', {
      propTypes: {
        string: fad.ModelTypes.string,
        bool: fad.ModelTypes.bool,
        number: fad.ModelTypes.number,
        array: fad.ModelTypes.array
      },

      getDefaultProps: () => {
        return {
          string: 'hello',
          bool: true,
          number: 42,
          array: [1]
        }
      }
    })

    const model = new EverythingModel()

    expect(model.get('string')).to.equal('hello')
    expect(model.get('bool')).to.equal(true)
    expect(model.get('number')).to.equal(42)
    expect(model.get('array')).to.be.include(1)
  })
})

describe('Store', () => {
  const Store = fad.createStore()

  const CarModel = fad.createModelType('car', Store, {
    propTypes: {
      name: fad.ModelTypes.string
    }
  })

  it('Adding a new model creates an instance in the store', () => {
    const Car = new CarModel({
      id: 1,
      name: 'Generic Car'
    })

    expect(Store.find(CarModel, 1)).to.equal(Car)
    expect(Store.where(CarModel, { name: 'Generic Car' })[0]).to.equal(Car)
  })

  it('Adding a model with the same id throws an error', () => {
    const createCar = () => {
      return new CarModel({
        id: 1,
        name: 'Generic Car'
      })
    }

    expect(createCar).to.throw(Error, '[fad] Model with id 1 already exists in store')
  })
})

describe('Model Relationships', () => {
})
