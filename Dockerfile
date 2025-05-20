# Build the frontend Vite+React app
FROM node:24 as build-stage
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY frontend/ .
RUN npm install
RUN npm run build

# Copy the build files to backend as static files
FROM python:3.12-slim
WORKDIR /app
COPY --from=build-stage /app/dist ./static
RUN mkdir ./api
COPY backend/requirements.txt backend/.flaskenv backend/main.py ./api/
RUN pip install -r ./api/requirements.txt
ENV FLASK_ENV production

EXPOSE 3000
WORKDIR /app/api
CMD ["gunicorn", "-b", ":3000", "api:app"]
