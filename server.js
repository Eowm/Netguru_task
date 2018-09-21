var express = require('express');
var app = express();
var request = require('request-promise-native');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var MONGO_URL = 'mongodb://Netguru:netguru1@ds263642.mlab.com:63642/netguru_task';

const API_KEY = 'b83010ce';
const URL = 'http://www.omdbapi.com/';

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

let db;

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        throw new Error() // <- do obsluzenia
    }
    db = client.db('Movies')
});

app.post('/movies', (req, res) => {
    console.log(req.body.title);
    if (!req.body.title) {
        throw new Error("no title given"); // Express will catch this on its own.
    }
    //usage of request-promise
    var options = {
        uri: URL,
        qs: {
            apikey: API_KEY,
            t: req.body.title // -> uri + '?access_token=xxxxx%20xxxxx'
        },
        json: true // Automatically parses the JSON string in the response
    };
    request(options)
        .then((repos) => {
            db.collection('movies_collection').find({
                Title: {
                    $in: [repos.Title]
                }
            }).toArray((err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    console.log("Pusto! Mozna dodac")
                    repos.comments = [];
                    db.collection('movies_collection').insertOne(repos);
                } else console.log("Juz jest...")
            });
            res.send(repos);
        })
        .catch((err) => {
            console.log(err)
        });
});

app.get('/movies', (req, res) => {
    var mysort = {
        Title: 1
    };
    db.collection('movies_collection').find().sort(mysort).toArray((err, result) => {
        if (err) throw err;
        console.log('All movies in the DB');
        res.send(result);
    })
})

app.post('/comments', (req, res) => {
    if (!req.body.comment || !req.body.title) {
        throw new Error("an error ocured no comment or id"); // Express will catch this on its own. 
    }
    db.collection('movies_collection').find({
        Title: {
            $in: [req.body.title]
        }
    }).toArray((err, result) => {
        if (result.length === 0) {
            console.log('There is no movie with this id');
        } else {
            console.log(result[0]);
            result[0].comments = [...result[0].comments, {
                comment: req.body.comment,
                date: Date.now()
            }]
            res.send({
                title: req.body.title,
                comment: req.body.comment,
                date: Date.now()
            });
            console.log('Added comment');
            db.collection('movies_collection').replaceOne({
                Title: {
                    $in: [req.body.title]
                }}, { ...result[0] }
            );
            db.collection('comments').insertOne({Title: req.body.title, comment: req.body.comment, date: Date.now()});
        }
    })
})

app.get('/comments', (req, res) => {
    var mysort = {
        Title: 1
    };
    db.collection('movies_collection').find({    comments: { $exists: true, $not: {$size: 0} }}).sort(mysort).toArray((err, result) => {
        console.log(result)
        if (err) throw err;
        console.log('comment in DB');
        res.send(result);
    })
})

var server = app.listen(3000, () => {
    console.log('Przykładowa aplikacja nasłuchuje na http://localhost:3000');
});