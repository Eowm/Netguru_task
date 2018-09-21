# Netguru_task

## Task

Simple REST API,  a basic movie database interacting with external API.

## SOURCE 
While creating the project I used: 
1. Express - Documentation [https://github.com/expressjs/express]
2. Node- Documentation [https://github.com/nodejs/node]
3. BodyParser - Documentation [https://github.com/expressjs/body-parser]
4. Request-promise-native - Documentation [https://github.com/request/request-promise-native]
5. MongoDB - Documentation [https://docs.mongodb.com/?_ga=2.2261424.1003173563.1537216663-1177185025.1535995594]

## TECHNOLOGIES 
The project was created based on JavaScript(ES6), Express.js, Node.js, MongoDb.


## USAGE
Comments are added to collection movies_collection to the movie object at the very bottom, I think there was no need to create another collections only for comments.

App uses existing API OMDb API to fetch movie details by it's title>

API returns JSON object with movie data. This info is extended by 'comments' property and as initial is assigned as empty array ([])

To start the app, you need to pull it. After that connect to it via e.g. Postman. In Postman on Post method for http://localhost:3000/movies in header set content-type as application/json, and in body create object with Name. I have choosen name instead of id because in my App Name is unique when you push Send request will be visible below with full body of the movie. In Get of /movies there is no need to do anything, just set as before in header content-type to application/json and send, you will see all of the movies in the DB alphabetically.

In /comments for push as before set content-type, in body there is need to create object with FULL name of the movie you want to add comment to and the comment itself. After that push send and you will see this comment below. In get /comments after pressing send there are all of the movies with the comments visible.

Unfortunatly I didnt have time to make the last part of the task  "Should allow filtering comments by associated movie, by passing its ID."

All of the tests were made Manually.
