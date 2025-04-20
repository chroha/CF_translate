// V2.0
export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    
    // ⏱️ UptimeFlare 检查路径，不走密码
    if (url.pathname === "/uptime-check") {
      return new Response("OK", { status: 200 });
    }
    
    const password = searchParams.get("password") || "";
    const isJson = searchParams.get("api") === "true";

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

      if (isJson) {
        return Response.json({ input: inputs, output: aiResponse });
      }

      return new Response(`
        <html>
          <head><meta charset="UTF-8"><title>翻译结果</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h2>翻译结果</h2>
            <p><strong>原文：</strong> ${text}</p>
            <p><strong>源语言：</strong> ${source}</p>
            <p><strong>目标语言：</strong> ${target}</p>
            <p><strong>翻译：</strong> ${aiResponse.translated_text}</p>
            <h3>Token 用量</h3>
            <ul>
              <li>Prompt Tokens：${aiResponse.usage?.prompt_tokens ?? "-"}</li>
              <li>Completion Tokens：${aiResponse.usage?.completion_tokens ?? "-"}</li>
              <li>Total Tokens：${aiResponse.usage?.total_tokens ?? "-"}</li>
            </ul>
            <a href="/?password=${encodeURIComponent(password)}">返回</a>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 返回输入页面
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
      input, select {
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
    </style>
  </head>
  <body>
    <div class="card">
      <h2>多语言翻译器</h2>
      <p>输入内容并选择语言</p>
      <input type="text" id="text" placeholder="请输入要翻译的文本" />
      <input type="text" id="sourceLang" placeholder="源语言（如 zh）" />
      <input type="text" id="targetLang" placeholder="目标语言（如 en）" />
      <label style="display:block; text-align:left;"><input type="checkbox" id="apiCheckbox" /> API JSON 输出</label>
      <button onclick="submitTranslation()">翻译 / Translate</button>
    </div>

    <script>
      function submitTranslation() {
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
          text: text,
          source_language: sourceLang,
          target_language: targetLang
        });
        if (api) query.set("api", "true");

        window.location.href = "/?" + query.toString();
      }
    </script>
  </body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
