FROM node:16
WORKDIR /code
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js", "config.xml", "-v"]