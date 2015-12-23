const clone = (obj) =>
    JSON.parse(JSON.stringify(obj))

const nodeCache = () => {

    let {REDIS_URL} = process.env

    if(REDIS_URL) {
        let client = require('redis').createClient(REDIS_URL)

        "ready,connect,error,reconnecting,end".split(',').map(event =>
            client.on(event, msg => console.log(`Redis ${event} :: ${msg}`)))

        const getItem = (key, expire) => {
            return new Promise((res,rej) => {
                client.get(key, (err,data) => {
                    if(err || !data) rej(`${key} not in cache`)
                    data = JSON.parse(data)
                    let expired = expire || (+new Date) > data.expiresAt
                    if(expired) rej(`${key} is expired`)
                    res(data)
                })
            })
        }

        const setItem = (key, val, timeout=5*60*60*1000) => {
            const expiresAt = +new Date + timeout
            return new Promise((res,rej) => {
                client.set(key, JSON.stringify({expiresAt, data:val}), (...args) => {
                    res(val)
                })
            })
        }

        const clear = () =>
            new Promise((res,rej) => {
                client.keys('*', (...args) =>
                    args.map(key =>
                        client.del(key)))

                res()
            })

        return { getItem, setItem, clear }

    } else {

        let cache = {}

        const getItem = (key, expire) => {
            return new Promise((res,rej) => {
                if(key in cache) {
                    let data = clone(cache[key]),
                        expired = expire || (data.expiresAt < +new Date)
                    if(expired) return rej(`${key} is expired`)
                    if(!data.data) return rej(`${key} has no data`)
                    return res(data.data)
                }
                rej(`${key} not in cache`)
            })
        }

        const setItem = (key, val, timeout=5*60*60*1000) => {
            const expiresAt = +new Date + timeout
            let data = {expiresAt, data: val}
            return new Promise((res,rej) => {
                cache[key] = clone(data)
                res(clone(data).data)
            })
        }

        const clear = () => {
            delete cache = {}
            return Promise.resolve()
        }

        return { getItem, setItem, clear }
    }
}

const c = nodeCache()
export default c
