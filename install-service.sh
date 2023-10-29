#! /bin/bash
# To run this script, you must have installed forever-service globally: npm i -g forever-service
# This script is meant to be run from the root directory of the project. It will install 
# noblingblog as a service to the system. (see restart.sh for how to (re)start the service)

cd server
sudo /opt/node/bin/forever-service install -s dest/index.js noblingblog
