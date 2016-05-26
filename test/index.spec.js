import fad from '../src/index'
import { expect } from 'chai'
import util from 'util'

describe('Model Type Creation', () => {
  const Store = fad.createStore()

  const CarModel = Store.createModel('car', {
    propTypes: {
      name: fad.PropTypes.string
    }
  })

  const PlaneModel = Store.createModel('plane', {
    propTypes: {
      name: fad.PropTypes.string
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

  const CarModel = Store.createModel('car', {
    propTypes: {
      name: fad.PropTypes.string
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
    const EverythingModel = Store.createModel('everything', {
      propTypes: {
        string: fad.PropTypes.string,
        bool: fad.PropTypes.bool,
        number: fad.PropTypes.number,
        array: fad.PropTypes.array
      }
    })

    const model = new EverythingModel()

    expect(model.get('string')).to.equal('')
    expect(model.get('bool')).to.equal(false)
    expect(model.get('number')).to.equal(0)
    expect(model.get('array')).to.be.a('array')
  })

  it('getDefaultProps runs', () => {
    const EverythingModel = Store.createModel('everything', {
      propTypes: {
        string: fad.PropTypes.string,
        bool: fad.PropTypes.bool,
        number: fad.PropTypes.number,
        array: fad.PropTypes.array
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

  it('Runs with no parameters', () => {
    const createCar = () => {
      return new CarModel()
    }

    expect(createCar).to.not.throw()
  })
})

describe('Store', () => {
  const Store = fad.createStore()

  const CarModel = Store.createModel('car', {
    propTypes: {
      name: fad.PropTypes.string
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
  const Store = fad.createStore()

  const ParkingModel = Store.createModel('garage', {
    propTypes: {
      location: fad.PropTypes.string,
      car: fad.PropTypes.hasOne('car', { key: 'car_id' })
    }
  })

  const CarModel = Store.createModel('car', {
    propTypes: {
      name: fad.PropTypes.string,
      owner: fad.PropTypes.hasOne('owner', { key: 'owner_id' })
    }
  })

  const OwnerModel = Store.createModel('owner', {
    propTypes: {
      name: fad.PropTypes.string
    }
  })

  const Car1 = new CarModel({
    id: 1,
    name: 'Generic Car',
    owner_id: 1
  })

  const Owner = new OwnerModel({
    id: 1,
    name: 'John Doe'
  })

  it('Adding a new model creates an instance in the store', () => {
    expect(Car1.get('owner')).to.equal(Owner)
    expect(Car1.get('owner.name')).to.equal('John Doe')

    Owner.set('name', 'Jane Doe')

    expect(Car1.get('owner.name')).to.equal('Jane Doe')
  })

  it('Referencing existing model adds it as an associated model', () => {
    const Car2 = new CarModel({
      id: 2,
      name: 'Generic Car',
      owner_id: 1
    })

    expect(Car2.get('owner')).to.not.be.undefined
    expect(Car2.get('owner')).to.equal(Owner)
  })

  it('Referencing non-existant model returns UnloadedAssociation', () => {
    const Car3 = new CarModel({
      id: 3,
      name: 'Generic Car',
      owner_id: 3
    })

    expect(Car3.get('owner') instanceof fad.UnloadedAssociation).to.be.true
  })

  it('Nested relations with nested relations', () => {
    const ParkingSpot = new ParkingModel({
      location: 'Driveway',
      car_id: 1
    })

    expect(ParkingSpot.get('car')).to.equal(Car1)
    expect(ParkingSpot.get('car.owner')).to.equal(Owner)
  })
})

describe('Model Serialization', () => {
  const Store = fad.createStore()

  const CarModel = Store.createModel('car', {
    propTypes: {
      name: fad.PropTypes.string,
      owner: fad.PropTypes.hasOne('owner', { key: 'owner_id' })
    }
  })

  const OwnerModel = Store.createModel('owner', {
    propTypes: {
      name: fad.PropTypes.string
    }
  })

  const Owner = new OwnerModel({
    id: 1,
    name: 'John Doe'
  })

  it('Serializing a model returns expected attributes', () => {
    const Car = new CarModel({
      id: 1,
      name: 'Generic Car'
    })

    const SerializedCar = Car.serialize()
    const DeserializedCar = JSON.parse(SerializedCar)

    expect(DeserializedCar.name).to.equal(Car.get('name'))
    expect(DeserializedCar.id).to.equal(Car.id)
  })

  it('Serializing removed protected attributes', () => {
    const Car = new CarModel({
      id: 2,
      name: 'Generic Car'
    })

    const SerializedCar = Car.serialize()
    const DeserializedCar = JSON.parse(SerializedCar)

    expect(DeserializedCar.guid).to.be.undefined
  })

  it('Serializing also serializes nested models', () => {
    const Car = new CarModel({
      id: 3,
      name: 'Generic Car',
      owner_id: 1
    })

    const SerializedCar = Car.serialize()
    const DeserializedCar = JSON.parse(SerializedCar)

    expect(DeserializedCar.owner.name).to.equal('John Doe')
  })
})
