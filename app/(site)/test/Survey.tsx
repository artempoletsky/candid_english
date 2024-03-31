import Select from "components/select";
import { asDict, range } from "lib/language_levels";


const Levels = asDict(range());

function injectOptions(injeced: Record<string, string>): Record<string, string> {
  return {
    ...injeced,
    ...Levels,
  }
}

export default function Survey() {
  return <div>
    <p className="mt-5">How do you rate your level of English?</p>
    <Select className="select" name="ownRating" dict={injectOptions({
      x: "I don't know"
    })} />
    <p className="mt-5">How other online English tests rate your level of English (in general)?</p>
    <Select className="select" name="online" dict={injectOptions({
      x: "I haven't tried them"
    })} />
    <p className="mt-5">In case you have taken an official English exam like TOEFL, IELTS, etc. what result did you get?</p>
    <Select className="select" name="certificate" dict={injectOptions({
      x: "I haven't taken one"
    })} />
  </div>
}