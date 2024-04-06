"use client"

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

export function blinkBoolean(setter: (b: boolean) => void, timeout = 1000) {
  setter(true);
  setTimeout(() => {
    setter(false);
  }, timeout);
}

export function saveTextFile(fileName: string, textData: string) {
  let blobData = new Blob([textData], { type: "text/plain" });
  let url = window.URL.createObjectURL(blobData);

  let a = document.createElement("a");
  a.setAttribute("style", "display: none");
  document.body.appendChild(a);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

