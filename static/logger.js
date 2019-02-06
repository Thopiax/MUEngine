(function() {

  // CONSTANTS
  var DEBUG = true;
  var BASE_URL = "http://127.0.0.1:5000";
  var MAX_BUFFER_SIZE = 64;

  var pageShowEvent = "pageshow" in window ? "pageshow" : "load";
  var pageHideEvent = "pagehide" in window ? "pagehide" : "unload";

  var visitId = "%s";

  var sendBeacon = (function() {
    if ('sendBeacon' in navigator) {
        return function (URL, data) {
            const payload = new Blob([JSON.stringify(data)], {type: 'text/plain; charset=UTF-8'})
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
        console.log("[" + timeStamp + "] " + name);
        if (payload) console.log(payload);
      }

      this.bufferSize += 1;
      this.bufferData.push({
        name: name,
        timeStamp: timeStamp,
        payload: payload
      });

      if (this.bufferSize > MAX_BUFFER_SIZE) this.flush();
    },
    flush: function flush() {
      if (this.bufferSize == 0) return;

      var result = EventBeacon.send(BASE_URL + "/log", this.bufferData);
      if (result) {
        this.bufferSize = 0;
        this.bufferData = [];
      }
    }
  };

  window.addEventListener(pageHideEvent, BufferedEventLogger.flush());

  function addEventListernerToAll(
    objects,
    eventType,
    eventLogName,
    eventPayloadFun
  ) {
    for (i = 0; i < objects.length; i++) {
      objects[i].addEventListener(
        eventType,
        BufferedEventLogger.addEvent(
          eventLogName,
          event.timeStamp,
          eventPayloadFun(objects[i])
        )
      );
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

      userAgent: navigator.userAgent,

      screenHeight: screen.height,
      screenWidth: screen.width,

      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    };

    EventBeacon.send(BASE_URL + "/register", data);
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

  // pageshow/pagehide
  window.addEventListener(pageShowEvent, function(event) {
    return BufferedEventLogger.addEvent("windowPageShow", event.timeStamp);
  });
  window.addEventListener(pageHideEvent, function(event) {
    return BufferedEventLogger.addEvent("windowPageHide", event.timeStamp);
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

  var allVideos = document.getElementsByTagName("video");
  var allAudios = document.getElementsByTagName("audio");

  addEventListernerToAll(allVideos, "play", "videoPlay", function() {
    return nil;
  });
  addEventListernerToAll(allVideos, "pause", "videoPause", function() {
    return nil;
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

  // MARKING EVENTS

  addEventListernerToAll(document.links, "click", "linkClick", function(aTag) {
    return {};
  });
})();
