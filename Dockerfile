
FROM node:18

# Cài đặt thêm Python3 và G++ (để chấm bài C++)
RUN apt-get update && apt-get install -y python3 g++ 

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Chạy server 
CMD ["node", "server.js"]
