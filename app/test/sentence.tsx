import Select from "@/select";

import React, { FC, HTMLAttributes } from "react";

interface TestSentenceProps extends HTMLAttributes<HTMLDivElement> {
  question: string,
  options: string[][]
};

const TEMPLATE = "{...}";
export default function TestSentence({ question, options }: TestSentenceProps) {
  return (
    <div>
      {question.split(TEMPLATE).map((text, i, arr) => <React.Fragment key={i}>
        {text}
        {arr.length - 1 != i && <Select placeholder="Select..." array={options[i++]} />}
      </React.Fragment>
      )}
    </div>
  );
}
