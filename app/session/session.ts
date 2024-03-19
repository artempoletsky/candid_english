import { TestSession } from "../test/test_methods"

export type Session = {
  id: string
  username?: string
  isAdmin: boolean
  activeEnglishTest?: TestSession
}