import express from "express";
import routes from "./routes/v1.js";
import errorHandler from "./middleware/error-handling.js";

const app = express();

app.use(express.json());
app.use("/v1", routes);
app.use(errorHandler);

export default app;
