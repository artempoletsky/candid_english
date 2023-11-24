
export type APIRequest = {
  method: string,
  arguments: any
}

export type FieldValidation = ((...args: any) => string | false) | "number" | "boolean" | "string" | "any" | "string[]" | "number[]" | "object" | "[]"

export type ValidationRecord = Record<string, FieldValidation>;

export type APIValidationObject = Record<string, ValidationRecord>

export type ValidationResponce = [any, {
  status: number
}]


function invalid(message: string): ValidationResponce {
  return [
    {
      message: message
    }, {
      status: 400
    }
  ]
}

export function typeExpectedMessage(field: string, type: string, got: any) {
  return `Argument '${field}' expected to be '${type}' got '${typeof got}: ${got}'`;
}

function typeExpected(field: string, type: string, got: any) {
  return invalid(typeExpectedMessage(field, type, got));
}

export default async function validate(req: APIRequest, rules: APIValidationObject, api: Record<string, (...args: any) => Promise<any>>): Promise<ValidationResponce> {
  const { method, arguments: args } = req;
  if (!(rules as any)[method]) {
    return invalid(`API method '${method}' doesn't exist`);
  }

  const methodRules: Record<string, FieldValidation> = rules[method];

  for (const fieldName in methodRules) {
    const rule = methodRules[fieldName];
    const field = args[fieldName];
    if (!field) {
      const t = typeof rule == "string" ? rule : "";
      return invalid(`Missing argument '${fieldName}'` + (t ? `, expected: '${rule}'` : ""));
    }
    if (typeof rule == "function") {
      const errorMessage = rule(field, args);
      if (errorMessage) {
        return invalid(errorMessage);
      }
    } else if (rule == "string[]") {
      if (!(field instanceof Array)) {
        return typeExpected(fieldName, rule, field);
      }
      if ((field as Array<any>).find(e => typeof e != "string")) {
        return typeExpected(fieldName, rule, field);
      }
    } else if (rule == "number[]") {
      if (!(field instanceof Array)) {
        return typeExpected(fieldName, rule, field);
      }
      if ((field as Array<any>).find(e => typeof e != "number")) {
        return typeExpected(fieldName, rule, field);
      }
    } else if (rule == "[]") {
      if (!(field instanceof Array)) {
        return typeExpected(fieldName, rule, field);
      }
    } else if (rule != "any" && typeof field != rule) {
      return typeExpected(fieldName, rule, field);
    }
  }

  let result;
  try {
    result = await api[method](args);

  } catch (error) {
    return [
      {
        message: `Method has failed with error: '${error}'`
      },
      {
        status: 500
      }
    ];
  }

  return [
    result,
    {
      status: 200
    }
  ];
}