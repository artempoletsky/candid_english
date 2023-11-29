
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
) => Promise<InvalidFieldReason | string | true>;

type PrimitiveType = "number" | "boolean" | "string" | "any" | "stringEmpty";

type ArrayType = "number[]" | "boolean[]" | "string[]" | "stringEmpty[]" | "any[]";

type ValidationType = PrimitiveType | ArrayType | "object" | "email" | "optionalEmail";

type ValidationRecord = Record<string, Validator | ValidationType | (Validator | ValidationType)[]>;

export type ValidationRule = ValidationRecord | (ValidationRecord | Validator)[]

export type APIValidationObject = Record<string, any>

export type InvalidResult = [ValiationErrorResponce, {
  status: number
}];

export type ValidResult = [any, {
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


function invalidResponce(message: string): InvalidResult {
  return [
    {
      message: message,
      invalidFields: {}
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

export function validateUnionFabric(union: readonly any[]): Validator {
  return async ({ value }) => {
    return union.includes(value) || typeExpectedReason(stringifyUnion(union), value);
  }
}

export function typeExpectedMessage(expectedType: string, got: any) {
  return `expected to be '${expectedType}' got ${typeof got}: '${got}'`;
}

function typeExpectedReason(expectedType: string, got: any): InvalidFieldReason {
  return {
    message: typeExpectedMessage(expectedType, got),
    userMessage: UserMessages.invalid,
  }
}


const primitiveValidatorFabric = (type: PrimitiveType): Validator => {
  return async ({ value }) => {
    return typeof value == type || typeExpectedReason(type, value);
  }
}

export const arrayValidatorFabric = (type: string = "", validator?: Validator): Validator => {

  return async ({ value, method, args }) => {
    if (!(value instanceof Array)) {
      return typeExpectedReason(type, value);
    }
    if (!validator) {
      return true;
    }

    for (let i = 0; i < value.length; i++) {
      const result = await validator({
        value: value[i],
        method,
        args,
      });


      if (result !== true) {
        if (typeof result != "string") {
          result.message = `element at index: ${i} is invalid ` + result.message;
          return result;
        } else {
          return `element at index: ${i} is invalid ` + result;
        }
      }
    }
    return true;
  }
}


function validify(entry: any): Validator {
  if (typeof entry == "function") {
    return entry;
  } else if (typeof entry == "string") {
    return RulesObject[entry];
  } else if (entry instanceof Array) {
    return chainValidators.apply(undefined, entry.map(validify));
  } else if (typeof entry == "object") {
    return objectValidatorFactory(entry);
  }
  throw new Error("entry can be a Validator, a string, an array of Validators or a plain object");
}

export const objectValidatorFactory = (rulesObject: Record<string, any>): Validator => {
  const validators: Validator[] = [];
  for (const field in rulesObject) {
    const validator = validify(rulesObject[field]);
    validators.push(
      ((field: string, validator: Validator) =>
        async ({ value, args, method }) => {
          if (typeof value[field] === "undefined") {
            return `Object is missing field '${field}'`;
          }
          return await validator({ value: value[field], args, method })
        }

      )(field, validator)
    );
    // validators[field] = 
    // const result = await validator()
    // validators.push())
  }
  return chainValidators.apply(undefined, validators);
}

const stringValidator = primitiveValidatorFabric("string");

export function chainValidators(...validators: any[]): Validator {
  return async (request) => {
    for (const v of validators) {
      const validator = validify(v);
      const error = await validator(request);
      if (error !== true) {
        return error;
      }
    }
    return true;
  }
}

export const nonEmptystringValidator: Validator = chainValidators(
  stringValidator,
  (async ({ value }) => value !== "" || {
    message: "should not be empty",
    userMessage: UserMessages.required
  }) as Validator
);

export const emailValidator: Validator = chainValidators(
  nonEmptystringValidator,
  (async ({ value }) => {
    return !!value.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) || {
      message: "email is invalid",
      userMessage: "email is invalid",
    }
  }) as Validator
);

export const optionalEmailValidator: Validator = async ({ value, method, args }) => {
  if (value === "") return true;
  return await emailValidator({ value, method, args });
};

const RulesObject: Record<string, Validator> = {
  number: primitiveValidatorFabric("number"),
  stringEmpty: stringValidator,
  boolean: primitiveValidatorFabric("boolean"),
  "stringEmpty[]": arrayValidatorFabric("string[]", primitiveValidatorFabric("string")),
  "number[]": arrayValidatorFabric("number[]", primitiveValidatorFabric("number")),
  "boolean[]": arrayValidatorFabric("boolean[]", primitiveValidatorFabric("boolean")),
  "any[]": arrayValidatorFabric("any[]", async () => true),
  any: async () => true,
  string: nonEmptystringValidator,
  "string[]": arrayValidatorFabric("string[]", nonEmptystringValidator),
  email: emailValidator,
  optionalEmail: optionalEmailValidator,
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

function arraify<T>(value: T | T[]): T[] {
  if (value instanceof Array) {
    return value;
  }
  return [value];
}

function validate(req: APIRequest, rules: APIValidationObject): Promise<InvalidResult | false>;

function validate(req: APIRequest, rules: APIValidationObject, api: APIObject): Promise<ValidResult | InvalidResult>

async function validate(req: APIRequest, rules: APIValidationObject, api?: APIObject) {
  const { method, args } = req;
  if (!(rules as any)[method]) {
    return invalidResponce(`API method '${method}' doesn't exist`);
  }

  const methodRules = arraify(rules[method]);

  let fieldRules: Record<string, any[]> = {};
  const invalidFields: Record<string, {
    message: string,
    userMessage: string
  }> = {};

  const commonValidators: Validator[] = [];

  for (const rule of methodRules) {
    if (typeof rule == "function") {
      commonValidators.push(rule);
    } else {

      fieldRules = rule;

      for (const fieldName in fieldRules) {
        const validator = validify(fieldRules[fieldName]);
        const value = args[fieldName];

        if (invalidFields[fieldName]) continue;

        if (typeof value == "undefined") {

          invalidFields[fieldName] = {
            message: `missing`,
            userMessage: UserMessages.required
          }
          continue;
        }

        let validationErrorReason = await validator({ value, method, args });

        if (validationErrorReason !== true) {
          invalidFields[fieldName] = makeReason(validationErrorReason);
        }
      }
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

  for (const validator of commonValidators) {
    let validationErrorReason = await validator({ value: null, method, args });
    if (validationErrorReason !== true) {
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


export function commonArraysEqualLength(fields: readonly string[]): Validator {
  if (fields.length < 2) {
    throw new Error("Must be at least 2 array fields to operate");
  }

  return async ({ args, method }) => {

    let len = -1;

    for (let i = 0; i < fields.length; i++) {
      const arr = args[fields[i]];

      if (len == -1) len = arr.length;

      if (arr.length != len)
        return `In method '${method}' arrays expected to have equal length`;
    }
    return true;
  };
}