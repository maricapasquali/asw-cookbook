import {flatten, recursiveSearch} from "../arrays";

export interface Scrolling {
    enable: () => void
    disable: () => void,
    addScrollingEnable: (...element: HTMLElement[]) => void,
    cleanScrollingEnables: () => void,
}

// left: 37, up: 38, right: 39, down: 40,
const keys: number[] = [37, 38, 39, 40];

const scrollingElements: HTMLElement[] = []

function childrenFlatten(elems: HTMLElement[]): HTMLElement[] {
    return flatten(elems, "children") as HTMLElement[]
}

function parentSearch(elements: HTMLElement[], elem: HTMLElement): HTMLElement {
    return recursiveSearch(elements, elem, "parentElement")
}

function isScrollable(elem: HTMLElement): boolean {
    return elem.scrollHeight > elem.clientHeight
}

function preventDefault(e) {
    let target: HTMLElement = e.target
    if(scrollingElements.find(t => t == target)) {
        if(!isScrollable(target)){
            e.preventDefault();
        }
    }
    else {
        if(childrenFlatten(scrollingElements).find(t => t == target)){
            const parent = parentSearch(scrollingElements, target)
            if(parent && !isScrollable(parent)){
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    }
}

function preventDefaultForScrollKeys(e) {
    if (keys.includes(e.keyCode)) {
        preventDefault(e);
        return false;
    }
}

// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; }
    }));
} catch(e) {}

const wheelOpt = supportsPassive ? { passive: false } : false;

const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    console.debug("Disable scroll.")
}

function enableScroll() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt as EventListenerOptions);
    window.removeEventListener('touchmove', preventDefault, wheelOpt as EventListenerOptions);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    console.debug("Enable scroll.")
}

function addExcluded(...element: HTMLElement[]) {
    scrollingElements.push(...element)
    console.debug("[addScrollingEnable]: ", scrollingElements)
}

function cleanExcluded() {
    scrollingElements.splice(0)
    console.debug("[cleanScrollingEnables]: ", scrollingElements)
}

const scrolling: Scrolling = {
    enable: enableScroll,
    disable: disableScroll,
    addScrollingEnable: addExcluded,
    cleanScrollingEnables: cleanExcluded
}

export default scrolling
