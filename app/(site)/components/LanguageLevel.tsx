
import { LanguageLevel } from "~/lib/language_levels";

type Props = {
  level: LanguageLevel | "";
  size?: "sm" | "lg";
}
export default function LanguageLevel({ level, size }: Props) {
  if (!size) size = "sm";
  if (!level) return "";

  let sizeClass = "";
  switch (size) {
    case "sm": sizeClass = "text-xs"; break;
    case "lg": sizeClass = "text-5xl"; break;
  }

  let colorClass = "";
  switch (level) {
    case "a0": colorClass = "bg-gray-500"; break;
    case "a1": colorClass = "bg-red-500"; break;
    case "a2": colorClass = "bg-red-500"; break;
    case "b1": colorClass = "bg-blue-600"; break;
    case "b2": colorClass = "bg-blue-600"; break;
    case "c1": colorClass = "bg-green-700"; break;
    case "c2": colorClass = "bg-yellow-400 text-black border border-gray-500"; break;
  }

  return <span className={`uppercase ${level != "c2" ? "text-white" : ""} rounded ml-[2px] mr-2 px-2 py-1 ${sizeClass} ${colorClass}`}>{level}</span>
}