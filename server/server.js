var express = require('express'); // eslint-disable-line import/no-commonjs
var compression = require('compression'); // eslint-disable-line import/no-commonjs
var path = require('path'); // eslint-disable-line import/no-commonjs
var httpProxy = require('http-proxy');
var app = express();

function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.') {
    var newHost = req.headers.host.slice(4);
    var destUrl = req.protocol + '://' + newHost + req.url;
    res.redirect(301, destUrl);
  } else {
    next();
  }
}

app.set('port', process.env.PORT || 3000);
app.set('trust proxy', true);

app.use(compression());
app.use(wwwRedirect);
app.use(express.static(__dirname));

var proxy = httpProxy.createProxyServer({
  target: 'https://www.gokgs.com',
  changeOrigin: true
});

app.get('/json/access', function(req, res) {
  proxy.web(req, res);
});

app.post('/json/access', function(req, res) {
  proxy.web(req, res);
});

app.get('/*', function(req,res) {
  var index = path.join(__dirname, '/index.html');
  res.sendFile(index);
});

// console.log("Serving files from " + path.join(__dirname, '../'));
// app.use(express.static(__dirname, 'public'));

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Server running at http://localhost:' + port);
});
