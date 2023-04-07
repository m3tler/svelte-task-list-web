# Task list - core app

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Set up](#set-up)

## General info
This application is a frontend site of the task list project. 

## Technologies
Project is created with:
* Node: 18.15.0
* SvelteKit: 1.5.0
* Svelte Material UI: 7

## Set up
This section shows how to set up and install the application on the Tomcat server.

Important: Before the app installation on the Tomcat server make sure you have Node.js installed.

To set up the application follow these steps:
1. Clone the application using ```git clone https://github.com/m3tler/task-list-web.git```
2. Install npm using ```npm install``` command.
3. Install npm dotenv using ```npm install dotenv``` command (SvelteKit will be able to read environment variables from your .env file)
4. Go to .env file and set the following properties:
- PUBLIC_API_URL - URL of the API server application,
- ORIGIN - origin of the web application,
- HOST - host of the web application,
- PORT - port of the web application.
5. Build the application using ```npm run build``` command.
6. Run the application using ```node -r dotenv/config build``` command.
7. Open the browser and go to specified origin.
