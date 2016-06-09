# Reduxr

[Redux](https://github.com/reactjs/redux) made easy - no boilerplate!

With Reduxr, you never have to create actions or action creators unless you
want to.  You just need to define your reducers.  Reduxr handles the rest.

## What does it do?

- Eliminates LONG_ACTION_NAMES_WITH_UNDERSCORES
- Automatically defines actions based on your reducers
  - All action objects have a `type` and a `payload`
- Actions and Reducers can be namespaced
  - Reducer methods can have simple names like `create`, `read`, `update`,
  `delete` as a result!
- Low cyclomatic complexity instead of long `switch` or `if` statement. Reducer
methods are defined in an easy to read map.

## How Does it Work?

Define a map of individual reducer methods and a reducer function and
action map will be generated for you.

```js
import reject from 'lodash/reject'

const initialState = []

const reducers = {
  create: (state, action) => [ ...state, action.payload ],
  delete: (state, action) => reject(state, action.payload)
}

const todoArray = reduxr(reducers, initialState)

// ->
// {
//   action: {
//     create: [Function],
//     delete: [Function],
//   },
//   reducer: [Function]
// }
```

Now we can manually dispatch an action through the reducer to see the output:
```js
const action = todoArray.action.create({
  id: 1,
  name: 'Start Open Source Project'
})

// ->
// {
//   type: 'create',
//   payload: {
//     id: 1,
//     name: 'Start Open Source Project'
//   }
// }

todoArray.reducer([], action)

// ->
// [
//   { id: 1, name: 'Start Open Source Project'}
// ]
```

## Examples

### Define Simple Reducer

Let's say we have to toggle a todo.

```js
// Todo.js
import { reduxr } from 'reduxr'

// define our reducers in a map
const todoReducer = {
  todoToggleVisibility: (state) => {
    return {
      ...state,
      visible: !state.visible  
    }
  }
}

// define our initial state
const initialState = {
  label: '',
  visible: false
}

export default const todo = reduxr(todoReducer, initialState)
{
  action: {
    todoToggleVisibility: [Function] // action creator method
  },
  reducer: [Function] // reducer method for use in combineReducers
}
```

#### Dispatching an Action
Here's how we can import our Todo.js and dispatch an action using `reduxr`.

```js
import Todo from './Todo'
import { createStore, combineReducers } from 'redux'

const store = createStore(
  combineReducers({
    todo: Todo.reducer // load our reducer into the store
  })
)

store.dispatch(Todo.action.todoToggleVisibility({visible: true}))
// -> dispatches:
// {
//   type: 'todoToggleVisibility',
//   payload: { visible: true}
// }
```
***"But `todoToggleVisibility` didn't have an action argument! What's all this
then?!"***

Glad you asked. When we call `reduxr`, 2 things happen:

1. Reducer names are transformed into action creator methods. Action creators
will always return an action object with a `type` property.  The type property
has the same name as the reducer method.
2. The `reducer` function is supplied with our reducer map and the value of any
initial state we supplied. If a match is not found, state is returned.

When an action is dispatched, the reducer matches the `type` value of the action
being dispatched to the same key in the reducer map.  In our case, we
dispatched `Todo.action.todoToggleVisibility()`, and that mapped to the
`todoToggleVisibility` function we created.

### Dispatching Actions with a Payload
Of course we can't only dispatch actions with only string type names.  Let's
update the example above, to see what it would take to add a reducer that
requires an action with a payload.

```js
// Todo.js
import { reduxr } from 'reduxr'

// define our reducers in a map
const todoReducer = {
  todoToggleVisibility: (state) => {
    return {
      ...state,
      visible: !state.visible  
    }
  },
  complete: (state, payload) => {
    return {
      ...state,
      complete: payload
    }
  }
}

// define our initial state
const initialState = {
  visible: false
}

export default const todo = reduxr(todoReducer, initialState)
```

#### Output
After adding the above method, our output is now:

```js
{
  action: {
    todoToggleVisibility: [Function],
    complete: [Function]
  },
  reducer: [Function]
}
```

#### Dispatching an Action with a Payload
And here's how we dispatch an action with a payload. Notice that

```js
import Todo from './Todo'
import { createStore, combineReducers } from 'redux'

const store = createStore(
  combineReducers({
    todo: Todo.reducer // load our reducer into the store
  })
)

store.dispatch(Todo.action.complete(true))
// -> dispatches: { type: 'todoToggleVisibility' }
```

## Namespaced reducers
Reducer methods can be easily namespaced by passing a third argument to
`reduxr`.

```js
const todoArray = reduxr(reducerMethods, initialState, 'todoArray')

todoArray.action.create({
  id: 1,
  name: 'Start Open Source Project'
})

// ->
// {
//   type: 'todoArray_create',
//   payload: {
//     id: 1,
//     name: 'Start Open Source Project'
//   }
// }
```

You can now safely dispatch this action without worrying about it conflicting
with other reducers of the same name.

## Roadmap

This project was started because I love Redux, but not all the boilerplate that
can come with it. My future goals for this project are to create more shortcuts
and reusable patterns.

The overall goal for the Roadmap is not to force people to do things our way,
whenever possible.  I just want to provide some very useful shortcuts so we can
get back to coding instead of writing boilerplate or snippets that output
boilerplate.

Some items on my to-do list for this project:

- Async Action Creator Pattern (predef actions for success/fail/etc)
- CRUD Object pattern (some of this work already in-progress, read the code)
- Collection & Array Patterns (most collections should have common functions)

## Like this Project?

[Buy me a Porsche](http://www.ebay.com/sch/eBay-Motors-/6000/i.html?_nkw=porsche+911+turbo&_frs=1)
