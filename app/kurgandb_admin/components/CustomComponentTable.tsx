
import { TableComponentProps } from "../../kurgandb/globals";
import { Button } from "@mantine/core"
import LemmatizerPropositions from "./LemmatizerPropositions";



export default function CustomComponentTable(props: TableComponentProps) {
  const { tableName } = props;
  if (tableName == "lemmatizer_propositions") {
    return <LemmatizerPropositions {...props} />
  }
  return (
    <div className="">
      <p className="text-red-900 mb-3">Customize table editing by modifying /app/kurgandb_admin/components/CustomComponentTable.tsx</p>
      <Button>Got it!</Button>
    </div>
  );
}