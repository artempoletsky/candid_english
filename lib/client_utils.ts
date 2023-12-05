"use client"

export const fetcher = (...args: any) => fetch.apply(null, args).then(res => res.json());

type FormDataToDictOptions = {
  removeActionField?: boolean,
  keysToRemove?: string[],
}

export function formDataToDict(formData: FormData,
  options: FormDataToDictOptions = {
    removeActionField: false,
    keysToRemove: []
  }): Record<string, string> {
  const result: Record<string, string> = {};

  formData.forEach((value, key) => {

    if (options.keysToRemove?.includes(key)) {
      return;
    }
    if (options.removeActionField && key.startsWith("$ACTION_ID_")) {
      return;
    }
    result[key] = value.toString()
  });
  return result;
}

export function request() {

}

export function getAPIMethod(route: string, method: string, httpMethod: string = "POST"): (args: Record<string, any>) => Promise<any> {
  return function (args: Record<string, any>) {
    return fetch(route, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method,
        ...args
      })
    }).then(r => r.json());
  }
}

export function getAPIData(route: string): () => Promise<any> {
  return function () {
    return fetch(route, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(r => r.json());
  }
}
