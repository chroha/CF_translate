export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const PASSWORD = env.PASSWORD;
    const queryPassword = url.searchParams.get("password");

    // 密码校验逻辑
    if (!queryPassword || queryPassword !== PASSWORD) {
      return new Response(`
        <html>
          <head>
            <title>密码验证</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
                text-align: center;
              }
              input[type="password"] {
                width: 100%;
                padding: 10px;
                margin-top: 15px;
                border-radius: 6px;
                border: 1px solid #ccc;
              }
              button {
                width: 100%;
                margin-top: 15px;
                padding: 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
              }
              button:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>请输入密码访问翻译服务</h2>
              <input type="password" id="pwd" placeholder="Password" />
              <button onclick="submitPassword()">提交</button>
            </div>
            <script>
              function submitPassword() {
                const pwd = document.getElementById('pwd').value.trim();
                const params = new URLSearchParams(window.location.search);
                params.set('password', pwd);
                window.location.search = params.toString();
              }
            <\/script>
          </body>
        </html>
      `, {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 获取翻译请求参数
    const text = url.searchParams.get("text");
    const source_language = url.searchParams.get("source_language");
    const target_language = url.searchParams.get("target_language");

    // 如果没有参数，展示页面
    if (!text || !source_language || !target_language) {
      return new Response(`
        <html>
          <head>
            <title>翻译工具</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                background: #e8f0fe;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 90%;
              }
              textarea, input {
                width: 100%;
                padding: 10px;
                margin-top: 10px;
                border: 1px solid #ccc;
                border-radius: 6px;
              }
              button {
                width: 100%;
                padding: 10px;
                margin-top: 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
              }
              button:hover {
                background: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>在线翻译工具</h2>
              <textarea id="text" rows="4" placeholder="输入要翻译的内容"></textarea>
              <input id="source_language" placeholder="原始语言（如 zh）">
              <input id="target_language" placeholder="目标语言（如 en）">
              <button onclick="translate()">翻译</button>
            </div>
            <script>
              function translate() {
                const text = document.getElementById('text').value;
                const source = document.getElementById('source_language').value;
                const target = document.getElementById('target_language').value;
                const pwd = new URLSearchParams(window.location.search).get('password');
                if (text && source && target) {
                  const query = `?text=${encodeURIComponent(text)}&source_language=${source}&target_language=${target}&password=${encodeURIComponent(pwd)}`;
                  window.location.href = query;
                }
              }
            <\/script>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 翻译请求
    const inputs = {
      text,
      source_lang: source_language,
      target_lang: target_language
    };
    const aiResponse = await env.AI.run('@cf/meta/m2m100-1.2b', inputs);

    return new Response(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>翻译结果</title>
        </head>
        <body>
          <h2>翻译结果：</h2>
          <pre>${aiResponse.translated_text || JSON.stringify(aiResponse)}</pre>
          <a href="/?password=${encodeURIComponent(queryPassword)}">返回</a>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
