
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
