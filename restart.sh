#! /bin/bash
# To run this script, you must have installed forever-service globally: npm i -g forever-service, 
# and the service must have been installed with install-service.sh

sudo systemctl stop noblingblog
git pull
cd client
npm run build
cd ../server
sudo systemctl start noblingblog
sudo forever restart noblingblog
sudo systemctl status noblingblog
