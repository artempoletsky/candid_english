import { describe, expect, test, beforeAll } from "@jest/globals";
import validate, { APIValidationObject, InvalidResult } from "~/lib/api";


const xdescribe = (...args: any) => { };
const xtest = (...args: any) => { };


describe("Validator", () => {
  xtest("validates required methods", async () => {
    const rules: APIValidationObject = {
      foo: {
      }
    };

    const api = {
      foo: jest.fn()
    };

    const correctRequest = {
      method: "foo",
      arguments: {}
    };

    let [res, status] = await validate(correctRequest, rules, api);
    expect(status.status).toBe(200);
    expect(api.foo).toHaveBeenCalled();

    const incorrectRequest = {
      method: "bar",
      arguments: {}
    };

    [res, status] = await validate(incorrectRequest, rules, api);
    expect(status.status).toBeLessThan(500);
    expect(status.status).toBeGreaterThanOrEqual(400);
    expect(res.message).toBe(`API method 'bar' doesn't exist`);
  });

  test("validates required fields", async () => {
    const rules: APIValidationObject = {
      addToDo: {
        name: "string"
      }
    };

    const api = {
      addToDo: jest.fn()
    };

    const correctRequest = {
      method: "addToDo",
      arguments: {
        name: "nothing"
      }
    };

    let [res, status] = await validate(correctRequest, rules, api);
    expect(status.status).toBe(200);
    expect(api.addToDo).toHaveBeenCalled();
    const mockArgs = api.addToDo.mock.calls[0][0];

    expect(mockArgs.name).toBe("nothing");

    const incorrectRequest = {
      method: "addToDo",
      arguments: {}
    };

    [res, status] = await validate(incorrectRequest, rules, api);
    expect(status.status).toBeLessThan(500);
    expect(status.status).toBeGreaterThanOrEqual(400);
    expect(res.message).toBe(`Bad request`);

    expect(res.invalidFields.name).toBeDefined();
    expect(res.invalidFields.name.message).toBe(`missing; expected: 'string'`);
    expect(res.invalidFields.name.userMessage).toBe(`required field`);
  });

  test("validates required fields", async () => {
    const rules: APIValidationObject = {
      addToDo: {
        name: "string"
      }
    };

    const api = {
      addToDo: jest.fn()
    };

    const correctRequest = {
      method: "addToDo",
      arguments: {
        name: "nothing"
      }
    };

    let [res, status] = await validate(correctRequest, rules, api);
    expect(status.status).toBe(200);
    expect(api.addToDo).toHaveBeenCalled();
    const mockArgs = api.addToDo.mock.calls[0][0];

    expect(mockArgs.name).toBe("nothing");

    const incorrectRequest = {
      method: "addToDo",
      arguments: {}
    };

    [res, status] = await validate(incorrectRequest, rules, api);
    expect(status.status).toBeLessThan(500);
    expect(status.status).toBeGreaterThanOrEqual(400);
    expect(res.message).toBe(`Bad request`);

    expect(res.invalidFields.name).toBeDefined();
    expect(res.invalidFields.name.message).toBe(`missing; expected: 'string'`);
    expect(res.invalidFields.name.userMessage).toBe(`required field`);
  });


  test("validates without API", async () => {
    const rules: APIValidationObject = {
      addToDo: {
        name: "string"
      }
    };

    const correctRequest = {
      method: "addToDo",
      arguments: {
        name: "nothing"
      }
    };


    let res = await validate(correctRequest, rules);
    expect(res).toBe(false);

    const incorrectRequest = {
      method: "addToDo",
      arguments: {}
    };

    const invalidRes = await validate(incorrectRequest, rules);
    expect(invalidRes).not.toBe(false)
    if (!invalidRes) {
      return;
    }
    expect(invalidRes[0].message).toBe(`Bad request`);
    expect(invalidRes[0].invalidFields.name).toBeDefined();
  });
});