
export type APIRequest = {
  method: string,
  arguments: any
}
type Validator = (args:
  {
    value: any,
    method: string,
    args: any,
  }
) => Promise<InvalidFieldReason | false>;

type PrimitiveType = "number" | "boolean" | "string";
type ArrayType = "number[]" | "boolean[]" | "string[]";

type ValidationType = PrimitiveType | ArrayType | "any" | "object" | "[]";

export type ValidationRecord = Record<string, Validator | ValidationType>;

export type APIValidationObject = Record<string, ValidationRecord>

export type InvalidResult = [ValiationErrorResponce, {
  status: number
}];

export type ValidResult = [any, {
  status: number
}];

export type ValidationResponce = [ValiationErrorResponce | any, {
  status: number
}];

export type APIObject = Record<string, (...args: any) => Promise<any>>;

type InvalidFieldReason = {
  message: string,
  userMessage: string,
}

export type ValiationErrorResponce = {
  message: string,
  invalidFields: Record<string, InvalidFieldReason>
};


function invalidResponce(message: string): ValidationResponce {
  return [
    {
      message: message
    }, {
      status: 400
    }
  ]
}

function stringifyTuple(tuple: any[]): string {
  return "(" + tuple.map(e => `'${e}'`).join(" | ") + ")";
}

export function validateArrayTupleFabric(tuple: any[]): Validator {
  return arrayValidatorFabric(async ({ value }) => {
    if (tuple.includes(value)) return false;
    return typeExpectedReason(stringifyTuple(tuple) + "[]", value);
  });
}

export function validateTupleFabric(tuple: any[]): Validator {
  return async function ({ value }) {
    if (tuple.includes(value)) {
      return false;
    }
    return typeExpectedReason(stringifyTuple(tuple), value);
  }
}

export function typeExpectedMessage(expectedType: string, got: any) {
  return `expected to be '${expectedType}' got '${typeof got}: ${got}'`;
}

function typeExpectedReason(expectedType: string, got: any): InvalidFieldReason {
  return {
    message: typeExpectedMessage(expectedType, got),
    userMessage: UserMessages.invalid,
  }
}


const primitiveValidatorFabric = (type: PrimitiveType): Validator => {
  return async ({ value }) => {
    return typeof value != type ? typeExpectedReason(type, value) : false;
  }
}

export const arrayValidatorFabric = (type?: ArrayType | Validator): Validator => {
  let simpleRule: PrimitiveType, validator: Validator;
  let arrayType = "[]";

  if (typeof type == "string") {
    simpleRule = type.slice(0, -2) as PrimitiveType;
    validator = primitiveValidatorFabric(simpleRule);
    arrayType = type;
  }

  return async ({ value, method, args }) => {
    if (!(value instanceof Array)) {
      return typeExpectedReason(arrayType, value);
    }
    if (!validator) {
      return false;
    }

    for (let i = 0; i > value.length; i++) {
      const result = await validator({
        value: value[i],
        method,
        args,
      });

      if (result) {
        return typeExpectedReason(arrayType, value);
      }
    }

    return false;
  }
}


export const objectValidator: Validator = async ({ value, }) => {
  if (typeof value == "object") {
    return false;
  }
  return typeExpectedReason("object", value);
}

const RulesObject: Record<ValidationType, Validator> = {
  number: primitiveValidatorFabric("number"),
  string: primitiveValidatorFabric("string"),
  boolean: primitiveValidatorFabric("boolean"),
  "string[]": arrayValidatorFabric("string[]"),
  "number[]": arrayValidatorFabric("number[]"),
  "boolean[]": arrayValidatorFabric("boolean[]"),
  "[]": arrayValidatorFabric(),
  any: async () => false,
  object: objectValidator,
};


const UserMessages = {
  required: "required field",
  invalid: "field is invalid",
};

function validate(req: APIRequest, rules: APIValidationObject): Promise<InvalidResult | false>;

function validate(req: APIRequest, rules: APIValidationObject, api: APIObject): Promise<ValidResult | InvalidResult>

async function validate(req: APIRequest, rules: APIValidationObject, api?: APIObject) {
  const { method, arguments: args } = req;
  if (!(rules as any)[method]) {
    return invalidResponce(`API method '${method}' doesn't exist`);
  }

  const methodRules: Record<string, Validator | ValidationType> = rules[method];

  const invalidFields: Record<string, {
    message: string,
    userMessage: string
  }> = {};

  for (const fieldName in methodRules) {
    const rule = methodRules[fieldName];
    const value = args[fieldName];

    if (typeof value == "undefined") {
      const t = typeof rule == "string" ? rule : "";
      invalidFields[fieldName] = {
        message: `missing; ` + (t ? `expected: '${rule}'` : ""),
        userMessage: UserMessages.required
      }
      continue;
    }

    let validationErrorReason: InvalidFieldReason | false;
    if (typeof rule == "function") {
      validationErrorReason = await rule({ value, method, args });
    } else {
      validationErrorReason = await RulesObject[rule]({
        args,
        value,
        method
      });
    }
    if (validationErrorReason) {
      invalidFields[fieldName] = validationErrorReason;
    }
  }

  if (Object.keys(invalidFields).length != 0) {
    return [
      {
        message: "Bad request",
        invalidFields,
      },
      {
        status: 400
      }
    ];
  }

  if (!api) {
    return false;
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

  if (!result) {
    result = "";
  }

  return [
    result,
    {
      status: 200
    }
  ];
}


export default validate;