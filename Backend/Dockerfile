FROM node:22-alpine AS dependencies

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS runner
WORKDIR /usr/src/app

USER node

COPY --chown=node:node --from=dependencies /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

EXPOSE 5000

ENV NODE_ENV=production

CMD [ "node", "server.js" ]

