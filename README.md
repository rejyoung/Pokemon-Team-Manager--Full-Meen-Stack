# Pokémon Team Manager

Pokémon Team Manager is a full-stack web app built with MongoDB, Express, EJS, and Node.js. It also integrates with the Pokémon API, which is where much of the data and all the pokemon images came from, and utilizes both front- and back-end javascript. The concept is that you can manage a pokemon team you're using in one of the officially licensed games. A live version of the site can be viewed here at https://pokemon-team-manager-full-meen-stack.onrender.com/

## Database Functionality

Part of my purpose in building this site was to practice working with relational databases and user accounts. There are four databases in total: one to store all pokémon species data, one to store all data related to trainers and their pokémon teams, one to store temporary user tokens, and another to store session data. The last is a Redis database.

## User Accounts and Security

The site supports the ability to create and log in to individual trainer profiles. Password security is managed by Argon2, and general account security is managed with a combination of express-session, the MongoDB session utility (connect-mongo), and randomly generated temporary user tokens, the latter of which are designed to avoid any insecure direct object references.

## Features

Users can capture pokémon, level them up (using the up arrow on the collection screen), evolve them (using the E button), release them, give them nicknames, and add or remove them from their standing team of six pokémon. All of this is accomplished using api calls to the trainer database. Users can also update their display names or passwords or delete their accounts altogether.add-to-team

I may eventually add the ability to upload profile pics (placeholders are already included) and trade pokémon with other trainers.
