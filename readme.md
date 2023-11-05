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
   basedir=../data
   jwt_secret=chose something different
   ```
   (Stay with these defaults for you first tests. For other possible entries, see server/env.sample)

1.  `npm start` in the server directory will bring up the management interface:
    ```
    .---------------------------------------------.
    | No-Bling-Blog Management                    |
    +---------------------------------------------+
    | [1] Build and run NoBlingBlog               |
    |  2) Create new user                         |
    |  3) Show stats                              |
    |  4) Backup data                             |
    |  5) Show version                            |
    |                                             |
    |  d) Create dummy posts                      |
    |  c) Cleanup, delete all data (destructive!) |
    |  q) Quit                                    |
    '---------------------------------------------'
    ```
    For your first experiments, hit d for "create dummy posts" and then "2 for create new user". Enter any username you like and "admin" when asked for the role. Then, launch the blog with 1 and navigate your favourite browser to `http://localhost:3000`. You'll have 100 fake posts to experiment. Login with your user name and any password (which will be set with your first login). Hit 'q' when you're done.

![Screenshot](screenshot.jpg)

## Development mode

Launch `npm run dev` in the server directory and `npm run dev` in the client directory, and navigate to `http://localhost:5173`

## Concepts

No-Bling-Blog is made for a single author or a small group of authors who know each other. So, creating new users happens only manually from the management console. The password is initially empty and will be whatever the newly created user enters the first time, they log in. Retrieval of a lost password ist not possible, but the admin can delete the pass property of a user entry in users.json so they can create a new password the next time, they log in.

### Users and roles

There are three different roles: admin, editor and visitor. 
* Visitors do not need an account. They can only read published posts. 
* Editors need an account with the role set to 'editor'. They can read all published posts and their own unpublished posts. They can create new posts and edit, publish, or unpublish them.
* Admins need an account with the role set to 'admin'. They can read, edit, publish, unpublish and delete any post.

### Posts

A post is initially unpublished when created. Its editor or the admin can edit, publish and unpublish it. If published, it's visible to all visitors. If unpublished, it's only visible to its editor and to admin(s).

Posts can be written in the Markdown language. All standard markups are supported. Additionally, Metadata of news sites can be embedded with: [[https://some.news.site.somewhere/hot/article.html]]. No-Bling-Blog will read json-ld and openGraph metadata such as title, author, image, teaser fom such a page and provide these information as link to the original article in the post. 

#### Normal links to external websites are written as: 

`[Title](http://link/to/site)`

#### Internal links to other posts can be written as absolute links: 

`[Title](/post/b36h7nhij)`

#### To include an image, which is available online, use the following code:

`![Title](https://link.to.image)`

Note: Since posts are processed by Markdown, you'll have to insert blank lines for hard linebreaks. For a summary of markdown's features look [here](https://daringfireball.net/projects/markdown/syntax).

It is possible to have source code examples colorized. Under the hood,  [highlight.js](https://highlightjs.org/) is used, so the same languages are supported.

Use usual code fences (``` or ~~~) to declare code to highlight. Alternatively you can use a single dash followed by the language name:

<pre>
-javascript
function sayHello(){
   console.log("Hello World")
}
-
</pre>

will render as:

```javascript
function sayHello(){
   console.log("Hello World")
}

```



## Design

You can, of course, customize the design of NoBlingBlog. But you must do so in the source files. There's no bling-bling method...
So:

* Make a fork of this repository
* Modify the relevant files in the client directory. Images are in /public, the top page layout is in src/App.svelte. Other files of interest for design are in src/lib/views.

### Partials

Special formattings can be applied through partials.


