const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(501).json({ error: "Username not sent" });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User does not exists" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!name || !username) {
    return response.status(500).json({ error: "Required params not sent" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = { name, username, id: uuidv4(), todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(500).json({ error: "Required params not sent" });
  }

  const todo = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(500).json({ error: "Required params not sent" });
  }

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    title,
    deadline: new Date(deadline),
  };

  return response.status(201).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  user.todos[todoIndex] = { ...user.todos[todoIndex], done: true };

  return response.status(201).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);
  return response.status(204).send();
});

module.exports = app;
