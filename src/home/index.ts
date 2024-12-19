import express, { Router, Request, Response } from "express";

const homeRouter: Router = express.Router();

homeRouter.get('/', (req:Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facebook Clone API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          header {
            background-color: #4267B2;
            color: white;
            padding: 20px;
            text-align: center;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h1 {
            margin: 0;
            font-size: 2.5rem;
          }
          main {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            width: 100%;
          }
          p {
            font-size: 1.2rem;
            color: #555;
            line-height: 1.5;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1.2rem;
            color: white;
            background-color: #4267B2;
            text-decoration: none;
            border-radius: 5px;
          }
          a:hover {
            background-color: #365899;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Facebook Clone Backend</h1>
        </header>
        <main>
          <p>
            Welcome to the backend API of the Facebook Clone project. This project implements core features of Facebook, including user authentication, profile management, posts, reactions, and more.
          </p>
          <p>
            Use this API to integrate front-end functionalities or to test the services directly.
          </p>
          <a href="/api/docs">View API Documentation</a>
        </main>
      </body>
      </html>
    `);
  });


export default homeRouter