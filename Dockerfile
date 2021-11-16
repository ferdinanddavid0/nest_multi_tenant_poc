FROM node:12.19.0-alpine3.9 AS development
WORKDIR /usr/src/app
COPY package*json ./
#RUN npm install glob rimraf
#RUN yarn add --only=development
#RUN yarn add typeorm
#RUN yarn add @nestjs/typeorm
#RUN yarn add mariadb
#RUN yarn add mysql
#RUN yarn add mysql2
RUN npm install @nestjs/bull
RUN npm install bull
#RUN yarn add mysql2
COPY . .
RUN yarn run build

FROM node:12.19.0-alpine3.9 as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json ./
#RUN yarn add --only=production
#RUN yarn add typeorm
#RUN yarn add @nestjs/typeorm
#RUN yarn add mariadb
#RUN yarn add mysql
#RUN yarn add mysql2
COPY . .
COPY --from=development /usr/src/app/dist ./dist
CMD ["node","dist/main"]