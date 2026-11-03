import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import {
  hashSecret,
  loadDb,
  money,
  saveDb,
  type CatalogItem,
  type Contacts,
  type SpaDb,
} from "@/lib/spa-db";

type Modal =
  | { kind: "none" }
  | { kind: "book"; item: string }
  | { kind: "card"; item: CatalogItem }
  | { kind: "account" }
  | { kind: "admin" }
  | { kind: "cookie-policy" };

const COSMETICS = [
  { name: "Selvert Thermal", note: "Термальные концентраты для лица" },
  { name: "Sothys", note: "Французская линия для чувствительной кожи" },
  { name: "Tokio Head Spa", note: "Ритуалы и масла для кожи головы" },
  { name: "Tokio Inkarami", note: "Восстановление структуры волоса" },
];

const RULES = [
  { n: "01", q: "Как прийти", a: "Приходите за 10 минут. Опоздание сокращает ритуал, а не следующий визит." },
  { n: "02", q: "Отмена", a: "Бесплатно за 12 часов. Позже визит сгорает или переносится по решению салона." },
  { n: "03", q: "Кому не подходит", a: "Острые воспаления кожи головы, температура, первый триместр — напишите мастеру до визита." },
  { n: "04", q: "Сертификат", a: "Номинал действует 12 месяцев. Сдачу наличными не выдаём, остаток остаётся на сертификате." },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) el.classList.add("rise");
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || started) return;
        started = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1100);
          setN(Math.round(to * (1 - (1 - p) ** 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function NeoSite() {
  const [db, setDb] = useState<SpaDb | null>(null);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<Modal>({ kind: "none" });
  const [adminOn, setAdminOn] = useState(false);
  const [cookieOn, setCookieOn] = useState(false);
  const [toast, setToast] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setDb(loadDb());
    setAdminOn(sessionStorage.getItem("neospa.admin") === "1");
    setCookieOn(localStorage.getItem("neospa.cookie") !== "1");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function commit(next: SpaDb) {
    setDb(next);
    saveDb(next);
  }

  function ping(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  const contactsReady = useMemo(() => {
    if (!db) return false;
    return Boolean(db.contacts.phone || db.contacts.address || db.contacts.email);
  }, [db]);

  if (!db) {
    return <main className="min-h-screen bg-ink" />;
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
          scrolled ? "border-line/80 header-solid" : "border-transparent bg-ink/40 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#top" className="font-serif text-2xl tracking-wide transition hover:text-gold">
            Neo SPA
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-line px-4 py-2 text-xs tracking-widest text-gold uppercase transition active:scale-[0.96] hover:border-gold hover:bg-gold/10"
              onClick={() => setModal({ kind: "account" })}
            >
              Профиль
            </button>
            <button
              type="button"
              aria-label="Меню"
              className="grid size-11 place-items-center rounded-full border border-line text-gold transition active:scale-[0.96] hover:border-gold"
              onClick={() => setMenu(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="menu-panel fixed inset-0 z-50 flex flex-col bg-ink/96 px-6 py-6">
          <div className="flex justify-end">
            <button type="button" aria-label="Закрыть" className="grid size-11 place-items-center text-gold" onClick={() => setMenu(false)}>
              <X />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-3 text-center">
            {[
              ["#about", "О нас"],
              ["#programs", "Программы"],
              ["#passes", "Абонементы"],
              ["#certs", "Сертификаты"],
              ["#care", "Косметика"],
              ["#voices", "Отзывы"],
              ["#rules", "Правила"],
              ["#visit", "Контакты"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="font-serif text-4xl italic transition hover:text-gold"
                onClick={() => setMenu(false)}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      <main id="top">
        <section className="relative flex min-h-screen items-end overflow-hidden pt-16">
          <img src="/spa/hero.jpg" alt="" className="absolute inset-0 size-full object-cover hero-ken" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/25" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16">
            <p className="rise text-xs tracking-[0.35em] text-gold uppercase">Санкт-Петербург</p>
            <h1 className="rise rise-d1 mt-4 max-w-3xl font-serif text-5xl leading-none italic sm:text-7xl">
              Искусство японского расслабления
            </h1>
            <p className="rise rise-d2 mt-5 max-w-md text-mute">
              Голова, лицо и тишина. Ритуалы без спешки и без лишнего шума.
            </p>
            <div className="rise rise-d3 mt-8 flex flex-wrap gap-3">
              <button type="button" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink active:scale-[0.96]" onClick={() => setModal({ kind: "book", item: "Визит" })}>
                Забронировать визит
              </button>
              <a href="#certs" className="rounded-full border border-cream/30 px-6 py-3 text-sm active:scale-[0.96]">
                Приобрести сертификат
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-line bg-panel">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-4">
            <Stat n={5} suffix="+" label="лет" />
            <Stat n={2000} suffix="+" label="гостей" />
            <Stat n={8} label="ритуалов" />
            <div>
              <p className="font-serif text-5xl text-gold">
                <Count to={5} suffix=".0" />
              </p>
              <p className="mt-2 text-xs tracking-widest text-mute uppercase">рейтинг</p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-b border-line py-4 text-gold/70">
          <div className="marquee-track flex w-max gap-10 font-serif text-2xl italic">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex gap-10">
                {db.services.map((s) => (
                  <span key={s.id + i}>{s.title}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <Gallery />

        <Section id="programs" kicker="Программы" title="Восемь ритуалов">
          <div className="grid gap-4 sm:grid-cols-2">
            {db.services.map((item) => (
              <Card key={item.id} item={item} onOpen={() => setModal({ kind: "card", item })} />
            ))}
          </div>
        </Section>

        <Section id="passes" kicker="Абонементы" title="Курс, а не разовый визит">
          <div className="grid gap-4 md:grid-cols-3">
            {db.subscriptions.map((item) => (
              <Card key={item.id} item={item} onOpen={() => setModal({ kind: "card", item })} />
            ))}
          </div>
        </Section>

        <Section id="certs" kicker="Сертификаты" title="Подарок без выбора за человека">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {db.certificates.map((item) => (
              <button
                key={item.id}
                type="button"
                className="card-hover rounded-3xl border border-line bg-panel p-5 text-left active:scale-[0.98]"
                onClick={() => setModal({ kind: "card", item })}
              >
                <p className="text-xs tracking-widest text-gold uppercase">{item.meta}</p>
                <h3 className="mt-3 font-serif text-3xl">{item.title}</h3>
                <p className="mt-2 text-sm text-mute">{item.text}</p>
                <p className="mt-6 font-serif text-2xl text-gold">{money(item.price)}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section id="care" kicker="Косметика" title="То, чем работаем в кабинете">
          <div className="grid gap-3 sm:grid-cols-2">
            {COSMETICS.map((b) => (
              <div key={b.name} className="rounded-3xl border border-line bg-panel p-6">
                <h3 className="font-serif text-3xl">{b.name}</h3>
                <p className="mt-2 text-sm text-mute">{b.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="voices" kicker="Отзывы" title="После визита">
          <div className="grid gap-4 md:grid-cols-3">
            {db.reviews.map((r) => (
              <figure key={r.id} className="flex flex-col rounded-3xl border border-line bg-panel p-6">
                <p className="tracking-[0.3em] text-gold">{"★".repeat(r.stars)}</p>
                <blockquote className="mt-4 flex-1 font-serif text-2xl italic leading-snug">{r.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid size-11 place-items-center rounded-full border border-line font-serif text-xl text-gold">
                    {r.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm">{r.name}</span>
                    <span className="text-xs tracking-wider text-mute uppercase">{r.meta}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="rules" kicker="Что нужно знать" title="Правила визита">
          <div className="border-y border-line">
            {RULES.map((rule) => (
              <details key={rule.n} className="rule-item group border-b border-line py-4 last:border-b-0">
                <summary className="flex cursor-pointer list-none items-baseline gap-4 transition hover:text-gold">
                  <span className="font-serif text-2xl text-gold">{rule.n}</span>
                  <span className="text-lg">{rule.q}</span>
                </summary>
                <div className="rule-body">
                  <p className="mt-2 max-w-xl pl-12 text-sm text-mute">{rule.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Section id="visit" kicker="Контакты" title={contactsReady ? "Как нас найти" : "Контакты ещё не заданы"}>
          {contactsReady ? (
            <address className="grid gap-3 not-italic text-mute sm:grid-cols-2">
              {db.contacts.phone ? <p>Телефон: <a className="text-cream" href={`tel:${db.contacts.phone}`}>{db.contacts.phone}</a></p> : null}
              {db.contacts.address ? <p>Адрес: <span className="text-cream">{db.contacts.address}</span></p> : null}
              {db.contacts.hours ? <p>Часы: <span className="text-cream">{db.contacts.hours}</span></p> : null}
              {db.contacts.email ? <p>Почта: <a className="text-cream" href={`mailto:${db.contacts.email}`}>{db.contacts.email}</a></p> : null}
              {db.contacts.telegram ? <p>Telegram: <span className="text-cream">{db.contacts.telegram}</span></p> : null}
            </address>
          ) : (
            <p className="max-w-md text-mute">Телефон, адрес и мессенджеры появятся здесь, когда их заполнят в профиле администратора.</p>
          )}
          <button type="button" className="mt-8 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink active:scale-[0.96]" onClick={() => setModal({ kind: "book", item: "Визит" })}>
            Оставить заявку
          </button>
        </Section>
      </main>

      <footer className="border-t border-line px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-mute sm:flex-row sm:justify-between">
          <div>
            <p className="font-serif text-2xl text-cream">Neo SPA</p>
            {db.contacts.legalName ? <p className="mt-2">{db.contacts.legalName}</p> : <p className="mt-2">Реквизиты салона задаются в админ-панели.</p>}
            {db.contacts.inn ? <p>ИНН {db.contacts.inn}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link to="/privacy" className="text-gold">
              Политика обработки персональных данных
            </Link>
            <button type="button" className="text-left text-gold sm:text-right" onClick={() => setModal({ kind: "cookie-policy" })}>
              Файлы cookie
            </button>
          </div>
        </div>
      </footer>

      {cookieOn ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel px-4 py-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-mute">
              На сайте только технические cookie, чтобы запомнить ваш выбор. Аналитики нет.{" "}
              <button type="button" className="text-gold underline" onClick={() => setModal({ kind: "cookie-policy" })}>
                Подробнее
              </button>
            </p>
            <button
              type="button"
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink active:scale-[0.96]"
              onClick={() => {
                localStorage.setItem("neospa.cookie", "1");
                setCookieOn(false);
              }}
            >
              Принять
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <p className="toast-anim fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-panel px-4 py-2 text-sm shadow-lg">{toast}</p>
      ) : null}

      {modal.kind === "card" ? (
        <Overlay onClose={() => setModal({ kind: "none" })}>
          <img src={modal.item.image ?? "/spa/ritual.jpg"} alt="" className="mb-4 h-48 w-full rounded-2xl object-cover" />
          <p className="text-xs tracking-widest text-gold uppercase">{modal.item.meta}</p>
          <h2 className="mt-2 font-serif text-4xl">{modal.item.title}</h2>
          <p className="mt-3 text-mute">{modal.item.text}</p>
          <p className="mt-4 font-serif text-3xl text-gold">{money(modal.item.price)}</p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-gold py-3 font-semibold text-ink"
            onClick={() => setModal({ kind: "book", item: modal.item.title })}
          >
            Записаться
          </button>
        </Overlay>
      ) : null}

      {modal.kind === "book" ? (
        <BookForm
          item={modal.item}
          onClose={() => setModal({ kind: "none" })}
          onSave={(order) => {
            commit({ ...db, orders: [order, ...db.orders] });
            setModal({ kind: "none" });
            ping("Заявка сохранена. Салон увидит её в профиле.");
          }}
        />
      ) : null}

      {modal.kind === "account" ? (
        <Account
          db={db}
          adminOn={adminOn}
          onClose={() => setModal({ kind: "none" })}
          onCommit={commit}
          onAdmin={() => {
            setAdminOn(true);
            sessionStorage.setItem("neospa.admin", "1");
            setModal({ kind: "admin" });
          }}
          onSubscribed={() => ping("Адрес записан.")}
        />
      ) : null}

      {modal.kind === "admin" && adminOn ? (
        <Admin
          db={db}
          onClose={() => setModal({ kind: "none" })}
          onCommit={commit}
          onLogout={() => {
            setAdminOn(false);
            sessionStorage.removeItem("neospa.admin");
            setModal({ kind: "none" });
          }}
        />
      ) : null}

      {modal.kind === "cookie-policy" ? (
        <Overlay onClose={() => setModal({ kind: "none" })}>
          <h2 className="font-serif text-4xl">Cookie</h2>
          <p className="mt-3 text-sm text-mute">
            Храним только ваш ответ на этот баннер и данные, которые вы сами вводите в админке этого браузера.
            Сторонних счётчиков, пикселей и рекламных cookie нет.
          </p>
        </Overlay>
      ) : null}
    </div>
  );
}

function Stat({ n, suffix = "", label }: { n: number; suffix?: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-5xl text-gold">
        <Count to={n} suffix={suffix} />
      </p>
      <p className="mt-2 text-xs tracking-widest text-mute uppercase">{label}</p>
    </div>
  );
}

function Gallery() {
  const shots = [
    ["/spa/hero.jpg", "Head SPA"],
    ["/spa/onsen.jpg", "Japanese Face"],
    ["/spa/ritual.jpg", "Tokyo Ritual"],
    ["/spa/stone.jpg", "Deep Care"],
  ] as const;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs tracking-[0.3em] text-gold uppercase">Кабинет</p>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {shots.map(([src, label]) => (
          <figure key={label} className="ken relative h-96 w-64 shrink-0 overflow-hidden rounded-3xl">
            <img src={src} alt="" className="size-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs tracking-widest uppercase">
              {label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section id={id} ref={ref} className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs tracking-[0.3em] text-gold uppercase">{kicker}</p>
      <h2 className="mt-2 font-serif text-4xl italic sm:text-5xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Card({ item, onOpen }: { item: CatalogItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="card-hover overflow-hidden rounded-3xl border border-line bg-panel text-left">
      {item.image ? (
        <div className="overflow-hidden">
          <img src={item.image} alt="" className="h-44 w-full object-cover" />
        </div>
      ) : null}
      <div className="p-5">
        <p className="text-xs tracking-widest text-gold uppercase">{item.meta}</p>
        <h3 className="mt-2 font-serif text-3xl">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-mute">{item.text}</p>
        <p className="mt-4 font-serif text-2xl text-gold">{money(item.price)}</p>
      </div>
    </button>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="overlay-bg fixed inset-0 z-50 grid place-items-end bg-ink/70 p-3 sm:place-items-center" onClick={onClose}>
      <div
        className="modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex justify-end">
          <button type="button" aria-label="Закрыть" onClick={onClose} className="text-mute transition hover:text-cream">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block text-xs tracking-wider text-mute uppercase">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-line bg-ink px-3 py-3 text-sm text-cream outline-none focus:border-gold";

function BookForm({
  item,
  onClose,
  onSave,
}: {
  item: string;
  onClose: () => void;
  onSave: (order: SpaDb["orders"][number]) => void;
}) {
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [err, setErr] = useState("");

  return (
    <Overlay onClose={onClose}>
      <h2 className="font-serif text-4xl">Запись</h2>
      <p className="mt-1 text-sm text-gold">{item}</p>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name") ?? "").trim();
          const phone = String(fd.get("phone") ?? "").trim();
          if (name.length < 2 || phone.length < 6) {
            setErr("Имя и телефон обязательны.");
            return;
          }
          if (!consent) {
            setErr("Нужно отдельное согласие на обработку данных.");
            return;
          }
          onSave({
            id: crypto.randomUUID(),
            name,
            phone,
            social: String(fd.get("social") ?? ""),
            nick: String(fd.get("nick") ?? ""),
            when: String(fd.get("when") ?? ""),
            comment: String(fd.get("comment") ?? ""),
            item,
            marketing,
            createdAt: new Date().toISOString(),
          });
        }}
      >
        <Field label="Имя"><input name="name" required className={inputCls} autoComplete="name" /></Field>
        <Field label="Телефон"><input name="phone" required className={inputCls} autoComplete="tel" inputMode="tel" /></Field>
        <Field label="Соцсеть"><input name="social" className={inputCls} /></Field>
        <Field label="Ник"><input name="nick" className={inputCls} /></Field>
        <Field label="Дата и время"><input name="when" type="datetime-local" className={inputCls} /></Field>
        <Field label="Комментарий"><textarea name="comment" className={inputCls} rows={3} /></Field>
        <label className="mt-2 flex items-start gap-3 text-sm text-mute">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4" />
          <span>
            Даю согласие на обработку персональных данных для записи на визит.{" "}
            <Link to="/privacy" className="text-gold underline">Политика</Link>
          </span>
        </label>
        <label className="mt-3 flex items-start gap-3 text-sm text-mute">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 size-4" />
          <span>Хочу редкие сообщения о свободных окнах. Это не обязательно.</span>
        </label>
        {err ? <p className="mt-3 text-sm text-danger">{err}</p> : null}
        <button type="submit" className="mt-5 w-full rounded-full bg-gold py-3 font-semibold text-ink">Отправить</button>
      </form>
    </Overlay>
  );
}

function Account({
  db,
  adminOn,
  onClose,
  onCommit,
  onAdmin,
  onSubscribed,
}: {
  db: SpaDb;
  adminOn: boolean;
  onClose: () => void;
  onCommit: (db: SpaDb) => void;
  onAdmin: () => void;
  onSubscribed: () => void;
}) {
  const [tab, setTab] = useState<"sub" | "admin">("sub");
  const [err, setErr] = useState("");
  const hasPass = Boolean(db.adminHash);

  return (
    <Overlay onClose={onClose}>
      <h2 className="font-serif text-4xl">Профиль</h2>
      <p className="mt-1 mb-4 text-sm text-mute">Подписка и доступ к панели салона</p>
      <div className="mb-4 flex gap-2">
        <button type="button" className={`rounded-full px-4 py-2 text-sm transition ${tab === "sub" ? "bg-gold text-ink" : "border border-line hover:border-gold"}`} onClick={() => setTab("sub")}>Подписка</button>
        <button type="button" className={`rounded-full px-4 py-2 text-sm transition ${tab === "admin" ? "bg-gold text-ink" : "border border-line hover:border-gold"}`} onClick={() => setTab("admin")}>Админ</button>
      </div>
      {tab === "sub" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
            if (!email.includes("@")) return;
            onCommit({
              ...db,
              subscribers: [{ id: crypto.randomUUID(), email, createdAt: new Date().toISOString() }, ...db.subscribers],
            });
            onSubscribed();
            onClose();
          }}
        >
          <Field label="Email">
            <input name="email" type="email" required className={inputCls} />
          </Field>
          <label className="mb-4 flex items-start gap-3 text-sm text-mute">
            <input type="checkbox" required className="mt-1 size-4" />
            <span>Согласен получать письма. Галочка не стоит заранее. <Link to="/privacy" className="text-gold underline">Политика</Link></span>
          </label>
          <button className="w-full rounded-full bg-gold py-3 font-semibold text-ink" type="submit">Подписаться</button>
        </form>
      ) : adminOn ? (
        <button type="button" className="w-full rounded-full bg-gold py-3 font-semibold text-ink" onClick={onAdmin}>Открыть панель</button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const pass = String(fd.get("pass") ?? "");
            if (pass.length < 6) {
              setErr("Пароль от 6 символов.");
              return;
            }
            const hash = await hashSecret(pass);
            if (!hasPass) {
              onCommit({ ...db, adminHash: hash });
              onAdmin();
              return;
            }
            if (hash !== db.adminHash) {
              setErr("Неверный пароль.");
              return;
            }
            onAdmin();
          }}
        >
          <p className="mb-3 text-sm text-mute">{hasPass ? "Вход в панель салона." : "Первый вход: задайте пароль администратора. Его увидите только вы."}</p>
          <Field label="Пароль"><input name="pass" type="password" required className={inputCls} autoComplete="current-password" /></Field>
          {err ? <p className="mb-3 text-sm text-danger">{err}</p> : null}
          <button className="w-full rounded-full bg-gold py-3 font-semibold text-ink" type="submit">{hasPass ? "Войти" : "Создать доступ"}</button>
        </form>
      )}
    </Overlay>
  );
}

const TABS = [
  ["services", "Услуги"],
  ["subscriptions", "Абонементы"],
  ["certificates", "Сертификаты"],
  ["reviews", "Отзывы"],
  ["contacts", "Контакты"],
  ["orders", "Заявки"],
  ["subscribers", "Подписчики"],
] as const;

function Admin({ db, onClose, onCommit, onLogout }: { db: SpaDb; onClose: () => void; onCommit: (db: SpaDb) => void; onLogout: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("services");
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/80 p-3" onClick={onClose}>
      <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-panel p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-4xl">Админ</h2>
          <button type="button" onClick={onClose} aria-label="Закрыть"><X /></button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" className={`shrink-0 rounded-full px-3 py-2 text-xs tracking-wider uppercase ${tab === id ? "bg-gold text-ink" : "border border-line"}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        {tab === "contacts" ? <ContactsForm contacts={db.contacts} onSave={(contacts) => onCommit({ ...db, contacts })} /> : null}
        {tab === "orders" ? <PlainList rows={db.orders.map((o) => `${o.name} · ${o.phone} · ${o.item}`)} empty="Заявок нет" onDelete={(i) => onCommit({ ...db, orders: db.orders.filter((_, n) => n !== i) })} /> : null}
        {tab === "subscribers" ? <PlainList rows={db.subscribers.map((s) => s.email)} empty="Подписчиков нет" onDelete={(i) => onCommit({ ...db, subscribers: db.subscribers.filter((_, n) => n !== i) })} /> : null}
        {tab === "reviews" ? (
          <ReviewEditor reviews={db.reviews} onChange={(reviews) => onCommit({ ...db, reviews })} />
        ) : null}
        {tab === "services" || tab === "subscriptions" || tab === "certificates" ? (
          <CatalogEditor
            items={db[tab]}
            onChange={(items) => onCommit({ ...db, [tab]: items })}
          />
        ) : null}
        <button type="button" className="mt-6 text-sm text-mute" onClick={onLogout}>Выйти</button>
      </div>
    </div>
  );
}

function CatalogEditor({ items, onChange }: { items: CatalogItem[]; onChange: (items: CatalogItem[]) => void }) {
  const [draft, setDraft] = useState<CatalogItem | null>(null);
  return (
    <div className="mt-4">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
          <span>{item.title} <span className="text-gold">{money(item.price)}</span></span>
          <span className="flex gap-2">
            <button type="button" className="text-sm text-gold" onClick={() => setDraft(item)}>править</button>
            <button type="button" className="text-sm text-danger" onClick={() => onChange(items.filter((_, n) => n !== i))}>удалить</button>
          </span>
        </div>
      ))}
      {draft ? (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next: CatalogItem = {
              ...draft,
              title: String(fd.get("title")),
              text: String(fd.get("text")),
              price: Number(fd.get("price")) || 0,
              meta: String(fd.get("meta") ?? ""),
            };
            const exists = items.some((x) => x.id === next.id);
            onChange(exists ? items.map((x) => (x.id === next.id ? next : x)) : [next, ...items]);
            setDraft(null);
          }}
        >
          <Field label="Название"><input name="title" defaultValue={draft.title} className={inputCls} required /></Field>
          <Field label="Текст"><textarea name="text" defaultValue={draft.text} className={inputCls} rows={3} /></Field>
          <Field label="Цена"><input name="price" type="number" defaultValue={draft.price} className={inputCls} /></Field>
          <Field label="Метка"><input name="meta" defaultValue={draft.meta} className={inputCls} /></Field>
          <button className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink" type="submit">Сохранить</button>
        </form>
      ) : (
        <button
          type="button"
          className="mt-4 text-sm text-gold"
          onClick={() => setDraft({ id: crypto.randomUUID(), title: "", text: "", price: 0, meta: "" })}
        >
          + Добавить
        </button>
      )}
    </div>
  );
}

function ReviewEditor({ reviews, onChange }: { reviews: SpaDb["reviews"]; onChange: (r: SpaDb["reviews"]) => void }) {
  return (
    <div className="mt-4">
      {reviews.map((r, i) => (
        <div key={r.id} className="flex justify-between border-b border-line py-3">
          <span>{r.name}</span>
          <button type="button" className="text-sm text-danger" onClick={() => onChange(reviews.filter((_, n) => n !== i))}>удалить</button>
        </div>
      ))}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onChange([
            { id: crypto.randomUUID(), name: String(fd.get("name")), text: String(fd.get("text")), meta: String(fd.get("meta")), stars: 5 },
            ...reviews,
          ]);
          e.currentTarget.reset();
        }}
      >
        <Field label="Имя"><input name="name" required className={inputCls} /></Field>
        <Field label="Услуга"><input name="meta" className={inputCls} /></Field>
        <Field label="Текст"><textarea name="text" required className={inputCls} rows={3} /></Field>
        <button className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink" type="submit">Добавить отзыв</button>
      </form>
    </div>
  );
}

function ContactsForm({ contacts, onSave }: { contacts: Contacts; onSave: (c: Contacts) => void }) {
  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
          phone: String(fd.get("phone") ?? ""),
          address: String(fd.get("address") ?? ""),
          email: String(fd.get("email") ?? ""),
          telegram: String(fd.get("telegram") ?? ""),
          hours: String(fd.get("hours") ?? ""),
          legalName: String(fd.get("legalName") ?? ""),
          inn: String(fd.get("inn") ?? ""),
        });
      }}
    >
      {(
        [
          ["phone", "Телефон", contacts.phone],
          ["address", "Адрес", contacts.address],
          ["email", "Email", contacts.email],
          ["telegram", "Telegram", contacts.telegram],
          ["hours", "Часы", contacts.hours],
          ["legalName", "Наименование / ФИО", contacts.legalName],
          ["inn", "ИНН", contacts.inn],
        ] as const
      ).map(([name, label, value]) => (
        <Field key={name} label={label}>
          <input name={name} defaultValue={value} className={inputCls} />
        </Field>
      ))}
      <button className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink" type="submit">Сохранить контакты</button>
    </form>
  );
}

function PlainList({ rows, empty, onDelete }: { rows: string[]; empty: string; onDelete: (i: number) => void }) {
  if (!rows.length) return <p className="mt-4 text-mute">{empty}</p>;
  return (
    <ul className="mt-4">
      {rows.map((row, i) => (
        <li key={row + i} className="flex justify-between gap-3 border-b border-line py-3 text-sm">
          <span>{row}</span>
          <button type="button" className="text-danger" onClick={() => onDelete(i)}>удалить</button>
        </li>
      ))}
    </ul>
  );
}
