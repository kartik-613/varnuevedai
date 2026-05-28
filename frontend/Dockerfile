FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=http://localhost:4000

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]