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
1.  `npm run manage` will bring up the management interface:
    ```
         ---------------------------------------------.
      | No-Bling-Blog Management                    |
      +---------------------------------------------+
      | [1] Launch NoBlingBlog                      |
      |  2) Create new user                         |
      |  3) Create dummy posts                      |
      |  4) Show stats                              |
      |  5) Backup data                             |
      |  6) Show version                            |
      |                                             |
      |  0) Cleanup, delete all data (destructive!) |
      |  q) Quit                                    |
      '---------------------------------------------'

    ```
    For your first experiments, hit 3 for "create dummy posts" and then "2 for create new user". Enter any username you like and "admin" when asked for the role. Then, launch the blog with 1 and navigate to `http://localhost:3000`. You'll have 100 fake posts to experiment.

    
