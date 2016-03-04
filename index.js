//Configuration
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.set('view engine', 'jade');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//API Endpoints

//New Project and Phase
app.post('/api/v1/submit', function(req, res) {
    var input = {
        "project-name": req.body.project_name,
        "lat": req.body.lat,
        "lng": req.body.lng,
        "RFP-number": req.body.RFP_number,
        "project-description": req.body.project_description,
        "project-manager": req.body.project_manager,
        "department": req.body.department,
        "division": req.body.division,
        "districts": req.body.districts,
        "contractor": req.body.contractor,
        "start-date": req.body.start_date,
        "estimated-completion": req.body.estimated_completion,
        "estimated-budget": req.body.estimated_budget,
        "work-complete": req.body.work_complete,
        "budget-spent": req.body.budget_spent,
        "notes": req.body.notes,
        "submitted-by": req.body.submitted_by
    }
    var response = {};
    if (req.query.key === process.env.apiKey) {
        response = {
            "response": "success",
            "summary": [{
                "records": "length"
            }],
            "data": []
        };
    } else {
        response = {
            "response": "Access Denied"
        };
    }
    res.json(response);
})

app.get('/api/v1/browse', function(req, res) {
    var response = {};
    if (req.query.key === process.env.apiKey) {
        response = {
            "response": "success",
            "summary": [{
                "records": "length"
            }],
            "data": []
        };
    } else {
        response = {
            "response": "Access Denied"
        };
    }
    res.json(response);
});


//Server
var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});