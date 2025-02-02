export type Range<Start extends number, Stop extends number[] = []> = Stop['length'] extends Start
  ? Stop[number]
  : Range<Start, [...Stop, Stop['length']]>
