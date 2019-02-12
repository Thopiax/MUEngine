# MUEngine
(Measuring User Engagement Engine)

A centralized server to collect anonymous web log data through event listeners.

## How it works?

A small Flask application provides a listener script from the `/visit/logger` endpoint.

The script (located at [`muengine/logger.js`](https://github.com/Thopiax/MUEngine/blob/master/muengine/logger.js)) uses a series of event listener to report them back to the server through batched calls. 

It transmits data to two server endpoints:
  - `/visit/register`: stores data that is characteristic of the individual visit such as visited URL, referrer, initial navigation time...
  - `/event/log`: logs HTML events such as scrolling, highlighting or playing multimedia...
