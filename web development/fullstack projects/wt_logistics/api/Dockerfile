# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Gunicorn
RUN pip install gunicorn

# Copy the rest of the backend code
COPY . .

# Expose port Flask runs on
EXPOSE 5000

# Using Gunicorn to serve the app
CMD ["gunicorn", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
