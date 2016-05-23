# fad - framework-agnostic data

Framework-Agnostic Data (representation)

Simple vanilla model system, aimed for easy integration and shared
model code between different JS frameworks.

### What is the objective?

- A simplistic, narrow library built to handle representing many different data types in a
  way that: centralizes the data manipulation logic, safety, and is framework-agnostic.

### What is it not?

- This is not an full-featured ORM. It only provides simple methods to compose data types together.
- This does not communicate to any back-end. It only provides methods to create adapters for (de)serialization.

### What are data types?

Data types are the unique model types used within an application. These data types
hold a specification of their properties and their relationships with other data types.

### Example usage:

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
  properties: {
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
  properties: {
    name: ModelTypes.string,
    wheels: [Wheel.type]
  }
})
```

### Internals

`fad` introduces a model store to provide ORM-like features. This is completely optional for use.
If not being used, `fad` will assume that you will be managing this manually and will only provide simple helpers for nested relationships.
