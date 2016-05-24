# fad - framework-agnostic data

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


### Example Implementation:

Store.js

```js
import { createStore } from 'fad'

const store = createStore({
  // some properties here
})

export default store
```

Wheel.js

```js
import { ModelTypes, createModelType } from 'fad'
import Store from './Store'

export default createModelType(Store, {
  propTypes: {
    size: ModelTypes.number
  }
})
```

Car.js


```js
import { ModelTypes, createModelType } from 'fad'
import Store from './Store'
import Wheel from './Wheel'

export default createModelType(Store, {
  propTypes: {
    name: ModelTypes.string,
    wheels: [Wheel.type]
  }
})
```

### Mixins

Completeable.js

```js
export default createModelMixin({
  propTypes: {
    completed: ModelTypes.bool
  }
})
```

Task.js

```js
export default createModelType(Store, {
  mixins: [Completeable]
  propTypes: {
    title: ModelTypes.string
  }
})
```

### Serialization

Since the serialize methods on models are idempotent and composable, we can compose a
single serialize method that is a combination of nested serialized methods.

Serialization will become very fast as we can memoize the returned values, only serializing the objects
that have changes within the structure.

Mixins with properties will be flattened to the parent, while nested relationships will become nested objects.

The default serialization method will default to propType names.

User.js

```js
export default createModelType(Store, {
  propTypes: {
    firstName: ModelTypes.string,
    lastName: ModelTypes.string
  }

  serialize(props) {
    return {
      id: props.id
    }
  }
})
```

Post.js

```js
export default createModelType(Store, {
  propTypes: {
    content: ModelTypes.string,
    author: User.type
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
