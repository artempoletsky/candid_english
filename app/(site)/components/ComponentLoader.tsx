"use client";

import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { useErrorResponse } from "@artempoletsky/easyrpc/react";
import { ComponentType, ElementType, ReactElement, ReactNode, useEffect, useState } from "react";


import ErrorMessage from "./ErrorMessage";
import { Loader } from "@mantine/core";


export class Mutator<RT>  {
  setter: ((res: RT) => void) | undefined
  trigger(res: RT) {
    if (this.setter) this.setter(res);
  }
}


type Props<AT, RT, PT> = {
  method: (arg: AT) => Promise<RT>;
  Component: ComponentType<RT & AT & PT>;
  args: AT;
  props?: PT;
  children?: ReactNode;
  onData?: (res: RT) => void;
  error?: ReactNode;
  mutator?: Mutator<RT>;
}

export default function ComponentLoader
  <AT, RT, PT>
  ({ Component, children, args, method: methodHack, props, onData, error, mutator }: Props<AT, RT, PT>) {


  const _props: PT = props || {} as PT;
  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  const [apiAddress, methodName] = (methodHack as unknown as string).split("?");
  const method = getAPIMethod<(arg: AT) => Promise<RT>>(apiAddress, methodName);

  const [data, setData] = useState<RT>();
  useEffect(() => {
    setData(undefined);
    setErrorResponse();
    method(args).then(res => {
      setData(res);
      if (onData) onData(res);
    }).catch(errorResponse => {
      setData(undefined);
      setErrorResponse(errorResponse);
    });
    if (mutator) {
      mutator.setter = setData;
    }
  }, [args]);


  if (!data && !errorResponse) {
    if (children) return children;
    return <Loader type="dots" />
  }
  if (data) return <Component {...data} {...args} {..._props} ></Component>;

  if (error) return error;
  return <ErrorMessage requestError={errorResponse}></ErrorMessage>;
}

