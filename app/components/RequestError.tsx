import { JSONErrorResponse, mainErrorMessage } from "@artempoletsky/easyrpc/client"

type Props = {
  requestError?: JSONErrorResponse
}

export default function RequestError({ requestError }: Props) {

  return <>
    {requestError && requestError.preferredErrorDisplay != "field" && <div className="text-red-600">
      <p className="">Request has failed:</p>
      <p className="">{mainErrorMessage(requestError)}</p>
    </div>}</>
}