import express from "express";
import dotenv from "dotenv"
import routes from "./routes/api.js"
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/rateLimit.js";
import logger from "./config/logger.js";

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

app.get('/', (req, res, next)=>{
   return res.send("The server is working fine")
})

app.use("/api", routes);

logger.info("Hey I am just checking winston");

import './jobs/index.js'

app.listen(port, ()=>{
    console.log(`Server is listening on ${port}`)
})

