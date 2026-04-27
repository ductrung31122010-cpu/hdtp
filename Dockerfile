# Dùng bản Node ổn định
FROM node:20-bullseye

# Cài đặt trình biên dịch Python và C++ cho hệ thống chấm bài
RUN apt-get update && apt-get install -y python3 g++ 

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Xóa bỏ các file lock cũ để cài đặt bản Tailwind phù hợp với Linux
RUN rm -f package-lock.json

# Cài đặt thư viện (ép buộc cài cả devDependencies để có Tailwind/Vite)
RUN npm install --include=dev

# Copy toàn bộ code
COPY . .

# Chạy server bằng node (thay vì tsx để ổn định hơn)
# Lưu ý: Nếu server.js dùng "import" bạn phải đảm bảo có "type": "module" (bạn đã có rồi)
CMD ["node", "server.js"]
