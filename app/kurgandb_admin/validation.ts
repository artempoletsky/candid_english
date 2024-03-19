
import { RecordValidator } from "@artempoletsky/kurgandb/globals";

export const users: RecordValidator = (users, { z }) => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getUTCFullYear() - 18);

  return z.object({
    username: z.string().min(1, "Required"),
    password: z.string().length(32, "Must be an md5 hash"),
    isAdmin: z.boolean(),
    about: z.string().max(1024, "Description is too long!"),
    birthDate: z.coerce.date().max(maxDate),
  });
}
