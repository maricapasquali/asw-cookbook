import * as crypto from 'crypto'

export function unixTimestampToString(ts: number, get: string = 'date_time', locals: string = 'it-IT', options: object = {}): string {
    let date = new Date(ts)
   switch (get) {
       case 'time': return date.toLocaleTimeString(locals, options)
       case 'date': return date.toLocaleDateString(locals, options)
       case 'date_time': return date.toLocaleString(locals, options)
   }
}

export function randomString(size: number = 20) {
    return crypto.randomBytes(size)
                 .toString('hex')
                 .slice(0, size)
}

export function futureDateFromNow(minutes: number): number{
    return new Date(Date.now() + minutes*60000).getTime()
}

export function decodeToArray(encodedString: string): Array<any> {
    let array = JSON.parse(encodedString)
    if(!Array.isArray(array)) throw new Error("it's not array.")
    return array
}

export function areThereDuplicatesIn(array: Array<any>, mapper?: (value: any) => any): Boolean {
    mapper = mapper || ( (p) => p )
    return new Set(array.map(p => mapper(p))).size < array.length
}