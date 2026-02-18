/**
 * Simple i18n system for Vanilla JS
 * Handles JSON loading, data-i18n injection, and language preferences.
 */
(async () => {
    // 1. Detect language from URL (folder strategy)
    // Assumes structure: /pt/, /en/, /es/
    const path = window.location.pathname;
    let lang = 'pt'; // default
    if (path.includes('/en/')) lang = 'en';
    else if (path.includes('/es/')) lang = 'es';

    // Save preference for future redirects (used by root index.html)
    localStorage.setItem('vanmo_lang', lang);
    document.documentElement.lang = lang;

    // 2. Load Translations
    // 2. Load Translations
    try {
        // We assume we are in a subfolder (e.g., /pt/), so locales are at ../locales
        const response = await fetch(`../locales/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang}.json`);

        const translations = await response.json();
        window.I18N = translations; // Expose globally for app.js

        // 3. Apply to DOM
        applyTranslations(translations);

        // 4. Notify app.js (for Slider)
        window.dispatchEvent(new CustomEvent('i18n-ready', { detail: translations }));

    } catch (error) {
        console.error('i18n Error:', error);
        if (window.location.protocol === 'file:') {
            alert('Erro: O navegador bloqueou o carregamento das traduções por segurança (CORS) porque você abriu o arquivo localmente.\n\nSolução: Use um servidor local (ex: Live Server no VS Code) ou suba para o GitHub Pages.');
        }
    }

    // --- Helpers ---

    function applyTranslations(data) {
        // Text Content: data-i18n="hero.title"
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNested(data, key);
            if (value) {
                // If the element has children (like icons), we might want to preserve them.
                // But for this simple implementation, we assume text-only replacement 
                // OR checks for specific structure.
                // For safety with HTML entities (like <br>), we use innerHTML if the value contains tags,
                // otherwise textContent.
                if (value.includes('<')) el.innerHTML = value;
                else el.textContent = value;
            }
        });

        // Attributes: data-i18n-attr="placeholder:contact.email_placeholder"
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const raw = el.getAttribute('data-i18n-attr');
            // Supports multiple attributes split by comma? Let's keep it simple first: one attr.
            const [attr, key] = raw.split(':');
            const value = getNested(data, key);
            if (value) el.setAttribute(attr, value);
        });

        // Update Page Meta
        if (data.meta) {
            document.title = data.meta.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', data.meta.description);
        }

        // Mark active language in switcher (if present)
        document.querySelectorAll('.lang-switcher a').forEach(a => {
            if (a.dataset.lang === lang) {
                a.classList.add('active');
                a.setAttribute('aria-current', 'page');
            } else {
                a.classList.remove('active');
                a.removeAttribute('aria-current');
            }
        });
    }

    function getNested(obj, path) {
        return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
    }
})();
