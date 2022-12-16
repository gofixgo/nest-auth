<<<<<<< HEAD
# FROM node:16.15-alpine as dev
# WORKDIR /usr/app/
# COPY package* .
# COPY . .
# EXPOSE 3000
# CMD [ "npm", "run", "start:dev" ]
=======
FROM node:16.15-alpine as dev
WORKDIR /usr/app/
RUN npx mikro-orm seeder:run
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]
>>>>>>> b55f5d7296e2b4dc249d71fe377c062298aa04ea

FROM node:16.15 as prod
WORKDIR /usr/app/
<<<<<<< HEAD
COPY package* yarn* ./
RUN yarn
=======
COPY package* .
RUN npm i && npm run build
>>>>>>> b55f5d7296e2b4dc249d71fe377c062298aa04ea
COPY . .
RUN yarn build
EXPOSE 3000
CMD [ "node", "dist/main.js" ]
