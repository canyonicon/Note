const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const notesList = document.getElementById("notesList");
const searchInput = document.getElementById("searchInput");
const expiryInput = document.getElementById("expiryInput");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

const storage = chrome.storage.sync;

// حذف الملاحظات المنتهية الصلاحية
function cleanupExpiredNotes(notes) {
  const now = Date.now();
  return notes.filter((note) => !note.expiry || note.expiry > now);
}

// تحميل وعرض الملاحظات
function loadNotes() {
  storage.get("notes", (data) => {
    let notes = data.notes || [];
    notes = cleanupExpiredNotes(notes);

    // حفظ بعد التنظيف إذا كانت هناك ملاحظات منتهية
    storage.set({ notes });

    const searchTerm = searchInput.value.toLowerCase();

    notesList.innerHTML = "";

    // عرض الملاحظات المثبتة أولاً
    const pinned = notes.filter((n) => n.pinned);
    const others = notes.filter((n) => !n.pinned);
    const combined = [...pinned, ...others];

    combined.forEach((note, index) => {
      if (note.text.toLowerCase().includes(searchTerm)) {
        const expiryDate = note.expiry ? new Date(note.expiry) : null;
        const expiryStr = expiryDate
          ? ` | ينتهي: ${expiryDate.toLocaleString()}`
          : "";
        const createdStr = new Date(note.created).toLocaleString();

        const li = document.createElement("li");
        li.setAttribute("data-index", index); // إضافة data-index لكل عنصر
        li.innerHTML = `
          <span title="أنشئت: ${createdStr}${expiryStr}">${note.text}</span>
          <div>
            <button class="" title="Stabilizing" data-action="pin">${
              note.pinned
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><circle cx="256" cy="96" r="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M272 164a9 9 0 00-9-9h-14a9 9 0 00-9 9v293.56a32.09 32.09 0 002.49 12.38l10.07 24a3.92 3.92 0 006.88 0l10.07-24a32.09 32.09 0 002.49-12.38z"/><circle cx="280" cy="72" r="24"/></svg>'
            }</button>
            <button class="" title="Edit" data-action="edit"><svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"/></svg></button>
            <button class="" title="Delete" data-action="delete"><svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg></button>
          </div>
        `;
        notesList.appendChild(li);
      }
    });
  });
}

// حفظ ملاحظة جديدة أو تعديلها
saveBtn.addEventListener("click", () => {
  const text = noteInput.value.trim();
  if (!text) return;

  const expiryMinutes = parseInt(expiryInput.value);
  const now = Date.now();
  const expiry =
    !isNaN(expiryMinutes) && expiryMinutes > 0
      ? now + expiryMinutes * 60000
      : null;

  storage.get("notes", (data) => {
    const notes = data.notes || [];
    notes.push({ text, pinned: false, created: now, expiry });
    storage.set({ notes }, () => {
      noteInput.value = "";
      expiryInput.value = "";
      loadNotes();
    });
  });
});

// معالجة أحداث الأزرار باستخدام Event Delegation
notesList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const li = btn.closest("li");
  const index = parseInt(li.getAttribute("data-index"));
  const action = btn.getAttribute("data-action");

  if (action === "edit") {
    editNote(index);
  } else if (action === "delete") {
    deleteNote(index);
  } else if (action === "pin") {
    pinNote(index);
  }
});

// تعديل ملاحظة
function editNote(index) {
  storage.get("notes", (data) => {
    const notes = data.notes || [];
    const updated = prompt("✏️ عدل الملاحظة:", notes[index].text);
    if (updated !== null) {
      notes[index].text = updated;
      storage.set({ notes }, loadNotes);
    }
  });
}

// حذف ملاحظة
function deleteNote(index) {
  if (confirm("🗑️ هل تريد حذف هذه الملاحظة؟")) {
    storage.get("notes", (data) => {
      const notes = data.notes || [];
      notes.splice(index, 1);
      storage.set({ notes }, loadNotes);
    });
  }
}

// تثبيت/إلغاء تثبيت ملاحظة
function pinNote(index) {
  storage.get("notes", (data) => {
    const notes = data.notes || [];
    notes[index].pinned = !notes[index].pinned;
    storage.set({ notes }, loadNotes);
  });
}

// بحث
searchInput.addEventListener("input", loadNotes);

// تصدير الملاحظات
exportBtn.addEventListener("click", () => {
  storage.get("notes", (data) => {
    const notes = data.notes || [];
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "notes-export.json";
    a.click();

    URL.revokeObjectURL(url);
  });
});

// استيراد الملاحظات
importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedNotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedNotes)) throw new Error("الملف غير صالح");

      storage.get("notes", (data) => {
        const notes = data.notes || [];
        const merged = [...notes, ...importedNotes];
        storage.set({ notes: merged }, loadNotes);
      });
    } catch {
      alert("⚠️ الملف الذي تم رفعه غير صالح.");
    }
  };
  reader.readAsText(file);
});

// تحميل الملاحظات عند البدء
loadNotes();
