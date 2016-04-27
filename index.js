//Configuration
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var helmet = require('helmet')

var app = express();

app.use(helmet())

var https_redirect = function(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] != 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        } else {
            return next();
        }
    } else {
        return next();
    }
};

app.use(https_redirect);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.set('view engine', 'jade');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//Street List
app.get('/api/v1/streets', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})

//Search Requests by Street
app.get('/api/v1/project-street', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : req.ip
    })
})

//Browse Requests
app.get('/api/v1/requests', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})

//Add Request POST
app.post('/api/v1/project', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})

//Vote POST
app.post('/api/v1/vote', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})


//Server
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});