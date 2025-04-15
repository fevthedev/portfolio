# Project Overview
This full stack application is all about Logistics. The goal is to provide a platform that a logistics company can provide shipment data via a csv file, then have that data cleaned, processed and displayed both in tabular format, as well as through insightful metrics on a dashboard.

## Project Setup - Docker
The project has been Dockerized for ease of setup. Once initialized, Docker will install dependencies for both the Flask api and the Next.js application - less work for you ;) 

1. Ensure that you have Docker installed and running on your system. [Download here](https://www.docker.com/)
2. Navigate to the project directory
```sh
cd westtech_logistics
```
3. Build the containers (configured in docker-compose.yml)
```sh
docker compose up --build
````
4. Access the application in your browser at the following address
```sh
http://localhost:3002
```
5. To shut down the application, simply use 
```sh
CTRL + C
```
and release the docker resources using
```sh
docker compose down
```

## Project Setup - Running Locally
If you don't mind the additional labour, the following guide will assist in running the project components locally.

### Flask API (Back-end)
1. Navigate to the project's api directory and install the python virtual environment
```sh
cd westtech_logistics/api
```
```sh
python -m venv venv
```
2. Activate the virtual environment once it's installed into the directory.
```sh
source ./venv/bin/activate
```
3. Install project dependencies from requirements.txt
```sh
pip install -r requirements.txt
```
4. Start the Flask Api (from inside the api directory)
```sh
python app.py
```
Take note of the url and port that the flask api is running on your local machine. It will likely be localhost:5000. Leave this running as it now serves as the live backend server for the Next.js application.

### Next.js (Front-end)
1. In another terminal window, Navigate to the project frontend directory
```sh
cd westtech_logistics/frontend
```
2. Install the frontend dependencies
```sh
npm install
```
3. Run the Next.js app ()
```sh
npm run dev
```

## Project Components
The application consists of 2 components: the front-end and back-end. 

### Back-End
Python Flask API to handle requests from the front-end. Due to the simplicity of the app I did not bother modularize the API.

#### API Endpoints
```sh
/upload-csv
```
**Methods**: POST

**Purpose**: Handles the uploading and processing of the user provided csv data. Data is cleaned before being saved in a local SQLite database and referenced throughout the application.

```sh
/shipments
```
**Methods**: GET

**Purpose**: Retrieves all shipment data requested from the front-end. Handles pagination and filters as well. Returns JSON formatted results.

```sh
/shipments/<shipment_id>
```
**Methods**: GET

**Purpose**: Retrieves a shipment record identified by the shipment_id. Results in a 404 error if there is no corresponding shipment record found.

```sh
/shipments/export
```
**Methods**: GET

**Purpose**: Handles requests for custom query reports. Processes the current filters and returns a downloadable .csv  file with the corresponding results.

```sh
/insights
```
**Methods**: GET

**Purpose**: Provides a comprehensive collection of information procured from the treated shipment data. Currently produces the following:
1. Total Shipments
2. \# of On Time Deliveries
3. \# of Delayed Shipments
4. Warehouse Utilization %
5. Chart Related Data (See Visualizations section below)

---

### Front-End
The Next.js powered front-end offers an intuitive and seamless user experience. The layout consists of a sidebar and the primary content container. The application utilizes loading indicators, confirmation feedback and more.
#### Front-end Features
- **Dashboard**: Displays a quick summary of shipment statistics as well as the visualizations (see more on visualizations below)
- **File Uploads**: Offers a functional drag and drop form, allowing users to easily upload csv data into the application for processing.
- **Shipments**: The Shipments page offers the tabulated shipment data, equipped with customizable pagination, filters and export functionality for custom queries.


## Project Structure
```sh
Project Root
├── api
│   ├── __pycache__
│   │   ├── app.cpython-311.pyc
│   │   ├── persistence.cpython-311.pyc
│   │   └── utils.cpython-311.pyc
│   ├── app.py
│   ├── Dockerfile
│   ├── persistence.py
│   ├── requirements.txt
│   ├── uploads
│   └── utils.py
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   └── favicon.ico
│   ├── src
│   │   ├── app
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── shipments
│   │   │   │   └── page.tsx
│   │   │   └── upload
│   │   │       └── page.tsx
│   │   └── components
│   │       ├── Dashboard.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── NoDataAlert.tsx
│   │       ├── ShipmentModal.tsx
│   │       └── Sidebar.tsx
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md

11 directories, 29 files


```


--- 


# Visualizations
I use [chart.js](https://www.chartjs.org/docs/latest/) to construct the charts throughout this application.

## Packages Received per Carrier Daily
A Bar Graph displaying the number of packages received daily for each shipment carrier. The data is taken over the course of the current year.
#### Assumptions Made
- All shipments are considered in this calculation regardless of their status.

## Volume of Shipments by Mode
A Pie Chart comparing the volume of shipments received by air or by sea. From the test data set we can see that the values differ slightly, almost equally splitting the chart.
#### Assumptions Made
- All shipments are considered in this calculation regardless of their status.

## Warehouse Utilization
A Pie Chart comparing the warehouse space occupied with the amount of free space available. The warehouse is supposedly 60,000,000,000 cubic cm. From the illustration we can see that the warehouse has less than a quarter of it's capacity available.
#### Assumptions Made
- Only shipments received at the warehouse have been considered in this calculation, assuming that shipments with a status of "intransit" or "delivered" have already left the warehouse.

## Packages Per Day
A Line Chart displaying the number of packages received at the warehouse on a daily basis. The data is charted for the current year showing a maximum of 1687 shipments arriving on February 25, 2025, and a minimum of 1425 shipments arriving at the warehouse on January 21, 2025.


## Other Assumptions
- On time deliveries correspond to shipments with a delivery date within 5 days (one working week) of the arrival date.


## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).  
You are free to use, adapt, and share the code for non-commercial purposes only.
