module.exports = profile

var gravatar = require('gravatar').url

function profile (req, required, cb) {
  if (typeof required === 'function') cb = required, required = false
  req.session.get('profile', function (er, data) {
    if (!required && er) er = null
    if (data) {
      var gr = data.email ? 'retro' : 'mm'
      data.avatar = gravatar(data.email || '', {s:50, d:gr}, true)
      data.avatarLarge = gravatar(data.email || '', {s:496, d:gr}, true)
    }

    if (er || data) return cb(er, req.profile = data)

    // if we're logged in, try to see if we can get it
    var name = req.cookies.get('name')
    if (!name) return cb()

    var pu = '/_users/org.couchdb.user:' + name
    req.couch.get(pu, function (er, cr, data) {
      if (!required) er = null
      if (er || cr && cr.statusCode !== 200 || !data) {
        // Oh well.  Probably the login expired.
        return cb(er)
      }

      var gr = data.email ? 'retro' : 'mm'
      data.avatar = gravatar(data.email || '', {s:50, d:gr}, true)
      data.avatarLarge = gravatar(data.email || '', {s:496, d:gr}, true)

      req.session.set('profile', data)
      return cb(null, req.profile = data)
    })
  })
}
