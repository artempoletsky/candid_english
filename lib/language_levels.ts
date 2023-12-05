
export const Levels = ["a0", 'a1', "a2", 'b1', "b2", 'c1', "c2"] as const;
export type LanguageLevel = typeof Levels[number];

export function asNumber(level: LanguageLevel) {
  return Levels.indexOf(level);
}

export function asDict(levels: LanguageLevel[]): Record<LanguageLevel, string> {
  return levels.reduce((res: Record<string, string>, level: LanguageLevel) => {
    res[level] = userView(level);
    return res;
  }, {});
}

export function range(min: LanguageLevel = "a0", max: LanguageLevel = "c2"): LanguageLevel[] {
  const minN = asNumber(min);
  const maxN = asNumber(max);
  const result: LanguageLevel[] = [];
  for (let index = minN; index <= maxN; index++) {
    result.push(Levels[index]);
  }
  return result;
}

export const DictRange = range("a1", "c1");

export function userView(level: LanguageLevel): string {
  return level.toUpperCase();
}

export function inc(level: LanguageLevel): LanguageLevel {
  return Levels[asNumber(level) + 1];
}

export function dec(level: LanguageLevel): LanguageLevel {
  return Levels[asNumber(level) - 1];
}

