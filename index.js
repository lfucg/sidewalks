//Configuration
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
var helmet = require('helmet');

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

app.enable('trust proxy')

app.use(bodyParser.json({
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
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('SELECT sid, anno FROM streets ORDER BY anno ASC',function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})

//Search Requests by Street
app.get('/api/v1/project-street', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : req.ip,
    })
})

//Browse Requests
app.get('/api/v1/requests', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})

//Add Request
app.post('/api/v1/request', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'INSERT INTO requests (first_name, last_name, email, request_ip, street, from_street, to_street, sides, connections, ped_traffic, safety, comments, confirmation_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING street, email, confirmation_id;',
                values: [
                req.body.first_name,
                req.body.last_name, 
                req.body.email, 
                req.ip, 
                req.body.street, 
                req.body.from_street, 
                req.body.to_street, 
                req.body.sides, 
                req.body.connections, 
                req.body.ped_traffic, 
                req.body.safety, 
                req.body.comments,
                uuid.v4()
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        
                        res.json({"success": false,"results": err});
                    
                    } else {
                        
                        sendgrid.send({
                          to:       'jmholl5@gmail.com',
                          from:     'jhollinger@lexingtonky.gov',
                          subject:  'Please Confirm your Sidewalk Request',
                          html:     '<p>Thanks for submitting a sidewalk request for Southland Dr.</p> To confirm your request, please click<a href="http://www.lexingtonky.gov">here</a>'
                        }, function(err, json) {
                          if (err) { return console.error(err); }
                          else console.log("Email sent.")
                        });

                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})

//Confirm Request
app.get('/api/v1/request/:confirmationId', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'UPDATE requests SET confirmation_status=\'Confirmed\' WHERE confirmation_id = $1',
                values: [
                req.params.confirmationId
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : "Success"});
                    }
                });
    });
})

//Vote
app.post('/api/v1/vote', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})

app.post('/api/v1/vote/:confirmation', function(req, res) {
    res.json({
        "Response" : "Success",
        "Result" : "Records..."
    })
})


//Feedback
app.post('/api/v1/feedback', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query(
                'SELECT sid, anno FROM streets ORDER BY anno ASC'
                ,function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})



//Email Test
app.get('/api/v1/email-test', function(req, res) {
sendgrid.send({
  to:       'jmholl5@gmail.com',
  from:     'jhollinger@lexingtonky.gov',
  subject:  'Please Confirm your Sidewalk Request',
  html:     '<p>Thanks for submitting a sidewalk request for Southland Dr.</p> To confirm your request, please click<a href="http://www.lexingtonky.gov">here</a>'
}, function(err, json) {
  if (err) { return console.error(err); }
  else res.json({"success" : true});
});
})

//Server
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});