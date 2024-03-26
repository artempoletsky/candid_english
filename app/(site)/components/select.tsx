'use client';

import React, { FC, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  keys?: string[],
  values?: string[],
  array?: string[],
  dict?: Record<string, string>,
  placeholder?: string,
  bind?: [any, Function]
};

export default function Select({
  keys,
  values,
  bind,
  dict,
  array,
  placeholder,
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
    rest.defaultValue = bind[0];
  }

  if (array) {
    keys = [...array];
    values = [...array];
  }

  if (placeholder) {
    keys.unshift("");
    values.unshift(placeholder);
  }

  return (
    <select {...rest}>
      {keys.map((key, index) =>
        !key ?
          <option hidden key="" value="">{placeholder}</option> :
          <option hidden={!key} key={key} value={key}>{values ? values[index] : ""}</option>
      )}
    </select>
  );
};
