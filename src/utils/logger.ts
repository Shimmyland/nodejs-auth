import { pino } from "pino";
//import { pinoHttp } from 'pino-http'
import fs from "fs";

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino-pretty",
        options: {
          destination: "./app.log",
          colorize: false,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    ],
  },
});

fs.appendFileSync("./app.log", "\n");
logger.info("Server has started.");
/*
export const loggerHttp = pinoHttp({
    logger,
    customLogLevel: (res: any, err: any) => {
        if (res.statusCode >= 500) return 'error'
        if (res.statusCode >= 400) return 'warn'
        return 'info'
    },
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params
        }),
        res: (res) => ({
            statusCode: res.statusCode,
            responseTime: res.responseTime
        }),
        err: (err) => ({
            message: err.message
        })
    }
})
*/
