const express = require('express');
const app = express();
const request = require('request-promise-native');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const MONGO_URL = 'mongodb://Netguru:netguru1@ds263642.mlab.com:63642/netguru_task';

const API_KEY = 'b83010ce';
const URL = 'http://www.omdbapi.com/';

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

let db;

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        throw new Error(); // <- do obsluzenia
    }
    db = client.db('Movies');
});

app.post('/movies', (req, res) => {
    if (!req.body.title) {
        throw new Error("no title given"); // Express will catch this on its own.
    }
    //usage of request-promise
    let options = {
        uri: URL,
        qs: {
            apikey: API_KEY,
            t: req.body.title
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
                    console.log("Empty!  Can Add")
                    repos.comments = [];
                    db.collection('movies_collection').insertOne(repos);
                } else console.log("Already exists...")
            });
            res.send(repos);
        })
        .catch((err) => {
            console.log(err)
        });
});

app.get('/movies', (req, res) => {      
    const mysort = {
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
        if (err) throw err;
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
    const mysort = {
        Title: 1
    };
    db.collection('movies_collection').find({    comments: { $exists: true, $not: {$size: 0} }}).sort(mysort).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

var server = app.listen(3000, () => {
    console.log('Przykładowa aplikacja nasłuchuje na http://localhost:3000');
});