
import { TestSession } from "../test/api/route"

export type Session = {
  id: string
  username?: string
  isAdmin: boolean
  activeEnglishTest?: TestSession
}