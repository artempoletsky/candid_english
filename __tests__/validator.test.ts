import { describe, expect, test, beforeAll } from "@jest/globals";
import validate, { APIValidationObject, InvalidResult, Validator, commonArraysEqualLength } from "~/lib/api";


const xdescribe = (...args: any) => { };
const xtest = (...args: any) => { };


describe("Validator", () => {

  const addTodoRules: APIValidationObject = {
    addTodo: {
      name: "string"
    }
  };

  const correctaddTodoRequest = {
    method: "addTodo",
    args: {
      name: "nothing"
    }
  };

  test("validates required methods", async () => {

    const api = {
      addTodo: jest.fn()
    };

    let [res, status] = await validate(correctaddTodoRequest, addTodoRules, api);
    expect(res).toBe("");
    expect(status.status).toBe(200);
    expect(api.addTodo).toHaveBeenCalled();

    const incorrectRequest = {
      method: "bar",
      args: {}
    };

    [res, status] = await validate(incorrectRequest, addTodoRules, api);
    expect(status.status).toBeLessThan(500);
    expect(status.status).toBeGreaterThanOrEqual(400);
    expect(res.message).toBe(`API method 'bar' doesn't exist`);
  });

  test("validates required fields", async () => {
    const api = {
      addTodo: jest.fn()
    };

    const incorrectRequest = {
      method: "addTodo",
      args: {}
    };

    const [res, status] = await validate(incorrectRequest, addTodoRules, api);
    expect(api.addTodo).not.toHaveBeenCalled();
    expect(status.status).toBeLessThan(500);
    expect(status.status).toBeGreaterThanOrEqual(400);
    expect(res.message).toBe(`Bad request`);

    expect(res.invalidFields.name).toBeDefined();
    expect(res.invalidFields.name.message).toBe(`missing; expected: 'string'`);
    expect(res.invalidFields.name.userMessage).toBe(`required field`);
  });


  test("validates without API", async () => {

    let res = await validate(correctaddTodoRequest, addTodoRules);
    expect(res).toBe(false);

    const incorrectRequest = {
      method: "addTodo",
      args: {}
    };

    const invalidRes = await validate(incorrectRequest, addTodoRules);
    expect(invalidRes).not.toBe(false)
    if (!invalidRes) {
      return;
    }
    expect(invalidRes[0].message).toBe(`Bad request`);
    expect(invalidRes[0].invalidFields.name).toBeDefined();
  });


  test("checks for null", async () => {
    const incorrectRequest = {
      method: "addTodo",
      args: {
        name: null
      }
    };
    const invalidRes = await validate(incorrectRequest, addTodoRules);
    expect(invalidRes).not.toBe(false);
    if (!invalidRes) return;

    expect(invalidRes[0].invalidFields.name.userMessage).toBe("field is invalid");
  });


  const arrayExampleRules: APIValidationObject = {
    sendArray: {
      array: "string[]"
    }
  };

  const correctArrayRequest = {
    method: "sendArray",
    args: {
      array: ["1", "2"]
    }
  };

  test("validates arrays", async () => {
    const api = {
      sendArray: jest.fn()
    }
    const validResult = await validate(correctArrayRequest, arrayExampleRules, api);
    expect(validResult[1].status).toBe(200);
    // console.log(api.sendArray.mock.calls[0][0]);
    expect(api.sendArray.mock.calls[0][0].array[1]).toBe("2");


    const invalidRes = await validate({
      method: "sendArray",
      args: {
        array: "foo"
      }
    }, arrayExampleRules);
    expect(invalidRes).not.toBe(false);
    if (!invalidRes) return;
    expect(invalidRes[0].invalidFields.array.message).toBe("expected to be 'string[]' got 'string: foo'");


    const invalidRes2 = await validate({
      method: "sendArray",
      args: {
        array: ["a", 2, "b", "c"]
      }
    }, arrayExampleRules);

    expect(invalidRes2).not.toBe(false);
    if (!invalidRes2) return;
    expect(invalidRes2[0].invalidFields.array.message).toBe("element at index: 1 is invalid expected to be 'string' got 'number: 2'");
  });

  test("validates common rules", async () => {
    type TArgs = {
      a1: number[],
      a2: number[]
    }
    const invalidRequest = {
      method: "sendTwoArrays",
      args: {
        a1: [1, 2],
        a2: [3, 4, 5]
      } as TArgs
    };

    const validRequest = {
      method: "sendTwoArrays",
      args: {
        a1: [1, 2],
        a2: [3, 4]
      } as TArgs
    };

    const customMock: Validator = jest.fn(async ({ method, args }) => {
      return false
    });

    const rules: APIValidationObject = {
      sendTwoArrays: {
        a1: "number[]",
        a2: "number[]",
      },
      arraysEqual: commonArraysEqualLength({
        sendTwoArrays: ["a1", "a2"]
      }),
      customMock
    }

    const validRes = await validate(validRequest, rules);
    expect(validRes).toBe(false);
    expect(customMock).toHaveBeenCalledTimes(1);

    expect(((customMock as any).mock.calls[0][0].args as TArgs).a2[1]).toBe(4);
    expect((customMock as any).mock.calls[0][0].method).toBe("sendTwoArrays");

    const invalidRes = await validate(invalidRequest, rules);
    expect(invalidRes).not.toBe(false);
    if (!invalidRes) return;

    expect(invalidRes[0].message).toBe("In method 'sendTwoArrays' arrays expected to have equal length");
    console.log(invalidRes);
  });


});