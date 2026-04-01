FROM node:18-alpine

RUN apt-get update && apt-get install -y libaio1 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]