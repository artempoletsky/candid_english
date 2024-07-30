
import { Button, Checkbox, TextInput } from "@mantine/core";
import CustomRecordTicket from "./CustomRecordTicket";
import { DocumentComponentProps } from "../../../app/kurgandb/globals";
import { Store } from "../../../app/kurgandb/store";


export function bind(record: any, prop: string) {
  return {
    value: record[prop],
    onChange: (e: any) => record[prop] = e.target.value,
  }
}

export default function CustomComponentRecord(params: DocumentComponentProps<any>) {
  if (Store.tableName == "test_questions") return <CustomRecordTicket {...params} />
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