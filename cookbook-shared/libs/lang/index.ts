declare global {
    interface String {
        /**
         * @return A new string with the first letter uppercase.
         */
        capitalize: () => string
    }
}

String.prototype.capitalize = function () {
    return this.replace(/^\w/, c => c.toUpperCase())
}

export {}
