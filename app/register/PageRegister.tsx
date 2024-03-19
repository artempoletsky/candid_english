"use client";

import { fetchCatch, getAPIMethod, useErrorResponse } from "@artempoletsky/easyrpc/client";
import type { FSayHello } from "./api/methods";
import { useState } from "react";

const sayHello = getAPIMethod<FSayHello>("/register/api", "sayHello");


type Props = {};
export default function TestComponent(props: Props) {
  const [greeting, setGreeting] = useState("");
  const [name, setName] = useState("");
  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();


  const onClick = fetchCatch(sayHello)
    .before(() => {
      return {
        name,
      }
    })
    .then(setGreeting)
    .catch(setErrorResponse)
    .action();

  return (
    <div className="">
      <div className="inline-flex gap-3">
        <input
          placeholder="Type your name"
          className="rounded bg-gray-200 border border-blue-500 px-3 py-1 text-black h-[36px]"
          value={name}
          onChange={e => setName(e.target.value)}
          type="text"
        />
        <button className="rounded bg-blue-500 px-3 py-1 text-white h-[36px]" onClick={onClick}>{greeting ? greeting : "Say hello!"}</button>
      </div>

      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>

    </div>
  );
}