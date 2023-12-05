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
