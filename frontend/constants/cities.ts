export type SimpleCity = { id?: number; name: string };
export type CityGroup = { title: string; cities: SimpleCity[] };

// Regional groups for quick selection. IDs are optional; we'll resolve by name
// against backend cities when available.
export const CITY_GROUPS: CityGroup[] = [
  {
    title: 'Төвийн бүс',
    cities: [
      { name: 'Улаанбаатар' },
      { name: 'Багануур' },
      { name: 'Багахангай' },
      { name: 'Төв' },
    ],
  },
  {
    title: 'Баруун бүс',
    cities: [
      { name: 'Баян-Өлгий' },
      { name: 'Говь-Алтай' },
      { name: 'Завхан' },
      { name: 'Увс' },
      { name: 'Ховд' },
    ],
  },
  {
    title: 'Зүүн бүс',
    cities: [
      { name: 'Дорнод' },
      { name: 'Сүхбаатар' },
      { name: 'Хэнтий' },
    ],
  },
  {
    title: 'Хангайн бүс',
    cities: [
      { name: 'Архангай' },
      { name: 'Булган' },
      { name: 'Өвөрхангай' },
      { name: 'Дархан-Уул' },
      { name: 'Орхон' },
      { name: 'Сэлэнгэ' },
      { name: 'Баянхонгор' },
      { name: 'Хөвсгөл' },
    ],
  },
  {
    title: 'Говийн бүс',
    cities: [
      { name: 'Говьсүмбэр' },
      { name: 'Дорноговь' },
      { name: 'Дундговь' },
      { name: 'Өмнөговь' },
    ],
  },
  {
    title: 'Олон улс',
    cities: [
      { name: 'ОХУ' },
      { name: 'БНХАУ' },
      { name: 'БНКазУ' },
    ],
  },
];


