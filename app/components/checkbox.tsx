'use client';

import React, { FC, InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  bind?: [boolean, Function],
  children?: ReactNode,
  label?: string,
  containerClassName?: string
};


export default function Checkbox({
  bind,
  children,
  label,
  containerClassName,
  ...rest
}: CheckboxProps) {
  if (label) {
    children = <>{label}</>
  }
  if (bind) {
    rest.onChange = e => bind[1](e.target.checked);
    rest.checked = bind[0];
  }

  return (
    <label className={containerClassName}>
      <input type="checkbox" {...rest} /> {children}
    </label>
  )
}