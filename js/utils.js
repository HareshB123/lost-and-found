// Helper utilities: safe rendering, dates, toasts, debouncing, modals

export function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getTimeGreeting(name) {
  const hour = new Date().getHours();
  let timeOfDay = "evening";
  if (hour < 12) timeOfDay = "morning";
  else if (hour < 17) timeOfDay = "afternoon";
  return `Good ${timeOfDay}, ${escapeHTML(name || "Student")}!`;
}

export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  if (type === "success") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export function openModal(title, bodyHTML, onConfirm, confirmText = "Confirm", isDanger = false) {
  let modalOverlay = document.getElementById("app-modal-overlay");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "app-modal-overlay";
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="modal-title"></h3>
          <button id="modal-close-btn" style="font-size:1.25rem; color:var(--text-secondary);">&times;</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
          <button class="btn" id="modal-confirm-btn"></button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = bodyHTML;
  const confirmBtn = document.getElementById("modal-confirm-btn");
  confirmBtn.textContent = confirmText;
  confirmBtn.className = isDanger ? "btn btn-danger" : "btn btn-primary";

  const close = () => {
    modalOverlay.classList.remove("active");
  };

  document.getElementById("modal-close-btn").onclick = close;
  document.getElementById("modal-cancel-btn").onclick = close;
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) close();
  };

  confirmBtn.onclick = async () => {
    if (typeof onConfirm === "function") {
      await onConfirm();
    }
    close();
  };

  modalOverlay.classList.add("active");
}
