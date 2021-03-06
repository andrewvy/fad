# fad - framework-agnostic data

Disclaimer: work-in-progress. Please do not use in production.

[![Codeship Build Status](https://codeship.com/projects/86061510-0365-0134-078c-16bd53bff421/status?branch=master)](https://codeship.com/projects/153844)


Framework-Agnostic Data (representation)

Simple vanilla model system, aimed for easy integration and shared model code between different JS frameworks.

Heavily inspired by React/Redux.

### What is the objective?

- A simplistic, narrow library built to handle representing many different data types in a
  way that: centralizes the data manipulation logic, safety, and is framework-agnostic.

### What is it not?

- This is not an full-featured ORM. It only provides simple methods to compose data types together.
- This does not communicate to any back-end. It only provides methods to create adapters for (de)serialization.

### Why?

Most data layers are tightly coupled to web application frameworks. This can make it difficult when
representing the same data across multiple web frameworks for different applications.

Some data layers are fairly complex, and provide a lot of functionality outside of the box.

`fad` tries to be different by making the API as simple and powerful as possible to allow for complete extensibility.

### Example Implementation:

```js
import fad from 'fad'

let store = fad.createStore()

const Owner = store.createModel('owner', {
  propTypes: {
    firstName: fad.PropTypes.string,
    lastName: fad.PropTypes.string
  }
})

const Car = store.createModel('car', {
  propTypes: {
    name: fad.PropTypes.string,
    owner: fad.PropTypes.hasOne('owner', { key: 'owner_id' })
  }
})


/**
 * Creating a model instance already inserts it into
 * the store bounded when we defined the model class.
 */

let car = new Car({
  owner_id: 1
})

// undefined
console.log(car.get('id'))

// Defined PropTypes default to their defined type
// ''
console.log(car.get('name'))

// UnloadedAssocation{ type: 'owner', id: 1 }
console.log(car.get('owner'))

let owner = new Owner({
  id: 1,
  firstName: 'John',
  lastName: 'Doe'
})

/**
 * Adding a new Owner model updates the Car model
 * instance as Owner has a reverseRelation to Car
 */

// Owner{ id: 1, firstName: 'John', lastName: 'Doe' }
console.log(Car.get('owner'))
```

### Mixins (not yet implemented)

Completeable.js

```js
export default fad.createModelMixin({
  propTypes: {
    completed: fad.PropTypes.bool
  }
})
```

Task.js

```js
export default fad.createModel('task', {
  mixins: [Completeable],
  propTypes: {
    title: fad.PropTypes.string
  }
})
```

### Serialization (not yet implemented)

Since the serialize methods on models are idempotent and composable, we can compose a
single serialize method that is a combination of nested serialized methods.

Serialization will become very fast as we can memoize the returned values, only serializing the objects
that have changes within the structure.

Mixins with properties will be flattened to the parent, while nested relationships will become nested objects.

The default serialization method will default to propType names.

store.js

```js
import fad from 'fad'
const Store = fad.createStore()
export default Store
```

user.js

```js
import Store from './store'

export default Store.createModel('user', {
  propTypes: {
    firstName: fad.PropTypes.string,
    lastName: fad.PropTypes.string
  },

  fullName: computed('firstName', 'lastName', () => {
    return `${this.get('firstName')} ${this.get('lastName')}`
  }),

  serialize(props) {
    return {
      id: props.id
    }
  }
})
```

post.js

```js
import Store from './store'

export default Store.createModel('post', {
  propTypes: {
    content: fad.PropTypes.string,
    author: fad.PropTypes.belongsTo('user')
  }
})
```

example.js

```js
let user = new User({
  id: 1,
  firstName: "Foo",
  lastName: "Bar"
})

let newPost = new Post({
  content: "Hello world!",
  author: user
})

newPost.serialize()

/* Returns
 * {
 *   content: "Hello world!"
 *   author: {
 *     id: 1
 *   }
 * }
 */

```

### Events (not yet implemented)

Still brainstorming.

```js
import fad from 'fad'

const Store = fad.createStore()

const Car = Store.createModel('car', {
  propTypes: {
    name: fad.PropTypes.string,
    type: fad.PropTypes.string,
    passengers: fad.PropTypes.number
  }
})

let car = new Car({
  name: 'Foo',
  type: 'Bar'
})

// reactive
let subscription = car.stream('passengers')
  .filter((passengers) => passengers > 5)
  .subscribe(() => {
    throw new Error('Car is full!')
  })

subscription.unsubscribe()

// traditional

const Listener = fad.createListener()

Listener.on(car, 'passengers', () => {
  let passengers = car.get('passengers')
  if (passengers > 5) throw new Error('Car is full!')
})

Listener.off()
```

---

### Usage


Finding models by properties:

```js
let car = new Car({
  id: 1,
  name: 'Test'
})

Store.where(Car, { id: 1 })
Store.where(Car, { name: 'Generic Car' })
```

### Internals

`fad` introduces a model store to provide ORM-like features. This is completely optional for use.
If not being used, `fad` will assume that you will be managing this manually and will only provide simple helpers for nested relationships.
