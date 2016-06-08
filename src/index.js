
import isFunction from 'lodash/isFunction'
import reduce from 'lodash/reduce'
import omitBy from 'lodash/omitBy'
import isError from 'lodash/isError'
import filter from 'lodash/filter'
import reject from 'lodash/reject'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import has from 'lodash/has'

// TODO: No way to validate/error in the action. Does it matter?
// TODO: Async actions can be added by specifying a action with same name as the
//       reducer.  In that case, any action's default behavior can be overridden
// TODO: Need a CRUD reducer with default async actions
// TODO: utils.toggleState(key)
// TODO: instanceReducer: Listens for events based on ID (smart-reducer)

const omitEmpty = (collection) => omitBy(
  collection,
  item => item === null || item === undefined
)

export const createAction = (type, ns) => {
  if (!type) {
    throw new Error('Type argument to createAction cannot be blank')
  }
  return (payload, meta, error) => omitEmpty({
    type: ns ? `${ns}_${type}`: type,
    payload,
    meta,
    error: error || isError(payload)
  })
}

export const createActions = (actionHash, ns) =>
  reduce(actionHash, (collect, fn, key) => ({
    ...collect,
    [key]: createAction(key, ns)
  }), {})

const nsReducerHash = (ns, reducerHash) => {
  return reduce(
    reducerHash,
    (result, fn, fnName) => ({
      ...result, [`${ns}_${fnName}`]: fn
    }),
    {}
  )
}

export const reducer = (reducerHash, initialState, ns) => {
  const __reducerHash = ns ? nsReducerHash(ns, reducerHash) : reducerHash
  return (state=initialState, action) => {
    if (!action) {
      return state
    }
    const reducerFn = __reducerHash[action.type]
    if (action.type && isFunction(reducerFn)) {
      return reducerFn(state, action)
    }
    return state
  }
}

export const reduxr = (reducerHash, initialState, ns) => ({
  action: createActions(reducerHash, ns),
  reducer: reducer(reducerHash, initialState, ns)
})


export const arrayReducer = (itemReducer, ns) =>
  reduxr({
    add: (state, action) => [
      ...state,
      itemReducer ? itemReducer(undefined, action) : action.payload
    ],
    remove: (state, action) => filter(state, item => item === action.payload)
  }, [], ns)

const objExists = (obj, id) => has(obj, 'id') && obj.id === id

export const crudReduce = (name, defaultObj) => ({
  [`${ name }Create`]: (state, action) => [
    ...state,
    {
      ...defaultObj,
      ...action.payload
    }
  ],
  [`${ name }Update`]: (state, action) => state.map(val => {
    if (objExists(val, action.payload.id)) {
      return {
        ...val,
        ...action.payload
      }
    }
    return val
  }),
  [`${ name }Delete`]: (state, action) => reject(state, {id: action.payload.id})
})

export const proxyReduce = (stateKey, red) => (state, action) => ({
  ...state,
  [stateKey]: red.reducer(state[stateKey], action)
})
