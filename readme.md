# The No Bling Blog

This is a very simple Blog app with no bling-bling (hence the name).

## How to start

1. ```bash
   git clone https://github.com/rgwch/no-bling-blog
   cd no-bling-blog/client
   npm i
   cd ../server
   npm i

1. create a file server/.env with the following properties:
   ```
   storage=nedb
   nedb_datadir=../data/nedb
   documents=../data/documents
   partials=../data/partials
   index=../data/documents/index
   users=../data/users.json
   jwt_secret=not so secret
   
   ```
   (Stay with these defaults for you first tests.)
1.    