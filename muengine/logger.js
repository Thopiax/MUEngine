(function() {

  // CONSTANTS

  var DEBUG = true;

  var BASE_URL = "http://127.0.0.1:5000";
  var VISIT_URL = BASE_URL + "/visit";
  var EVENT_URL = BASE_URL + "/event";

  var MAX_BUFFER_SIZE = 64;

  var pageShowEvent = "pageshow" in window ? "pageshow" : "load";
  var pageHideEvent = "pagehide" in window ? "pagehide" : "unload";

  var visitId = "%s";

  /*
  Event logging & beaconing
   */
  var sendBeacon = (function() {
    if ('sendBeacon' in navigator) {
        return function (URL, data) {
            var payload = new Blob([JSON.stringify(data)], {type: 'text/plain; charset=UTF-8'})
            return navigator.sendBeacon(URL, payload);
        }
    }

    return function(URL, data) {
      var xhr = new XMLHttpRequest();

      if ("withCredentials" in xhr) {
        // No need for credentials
        xhr.withCredentials = false;
        xhr.open("POST", URL);
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open("POST", URL);
      } else {
        // CORS not allowed
        return true;
      }

      var payload = new Blob([JSON.stringify(data)], {
        type: "application/json"
      });

      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);

      return true;
    };
  })();

  var EventBeacon = {
    send: function send(URL, data) {
      var payload = { visitId: visitId, data: data };
      var result = sendBeacon(URL, payload);

      if (DEBUG) {
        if (result) {
          console.log("[EventBeacon#send] Successfully sent event data");
        } else {
          console.error("[EventBeacon#send] Error sending event data");
        }
      }

      return result;
    }
  };

  var BufferedEventLogger = {
    bufferSize: 0,
    bufferData: [],
    addEvent: function addEvent(name, timeStamp, payload) {
      if (DEBUG) {
        console.log("[" + timeStamp + "] " + name + "; bufferSize = " + this.bufferSize);
        if (payload) console.log(payload);
      }

      this.bufferSize += 1;
      this.bufferData.push({
        name: name,
        timestamp: timeStamp,
        payload: payload
      });

      if (this.bufferSize > MAX_BUFFER_SIZE) this.flush();
    },
    flush: function flush() {
      if (this.bufferSize == 0) return;

      if (DEBUG) console.log('FLUSHING');

      var result = EventBeacon.send(EVENT_URL + "/log", this.bufferData);
      if (result) {
        this.bufferSize = 0;
        this.bufferData = [];
      }

      return true;
    }
  };

  window.addEventListener('beforeunload', function (ev) {
    BufferedEventLogger.addEvent("windowPageHide", event.timeStamp);
    BufferedEventLogger.flush();
    return true;
  });

  function addEventListenerToAll(
    objects,
    eventType,
    eventLogName,
    eventPayloadFun
  ) {
    for (var i = 0; i < objects.length; i += 1) {
      objects[i].addEventListener(eventType, (function (index) {
        return function (event) {
          BufferedEventLogger.addEvent(eventLogName, event.timeStamp, eventPayloadFun(index, event))
        }
      })(i));
    }
  }
  /*
    Register Navigator/Article/User information
    */

  window.addEventListener(pageShowEvent, function(event) {
    if (DEBUG) console.log("Connected to " + document.domain);

    data = {
      baseURI: document.baseURI,
      URL: document.URL,
      domain: document.domain,
      referrer: document.referrer,

      navigationStart: performance.timing.navigationStart,

      userAgent: navigator.userAgent,

      screenHeight: screen.height,
      screenWidth: screen.width,

      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    };

    EventBeacon.send(VISIT_URL + "/register", data);
  });

  /*
   Dwell Time Events
  */

  // visibility changes
  document.addEventListener(
    "visibilitychange",
    function(event) {
      var eventType = document.hidden ? "documentHidden" : "documentVisible";

      BufferedEventLogger.addEvent(eventType, event.timeStamp);
    },
    false
  );

  window.addEventListener(pageShowEvent, function(event) {
    return BufferedEventLogger.addEvent("windowPageShow", event.timeStamp);
  });

  // focus/blur
  window.addEventListener("focus", function(event) {
    return BufferedEventLogger.addEvent("windowFocus", event.timeStamp);
  });
  window.addEventListener("blur", function(event) {
    return BufferedEventLogger.addEvent("windowBlur", event.timeStamp);
  });

  // VIEWPORT TIME

  window.addEventListener("resize", function(event) {
    BufferedEventLogger.addEvent("windowResize", event.timeStamp, [
      window.innerHeight,
      window.innerWidth
    ]);
  });

  window.addEventListener("scroll", function(event) {
    BufferedEventLogger.addEvent(
      "windowScroll",
      event.timeStamp,
      window.scrollY
    );
  });

  // MEDIA EVENTS

  window.addEventListener("load", function() {
    var allVideos = document.getElementsByTagName("video");
    var allAudios = document.getElementsByTagName("audio");

    addEventListenerToAll(allVideos, "loadedmetadata", "videoReady", function(index, event) {
      var video = allVideos[index];
      var videoProps = video.getBoundingClientRect();

      return {
        id: index,
        src: event.target.currentSrc,
        top: videoProps.top,
        left: videoProps.left,
        width: videoProps.width,
        height: videoProps.height
      };
    });
    addEventListenerToAll(allVideos, "play", "videoPlay", function(index, event) {
      return { id: index, time: event.target.currentTime };
    });
    addEventListenerToAll(allVideos, "pause", "videoPause", function(index, event) {
      return { id: index, time: event.target.currentTime };
    });
  });


  // TEXT SELECTION

  document.addEventListener("selectionchange", function(event) {
    // TODO: REDUCE AMOUNT OF EVENTS CONSIDERED
    // TODO: ADD POSITION INDICATOR TO EVENT

    var selectedObject = window.getSelection();

    // ignore selection events that equate to clicks
    if (selectedObject.isCollapsed) return;

    BufferedEventLogger.addEvent("windowSelection", event.timeStamp, {
      size: selectedObject.focusOffset - selectedObject.anchorOffset
    });
  });

  // SHARING EVENTS


  // MARKING EVENTS

  addEventListenerToAll(document.links, "click", "linkClick", function(index) {
    return {
      href: document.links[index].href
    };
  });
})();
