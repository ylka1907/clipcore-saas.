const Express = require('express');
const Cors = require('cors');
const { OpenAI } = require('openai');

const app = Express();
app.use(Cors());
app.use(Express.json());

// Инициализируем ChatGPT через наше рабочее российское зеркало
const openai = new OpenAI({
  apiKey: 'proxyapi-2e86dfc920e8b15d0bf93c40787e9cf2-yulia', // Твой бесплатный учебный токен
  baseURL: 'https://proxyapi.ru', // Адрес моста
});

// Создаем цифровой порт, который будет слушать твой чат на React
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Ты продвинутый киберпанк-ИИ внутри терминала Кибер-Ядро. Отвечай сочно, с характером, емко и строго на русском языке.' },
        { role: 'user', content: message }
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Ошибка ИИ:', error);
    res.status(500).json({ error: 'Сбой квантового луча сервера.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🤖 Квантовый мост запущен на http://localhost:${PORT}`);
});
