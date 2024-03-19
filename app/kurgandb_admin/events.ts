
import type { EventTableOpen, EventRecordChange, EventRecordsInsert, EventRecordsRemoveLight, EventRecordsRemove } from "@artempoletsky/kurgandb/globals";

// uncomment ater pressing `generate globals` button on the scripts page
// import { User, UserFull, UserLight, UsersMeta } from "@/globals";
type TableEventsDeclaration = Record<string, (event: any) => void>

// example of the event type declaration
// EventTableOpen<UserFull, string, UsersMeta, UserFull, UserLight, User>
export const users: TableEventsDeclaration = {
  "tableOpen": ({ $ }: EventTableOpen<any, string, any, any, any, any>) => {
    const tableName = "users";
    $.log(`Table '${tableName}' has been opened.`, "", "info");
  },
  "recordChange:password": ({ $, newValue, oldValue, record, table }: EventRecordChange<any, string, any, any, any, any, string>) => {
    $.log(`User '${record.username}' has changed his password from '${oldValue}' to '${newValue}'`, "", "info");
  },
  "recordsInsert": ({ $, records }: EventRecordsInsert<any, string, any, any, any, any>) => {
    $.log(`Added '${records.length}' records`, records.map(r => r.username).join(", "), "info");
  },
  "recordsRemoveLight": ({ $, records }: EventRecordsRemoveLight<any, string, any, any, any, any>) => {
    $.log(`Removed '${records.length}' records`, records.map(r => r.username).join(", "), "info");
  },
  "recordsRemove": ({ $, records }: EventRecordsRemove<any, string, any, any, any, any>) => {
    $.log(`Removed '${records.length}' records`, records.map(r => r.username).join(", "), "info");
  },
}

