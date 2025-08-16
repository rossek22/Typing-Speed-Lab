import { NextResponse } from "next/server";

const MODEL = "z-ai/glm-4.5-air:free";
const MAX_LIMIT = 1000;

const systemPrompts: Record<string, string> = {
  ru: "Сгенерируй одно связное, естественное предложение на русском языке.",
  en: "Generate one coherent, natural sentence in English.",
  hy: "Գեներացրու մեկ համահունչ և բնական նախադասություն հայերենով։",
  ka: "შექმენი ერთი თანმიმდევრული და ბუნებრივი წინადადება ქართულად.",
  de: "Erzeuge einen zusammenhängenden, natürlichen Satz auf Deutsch.",
};

export async function POST(req: Request) {
  try {
    const { lang, maxWords } = await req.json();

    if (!lang || !systemPrompts[lang]) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }
    const limit = Math.min(Number(maxWords || 25), MAX_LIMIT);
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: "Invalid maxWords" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server API key missing" },
        { status: 500 }
      );
    }

    const userPrompt =
      (lang === "ru" &&
        `Сгенерируй одно связное предложение РОВНО из ${limit} слов. Используй простые слова. Не меньше и не больше.`) ||
      (lang === "en" &&
        `Generate ONE coherent sentence of EXACTLY ${limit} words. Use simple words. No more, no less.`) ||
      (lang === "hy" &&
        `Գեներացրու մեկ համահունչ նախադասություն ՀԱՍԿԱՑՈՂ ${limit} բառերով։ Ոչ ավելի, ոչ պակաս։`) ||
      (lang === "ka" &&
        `შექმენი ერთი წინადადება ზუსტად ${limit} სიტყვით. არც მეტი, არც ნაკლები.`) ||
      (lang === "de" &&
        `Erzeuge EINEN zusammenhängenden Satz mit GENAU ${limit} Wörtern. Nicht mehr, nicht weniger.`) ||
      "";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "",
        "X-Title": process.env.OPENROUTER_SITE_TITLE ?? "",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompts[lang] },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `OpenRouter error: ${txt}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content)
      return NextResponse.json({ error: "Empty response" }, { status: 500 });

    // Очистим переносы/кавычки, оставим одно предложение
    const sentence = content
      .replace(/\s+/g, " ")
      .replace(/^["'“”«»]+|["'“”«»]+$/g, "")
      .split(/(?<=[.!?])\s/)[0];

    return NextResponse.json({ sentence });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
