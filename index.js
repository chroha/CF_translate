export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

async function handleRequest(request, env) {
  const PASSWORD = env.PASSWORD;
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password");

  // ✅ 验证密码
  if (queryPassword !== PASSWORD) {
    return new Response(`
      <html>
        <head><title>Password Required</title><meta charset="UTF-8"></head>
        <body>
          <form method="GET">
            <h3>请输入密码访问翻译服务 / Enter password to access:</h3>
            <input type="password" name="password" />
            <button type="submit">进入 / Go</button>
          </form>
        </body>
      </html>
    `, {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  // ✅ API 路由处理
  if (url.pathname === "/api/translate") {
    const text = url.searchParams.get("text");
    const source_language = url.searchParams.get("source_language");
    const target_language = url.searchParams.get("target_language");

    const inputs = {
      text,
      source_lang: source_language,
      target_lang: target_language
    };

    if (!text || !source_language || !target_language) {
      return Response.json({
        inputs,
        response: { translated_text: "ERROR: Missing parameters" }
      });
    }

    // ✅ AI 翻译调用
    const result = await env.AI.run("@cf/meta/m2m100-1.2b", inputs);
    return Response.json({ inputs, response: result });
  }

  // ✅ 网页 UI 界面
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>AI 翻译页面</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
            textarea, select, button { width: 100%; margin: 8px 0; padding: 10px; }
          </style>
        </head>
        <body>
          <h2>🌐 Cloudflare AI 翻译@cf/meta/m2m100-1.2b</h2>
          <textarea id="text" rows="4" placeholder="请输入要翻译的内容"></textarea>
          <select id="source">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <select id="target">
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
          <button onclick="translate()">翻译 Translate</button>
          <p><strong>结果:</strong></p>
          <div id="result" style="white-space: pre-wrap;"></div>
          <script>
            const pwd = "${queryPassword}";
            async function translate() {
              const text = document.getElementById("text").value;
              const source = document.getElementById("source").value;
              const target = document.getElementById("target").value;
              const res = await fetch(\`/api/translate?text=\${encodeURIComponent(text)}&source_language=\${source}&target_language=\${target}&password=\${encodeURIComponent(pwd)}\`);
              const data = await res.json();
              document.getElementById("result").innerText = data.response.translated_text || JSON.stringify(data.response);
            }
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  // ❌ 其他路径返回 404
  return new Response("Not Found", { status: 404 });
}
