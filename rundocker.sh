#! /bin/bash

docker run -d -p 8082:3000 --name nbb no-bling-blog:`cat VERSION`
