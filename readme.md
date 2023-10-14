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
   documents=../data/documents
   nedb_datadir=../data/documents/nedb
   partials=../data/partials
   index=../data/documents/index
   users=../data/users.json
   jwt_secret=not so secret
   
   ```
   (Stay with these defaults for you first tests.)
1.  `npm start` in the server directory will bring up the management interface:
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
    For your first experiments, hit 3 for "create dummy posts" and then "2 for create new user". Enter any username you like and "admin" when asked for the role. Then, launch the blog with 1 and navigate your favourite browser to `http://localhost:3000`. You'll have 100 fake posts to experiment.

## Development mode

Launch `npm run dev` in the server directory and `npm run dev` in the client directory and navigate to `http://localhost:5173`

## Concepts

No-Bling-Blog is made for a single author or a small group of authors who know each other. So, creating new users happens only manually from the management console. The password is initially empty and will be whatever the newly created user enters the first time, they log in. Retreaval of a lost password ist not possible, but the admin can delete the pass property of a user entry so the can create a new password the next time, they log in.

### Users and roles

There are three different roles: admin, editor and visitor. Visitors do not need an account, They can only read published posts. Editors need an accouunt with the role set to 'editor'. They can read all published posts and their own unpublished posts. The can create new posts and edit, publish or unpublish them.
Admins need an account with the role set to 'admin'. They can read, edit, publish, unpublish and delete any post.

### Posts

A post is initially unpublished when created. Its editor or the admin can edit, publish and unpublish it. If published, it's visible to all visitor. If unpublished, it's only visible to its editor and to admin(s).

Posts can be written in the Markdown language. All standard markups are supported. Additionally, Metadata of news sites can be embedded with: [[https://some.news.site.somewhere/hot/article.html]]. No-Bling-Blog will read json-ld metadata such as title, author, image, teaser fom such a page and provide these information as link to the original article in the post. 

## Design

You can, of course, customize the design of NoBlingBlog. But you must do so in the source files. 
