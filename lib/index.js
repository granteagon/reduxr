'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxyReduce = exports.crudReduce = exports.arrayReducer = exports.reduxr = exports.reducer = exports.createActions = exports.createAction = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

var _isError = require('lodash/isError');

var _isError2 = _interopRequireDefault(_isError);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _reject = require('lodash/reject');

var _reject2 = _interopRequireDefault(_reject);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _has = require('lodash/has');

var _has2 = _interopRequireDefault(_has);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO: No way to validate/error in the action. Does it matter?
// TODO: Async actions can be added by specifying a action with same name as the
//       reducer.  In that case, any action's default behavior can be overridden
// TODO: Need a CRUD reducer with default async actions
// TODO: utils.toggleState(key)
// TODO: instanceReducer: Listens for events based on ID (smart-reducer)

var omitEmpty = function omitEmpty(collection) {
  return (0, _omitBy2.default)(collection, function (item) {
    return item === null || item === undefined;
  });
};

var createAction = exports.createAction = function createAction(type, ns) {
  if (!type) {
    throw new Error('Type argument to createAction cannot be blank');
  }
  return function (payload, meta, error) {
    return omitEmpty({
      type: ns ? ns + '_' + type : type,
      payload: payload,
      meta: meta,
      error: error || (0, _isError2.default)(payload)
    });
  };
};

var createActions = exports.createActions = function createActions(actionHash, ns) {
  return (0, _reduce2.default)(actionHash, function (collect, fn, key) {
    return _extends({}, collect, _defineProperty({}, key, createAction(key, ns)));
  }, {});
};

var nsReducerHash = function nsReducerHash(ns, reducerHash) {
  return (0, _reduce2.default)(reducerHash, function (result, fn, fnName) {
    return _extends({}, result, _defineProperty({}, ns + '_' + fnName, fn));
  }, {});
};

var reducer = exports.reducer = function reducer(reducerHash, initialState, ns) {
  var __reducerHash = ns ? nsReducerHash(ns, reducerHash) : reducerHash;
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    if (!action) {
      return state;
    }
    var reducerFn = __reducerHash[action.type];
    if (action.type && (0, _isFunction2.default)(reducerFn)) {
      return reducerFn(state, action);
    }
    return state;
  };
};

var reduxr = exports.reduxr = function reduxr(reducerHash, initialState, ns) {
  return {
    action: createActions(reducerHash, ns),
    reducer: reducer(reducerHash, initialState, ns)
  };
};

var arrayReducer = exports.arrayReducer = function arrayReducer(itemReducer, ns) {
  return reduxr({
    add: function add(state, action) {
      return [].concat(_toConsumableArray(state), [itemReducer ? itemReducer(undefined, action) : action.payload]);
    },
    remove: function remove(state, action) {
      return (0, _filter2.default)(state, function (item) {
        return item === action.payload;
      });
    }
  }, [], ns);
};

var objExists = function objExists(obj, id) {
  return (0, _has2.default)(obj, 'id') && obj.id === id;
};

var crudReduce = exports.crudReduce = function crudReduce(name, defaultObj) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, name + 'Create', function undefined(state, action) {
    return [].concat(_toConsumableArray(state), [_extends({}, defaultObj, action.payload)]);
  }), _defineProperty(_ref, name + 'Update', function undefined(state, action) {
    return state.map(function (val) {
      if (objExists(val, action.payload.id)) {
        return _extends({}, val, action.payload);
      }
      return val;
    });
  }), _defineProperty(_ref, name + 'Delete', function undefined(state, action) {
    return (0, _reject2.default)(state, { id: action.payload.id });
  }), _ref;
};

var proxyReduce = exports.proxyReduce = function proxyReduce(stateKey, red) {
  return function (state, action) {
    return _extends({}, state, _defineProperty({}, stateKey, red.reducer(state[stateKey], action)));
  };
};