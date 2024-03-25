import { JSONErrorResponse, mainErrorMessage } from "@artempoletsky/easyrpc/client"

type Props = {
  requestError?: JSONErrorResponse;
  message?: string;
}

export default function ErrorMessage({ requestError, message }: Props) {
  const text = requestError ? mainErrorMessage(requestError) : message || "";
  return (
    <div className="text-red-600  min-h-[24px]">
      {text}
    </div>
  )
}