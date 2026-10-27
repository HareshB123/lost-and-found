// LOST AND FOUND - Common UI Header & Navigation Component
import { AuthService } from './auth.js';
import { escapeHTML } from './utils.js';

export function renderNavbar(activePage = "dashboard") {
  const user = AuthService.getCurrentUser();
  const navPlaceholder = document.getElementById("navbar-placeholder");
  if (!navPlaceholder) return;

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U";

  navPlaceholder.innerHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <a href="dashboard.html" class="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/><path d="M12 16h.01"/>
          </svg>
          <span>LOST &amp; <span class="highlight">FOUND</span></span>
        </a>

        <button class="mobile-nav-toggle" id="mobileNavBtn" aria-label="Toggle navigation">
          &#9776;
        </button>

        <ul class="nav-links" id="navLinks">
          <li><a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
          <li><a href="lost.html" class="nav-link ${activePage === 'lost' ? 'active' : ''}">Lost Items</a></li>
          <li><a href="found.html" class="nav-link ${activePage === 'found' ? 'active' : ''}">Found Items</a></li>
          <li><a href="my-reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">My Reports</a></li>
          <li><a href="my-chats.html" class="nav-link ${activePage === 'chats' ? 'active' : ''}">My Chats</a></li>
          <li><a href="profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">Profile</a></li>
        </ul>

        <div class="nav-actions">
          <a href="report-item.html?type=lost" class="btn btn-outline btn-sm">+ Report</a>
          <div class="dropdown">
            <button class="user-menu-btn" id="userMenuToggle" aria-haspopup="true">
              <div class="avatar">${userInitial}</div>
            </button>
            <div class="dropdown-menu" id="userDropdown">
              <div style="padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color);">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--navy-primary);">${escapeHTML(user?.full_name || "Student")}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(user?.college_email || "")}</div>
              </div>
              <a href="profile.html" class="dropdown-item">My Profile</a>
              <a href="my-reports.html" class="dropdown-item">My Reports</a>
              <a href="my-chats.html" class="dropdown-item">Active Chats</a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" id="logoutBtn" style="color: var(--error); width: 100%; text-align: left;">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Attach events
  const mobileNavBtn = document.getElementById("mobileNavBtn");
  const navLinks = document.getElementById("navLinks");
  if (mobileNavBtn && navLinks) {
    mobileNavBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  const userMenuToggle = document.getElementById("userMenuToggle");
  const userDropdown = document.getElementById("userDropdown");
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      AuthService.logout();
    });
  }
}

export function renderFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (!footerPlaceholder) return;

  footerPlaceholder.innerHTML = `
    <footer>
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>LOST &amp; <span class="highlight">FOUND</span></span>
            </div>
            <p>Lost it? Found it? Let's bring it home. Every lost item deserves a way back.</p>
          </div>
          <div>
            <a href="report-item.html?type=lost" class="btn btn-primary btn-sm">Report Lost Item</a>
            <a href="report-item.html?type=found" class="btn btn-outline btn-sm" style="margin-left: 0.5rem;">Report Found Item</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 LOST AND FOUND. Academic Capstone Project. All rights reserved.</span>
          <span>Privacy &middot; Student Safety Guidelines &middot; Secure Automatic Chat Cleanup</span>
        </div>
      </div>
    </footer>
  `;
}
