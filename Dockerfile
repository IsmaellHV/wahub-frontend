FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=80

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 80

CMD ["node", "server.js"]
