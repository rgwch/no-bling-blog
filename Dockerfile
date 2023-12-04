FROM node:18.19.0-alpine3.18
EXPOSE 3000
ENV jwt_secret=change_this
COPY . /opt/app/
RUN cd /opt/app/client && npm install && npm run build && npm prune --production
WORKDIR /opt/app/server
RUN npm install && npx tsc && npm prune --production
RUN chown -R node /opt/app
USER node
ENV NODE_ENV=production
CMD ["node", "dest/index.js"]
