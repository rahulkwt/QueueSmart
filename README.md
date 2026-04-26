You need Node.js and this comes with Node Package Manager (npm).
You need PostgreSQL.

# necessary libraries

Write in the terminal: `npm install`.

# running the frontend and server (must do both)

Write in one terminal: `npm run dev`.
Write in another terminal: `node ./backend/server.js` or `cd backend; node server.js`.

# running tests

All test commands run from the repo root.

The test suite has two layers:

- **Unit tests** — controller logic with the database mocked out. Fast (~300ms), no external dependencies.
- **Integration tests** — real SQL against a separate `queue_smart_test_db` Postgres database. Verifies queries, schema, and end-to-end behavior. Requires Postgres running on `localhost:5432`.

| Command | What it does |
|---|---|
| `npm test` | Runs the unit suite only. Use during development. |
| `npm run test:watch` | Re-runs unit tests on file changes. |
| `npm run test:verbose` | Unit tests with every individual test name listed. |
| `npm run test:coverage` | Unit tests + coverage table + HTML report at `coverage/index.html`. |
| `npm run test:integration` | Runs the integration suite. Auto-creates and seeds `queue_smart_test_db` before each run, so your dev `queue_smart_db` is never touched. |
| `npm run test:integration:verbose` | Integration tests with every test name listed. |
| `npm run test:integration:coverage` | Integration tests + coverage. |
| `npm run test:all` | **Canonical "run everything" command.** Unit + integration, back-to-back. Use this before submitting or pushing. |

Integration tests use the same `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT` from `.env` but override `DB_NAME` to `queue_smart_test_db` so they never collide with development data.

# profiles to log in

Found in the file `./backend/src/data/users.json`.
Use the email and password.

# setting up PostgreSQL

You need to install PostgreSQL. 
Set password to `admin123` for easy compatibility (rechange later if desired).
You can type the following: `ALTER USER postgres WITH PASSWORD 'admin123';`.

You can make SQL queries below easier by using DBeaver, instructions can be looked up on the
web for how to use that. 
If using a Mac, run the terminal with the following code 
`psql -U postgres -c "CREATE DATABASE queue_smart_db;"`.
If using Windows, you can also run the above command but it may not work
if the directory where `psql.exe` is not in your path. 

If it does not work for either one, look up SQL shell on your respective
app finder and log in with the credentials you set up. Press enter on all.
From here you can simply type `CREATE DATABASE queue_smart_db;`.

To look up user information to log in and to do any SQL query (replace SELECT with what you want), either do
1. `SELECT * FROM users;"` in SQL shell (this will not work unless you rerun SQL shell and 
type `queue_smart_db` as the database) or

2. or continue the general terminal workflow `psql -U postgres -c "SELECT * FROM users;"`

# setting up website database

For Windows, you need Git Bash or something that can run bash scripts.
On Mac you can write the scripts as is.
For the first time setting up, run `./database/scripts/reset_db.sh migrate`.
To fill the database, run `./database/scripts/seed_db.sh`.

For resetting (like wanting to go back to initial state) run `./database/scripts/reset_db.sh reset`
and refill the database.

Server is already integrated with database so once the database is set up simply run
the server as shown above.