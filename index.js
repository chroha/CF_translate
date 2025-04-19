export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password") || "";
    const apiMode = searchParams.get("api") === "true";

    // 密码验证
    if (env.PASSWORD && password !== env.PASSWORD) {
      return new Response(`
        <html><head><title>请输入密码</title><meta charset="utf-8" />
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f2f2f2; }
          .box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          input { padding: 10px; width: 100%; margin-top: 10px; }
          button { padding: 10px; width: 100%; margin-top: 10px; background: #007bff; color: white; border: none; }
        </style>
        </head><body>
        <div class="box">
          <h3>请输入密码以进入翻译工具</h3>
          <input id="pwd" type="password" placeholder="Password" />
          <button onclick="check()">进入 / Go</button>
        </div>
        <script>
          function check() {
            const pwd = document.getElementById('pwd').value.trim();
            if (pwd) {
              location.href = "/?password=" + encodeURIComponent(pwd);
            }
          }
        <\/script>
        </body></html>
      `, { headers: { "Content-Type": "text/html;charset=utf-8" }, status: 401 });
    }

    // 翻译逻辑
    const text = searchParams.get("text") || "";
    const source = searchParams.get("source_language") || "";
    const target = searchParams.get("target_language") || "";

    if (text && source && target) {
      const inputs = {
        text,
        source_lang: source,
        target_lang: target,
      };

      const aiResponse = await env.AI.run("@cf/meta/m2m100-1.2b", inputs);

      if (apiMode) {
        return Response.json({ input: inputs, output: aiResponse });
      }

      return new Response(`
        <html><head><meta charset="utf-8" /><title>翻译结果</title></head><body>
        <h2>翻译结果：</h2>
        <pre>${aiResponse.translated_text || JSON.stringify(aiResponse)}</pre>
        <p><strong>Prompt tokens:</strong> ${aiResponse.usage?.prompt_tokens || 0} | 
        <strong>Completion tokens:</strong> ${aiResponse.usage?.completion_tokens || 0} | 
        <strong>Total:</strong> ${aiResponse.usage?.total_tokens || 0}</p>
        <a href="/?password=${encodeURIComponent(password)}">返回</a>
        </body></html>
      `, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    // 初始页面 HTML
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>翻译页面</title>
    <style>
      body {
        font-family: Arial, sans-serif;
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        text-align: center;
      }
      input, select, textarea {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 16px;
      }
      button {
        padding: 12px;
        width: 100%;
        border: none;
        border-radius: 8px;
        background-color: #007bff;
        color: white;
        font-size: 16px;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>多语言翻译器</h2>
      <p>输入内容并选择语言</p>
      <input type="text" id="text" placeholder="请输入要翻译的文本" />
      <input type="text" id="sourceLang" placeholder="源语言（如 zh）" />
      <input type="text" id="targetLang" placeholder="目标语言（如 en）" />
      <div class="row">
        <input type="checkbox" id="apiCheckbox" />
        <label for="apiCheckbox">API JSON 输出</label>
      </div>
      <button onclick="submitTranslation()">翻译 / Translate</button>
      <textarea id="resultBox" rows="4" readonly placeholder="翻译结果将在此显示"></textarea>
      <p id="tokenInfo"></p>
    </div>

    <script>
      async function submitTranslation() {
        const pwd = new URLSearchParams(window.location.search).get("password") || "";
        const text = document.getElementById("text").value.trim();
        const sourceLang = document.getElementById("sourceLang").value.trim();
        const targetLang = document.getElementById("targetLang").value.trim();
        const api = document.getElementById("apiCheckbox").checked;

        if (!text || !sourceLang || !targetLang) {
          alert("请填写所有字段");
          return;
        }

        const query = new URLSearchParams({
          password: pwd,
          api: api ? "true" : "false",
          text: text,
          source_language: sourceLang,
          target_language: targetLang
        }).toString();

        if (api) {
          window.location.href = "/?" + query;
        } else {
          const res = await fetch("/?" + query);
          const html = await res.text();
          const match = html.match(/<pre>([\s\S]*?)<\/pre>/);
          const tokens = html.match(/Prompt tokens:\/strong> (\d+).*?Completion tokens:\/strong> (\d+).*?Total:\/strong> (\d+)/);
          document.getElementById("resultBox").value = match ? match[1] : "未找到翻译结果";
          if (tokens) {
            document.getElementById("tokenInfo").innerText = `Prompt: ${tokens[1]}, Completion: ${tokens[2]}, Total: ${tokens[3]}`;
          }
        }
      }
    </script>
  </body>
</html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
