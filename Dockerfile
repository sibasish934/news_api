FROM node:20
WORKDIR /backend/news-api
COPY package*.json .
RUN npm install
COPY . .
CMD [ "npm", "run", "dev" ]