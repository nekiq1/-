export type CatalogItem = {
  id: string;
  title: string;
  text: string;
  price: number;
  meta?: string;
  image?: string;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  stars: number;
  meta: string;
};

export type Contacts = {
  phone: string;
  address: string;
  email: string;
  telegram: string;
  hours: string;
  legalName: string;
  inn: string;
};

export type Order = {
  id: string;
  name: string;
  phone: string;
  social: string;
  nick: string;
  when: string;
  comment: string;
  item: string;
  marketing: boolean;
  createdAt: string;
};

export type Subscriber = { id: string; email: string; createdAt: string };

export type SpaDb = {
  services: CatalogItem[];
  subscriptions: CatalogItem[];
  certificates: CatalogItem[];
  reviews: Review[];
  contacts: Contacts;
  orders: Order[];
  subscribers: Subscriber[];
  adminHash: string;
};

const H = "/spa/hero.jpg";
const R = "/spa/ritual.jpg";
const O = "/spa/onsen.jpg";
const S = "/spa/stone.jpg";

export const EMPTY_CONTACTS: Contacts = {
  phone: "",
  address: "",
  email: "",
  telegram: "",
  hours: "",
  legalName: "",
  inn: "",
};

export function defaultDb(): SpaDb {
  return {
    adminHash: "",
    contacts: { ...EMPTY_CONTACTS },
    orders: [],
    subscribers: [],
    services: [
      { id: "s1", title: "Barber & Head SPA", text: "Стрижка и расслабление кожи головы в одном визите: тёплый пар, массаж и укладка.", price: 4500, meta: "90 мин", image: H },
      { id: "s2", title: "Classic Head SPA", text: "Классический ритуал для кожи головы: очищение, масло и медленный массаж.", price: 3900, meta: "60 мин", image: R },
      { id: "s3", title: "Japanese Face", text: "Лицо и линия шеи: лимфа, тёплые камни и уход без агрессивных кислот.", price: 5200, meta: "75 мин", image: O },
      { id: "s4", title: "Tokyo Head SPA", text: "Городской ритуал после экрана: давление на точки, тишина, глубокий выдох.", price: 4900, meta: "70 мин", image: S },
      { id: "s5", title: "T-SHOCK", text: "Короткий тонизирующий протокол, когда нужен ясный взгляд за один час.", price: 3500, meta: "45 мин", image: R },
      { id: "s6", title: "Deep Care Tokio Inkarami", text: "Глубокое восстановление волос и кожи головы по японскому протоколу.", price: 6800, meta: "90 мин", image: H },
      { id: "s7", title: "Три-комплекс", text: "Голова, лицо и шея в одной сессии. Самый полный вечер в салоне.", price: 8900, meta: "120 мин", image: O },
      { id: "s8", title: "Selvert Thermal", text: "Термальный уход для кожи: минералы, тёплые полотенца, ровный тон.", price: 5600, meta: "80 мин", image: S },
    ],
    subscriptions: [
      { id: "a1", title: "Classic Head SPA", text: "4, 6 или 10 визитов. Масло и массаж кожи головы по фиксированной цене.", price: 14800, meta: "от 4 визитов", image: R },
      { id: "a2", title: "Japanese Face", text: "Курс для лица: 4, 6 или 10 сессий с одним мастером.", price: 19600, meta: "от 4 визитов", image: O },
      { id: "a3", title: "Tokyo Head SPA", text: "Абонемент на токийский ритуал. 4, 6 или 10 процедур.", price: 18400, meta: "от 4 визитов", image: H },
    ],
    certificates: [
      { id: "c1", title: "Сертификат 3 000 ₽", text: "Именной сертификат на любую услугу в пределах суммы.", price: 3000, meta: "12 месяцев" },
      { id: "c2", title: "Сертификат 5 000 ₽", text: "Подойдёт на короткий ритуал или как дополнение к визиту.", price: 5000, meta: "12 месяцев" },
      { id: "c3", title: "Сертификат 7 000 ₽", text: "Спокойный подарок без выбора конкретной процедуры.", price: 7000, meta: "12 месяцев" },
      { id: "c4", title: "Сертификат 10 000 ₽", text: "Хватает на полный ритуал головы или лица.", price: 10000, meta: "12 месяцев" },
      { id: "c5", title: "Сертификат 15 000 ₽", text: "Вечер для двоих или один длинный комплекс.", price: 15000, meta: "12 месяцев" },
      { id: "c6", title: "Сертификат 20 000 ₽", text: "Крупный номинал. Остаток можно добрать на месте.", price: 20000, meta: "12 месяцев" },
      { id: "c7", title: "Сертификат 25 000 ₽", text: "Максимальный открытый номинал.", price: 25000, meta: "12 месяцев" },
      { id: "c8", title: "Абонемент Classic", text: "Сертификат на курс Classic Head SPA.", price: 14800, meta: "курс" },
      { id: "c9", title: "Абонемент Face", text: "Сертификат на курс Japanese Face.", price: 19600, meta: "курс" },
      { id: "c10", title: "Абонемент Tokyo", text: "Сертификат на курс Tokyo Head SPA.", price: 18400, meta: "курс" },
    ],
    reviews: [
      { id: "r1", name: "Марина", meta: "Classic Head SPA", stars: 5, text: "Ушла без телефона в голове. Мастер не торопил и не продавал лишнего." },
      { id: "r2", name: "Алексей", meta: "Tokyo Head SPA", stars: 5, text: "После недели за экраном это единственное, что реально снимает зажим в шее." },
      { id: "r3", name: "Ева", meta: "Japanese Face", stars: 5, text: "Тихий кабинет, тёплые руки, никакой музыки из колонки у уха." },
    ],
  };
}

const KEY = "neospa.db.v1";

export function loadDb(): SpaDb {
  if (typeof window === "undefined") return defaultDb();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDb();
    const parsed = JSON.parse(raw) as SpaDb;
    const base = defaultDb();
    return {
      ...base,
      ...parsed,
      contacts: { ...base.contacts, ...parsed.contacts },
      services: parsed.services?.length ? parsed.services : base.services,
      subscriptions: parsed.subscriptions?.length ? parsed.subscriptions : base.subscriptions,
      certificates: parsed.certificates?.length ? parsed.certificates : base.certificates,
      reviews: parsed.reviews?.length ? parsed.reviews : base.reviews,
      orders: parsed.orders ?? [],
      subscribers: parsed.subscribers ?? [],
      adminHash: parsed.adminHash ?? "",
    };
  } catch {
    return defaultDb();
  }
}

export function saveDb(db: SpaDb) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export async function hashSecret(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`neospa:${value}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function money(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}
