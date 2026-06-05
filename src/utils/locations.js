export const LOCATIONS = [
  { value: 'male',       label: 'Malé' },
  { value: 'hulhumale1', label: 'Hulhumalé Phase 1' },
  { value: 'hulhumale2', label: 'Hulhumalé Phase 2' },
  { value: 'maafushi',   label: 'Maafushi' },
  { value: 'addu',       label: 'Addu City' },
  { value: 'fuvahmulah', label: 'Fuvahmulah' },
  { value: 'dhaalu',     label: 'Dhaalu Atoll' },
  { value: 'other',      label: 'Other Islands' },
];

export const LOCATION_MAP = Object.fromEntries(
  LOCATIONS.map(({ value, label }) => [value, label])
);
