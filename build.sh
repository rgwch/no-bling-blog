cd client
echo +++ runing in `pwd`
npm i
npm run build
cd ../server
echo +++ running in `pwd`
npm i
npx tsc
