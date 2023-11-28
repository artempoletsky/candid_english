
export type APIRequest = {
  method: string,
  args: any
}
export type Validator = (args:
  {
    value: any,
    method: string,
    args: any,
  }
) => Promise<InvalidFieldReason | string | false>;

const ALL_PRIMITIVES = ["number", "boolean", "string", "any"] as const;

type PrimitiveType = (typeof ALL_PRIMITIVES)[number];

function typeIsPrimitive(type: string): type is PrimitiveType {
  return ALL_PRIMITIVES.includes(type as PrimitiveType);
}

type ArrayType = "number[]" | "boolean[]" | "string[]" | "any[]";

type ValidationType = PrimitiveType | ArrayType | "object";

export type ValidationRecord = Record<string, Validator | ValidationType>;

export type APIValidationObject = Record<string, ValidationRecord | Validator>

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

function stringifyUnion(union: readonly any[]): string {
  return "(" + union.map(e => `'${e}'`).join(" | ") + ")";
}

export function validateArrayUnionFabric(union: readonly any[]): Validator {
  return arrayValidatorFabric(stringifyUnion(union), validateUnionFabric(union));
}

export function validateUnionFabric(tuple: readonly any[]): Validator {
  return async function ({ value }) {
    if (tuple.includes(value)) {
      return false;
    }
    return typeExpectedReason(stringifyUnion(tuple), value);
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

export const arrayValidatorFabric = (type: string = "", validator?: Validator): Validator => {

  return async ({ value, method, args }) => {
    if (!(value instanceof Array)) {
      return typeExpectedReason(type, value);
    }
    if (!validator) {
      return false;
    }

    for (let i = 0; i < value.length; i++) {
      const result = await validator({
        value: value[i],
        method,
        args,
      });


      if (result) {
        if (typeof result != "string") {
          result.message = `element at index: ${i} is invalid ` + result.message;
          return result;
        } else {
          return `element at index: ${i} is invalid ` + result;
        }
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
  "string[]": arrayValidatorFabric("string[]", primitiveValidatorFabric("string")),
  "number[]": arrayValidatorFabric("number[]", primitiveValidatorFabric("number")),
  "boolean[]": arrayValidatorFabric("boolean[]", primitiveValidatorFabric("boolean")),
  "any[]": arrayValidatorFabric("any[]", async () => false),
  any: async () => false,
  object: objectValidator,
};


const UserMessages = {
  required: "required field",
  invalid: "field is invalid",
  invalidRequest: "request is invalid",
};

function makeReason(reason: string | InvalidFieldReason): InvalidFieldReason {
  if (typeof reason == "string") {
    return {
      message: reason,
      userMessage: UserMessages.invalid
    }
  }
  return reason;
}

function validate(req: APIRequest, rules: APIValidationObject): Promise<InvalidResult | false>;

function validate(req: APIRequest, rules: APIValidationObject, api: APIObject): Promise<ValidResult | InvalidResult>

async function validate(req: APIRequest, rules: APIValidationObject, api?: APIObject) {
  const { method, args } = req;
  if (!(rules as any)[method]) {
    return invalidResponce(`API method '${method}' doesn't exist`);
  }

  const methodRules = rules[method];

  if (typeof methodRules == "function") {
    if (api && api[method]) {
      throw new Error("Common validation rules must not share names with API methods");
    }
    return invalidResponce(`API method '${method}' doesn't exist`);
  }

  for (const key in rules) {

    if (typeof rules[key] == "function") {
      let validator = rules[key] as Validator;
      let validationErrorReason = await validator({ value: null, method, args });

      if (validationErrorReason) {
        return [
          {
            message: makeReason(validationErrorReason).message
          },
          {
            status: 400
          }
        ];
      }
    }
  }

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
    const validator: Validator = typeof rule == "function" ? rule : RulesObject[rule];
    if (rule == "string[]") debugger;
    let validationErrorReason = await validator({ value, method, args });

    if (validationErrorReason) {
      invalidFields[fieldName] = makeReason(validationErrorReason);
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


export function commonArraysEqualLength(methods: Record<string, string[]>): Validator {

  return async ({ args, method }) => {
    const rules = methods[method];
    if (!rules) {
      return false;
    }
    const l: number = args[rules[0]].length;

    for (let i = 0; i < rules.length; i++) {
      if (args[rules[i]].length != l)
        return `In method '${method}' arrays expected to have equal length`;
    }
    return false;
  };
}