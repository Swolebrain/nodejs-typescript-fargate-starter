# if using ECR:
FROM public.ecr.aws/docker/library/node:latest

# if using docker hub - not recommended. You'll run into throttling unless you pay, and specifying credentials is a pain
#FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --production=true

# bundle app source
COPY ./src ./src

# this is the default port that ApplicationLoadBalancedFargateService expects the container to expose
EXPOSE 80

# not using pm2 since ECS will manage restarts for us anyway, but wouldn't hurt
CMD [ "yarn", "start" ]