# 1up

## Setup
### Requirements
*   PostgreSQL
*   Deno

### What to do
Create a new Discord Application and add a Bot user to it.

Save the Bot Token into the environment variable `1UP_BOT_TOKEN`.

Install PostgreSQL.

Create a new user and save its credentials into the environment variables
`1UP_DB_USERNAME` and `1UP_DB_PASSWORD`.

Create a new database called `oneup`.

Run `deno task setup`.

You should now be able to start the bot using `deno task run`.
