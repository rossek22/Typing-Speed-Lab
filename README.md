# Typing Speed Lab

## О проекте (RU)

**Typing Speed Lab** — это веб-приложение для тренировки скорости печати на разных языках. Сервис генерирует предложения с помощью искусственного интеллекта (OpenRouter API), а пользователь должен напечатать их максимально быстро и точно. В конце теста отображаются статистика: WPM (слов в минуту), точность и количество ошибок.

### Технологии

- [Next.js](https://nextjs.org/) (React, TypeScript)
- OpenRouter API (AI генерация текста)
- Framer Motion (анимации)
- Tailwind CSS (стили)

### Как работает

1. Выбираете язык и лимит слов.
2. Нажимаете "Сгенерировать" — ИИ создает предложение.
3. Начинаете печатать — таймер отсчитывает время.
4. После окончания теста видите свою статистику.

### Запуск проекта

```sh
git clone https://github.com/your-username/typing-speed-lab.git
cd typing-speed
npm install
npm run dev
```

Создайте файл `.env` и добавьте ваш ключ OpenRouter API:

```
OPENROUTER_API_KEY=ваш_ключ
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_SITE_TITLE=Typing Speed Lab
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## About the Project (EN)

**Typing Speed Lab** is a web app for practicing typing speed in different languages. The service generates sentences using AI (OpenRouter API), and the user must type them as quickly and accurately as possible. After the test, you see your stats: WPM (words per minute), accuracy, and error count.

### Technologies

- [Next.js](https://nextjs.org/) (React, TypeScript)
- OpenRouter API (AI text generation)
- Framer Motion (animations)
- Tailwind CSS (styles)

### How it works

1. Choose a language and word limit.
2. Click "Generate" — AI creates a sentence.
3. Start typing — the timer counts down.
4. After the test, view your statistics.

### Getting Started

```sh
git clone https://github.com/your-username/typing-speed-lab.git
cd typing-speed
npm install
npm run dev
```

Create a `.env` file and add your OpenRouter API key:

```
OPENROUTER_API_KEY=your_key
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_SITE_TITLE=Typing Speed Lab
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

[Документация Next.js](https://nextjs.org/docs)  
[Deploy on Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
