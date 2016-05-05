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
            client.query('SELECT sid, anno FROM streets ORDER BY anno ASC;',function(err, result) {
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
app.get('/api/v1/requests/street/:street', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text : 'SELECT * FROM request_votes WHERE street = $1 ORDER BY timestamp DESC;',
                values : [req.params.street]
            },function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})

//Browse Requests
app.get('/api/v1/requests', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('SELECT * FROM request_votes ORDER By timestamp DESC;',function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})

//Check Requests
app.get('/api/v1/vote-check/:requestId/:email', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'SELECT request_id, email FROM votes WHERE request_id = $1 AND email = $2;',
                values: [
                req.params.requestId, 
                req.params.email
                ]
            },function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {

                        if (result.rows.length === 0) {
                            var obj = {"success" : true, "vote_allowed" : true}
                        }
                        else {
                            var obj = {"success" : true, "vote_allowed" : false}
                        }
                        res.json(obj)
                    }
                });
    });
})

//Check Street Name
app.get('/api/v1/street-check/:street', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'SELECT sid FROM streets WHERE anno = $1;',
                values: [
                req.params.street
                ]
            },function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {

                        if (result.rows.length === 0) {
                            var obj = {"success" : true, "valid_street" : false}
                        }
                        else {
                            var obj = {"success" : true, "vote_allowed" : true}
                        }
                        res.json(obj)
                    }
                });
    });
})

//Request By ID
app.get('/api/v1/request/:requestId', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'SELECT * FROM request_votes WHERE request_id = $1;',
                values: [
                req.params.requestId
                ]
            },function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success" : true, "results" : result.rows});
                    }
                });
    });
})

//Add Request
app.post('/api/v1/request', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'INSERT INTO requests' +
                ' (first_name, last_name, email, request_ip, street, from_street, to_street, sides, connections, ped_traffic, safety, comments)' + 
                ' values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING first_name, street, email, confirmation_id;',
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
                req.body.comments
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        
                        res.json({"success": false,"results": err});
                    
                    } else {
                        
                        sendgrid.send({
                          to:       result.rows[0].email,
                          from:     'jhollinger@lexingtonky.gov',
                          fromname : 'Lexington Planning Preservation and Development',
                          subject:  'Please Confirm your Sidewalk Request',
                          html:     '<p>Hi ' + result.rows[0].first_name + ',</p><p>Thanks for submitting a sidewalk request for ' + result.rows[0].street + '.</p> To confirm your request, please <a href="https://sidewalk-tracker.herokuapp.com/request-confirmation/' + result.rows[0].confirmation_id + '">click here</a>.' +
                          '<p>If you have any feedback on the app, please visit our <a href="https://jmhollinger.github.io/sidewalks/#/contact">feedback page</a>.</p><p>Thanks,</p><p><strong>Jonathan Hollinger</strong><br>City of Lexington<br>Department of Planning, Preservation, and Development</p>'
                        }, function(err, json) {
                          if (err) { return console.error(err); }
                          else console.log("email sent")
                        });

                        res.json({"success" : true});
                    }
                });
    });
})

//Vote
app.post('/api/v1/vote', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'INSERT INTO votes' +
                ' (request_id, first_name, last_name, email, vote_ip, comments)' + 
                ' values ($1, $2, $3, $4, $5, $6) RETURNING first_name, email, confirmation_id;',
                values: [
                req.body.request_id,
                req.body.first_name,
                req.body.last_name, 
                req.body.email, 
                req.ip, 
                req.body.comments
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        
                        res.json({"success": false,"results": err});
                    
                    } else {
                        
                        sendgrid.send({
                          to:       result.rows[0].email,
                          from:     'jhollinger@lexingtonky.gov',
                          fromname : 'Lexington Planning Preservation and Development',
                          subject:  'Please Confirm your Sidewalk Project Vote',
                          html:     '<p>Hi ' + result.rows[0].first_name + ',</p><p>Thanks for adding your support to a sidewalk project.</p> To confirm your support, please <a href="https://sidewalk-tracker.herokuapp.com/vote-confirmation/' + result.rows[0].confirmation_id + '">click here</a>.' +
                          '<p>If you have any feedback on the app, please visit our <a href="https://jmhollinger.github.io/sidewalks/#/contact">feedback page</a>.</p><p>Thanks,</p><p><strong>Jonathan Hollinger</strong><br>City of Lexington<br>Department of Planning, Preservation, and Development</p>'
                        }, function(err, json) {
                          if (err) { return console.error(err); }
                          else console.log("email sent")
                        });

                        res.json({"success" : true});
                    }
                });
    });

})


//Confirm Request
app.get('/request-confirmation/:confirmationId', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'UPDATE requests SET confirmation_status= TRUE WHERE confirmation_id = $1',
                values: [
                req.params.confirmationId
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.redirect('https://lfucg.github.io/sidewalks/#/confirmation-thanks')
                    }
                });
    });
})

//Confirm Vote
app.get('/vote-confirmation/:confirmationId', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text: 'UPDATE votes SET confirmation_status= TRUE WHERE confirmation_id = $1',
                values: [
                req.params.confirmationId
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.redirect('https://lfucg.github.io/sidewalks/#/confirmation-thanks')
                    }
                });
    });
})

//Feedback
app.post('/api/v1/feedback', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                text : 'INSERT INTO feedback (ip_address, name, email, message) values ($1, $2, $3, $4)', 
                values : [
                req.ip,
                req.body.name,
                req.body.email,
                req.body.message
                ]
            }
                ,function(err, result) {
                    done();
                    if (err) {
                        res.json({"success": false,"results": err});
                    } else {
                        res.json({"success": true,"results": ""});
                        sendgrid.send({
                          to:       'jhollinger@lexingtonky.gov',
                          from:     req.body.email,
                          subject:  'Sidewalk Request System Feedback',
                          html:     '<p>Name: </p><p>' + req.body.name + '</p><p>Message: </p><p>' + req.body.message + '</p>'
                        }, function(err, json) {
                          if (err) { return console.error(err); }
                          else console.log("email sent")
                        });
                    }
                });
    });
})

//Server
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
