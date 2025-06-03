import app from "./app.js";
import { logger } from "../utils/logger.js";
import env from "../config/default.js";

app.listen(env.port, async () => {
  logger.info(`Server is running on ${env.port}.`);
});
