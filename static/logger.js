
// CONSTANTS
const DEBUG=true;
const BASE_URL='http://127.0.0.1:5000';
const BATCH_SIZE=2;

let VISIT_ID = 1;

/*
Setup Beacon to transmit data
 */
if (typeof navigator.sendBeacon === 'undefined') {
    // TODO: find better alternative
    navigator.sendBeacon = console.log;
}

function sendBeacon(URL, data) {
    const result = navigator.sendBeacon(URL, data);

    if (DEBUG) {
        if (result) {
            console.log(`[sendBeacon] Successfully sent events`);
        } else {
            console.error(`[sendBeacon] Error sending log data`);
        }
    }

    return result;
}

/*
Register Navigator/Article/User information
*/
window.addEventListener('pageshow', (event) => {
    if (DEBUG) console.log(`Connected to ${document.domain}`);

    payload = {
        visitId: VISIT_ID,
        baseURI: document.baseURI,
        URL: document.URL,
        domain: document.domain,
        referrer: document.referrer,

        userAgent: navigator.userAgent
    };

    sendBeacon(BASE_URL + '/register', JSON.stringify(payload));
});

let currentEventCount = 0;
let eventFormData = new FormData();

function flushEvents() {
    const result = sendBeacon(BASE_URL + '/log', eventFormData);
    if (result) {
        currentEventCount = 0;
        eventFormData = new FormData();
    }
}


function logEvent(eventType, eventTimeStamp, eventPayload = {}) {
    if (DEBUG) console.log(`[${eventTimeStamp}] ${eventType} = ${eventPayload}`);

    currentEventCount += 1;
    eventFormData.append(eventTimeStamp, JSON.stringify({ eventType, eventPayload }));

    if (currentEventCount > BATCH_SIZE) flushEvents();
}



/*
Dwell Time Events
 */

// visibility changes
document.addEventListener('visibilitychange', (event) => {
    let eventType = (document.hidden) ? 'documentHidden' : 'documentVisible';

    logEvent(eventType, event.timeStamp);
}, false);

// pageshow/pagehide
window.addEventListener('pageshow', (event) => logEvent('windowPageShow', event.timeStamp));
window.addEventListener('pagehide', (event) => logEvent('windowPageHide', event.timeStamp));

// focus/blur
window.addEventListener('focus', (event) => logEvent('windowFocus', event.timeStamp));
window.addEventListener('blur', (event) => logEvent('windowBlur', event.timeStamp));

// VIEWPORT TIME

// MEDIA EVENTS

// ARTICLE DATA

// TEXT SELECTION

// MARKING EVENTS
