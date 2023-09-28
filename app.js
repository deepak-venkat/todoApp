const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  let getTodosBasedOnQueryParameters = null;
  switch (true) {
    case status !== undefined &&
      priority === undefined &&
      search_q === undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                status LIKE '${status}'; `;
      break;
    case status === undefined &&
      priority !== undefined &&
      search_q === undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                priority LIKE '${priority}'; `;
      break;
    case status === undefined &&
      priority === undefined &&
      search_q !== undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                todo LIKE '%${search_q}%'; `;
      break;
    case status !== undefined &&
      priority !== undefined &&
      search_q === undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                status LIKE '${status}'
                AND priority LIKE '${priority}'; `;
      break;
    case status === undefined &&
      priority !== undefined &&
      search_q !== undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND priority LIKE '${priority}'; `;
      break;
    case status !== undefined &&
      priority === undefined &&
      search_q !== undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                status LIKE '${status}'
                AND todo LIKE '%${search_q}%' ; `;
      break;
    case status !== undefined &&
      priority !== undefined &&
      search_q !== undefined:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo
            WHERE 
                status LIKE '${status}'
                AND todo LIKE '%${search_q}%'
                AND priority LIKE '${priority}' ; `;
      break;
    default:
      getTodosBasedOnQueryParameters = `
            SELECT
                *
            FROM
                todo; `;
      break;
  }
  const todosArr = await db.all(getTodosBasedOnQueryParameters);
  response.send(todosArr);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
       id=${todoId}; `;
  const todoObj = await db.get(getTodoQuery);
  response.send(todoObj);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertTodoQuery = `
    INSERT INTO todo(id, todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}' ); `;
  await db.run(insertTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  let updateQuery = null;
  let givenProperty = null;
  switch (true) {
    case todo !== undefined && priority === undefined && status === undefined:
      updateQuery = `UPDATE
                    todo
                SET
                    todo = '${todo}'
                WHERE
                    id=${todoId};`;
      givenProperty = "Todo";
      break;
    case todo === undefined && priority !== undefined && status === undefined:
      updateQuery = `UPDATE
                    todo
                SET
                    priority = '${priority}'
                WHERE
                    id=${todoId};`;
      givenProperty = "Priority";
      break;
    case todo === undefined && priority === undefined && status !== undefined:
      updateQuery = `UPDATE
                    todo
                SET
                    status = '${status}'
                WHERE
                    id=${todoId};`;
      givenProperty = "Status";
      break;
  }

  await db.run(updateQuery);
  response.send(`${givenProperty} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
        todo
    WHERE id=${todoId}; `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
