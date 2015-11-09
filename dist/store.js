// The `store()` module is a mechanism to store an immutable object that represents state of an application. Any application may have one or more active stores, so there's no limitation from how you use the data. The store itself provides four methods: `state()`, `dispatch(reducer, state)`, `to(cb)`, `remove(cb)`.
//
// 1. The `store.state()` returns a clone of the internal state object, which is simply a pure copy of JSON of the data. Since this uses pure JSON representation in-lieue of actual Tries and immutable data libraries, this keeps the code footprint tiny, but you can only store pure JSON data in the store.
// 2. The `store.to(cb)` will register `cb` as a callback function, invoking `cb(nextState)` whenever the store's state is updated with `store.dispatch()` (`store.remove(cb)` simply does the opposite, removing the callback from the list of event listeners).
// 3. The biggest method implemented by `store()` is `store.dispatch(reducer, state=store.state())`. By default, the second parameter is the existing state of the `store`, but you can override the state object input, if need be. The key here is the redux-inspired `reducer`, which is a function that **you** write that receives two arguments, `state` and `next()`. You should modify the state object somehow, or create a copy, and pass it into `next(state)` to trigger an update to be sent to listener. For example:
//
//     ```js
//     const logger = (state) => console.log('state changed! -->', state)
//     store.to(logger)
//
//     store.distpatch((state, next) => {
//         setTimeout(() => {
//             let timestamp = +new Date
//             next({ ...state, timestamp })
//         }, 2000)
//     })
//     ```

"use strict";

exports.__esModule = true;
var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

/**
 *
 * Event-driven redux-like updates where we use
 * reducer functions to update a singular state object
 * contained within the store()
 *
 * Some limitations: You **must** use plain JS objects and arrays
 * with this implementation for serialization and cloning support.
 * This could eventually use actual immutable data-structures, but
 * an implementation change would be required; however if speed
 * or correctness is an issue we can try in the future, as immutable
 * libraries use data-structures like tries and the like to reduce
 * Garbage Collection and blatant in-memory copies with a "structural
 * sharing" technique.
 *
 * - state()
 * - dispatch()
 * - to()
 * - remove()
 */

var store = function store() {
    var _state2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // might have to be changed back to Set()
    // if subscribers get garbage collected
    //
    // WeakSet and WeakMap items are GC'd if
    // they have no other reference pointing to them
    // other than the WeakMap/WeakSet
    var subscribers = new Set(),
        actions = {};

    var instance = {
        state: function state() {
            return clone(_state2);
        },
        dispatch: function dispatch(reducer) {
            var _state = arguments.length <= 1 || arguments[1] === undefined ? instance.state() : arguments[1];

            return new Promise(function (res, rej) {
                var next = function next(newState) {
                    _state2 = clone(newState);
                    for (var _iterator = subscribers, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var s = _ref;

                        s(clone(_state2));
                    }
                    res(clone(_state2));
                };
                reducer(_state, next);
            });
        },
        to: function to(sub) {
            return subscribers.add(sub);
        },
        remove: function remove(sub) {
            return subscribers["delete"](sub);
        }
    };
    return instance;
};

exports["default"] = store;

/*
// Example usage:
// ----------------

let photos = store({photos:[]})
log(photos.state())

const printMe = (state) => {
    log('-------------- subscriber called', state)
}

photos.to(printMe)
photos.to(printMe) // can't have duplicate subscribers, printMe only called once per update
photos.to((state) => log('hi'))

const addRandomPhoto = (state, next) => {
    setTimeout(() => {
       state = {...state, photos: state.photos.concat('https://media0.giphy.com/media/hD52jjb1kwmlO/200w.gif')}
        next(state)
    }, 1000)
}

setInterval(() => photos.dispatch(addRandomPhoto), 500)

/// example React Component code
//
//
let update = (state) => this.setState(state)
let componentDidMount = () => {
    photos.to(update)
}
let componentWillUnmount = () => {
    photos.remove(update)
}
*/
module.exports = exports["default"];