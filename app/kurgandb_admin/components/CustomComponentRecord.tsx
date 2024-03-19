import { DocumentComponentProps } from "../../kurgandb/globals";
import { Button, Checkbox, TextInput } from "@mantine/core";

function recordUser(params: DocumentComponentProps) {
  return <div className="mt-3">
    <p className="mb-2">Example of customizing the user record</p>
    <p className="mb-1">Passing username:</p>
    {"username" in params.record &&
      <TextInput value={params.record.username} onChange={e => params.record.username = e.target.value} />}
    <p className="mb-1">Passing isAdmin property:</p>
    {"isAdmin" in params.record &&
      <Checkbox checked={params.record.isAdmin} onChange={e => params.record.isAdmin = e.target.checked} />}
  </div>
}

export default function CustomComponentRecord(params: DocumentComponentProps) {
  return (
    <div className="max-w-[550px]">
      <p className="text-red-900 mb-3">Customize records editing by modifying /app/kurgandb_admin/components/CustomComponentRecord.tsx</p>
      <Button onClick={e => alert("Yippee!")}>It&#39;s awesome!</Button>
      {params.tableName == "users" && recordUser(params)}
    </div>
  );
}