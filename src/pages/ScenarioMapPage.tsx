import { Link } from 'react-router-dom';
import s from './ScenarioMapPage.module.css';

type Role = 'Продавец' | 'Покупатель';

type Screen = {
  id: string;
  title: string;
  description: string;
  goal: string;
  step: string;
  kind: 'role' | 'intro' | 'form' | 'review' | 'live' | 'bid' | 'success' | 'end';
  action?: string;
};

const sellerScreens: Screen[] = [
  {
    id: 'seller-role',
    title: 'Выбор роли',
    description: 'Выбирает «Я продаю квартиру».',
    goal: 'auction_role_selected',
    step: 'role_choice',
    kind: 'role',
    action: 'role=seller',
  },
  {
    id: 'seller-intro',
    title: 'Старт продавца',
    description: 'Знакомится с механикой аукциона.',
    goal: 'auction_terms_opened',
    step: 'terms_form',
    kind: 'intro',
    action: 'Открыть условия',
  },
  {
    id: 'seller-form',
    title: 'Условия аукциона',
    description: 'Указывает старт, шаг, срок и резерв.',
    goal: 'auction_terms_validation_error',
    step: 'terms_form',
    kind: 'form',
    action: 'Ошибка валидации',
  },
  {
    id: 'seller-review',
    title: 'Проверка условий',
    description: 'Сверяет параметры перед публикацией.',
    goal: 'auction_terms_reviewed',
    step: 'terms_review',
    kind: 'review',
    action: 'Проверить условия',
  },
  {
    id: 'seller-live',
    title: 'Торги запущены',
    description: 'Следит за ставками и статусом резерва.',
    goal: 'auction_published',
    step: 'auction_live',
    kind: 'live',
    action: 'Опубликовать',
  },
  {
    id: 'seller-end',
    title: 'Итог торгов',
    description: 'Видит продажу или лот без продажи.',
    goal: 'auction_finished',
    step: 'auction_finished',
    kind: 'end',
    action: 'outcome=sold | unsold',
  },
];

const buyerScreens: Screen[] = [
  {
    id: 'buyer-role',
    title: 'Выбор роли',
    description: 'Выбирает «Я хочу купить».',
    goal: 'auction_role_selected',
    step: 'role_choice',
    kind: 'role',
    action: 'role=buyer',
  },
  {
    id: 'buyer-lot',
    title: 'Карточка лота',
    description: 'Изучает квартиру и условия торгов.',
    goal: 'auction_role_selected',
    step: 'role_choice',
    kind: 'live',
    action: 'Переход после выбора роли',
  },
  {
    id: 'buyer-bid',
    title: 'Ставка',
    description: 'Вводит сумму не ниже минимальной.',
    goal: 'auction_bid_validation_error',
    step: 'bid_form',
    kind: 'bid',
    action: 'Сделать ставку',
  },
  {
    id: 'buyer-pending',
    title: 'Ожидание ответа',
    description: 'Кнопка занята, ставка отправляется.',
    goal: 'auction_bid_attempted',
    step: 'bid_pending',
    kind: 'bid',
    action: 'state=pending',
  },
  {
    id: 'buyer-success',
    title: 'Статус ставки',
    description: 'Видит принятую ставку или ошибку ответа.',
    goal: 'auction_bid_response',
    step: 'bid_success / bid_error',
    kind: 'success',
    action: 'result=success | error',
  },
  {
    id: 'buyer-end',
    title: 'Итог торгов',
    description: 'Узнаёт, выиграл ли аукцион.',
    goal: 'auction_finished',
    step: 'auction_finished',
    kind: 'end',
    action: 'outcome=sold | unsold',
  },
];

function MiniScreen({ kind }: Pick<Screen, 'kind'>) {
  const content = {
    role: (
      <>
        <i className={s.miniBadge}>Аукцион</i>
        <b>Как вы участвуете?</b>
        <span className={s.miniChoice}>Я продаю квартиру</span>
        <span className={s.miniChoice}>Я хочу купить</span>
      </>
    ),
    intro: (
      <>
        <i className={s.miniBadge}>Ваша квартира</i>
        <b>Лучшая цена для квартиры</b>
        <p>Вы сами задаёте условия.</p>
        <em>Задать условия</em>
      </>
    ),
    form: (
      <>
        <b>Условия аукциона</b>
        <label>
          Стартовая цена <u />
        </label>
        <label>
          Минимальный шаг <u />
        </label>
        <label>
          Завершится <u />
        </label>
        <em>Проверить</em>
      </>
    ),
    review: (
      <>
        <i className={s.miniBadge}>Проверка</i>
        <b>Всё готово</b>
        <p>Стартовая цена · 14,5 млн</p>
        <p>Шаг · 100 тыс.</p>
        <em>Опубликовать</em>
      </>
    ),
    live: (
      <>
        <i className={s.miniPositive}>Аукцион открыт</i>
        <b>Текущая ставка</b>
        <strong>14,6 млн ₽</strong>
        <p>Шаг · 100 тыс. · 1 ставка</p>
      </>
    ),
    bid: (
      <>
        <i className={s.miniBadge}>Аукцион открыт</i>
        <b>Ваша ставка</b>
        <strong>14,6 млн ₽</strong>
        <label>
          Сумма ставки <u />
        </label>
        <em>Сделать ставку</em>
      </>
    ),
    success: (
      <>
        <i className={s.miniPositive}>Ставка принята</i>
        <b>Сейчас вы лидируете</b>
        <p>Мы сообщим, если ставку перебьют.</p>
        <em>Сделать ставку</em>
      </>
    ),
    end: (
      <>
        <i className={s.miniPositive}>Аукцион завершён</i>
        <b>Квартира продана</b>
        <p>Резервная цена достигнута.</p>
        <em>Начать заново</em>
      </>
    ),
  }[kind];
  return <div className={s.miniScreen}>{content}</div>;
}

function Flow({ role, screens }: { role: Role; screens: Screen[] }) {
  return (
    <section className={s.flow} aria-labelledby={`${role}-flow`}>
      <div className={s.flowHeading}>
        <span className={role === 'Продавец' ? s.sellerDot : s.buyerDot} />
        <div>
          <h2 id={`${role}-flow`}>{role}</h2>
          <p>
            {role === 'Продавец' ? 'Создаёт и публикует аукцион' : 'Изучает лот и делает ставку'}
          </p>
        </div>
      </div>
      <div className={s.flowTrack}>
        {screens.map((screen, index) => (
          <div className={s.flowItem} key={screen.id}>
            <article className={s.screenCard}>
              <div className={s.cardTopline}>
                <span>Экран {index + 1}</span>
                <code>role={role === 'Продавец' ? 'seller' : 'buyer'}</code>
              </div>
              <MiniScreen kind={screen.kind} />
              <h3>{screen.title}</h3>
              <p>{screen.description}</p>
              <div className={s.eventLabel}>
                <span>Событие</span>
                <code>{screen.goal}</code>
                <small>step={screen.step}</small>
              </div>
            </article>
            {index < screens.length - 1 && (
              <div className={s.connector} aria-label={`Переход: ${screen.action ?? 'далее'}`}>
                <span>{screen.action ?? 'Далее'}</span>
                <code>{screen.goal}</code>
                <i>→</i>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const metrics = [
  [
    'Публикация аукциона',
    'auction_published / auction_terms_opened',
    '≥ 65%',
    'Доля продавцов, дошедших от старта настройки до публикации.',
  ],
  [
    'Корректное заполнение условий',
    '1 − auction_terms_validation_error / auction_terms_reviewed',
    '≥ 85%',
    'Показывает, понятны ли поля и ограничения формы.',
  ],
  [
    'Ставка после просмотра лота',
    'auction_bid_attempted / auction_role_selected (role=buyer)',
    '≥ 20%',
    'Конверсия покупателя от входа в сценарий к попытке сделать ставку.',
  ],
  [
    'Успешная отправка ставки',
    'auction_bid_response (result=success) / auction_bid_attempted',
    '≥ 97%',
    'Надёжность действия без ответов с ошибкой.',
  ],
  [
    'Продажа после публикации',
    'auction_finished (outcome=sold) / auction_published',
    '≥ 40%',
    'Основной результат фичи для продавца.',
  ],
];

export function ScenarioMapPage() {
  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link className={s.brand} to="/" aria-label="К прототипу аукциона">
          <img src="/assets/cian-logo.svg" alt="Циан" />
        </Link>
        <Link className={s.prototypeLink} to="/">
          Открыть прототип <span>↗</span>
        </Link>
      </header>
      <div className={s.hero}>
        <p className={s.eyebrow}>Продажа квартиры на аукционе · карта сценариев</p>
        <h1>Как продавец запускает торги, а покупатель делает ставку</h1>
        <p>
          Все цели передаются как <code>reachGoal</code> с параметрами <code>role</code> и{' '}
          <code>step</code>. Номер счётчика в коде оставлен заглушкой.
        </p>
      </div>
      <div className={s.legend}>
        <span>
          <i className={s.sellerDot} /> Продавец
        </span>
        <span>
          <i className={s.buyerDot} /> Покупатель
        </span>
        <span>
          <b>→</b> Переход и инициирующее действие
        </span>
        <span>
          <code>goal</code> Цель Метрики
        </span>
      </div>
      <Flow role="Продавец" screens={sellerScreens} />
      <Flow role="Покупатель" screens={buyerScreens} />
      <section className={s.metrics} aria-labelledby="metrics-title">
        <div className={s.metricsHeading}>
          <p className={s.eyebrow}>Проверка фичи</p>
          <h2 id="metrics-title">Метрики после запуска</h2>
          <p>
            Целевые значения — ориентиры для учебного прототипа. Их стоит уточнить после первых 2–4
            недель трафика и сегментировать по типу лота.
          </p>
        </div>
        <div className={s.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Показатель</th>
                <th>Расчёт из событий</th>
                <th>Цель</th>
                <th>Зачем смотреть</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(([name, formula, target, purpose]) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>
                    <code>{formula}</code>
                  </td>
                  <td>
                    <strong>{target}</strong>
                  </td>
                  <td>{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <footer className={s.footer}>
        Прототип аукциона · Яндекс Метрика: <code>COUNTER_ID = 0</code>
      </footer>
    </main>
  );
}
