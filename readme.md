# 1up
A Discord levelling bot.

## Setup
### Requirements
*   PostgreSQL
*   Deno

### What to do
Create a new Discord Application and add a Bot user to it.

Save the Bot Token for later.

Install PostgreSQL.

Create a new user and save its credentials for later.

Create a new database called `oneup`.

Copy the file `.env.example` to `.env`
and enter all of the info you have saved for later.  
You can optionally enter your Discord user ID
to allow setting configs through Discord.  
This is temporary and will be removed once better access control is implemented.

Run `deno task setup`.

You should now be able to start the bot using `deno task run`.
