import { Request, Response, NextFunction } from "express";
import { Ajv, Schema, ValidateFunction } from "ajv";
import { ValidationError } from "../../utils/errors.js";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  coerceTypes: true,
  allErrors: true,
  removeAdditional: true,
});
addFormats.default(ajv);

type Source = "body" | "query" | "params";

export default function validate(schema: Schema, source: Source = "body") {
  const validateFn: ValidateFunction = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const data = { ...req[source] };

    const valid = validateFn(data);
    if (!valid) {
      const messages = validateFn.errors?.map(
        (err) => `${err.instancePath || err.schemaPath} ${err.message}`,
      ) || ["Invalid request"];
      throw new ValidationError(messages);
    }

    req[source] = data;
    next();
  };
}
