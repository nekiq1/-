import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-ink px-4 py-16 text-cream">
      <Link to="/" className="text-sm text-gold">
        На главную
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic">Политика обработки персональных данных</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-mute">
        <p>Документ относится только к заявке на визит и подписке на письма салона Neo SPA. Шаблон нужно сверить с вашими реквизитами в админ-панели до публикации.</p>
        <section>
          <h2 className="font-serif text-2xl text-cream">1. Цели</h2>
          <p className="mt-2">Запись на ритуал, связь по заявке, выдача сертификата. Письма о свободных окнах — только если отмечен отдельный чекбокс.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-cream">2. Какие данные</h2>
          <p className="mt-2">Имя, телефон, по желанию соцсеть, ник, дата визита и комментарий. Для подписки — адрес почты. Паспорт и адрес проживания не запрашиваем.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-cream">3. Основание</h2>
          <p className="mt-2">Согласие, которое вы ставите сами. Галочки по умолчанию нет. Согласие на запись и согласие на рекламу разделены.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-cream">4. Кто</h2>
          <p className="mt-2">Гости салона, которые сами отправили форму. Оператор — лицо, чьи реквизиты указаны в подвале сайта.</p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-cream">5. Срок и удаление</h2>
          <p className="mt-2">Заявка хранится, пока нужна для визита, и не дольше 1 года. Удаление — по запросу на почту из подвала. В этой версии сайта записи лежат в браузере администратора, а не на иностранном сервере.</p>
        </section>
      </div>
    </main>
  );
}
