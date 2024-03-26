import Select from "components/select";

import React, { FC, HTMLAttributes } from "react";

interface TestSentenceProps extends HTMLAttributes<HTMLDivElement> {
  question: string,
  options: string[][]
};

const TEMPLATE = "{...}";
export default function TestSentence({ question, options }: TestSentenceProps) {
  return (
    <div>
      {question.split(TEMPLATE).map((text, i, arr) =>
        <React.Fragment key={"foo_" + i}>
          <span dangerouslySetInnerHTML={{ __html: text }}></span>
          {arr.length - 1 != i && <Select className="select" name={i.toString()} placeholder="Select..." array={options[i]} />}
        </React.Fragment>
      )}
    </div>
  );
}
