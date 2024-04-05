
import { TableComponentProps } from "../../kurgandb/globals";
import { Button } from "@mantine/core"
import LemmatizerPropositions from "./CustomTableLemmatizerPropositions";
import TableMeta from "./TableMeta";
import { FGetUnreviewedLemmatizerPropositions } from "../api";
import ComponentLoader from "../../kurgandb/comp/ComponentLoader";
import CustomTableComments from "./CustomTableComments";



export default function CustomComponentTable(props: TableComponentProps) {
  const { tableName } = props;
  if (tableName == "lemmatizer_propositions") {
    const method = "getUnreviewedLemmatizerPropositions" as unknown as FGetUnreviewedLemmatizerPropositions;
    return <ComponentLoader
      Component={LemmatizerPropositions}
      method={method}
      args={{ page: 1 }}
      props={props}
    />
  } else if (tableName == "comments") {
    return <CustomTableComments {...props} />
  }
  return (
    <div className="">
      <TableMeta meta={props.meta} />
      <p className="text-red-900 mb-3">Customize table editing by modifying /app/kurgandb_admin/components/CustomComponentTable.tsx</p>
      <Button>Got it!</Button>
    </div>
  );
}