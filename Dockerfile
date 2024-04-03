FROM node:20
WORKDIR /backend/news-api
ARG migrate_tag
ENV prisma_migrate_tag=$migrate_tag
COPY package.json .
RUN npm install
COPY . .
RUN npx prisma migrate dev --name=prisma_migrate_tag
RUN npx prisma generate
EXPOSE 9000
CMD [ "npm", "run", "dev" ]