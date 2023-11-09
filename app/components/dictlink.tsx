type ServiceLiteral = "reverso" | "oxford" | "urban" | "google";

type DictLinkOptions = {
  className?: string,
  word: {
    id: string,
    word: string,
  },
  type?: "icon" | "anchor",
  service?: ServiceLiteral
};

const REVERSO_LANG = "russian";

const ServiceNameDict: Record<ServiceLiteral, string> = {
  reverso: "Reverso",
  oxford: "Oxford learner's dictionary",
  urban: "Urban dictionary",
  google: "Google",
}

function getLink(service: ServiceLiteral, id: string) {
  switch (service) {
    case "oxford": return `https://www.oxfordlearnersdictionaries.com/definition/english/${id}`;
    case "reverso": return `https://context.reverso.net/translation/english-${REVERSO_LANG}/${id}`;
    case "urban": return `https://www.urbandictionary.com/define.php?term=${id}`;
    case "google": return `https://www.google.com/search?q=${id}`;
  }
}

export default function DictLink({ className = "", word, service = "oxford", type = "icon" }: DictLinkOptions) {

  return (
    <a
      className={type == "icon" ? "small icon " + service + " " + className : className}
      title={`Search word on ${ServiceNameDict[service]}`}
      target="_blank"
      href={getLink(service, word.id)}>{type == "anchor" ? word.word : ""}</a>
  )
}

