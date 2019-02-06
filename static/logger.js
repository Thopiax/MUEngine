
// CONSTANTS
const DEBUG=true;
const BASE_URL='http://127.0.0.1:5000';
const MAX_BUFFER_SIZE=10;

let VISIT_ID = "%s";

/*
Setup Beacon to transmit data
 */
navigator.sendBeacon = undefined;
if (typeof navigator.sendBeacon === 'undefined') {
    navigator.sendBeacon = (URL, payload) => {
        let xhr = new XMLHttpRequest();

        if ('withCredentials' in xhr) {
            xhr.open('POST', URL, true);
        } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open('POST', URL);
        } else {
            return;
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        xhr.send(payload);
    };
}


class EventBeacon {

    constructor () {
        this.resetBuffer();

        document.addEventListener('pagehide', this.flush());
    }

    static send(URL, data) {
        const result = navigator.sendBeacon(URL, data);

        if (DEBUG) {
            if (result) {
                console.log(`[Beacon#send] Successfully sent events`);
            } else {
                console.error(`[Beacon#send] Error sending log data`);
            }
        }

        return result;
    }

    resetBuffer() {
        this.bufferSize = 0;
        this.bufferFormData = new FormData();
    }

    log(eventType, eventTimeStamp, eventPayload) {
        if (DEBUG) {
            console.log(`[${eventTimeStamp}] ${eventType}`);
            if (eventPayload) console.log(eventPayload);
        }

        this.bufferSize += 1;
        this.bufferFormData.append(eventTimeStamp, JSON.stringify({ eventType, eventPayload }));

        if (this.bufferSize > MAX_BUFFER_SIZE) this.flush();
    }

    flush() {
        if (this.bufferSize == 0) return;

        const result = EventBeacon.send(BASE_URL + '/log', this.bufferFormData);
        if (result) this.resetBuffer();
    }
}

const eventBeacon = new EventBeacon();

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

        userAgent: navigator.userAgent,

        screenHeight: screen.height,
        screenWidth: screen.width,

        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth
    };

    EventBeacon.send(BASE_URL + '/register', JSON.stringify(payload));
});

/*
Dwell Time Events
 */

// visibility changes
document.addEventListener('visibilitychange', (event) => {
    let eventType = (document.hidden) ? 'documentHidden' : 'documentVisible';

    eventBeacon.log(eventType, event.timeStamp);
}, false);

// pageshow/pagehide
window.addEventListener('pageshow', (event) => eventBeacon.log('windowPageShow', event.timeStamp));
window.addEventListener('pagehide', (event) => eventBeacon.log('windowPageHide', event.timeStamp));

// focus/blur
window.addEventListener('focus', (event) => eventBeacon.log('windowFocus', event.timeStamp));
window.addEventListener('blur', (event) => eventBeacon.log('windowBlur', event.timeStamp));

// VIEWPORT TIME

window.addEventListener('resize', (event) => {
    eventBeacon.log('windowResize', event.timeStamp, [window.innerHeight, window.innerWidth]);
});

window.addEventListener('scroll', (event) => {
    eventBeacon.log('windowScroll', event.timeStamp, window.scrollY);
})

// MEDIA EVENTS

const allVideos = document.getElementsByTagName('video')
const allAudios  = document.getElementsByTagName('audio');

for (i = 0; i < allVideos.length; i++) {
    allVideos[i].addEventListener('play', (event) => eventBeacon.log('videoPlay', event.timeStamp))
}


// TEXT SELECTION

document.addEventListener('selectionchange', (event) => {
    // TODO: REDUCE AMOUNT OF EVENTS CONSIDERED
    // TODO: ADD POSITION INDICATOR TO EVENT

    const selectedObject = window.getSelection();

    eventBeacon.log(
        'windowSelection',
        event.timeStamp,
        {
            size: selectedObject.focusOffset - selectedObject.anchorOffset,
        }
    );

});

// MARKING EVENTS
