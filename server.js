import express from "express";
import dotenv from "dotenv"
import routes from "./routes/api.js"
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/rateLimit.js";
import logger from "./config/logger.js";
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express"

dotenv.config({
    path: "./.env"
})

const app = express();

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}))

app.use(express.static("public"));

app.use(fileUpload());

app.use(helmet());

app.use(cors());

app.use(limiter);

const port = process.env.PORT || 9000;


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Sample API with swagger",
            version: "1.0.0",
            description: "A sample web api for news"
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            }
        ],
    },
    apis:["./routes/*.js"]
    
}

const swaggerSpec = swaggerJSDoc(options);

app.use("/swagger", serve, setup(swaggerSpec));

app.get('/', (req, res, next)=>{
   return res.send("The server is working fine")
})

app.use("/api", routes);

logger.info("Hey I am just checking winston");

import './jobs/index.js'


app.listen(port, ()=>{
    console.log(`Server is listening on ${port}`)
})

