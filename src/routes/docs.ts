import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Function to get the Swagger options
const getSwaggerOptions = () => ({
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Facebook Clone API",
      version: "1.0.0",
      description: "API documentation for the Facebook Clone project.",
      contact: {
        name: "MOHAMMED EL-IDRISSI",
        email: "mohammedelidrissi.fr78@gmail.com",
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:3000",
        description: "Local development server",
      },
    ],
  },
  apis: [path.join(__dirname, "../docs/**/*.yaml")], // Adjust to point to your YAML files
});

const router = Router();

// Setup Swagger UI
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(getSwaggerOptions())));

export default router;
