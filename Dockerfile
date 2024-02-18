
# latest from docker hub
FROM node:latest

# working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json 
COPY package*.json ./

# install dependencies
RUN npm install

# copy the current dir contents to container
copy . .


RUN npm run build

# # install serve
RUN npm install -g serve

# run app cmd
CMD ["serve", "-s", "build"]