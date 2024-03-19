import { DocumentComponentProps } from "../../kurgandb/globals";
import { Button, Checkbox, TextInput } from "@mantine/core";


export default function CustomComponentRecord(params: DocumentComponentProps) {
  return (
    <div className="max-w-[550px]">
      {"username" in params.record &&
        <TextInput value={params.record.username} onChange={e => params.record.username = e.target.value} />}
      {"isAdmin" in params.record &&
        <Checkbox checked={params.record.isAdmin} onChange={e => params.record.isAdmin = e.target.checked} />}
      <p className="text-red-900 mb-3">Customize records editing by modifying /app/kurgandb_admin/components/CustomComponentRecord.tsx</p>
      <Button onClick={e => alert("Yippee!")}>It&#39;s awesome!</Button>
    </div>
  );
}