FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask==3.1.3 flask-cors==0.0.1
COPY . .
RUN mkdir -p data
EXPOSE 8000
CMD ["python3", "app.py"]
