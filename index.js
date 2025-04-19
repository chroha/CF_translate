export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const PASSWORD = env.PASSWORD;
    const queryPassword = url.searchParams.get("password");
    const text = url.searchParams.get("text");
    const source_language = url.searchParams.get("source_language");
    const target_language = url.searchParams.get("target_language");

    // 密码验证失败，返回输入框页面
    if (queryPassword !== PASSWORD) {
      return new Response(`
        <html>
        <head>
          <meta charset="utf-8" />
          <title>密码验证</title>
        </head>
        <body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>请输入密码以使用翻译功能</h2>
          <input type="password" id="pwd" placeholder="Password" />
          <button onclick="go()">进入</button>
          <script>
            function go() {
              const pwd = document.getElementById('pwd').value.trim();
              if (pwd) {
                location.href = "/?password=" + encodeURIComponent(pwd);
              }
            }
          <\/script>
        </body>
        </html>
      `, { headers: { "Content-Type": "text/html;charset=utf-8" }, status: 401 });
    }

    // ✅ 有参数则翻译
    if (text && source_language && target_language) {
      const inputs = {
        text,
        source_lang: source_language,
        target_lang: target_language
      };
      try {
        const aiResponse = await env.AI.run('@cf/meta/m2m100-1.2b', inputs);
        return Response.json({ inputs, response: aiResponse });
      } catch (err) {
        return Response.json({
          inputs,
          response: { translated_text: "翻译失败: " + err.message }
        }, { status: 500 });
      }
    }

    // ✅ 没有翻译参数，则返回页面
    return new Response(`
      <html>
      <head>
        <meta charset="utf-8" />
        <title>AI翻译器</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: sans-serif;
            background: #f0f2f5;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 90%;
            max-width: 500px;
          }
          textarea, select, button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            font-size: 16px;
            border-radius: 8px;
            border: 1px solid #ccc;
          }
          button {
            background: #007bff;
            color: white;
            cursor: pointer;
          }
          button:hover {
            background: #0056b3;
          }
          pre {
            background: #eee;
            padding: 10px;
            border-radius: 8px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🌍 Cloudflare AI 翻译器</h2>
          <textarea id="text" rows="4" placeholder="请输入要翻译的文本"></textarea>
          <select id="source">
            <option value="zh">中文</option>
            <option value="en">英文</option>
            <option value="ja">日文</option>
          </select>
          <select id="target">
            <option value="en">英文</option>
            <option value="zh">中文</option>
            <option value="ja">日文</option>
          </select>
          <button onclick="translate()">翻译</button>
          <pre id="result"></pre>
        </div>
        <script>
          async function translate() {
            const text = document.getElementById("text").value.trim();
            const source = document.getElementById("source").value;
            const target = document.getElementById("target").value;
            const pwd = new URLSearchParams(location.search).get("password") || "";
            if (!text) return alert("请输入文本");
            const res = await fetch(\`/?text=\${encodeURIComponent(text)}&source_language=\${source}&target_language=\${target}&password=\${encodeURIComponent(pwd)}\`);
            const data = await res.json();
            document.getElementById("result").textContent = data.response?.translated_text || "翻译失败";
          }
        <\/script>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html;charset=utf-8" } });
  }
};
