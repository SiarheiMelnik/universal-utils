### Universal Utils

---

[![NPM](https://nodei.co/npm/universal-utils.png)](https://nodei.co/npm/universal-utils/)
![](https://david-dm.org/matthiasak/universal-utils.svg)

Small functional problem-solving, event, state-management, and caching utilities:

- a universal XMLHTTPRequest `fetch()` that returns ES6 Promises
- a universal caching mechanism that can cache to WebSQL, IndexedDB, or Local Storage in the browser, or to memory and redis in node
- a universal `fetch()` wrapper that can batch in-flight requests to the same URL, meaning simultaneous requests to the same URL will be resolved by a single network request
- a universal `store()` that maintains immutable pure JSON state (**NOTE: can only have Objects and Arrays, no custom constructors stored in it**) and implements an asynchronous flux/redux pattern that can chain reducer functions together to represent state
- a universal `resource()` that fetches, batches, caches, and maintains an internal store of data associated with a particular resource / model / or API endpoint

#### How to get started

1. start your own node project, then `npm install universal-utils`
2. `import {fetch, store, cache, resource} from 'universal-utils'` to use them

#### Changelog

- Oct 22, 2015
    - project started

#### Who?

Matthew Keas, [@matthiasak](https://twitter.com/@matthiasak)

#### What and Why?

These are tiny utilities that, while limiting in API "surface area", pack a lot of punch. By having tiny modules that provide a very scoped feature, I have been able to compose wrappers and wrappers (around wrappers) which let me configure my code to an exact need and specification, all the while keeping modules testable and running at lightning speed.

The `fetch()` module batches in-flight requests, so if at any point in time, anywhere in my front-end or back-end application I have a calls occur to `fetch('http://api.github.com/users/matthiasak')` while another to that URL is "in-flight", the Promise returned by both of those calls will be resolved by a single network request.

The `cache()` module is a mechanism in which I can customize the storage mechanism, and even force the data to expire at a certain interval (which is default 5 minutes). Thus, any request to a `cacheInstance.getItem(key)` returns a Promise that resolves if the data is cached and is not yet expired, or `throws` an error and thus the Promise must `catch()`. The cache layers in the browser are configured to use WebSQL, IndexedDB, or local-storage, depending on browser support. The node cache layer uses a redis instance (via environment variables) if provided, or an in-memory object cache.

The `store()` module is a mechanism to store an immutable object that represents state of an application. Any application may have one or more active stores, so there's no limitation from how you use the data. The store itself provides four methods: `state()`, `dispatch(reducer, state)`, `to(cb)`, `remove(cb)`.

1. The `store.state()` returns a clone of the internal state object, which is simply a pure copy of JSON of the data. Since this uses pure JSON representation in-lieue of actual Tries and immutable data libraries, this keeps the code footprint tiny, but you can only store pure JSON data in the store.
2. The `store.to(cb)` will register `cb` as a callback function, invoking `cb(nextState)` whenever the store's state is updated with `store.dispatch()` (`store.remove(cb)` simply does the opposite, removing the callback from the list of event listeners).
3. The biggest method implemented by `store()` is `store.dispatch(reducer, state=store.state())`. By default, the second parameter is the existing state of the `store`, but you can override the state object input, if need be. The key here is the redux-inspired `reducer`, which is a function that **you** write that receives two arguments, `state` and `next()`. You should modify the state object somehow, or create a copy, and pass it into `next(state)` to trigger an update to be sent to listener. For example:

    ```js
    const logger = (state) => console.log('state changed! -->', state)
    store.to(logger)

    store.distpatch((state, next) => {
        setTimeout(() => {
            let timestamp = +new Date
            next({ ...state, timestamp })
        }, 2000)
    })
    ```

The `resource()` module is a mechanism that wraps around the previous modules (`fetch()`, `cache()`, `store()`), exposing one primary method `get()`. I'll add more details to this module and how to use it at a later time.

#### License

MIT.
