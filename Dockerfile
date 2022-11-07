FROM node:latest
RUN mkdir -p /usr/src/RoboPenguin
WORKDIR /usr/src/RoboPenguin
COPY package.json /usr/src/RoboPenguin
RUN npm install
COPY . /usr/src/RoboPenguin
CMD ["node", "index.js"]
