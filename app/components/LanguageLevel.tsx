
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
    case "lg": sizeClass = "font-5xl"; break;
    case "sm": sizeClass = ""; break;
  }

  let colorClass = "";
  switch (level) {
    case "a0": sizeClass = "font-gray-500"; break;
    case "a1": sizeClass = "font-red-500"; break;
    case "a2": sizeClass = "font-pink-500"; break;
    case "b1": sizeClass = "font-blue-500"; break;
    case "b1": sizeClass = "font-teal-500"; break;
    case "c1": sizeClass = "font-green-500"; break;
    case "c2": sizeClass = "font-gold-500"; break;
  }

  return <span className={`uppercase ${sizeClass} ${colorClass}`}>{level}</span>
}