const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserName(request, response, next) {
  const {username} = request.headers

  if(!username){
    return response.status(501).json({error: "Username not sent"})
  }

  const user = users.find(user => user.username === username)

  if (!user){
    return response.status(404).json({error: "User does not exists"})
  }

  request.username = username

  return next()
}


app.post('/users', (request, response) => {
  const {name, username} = request.body

  const userExists = users.some(user => user.username === username)

  if(userExists){
    return response.status(400).json({error: 'User already exists!'})
  }

  const user = {name, username, id: uuidv4(), todos: []}

  users.push(user)

  return response.status(201).json(user)
});

app.use(checksExistsUserName)

app.get('/todos', (request, response) => {
  const {username} = request

  const user = users.find(user => user.username === username)

  return response.json(user.todos)
});

app.post('/todos', (request, response) => {
  const {username} = request
  const {title, deadline} = request.body

  if(!title || !deadline){
    return response.status(500).json({error: 'Required params not sent'})
  }

  const user = users.find(user => user.username === username)
  
  const todo = {title, deadline: new Date(deadline), id:uuidv4(), done:false, created_at: new Date()}

  user.todos.push(todo)
  
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserName, (request, response) => {
  const {id} = request.params
  const {username} = request

  const {title, deadline} = request.body

  if(!title || !deadline){
    return response.status(500).json({error: 'Required params not sent'})
  }

  const user = users.find(user => user.username === username)
  
  const todo = {title, deadline: new Date(deadline), id:uuidv4(), done:false, created_at: new Date()}

  user.todos.push(todo)
  
  return response.status(201).json(todo)


});

app.patch('/todos/:id/done', checksExistsUserName, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserName, (request, response) => {
  // Complete aqui
});

module.exports = app;