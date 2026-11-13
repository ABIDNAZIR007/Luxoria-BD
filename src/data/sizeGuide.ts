export interface ShoeSizeRow {
  eu: string;
  uk: string;
  us: string;
  cm: string;
  inches: string;
}

export interface BeltSizeRow {
  beltTag: string;
  pantWaistInches: string;
  pantWaistCm: string;
  totalLengthCm: string;
  totalLengthInches: string;
}

export const SHOE_SIZE_ROWS: ShoeSizeRow[] = [
  { eu: '40', uk: '6.5', us: '7.5', cm: '25.0 cm', inches: '9.8"' },
  { eu: '41', uk: '7.0', us: '8.0', cm: '25.7 cm', inches: '10.1"' },
  { eu: '42', uk: '8.0', us: '9.0', cm: '26.5 cm', inches: '10.4"' },
  { eu: '43', uk: '9.0', us: '10.0', cm: '27.3 cm', inches: '10.7"' },
  { eu: '44', uk: '9.5', us: '10.5', cm: '28.0 cm', inches: '11.0"' },
];

export const BELT_SIZE_ROWS: BeltSizeRow[] = [
  {
    beltTag: '32"',
    pantWaistInches: '30"',
    pantWaistCm: '76 cm',
    totalLengthCm: '95 cm',
    totalLengthInches: '37.5"',
  },
  {
    beltTag: '34"',
    pantWaistInches: '32"',
    pantWaistCm: '81 cm',
    totalLengthCm: '100 cm',
    totalLengthInches: '39.5"',
  },
  {
    beltTag: '36"',
    pantWaistInches: '34"',
    pantWaistCm: '86 cm',
    totalLengthCm: '105 cm',
    totalLengthInches: '41.5"',
  },
  {
    beltTag: '38"',
    pantWaistInches: '36"',
    pantWaistCm: '91 cm',
    totalLengthCm: '110 cm',
    totalLengthInches: '43.5"',
  },
  {
    beltTag: '40"',
    pantWaistInches: '38"',
    pantWaistCm: '97 cm',
    totalLengthCm: '115 cm',
    totalLengthInches: '45.5"',
  },
];
