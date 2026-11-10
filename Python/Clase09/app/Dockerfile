FROM python:3.11-slim
WORKDIR /curso
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENTRYPOINT ["python", "main.py"]
