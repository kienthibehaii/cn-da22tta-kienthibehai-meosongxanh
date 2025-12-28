FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json trước để cache
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy source code
COPY . .

# Mở cổng backend
EXPOSE 5000

# Chạy server
CMD ["npm", "start"]
