/**
 * +/- function to native math sign
 */
function signPoly(value) {
    if (value < 0) return -1
    return value > 0 ? 1 : 0
}
export const sign = Math.sign || signPoly

/**
 * Checks if the flag is set
 * @param val
 * @param flag
 * @returns {boolean}
 */
function hasFlag(val, flag) {
    return (val & flag) === flag
}

/**
 * Native modulo bug with negative numbers
 * @param n
 * @param mod
 * @returns {number}
 */
function mod(n, mod) {
    return ((n % mod) + mod) % mod
}

/**
 * Asserts a value is beetween min and max
 * @param val
 * @param min
 * @param max
 * @returns {number}
 */
function bound(val, min, max) {
    return Math.max(min, Math.min(max, val))
}

export {mod, bound, hasFlag}

/**
 * Get value of an object property/path even if it's nested
 */
export function getValueByPath(obj, path) {
    return path.split('.').reduce((o, i) => o ? o[i] : null, obj)
}

/**
 * Extension of indexOf method by equality function if specified
 */
export function indexOf(array, obj, fn) {
    if (!array) return -1

    if (!fn || typeof fn !== 'function') return array.indexOf(obj)

    for (let i = 0; i < array.length; i++) {
        if (fn(array[i], obj)) {
            return i
        }
    }

    return -1
}

/**
 * Merge function to replace Object.assign with deep merging possibility
 */
const isObject = (item) => typeof item === 'object' && !Array.isArray(item)
const mergeFn = (target, source, deep = false) => {
    if (deep || !Object.assign) {
        const isDeep = (prop) =>
            isObject(source[prop]) &&
            target !== null &&
            target.hasOwnProperty(prop) &&
            isObject(target[prop])
        const replaced = Object.getOwnPropertyNames(source)
            .map((prop) => ({ [prop]: isDeep(prop)
                ? mergeFn(target[prop], source[prop], deep)
                : source[prop] }))
            .reduce((a, b) => ({ ...a, ...b }), {})

        return {
            ...target,
            ...replaced
        }
    } else {
        return Object.assign(target, source)
    }
}
export const merge = mergeFn

/**
 * Mobile detection
 * https://www.abeautifulsite.net/detecting-mobile-devices-with-javascript
 */
export const isMobile = {
    Android: function () {
        return (
            typeof window !== 'undefined' &&
            window.navigator.userAgent.match(/Android/i)
        )
    },
    BlackBerry: function () {
        return (
            typeof window !== 'undefined' &&
            window.navigator.userAgent.match(/BlackBerry/i)
        )
    },
    iOS: function () {
        return (
            typeof window !== 'undefined' &&
            window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
        )
    },
    Opera: function () {
        return (
            typeof window !== 'undefined' &&
            window.navigator.userAgent.match(/Opera Mini/i)
        )
    },
    Windows: function () {
        return (
            typeof window !== 'undefined' &&
            window.navigator.userAgent.match(/IEMobile/i)
        )
    },
    any: function () {
        return (
            isMobile.Android() ||
            isMobile.BlackBerry() ||
            isMobile.iOS() ||
            isMobile.Opera() ||
            isMobile.Windows()
        )
    }
}

export function removeElement(el) {
    if (typeof el.remove !== 'undefined') {
        el.remove()
    } else if (typeof el.parentNode !== 'undefined' && el.parentNode !== null) {
        el.parentNode.removeChild(el)
    }
}

export function createAbsoluteElement(el) {
    const root = document.createElement('div')
    root.style.position = 'absolute'
    root.style.left = '0px'
    root.style.top = '0px'
    root.style.width = '100%'
    const wrapper = document.createElement('div')
    root.appendChild(wrapper)
    wrapper.appendChild(el)
    document.body.appendChild(root)
    return root
}

export function isVueComponent(c) {
    return c && c._isVue
}

export function toCssWidth(width) {
    return width === undefined ? null : (isNaN(width) ? width : width + 'px')
}


export function isCustomElement(vm) {
    return 'shadowRoot' in vm.$root.$options
}

