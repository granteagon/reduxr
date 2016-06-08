'use strict'

var expect = require('expect')
var dry = require('../lib/index')
var createAction = dry.createAction
var createActions = dry.createActions
var reducer = dry.reducer
var reduxr = dry.reduxr
var promiseAction = dry.promiseAction
var arrayReducer = dry.arrayReducer
var isFSA = require('flux-standard-action').isFSA


// TODO: test that expected functions are being exported?
// TODO: add throws and throw tests where relevant
// TODO: add spys where relevant

function mkStubReducer() {
  return {
    test: (state, action) => {
      if (action.payload.mutate) {
        return Object.assign(
          {},
          state,
          { mutated: action.payload.mutate }
        )
      }
      return state
    }
  }
}

describe('#createAction', () => {

  it('throws when type is empty', () => {
    expect(() => {
      createAction()
    }).toThrow(/Type argument to createAction cannot be blank/)
  })

  it('returns a function', () => {
    expect(createAction('test')).toBeA('function')
  })

  describe('returned function', () => {

    let creator;

    beforeEach(() => {
      creator = createAction('test')
    })

    it('returns an action object', () => {
      const action = creator()
      expect(action).toBeA('object')
    })

    it('returns a flux standard action', () => {
      const action = creator()
      expect(isFSA(action)).toBe(true)
    })

    it('contains the correct action type', () => {
      const action = creator()
      expect(action.type).toEqual('test')
    })

    it('payload can be object of mixed values', () => {
      const obj = {
        a: 'b',
        c: [],
        d: {
          e: 'f'
        },
        f: () => { return }
      }
      const action = creator(obj)
      expect(action.payload)
        .toBeA('object')
        .toBe(obj)
    })

    it('payload can be string', () => {
      const action = creator('test')
      expect(action.payload)
        .toBeA('string')
        .toBe('test')
    })

    it('payload can be function', () => {
      const fn = () => { return }
      const action = creator(fn)
      expect(action.payload)
        .toBeA('function')
        .toBe(fn)
    })

    it('payload can be number', () => {
      const action = creator(1)
      expect(action.payload)
        .toBeA('number')
        .toBe(1)
    })

    it('payload can be array of mixed values', () => {
      const arr = ['a', 1, {b: 'c'}, () => { return }]
      const action = creator(arr)
      expect(action.payload)
        .toBeA('array')
        .toBe(arr)
    })

    it('payload can be true', () => {
      const action = creator(true)
      expect(action.payload).toBe(true)
    })

    it('payload can be false', () => {
      const action = creator(false)
      expect(action.payload).toBe(false)
    })

    it('payload can\'t be undefined', () => {
      const action = creator(undefined)
      expect(action.hasOwnProperty('payload')).toBe(false)
    })

    it('payload can\'t be null', () => {
      const action = creator(null)
      expect(action.hasOwnProperty('payload')).toBe(false)
    })

  })

})

describe('#createActions', () => {

  let stub;
  beforeEach(() => {
    stub = createActions(mkStubReducer())
  })

  it('returns action creator methods from reducer hash', () => {
    expect(stub.test).toBeA('function')
  })

  it('action creators return object', () => {
    expect(stub.test()).toBeA('object')
  })

  it('action creator type is named after function', () => {
    expect(stub.test().type).toBe('test')
  })

  it('new action creator should return payload argument', () => {
    const payload = {foo: 'bar'}
    expect(stub.test(payload).payload).toBe(payload)
  })

})


describe('#reducer', () => {

  let stub;

  beforeEach(() => {
    stub = reducer(mkStubReducer())
  })

  it('is a function', () => {
    expect(stub)
      .toBeA('function')
  })

  describe('-> reducing', () => {

    let action, state;

    beforeEach(() => {
      action = createActions(mkStubReducer())
      state = { mutated: false }
    })

    it('reduces state', () => {
      action = action.test({ mutate: true })
      expect(stub(state, action).mutated).toBe(true)
    })

    it('state not mutated without action', () => {
      expect(stub(state)).toBe(state)
    })

    it('can set initial state', () => {
      const initialState = {
        foo: 'bar'
      }
      stub = reducer(mkStubReducer(), initialState)
      expect(stub()).toBe(initialState)
    })

  })

  describe('-> state', () => {

    it('can be string', () => {
      expect(stub('test'))
        .toBeA('string')
        .toBe('test')
    })

    it('can be function', () => {
      const fn = () => { return }
      expect(stub(fn))
        .toBeA('function')
        .toBe(fn)
    })

    it('can be number', () => {
      expect(stub(1))
        .toBeA('number')
        .toBe(1)
    })

    it('can be array of mixed values', () => {
      const arr = ['a', 1, {b: 'c'}, () => { return }]
      expect(stub(arr))
        .toBeA('array')
        .toBe(arr)
    })

    it('can be true', () => {
      expect(stub(true))
        .toBeA('boolean')
        .toBe(true)
    })

    it('can be false', () => {
      expect(stub(false))
        .toBeA('boolean')
        .toBe(false)
    })

    it('can be null', () => {
      expect(stub(null)).toBe(null)
    })

  })

})

describe('#reduxr', () => {

  let stub, initialState;

  beforeEach(() => {
    initialState = { foo: 'bar' }
    stub = reduxr(mkStubReducer(), initialState)
  })

  it('returns an object', () => {
    expect(stub).toBeA('object')
  })

  describe('-> action property', () => {

    it('exists', () => {
      expect(stub.action).toExist()
    })

    it('is an object', () => {
      expect(stub.action).toBeA('object')
    })

    it('transforms reducer function to action creator function', () => {
      expect(stub.action.test).toBeA('function')
    })

    it('has the correct \`type\` value', () => {
      expect(stub.action.test().type).toEqual('test')
    })

  })

  describe('-> reducer property', () => {

    it('exists', () => {
      expect(stub.reducer).toExist()
    })

    it('is a function', () => {
      expect(stub.reducer).toBeA('function')
    })

    it('calls the reducer method when action is dispatched', () => {
      const reducerHash = mkStubReducer()
      const spy = expect.spyOn(reducerHash, 'test')
      stub = reduxr(reducerHash, initialState)
      stub.reducer(initialState, stub.action.test())
      expect(spy.calls.length).toEqual(1)
    })

  })

  describe('- namespacing -', () => {

    let nsStub, ns;

    beforeEach(() => {
      initialState = { floo: 'flar' }
      ns = 'stub'
      nsStub = reduxr(mkStubReducer(), initialState, ns)
    })

    it('action creators are not namespaced', () => {
      // we want to be able someObj.action.get, not someObj.action.someObj_get
      expect(nsStub.action.test).toBeA('function')
    })

    it('action types *are* namespaced', () => {
      // we want type values namespaced so they don't collide w/ other reducers
      expect(nsStub.action.test().type).toEqual(`${ns}_test`)
    })

    it('should reduce namespaced actions', () => {
      expect(
        nsStub.reducer(undefined, nsStub.action.test({ mutate: true }))
      ).toEqual(
        Object.assign(initialState, { mutated: true })
      )
    })
  })

})


describe('#arrayReducer', () => {

  let stubObj, ar;

  beforeEach(() => {
    stubObj = reduxr({
      add: () => ({ id: Math.random() })
    }, {id: null})
    ar = arrayReducer(stubObj.reducer)
  })

  it('should add items to the array', () => {
    expect(
      ar.reducer(undefined, ar.action.add()).length
    ).toEqual(1)
  })

  it('should remove items from the array', () => {
    const x = ar.reducer(undefined, ar.action.add())[0]
    expect(
      ar.reducer(undefined, ar.action.remove(x)).length
    ).toEqual(0)
  })

})
