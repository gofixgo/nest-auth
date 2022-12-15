FROM node:16.15-alpine as dev
WORKDIR /usr/app/
RUN npx mikro-orm seeder:run
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]

FROM node:16.15 as prod
WORKDIR /usr/app/
COPY package* .
RUN npm i && npm run build
COPY . .
EXPOSE 3000
CMD [ "node", "dist/main.js" ]
