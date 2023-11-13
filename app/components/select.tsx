import React, { FC, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  keys?: string[],
  values?: string[],
  dict?: Record<string, string>,
  bind?: [any, Function]
};

export default function Select({
  keys,
  values,
  bind,
  dict,
  ...rest
}: SelectProps) {
  if (!keys) keys = [];

  if (!values) values = [];

  if (dict) {
    keys = Object.keys(dict);
    values = Object.values(dict);
  }

  if (bind) {
    rest.onChange = e => bind[1](e.target.value);
    rest.value = bind[0];
  }

  return (
    <select {...rest} >
      {keys.map((key, index) => <option key={key} value={key}>{values ? values[index] : ""}</option>)}
    </select>
  );
};
