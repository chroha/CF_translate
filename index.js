<html>
  <head>
    <title>翻译页面 | Translator</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      <button onclick="submitTranslation()">翻译 / Translate</button>
    </div>

    <script>
      function submitTranslation() {
        const pwd = new URLSearchParams(window.location.search).get("password") || "";
        const text = document.getElementById("text").value.trim();
        const sourceLang = document.getElementById("sourceLang").value.trim();
        const targetLang = document.getElementById("targetLang").value.trim();
        if (!text || !sourceLang || !targetLang) {
          alert("请填写所有字段");
          return;
        }
        const query = new URLSearchParams({
          password: pwd,
          text: text,
          source_language: sourceLang,
          target_language: targetLang
        }).toString();
        window.location.href = "/?" + query;
      }
    </script>
  </body>
</html>
