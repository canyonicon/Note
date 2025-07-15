if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get("browserPassword", (result) => {
    if (result.browserPassword) {
      const lockOverlay = document.createElement("div");
      lockOverlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #000000cc;
        color: white;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: sans-serif;
      `;

      lockOverlay.innerHTML = `
        <h2>🔒 الرجاء إدخال كلمة المرور</h2>
        <input type="password" id="lockInput" placeholder="كلمة المرور" style="padding:10px; font-size:16px; margin:10px;">
        <button id="unlockBtn" style="padding:8px 20px; font-size:16px; cursor:pointer;">فتح</button>
        <p id="lockMessage" style="color:red; margin-top:10px;"></p>
      `;

      document.documentElement.appendChild(lockOverlay);

      document.getElementById("unlockBtn").addEventListener("click", () => {
        const entered = document.getElementById("lockInput").value;
        if (entered === result.browserPassword) {
          lockOverlay.remove();
        } else {
          document.getElementById("lockMessage").textContent =
            "❌ كلمة المرور غير صحيحة";
        }
      });
    }
  });
} else {
  console.error(
    "⚠️ chrome.storage غير متوفر داخل content script. تأكد من manifest والـ permissions."
  );
}
