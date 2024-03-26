
import { TextInput as MantineTextInput, TextInputProps } from "@mantine/core";

export default function TextInput(props: TextInputProps) {
  return <MantineTextInput
    classNames={{
      root: "mb-2",
      error: "ml-3 inline",
      wrapper: "mb-[5px] inline-block w-[350px]",
      label: "block",
    }}
    {...props}
  />
}