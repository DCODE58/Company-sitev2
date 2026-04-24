/* ============================================================
   DCODE - Shared JavaScript  (main.js)
   Loaded by every page.  Page-specific logic lives inside
   DOMContentLoaded blocks that guard their selectors.
   ============================================================ */

/* ── TELEGRAM BOT CONFIG ──────────────────────────────────── */
// Replace these two values with your real bot token and chat id.
// The bot token is obtained from @BotFather on Telegram.
// The chat id is obtained by messaging @userinfobot on Telegram.
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID_HERE';

/**
 * sendToTelegram
 * Sends a formatted message to the configured Telegram bot.
 * @param {string} text - The message to send (HTML formatting supported)
 * @returns {Promise<boolean>} - true on success, false on error
 */
async function sendToTelegram(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id:    TELEGRAM_CHAT_ID,
                text:       text,
                parse_mode: 'HTML'   // allows <b>, <i> etc.
            })
        });
        const data = await res.json();
        return data.ok === true;
    } catch (err) {
        console.error('[DCODE] Telegram send error:', err);
        return false;
    }
}

/* ── UTILITY: current time HH:MM ──────────────────────────── */
function getCurrentTime() {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}

/* ============================================================
   Initialise everything after the DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // ── Copyright year ──────────────────────────────────────
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    /* ── MOBILE NAVIGATION ───────────────────────────────── */
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburger && mobileNav) {
        // Toggle the slide-in panel
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
            document.body.classList.toggle('no-scroll');
            mobileNav.setAttribute('aria-hidden', !mobileNav.classList.contains('open'));
        });

        // Auto-close when any nav link is clicked
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                document.body.classList.remove('no-scroll');
                mobileNav.setAttribute('aria-hidden', 'true');
            });
        });
    }


    /* ── SMOOTH SCROLL for anchor links ─────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });


    /* ── SERVICE CARD EXPANSION (index.html) ────────────── */
    const serviceCards = document.querySelectorAll('.service-card');
    const overlay      = document.querySelector('.overlay');

    if (serviceCards.length && overlay) {
        serviceCards.forEach(card => {
            card.addEventListener('click', function () {
                if (this.classList.contains('active')) return;

                // Close any already-open card
                document.querySelectorAll('.service-card.active').forEach(active => {
                    active.classList.remove('active');
                    active.querySelector('.close-btn')?.remove();
                });

                // Open this card
                this.classList.add('active');
                overlay.classList.add('active');
                document.body.classList.add('no-scroll');

                // Inject a close button
                const closeBtn = document.createElement('button');
                closeBtn.className   = 'close-btn';
                closeBtn.innerHTML   = '&times;';
                closeBtn.setAttribute('aria-label', 'Close');
                closeBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    closeActiveCard();
                });
                this.appendChild(closeBtn);
            });

            // Prevent clicks inside an open card from bubbling to overlay
            card.addEventListener('click', function (e) {
                if (this.classList.contains('active')) e.stopPropagation();
            });
        });

        overlay.addEventListener('click', closeActiveCard);

        function closeActiveCard() {
            document.querySelectorAll('.service-card.active').forEach(active => {
                active.classList.remove('active');
                active.querySelector('.close-btn')?.remove();
            });
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }


    /* ── CONTACT FORM → TELEGRAM ─────────────────────────── */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Gather values
            const name    = (document.getElementById('name')?.value    || '').trim();
            const email   = (document.getElementById('email')?.value   || '').trim();
            const subject = (document.getElementById('subject')?.value || '').trim();
            const message = (document.getElementById('message')?.value || '').trim();

            // Simple validation
            if (!name || !email || !subject || !message) return;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const original  = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML  = 'Sending… <i class="icon ion-md-sync"></i>';
            submitBtn.disabled   = true;

            // Build nicely formatted Telegram message
            const telegramText =
                `📩 <b>New Contact Form Submission</b>\n\n` +
                `👤 <b>Name:</b> ${name}\n` +
                `📧 <b>Email:</b> ${email}\n` +
                `📌 <b>Subject:</b> ${subject}\n` +
                `💬 <b>Message:</b>\n${message}\n\n` +
                `🕐 <i>${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</i>`;

            const success = await sendToTelegram(telegramText);

            if (success) {
                submitBtn.innerHTML           = 'Sent! ✓';
                submitBtn.style.background    = '#4CAF50';
                contactForm.reset();
            } else {
                submitBtn.innerHTML           = 'Error – Try Again';
                submitBtn.style.background    = '#e74c3c';
            }

            // Restore button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML        = original;
                submitBtn.style.background = '';
                submitBtn.disabled         = false;
            }, 3000);
        });

        // Subtle float effect on focused inputs
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('focus', function () { this.parentElement.style.transform = 'translateY(-3px)'; });
            input.addEventListener('blur',  function () { this.parentElement.style.transform = ''; });
        });
    }


    /* ── CHATBOT ─────────────────────────────────────────── */
    const chatbotBtn       = document.querySelector('.chatbot-btn');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotClose     = document.querySelector('.chatbot-close');
    const chatInput        = document.getElementById('chatbot-input-field');
    const chatSend         = document.querySelector('.chatbot-send');
    const chatMessages     = document.querySelector('.chatbot-messages');

    if (chatbotBtn && chatbotContainer) {
        // Toggle open/close
        chatbotBtn.addEventListener('click', () => chatbotContainer.classList.toggle('open'));
        chatbotClose?.addEventListener('click', () => chatbotContainer.classList.remove('open'));

        // Send on click or Enter
        chatSend?.addEventListener('click', sendChat);
        chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChat(); });

        // Welcome message if chat is empty
        if (chatMessages && chatMessages.children.length === 0) {
            appendMessage("👋 Hi! I'm the DCODE assistant. Ask me anything about our services, pricing, or team!", 'bot');
        }
    }

    /* Append a chat bubble */
    function appendMessage(text, sender) {
        if (!chatMessages) return;
        const wrap    = document.createElement('div');
        wrap.className = `message message-${sender}`;

        const bubble  = document.createElement('div');
        bubble.className   = 'message-content';
        bubble.textContent = text;

        const ts      = document.createElement('div');
        ts.className  = 'message-time';
        ts.textContent = getCurrentTime();

        wrap.appendChild(bubble);
        wrap.appendChild(ts);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /* Typing dots */
    function showTyping() {
        if (!chatMessages) return;
        const d = document.createElement('div');
        d.className = 'typing-indicator'; d.id = 'typing-indicator';
        for (let i = 0; i < 3; i++) { const dot = document.createElement('div'); dot.className = 'typing-dot'; d.appendChild(dot); }
        chatMessages.appendChild(d);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function hideTyping() { document.getElementById('typing-indicator')?.remove(); }

    /* Main send handler */
    function sendChat() {
        if (!chatInput) return;
        const msg = chatInput.value.trim();
        if (!msg) return;
        appendMessage(msg, 'user');
        chatInput.value = '';
        showTyping();
        const delay = 900 + Math.random() * 1500;
        setTimeout(() => { hideTyping(); appendMessage(getBotResponse(msg), 'bot'); }, delay);
    }

    /* ── EXPANDED bot knowledge base ────────────────────── */
    function getBotResponse(raw) {
        const msg = raw.toLowerCase();

        /* Greetings */
        if (/^(hi|hello|hey|hiya|howdy|yo|sup|good\s*(morning|afternoon|evening))/.test(msg))
            return "Hello! 👋 How can I help you today? You can ask me about our services, pricing, team, or how to get in touch.";

        /* Goodbye */
        if (/(bye|goodbye|see you|later|ciao|take care)/.test(msg))
            return "Goodbye! 👋 Feel free to come back any time. Have a great day!";

        /* About DCODE */
        if (/(who are you|what is dcode|about dcode|tell me about)/.test(msg))
            return "DCODE is a Nairobi-based tech startup founded with a mission to bridge cutting-edge technology and real business needs. We specialise in web development, mobile apps, UI/UX design, cybersecurity, cloud solutions, and IT consulting. 🚀";

        /* Services */
        if (/(service|what do you (do|offer|provide)|capabilities)/.test(msg))
            return "We offer: 💻 Web Development, 🎨 UI/UX Design, 📱 Mobile App Development, 🔐 Cybersecurity, ☁️ Cloud Solutions, 🌐 Network Administration, 🗃️ Data Administration, and 💡 IT Consulting. Click any service card on our homepage for full details!";

        /* Web dev */
        if (/(web (dev|develop|app|application)|website|react|angular|vue|node|html|css)/.test(msg))
            return "Our web development team builds responsive websites, SPAs, e-commerce stores, and CMS platforms using HTML/CSS/JS, React, Angular, Vue.js (front-end) and Node.js, Django, Laravel (back-end). We handle everything from design to deployment.";

        /* Mobile */
        if (/(mobile|android|ios|flutter|react native|app store|play store)/.test(msg))
            return "We build cross-platform mobile apps with Flutter and React Native, as well as native iOS (Swift) and Android (Kotlin) apps. We manage the full lifecycle from wireframing to App Store / Play Store deployment.";

        /* UI/UX */
        if (/(ui|ux|design|figma|wireframe|prototype|user (interface|experience))/.test(msg))
            return "Our UI/UX team covers user research, persona development, wireframing, high-fidelity prototyping, user testing, and full visual design. We use Figma and Adobe XD to produce designs that are both beautiful and intuitive.";

        /* Cybersecurity */
        if (/(cyber|security|pentest|penetration|hack|vulnerability|firewall|audit)/.test(msg))
            return "We provide security audits, penetration testing, policy development, incident response planning, and staff security training. We take a holistic approach to protecting your digital assets from evolving threats.";

        /* Cloud */
        if (/(cloud|aws|azure|google cloud|serverless|devops|kubernetes|docker)/.test(msg))
            return "Our cloud practice covers migrations, AWS / Azure / GCP architecture, serverless design, containerisation with Docker & Kubernetes, CI/CD pipelines, and cost optimisation. We help you scale safely and efficiently.";

        /* Network */
        if (/(network|vpn|router|firewall|lan|wan|cisco|monitoring)/.test(msg))
            return "We design, configure, and monitor enterprise networks — including LAN/WAN setup, VPN management, firewall configuration, and 24/7 network monitoring to keep your infrastructure secure and performant.";

        /* Data */
        if (/(data(base)?|sql|nosql|mysql|postgresql|mongodb|migration|backup)/.test(msg))
            return "We handle database design, migrations, optimisation, backup & recovery, and compliance. We work with MySQL, PostgreSQL, MongoDB, Redis, and more — both on-premise and in the cloud.";

        /* IT Consulting */
        if (/(consult|strategy|digital transform|roadmap|it plan|advisory)/.test(msg))
            return "Our IT consulting service helps you align technology investments with business goals. We deliver technology strategy, digital transformation roadmaps, software selection assistance, and infrastructure planning.";

        /* Pricing / cost */
        if (/(price|cost|how much|budget|quote|estimate|rate|fee|charge)/.test(msg))
            return "Pricing varies based on project scope and complexity. We offer competitive rates for startups and enterprises alike. 📩 Send us a message via the Contact page or email dcodedevs@gmail.com for a free personalised quote!";

        /* Timeline / how long */
        if (/(how long|timeline|duration|deadline|turnaround|delivery|when)/.test(msg))
            return "Timelines depend on the project. A simple website typically takes 1–2 weeks, while a full mobile app may take 6–12 weeks. We'll give you an accurate estimate after an initial consultation.";

        /* Portfolio / projects */
        if (/(portfolio|project|past work|case study|example|sample)/.test(msg))
            return "Check out our Projects page for case studies and live demos of work we've delivered. We build everything from marketing sites to complex SaaS platforms.";

        /* Team */
        if (/(team|founder|who built|developers|staff|crew)/.test(msg))
            return "DCODE was founded by Dave — a full-stack developer passionate about building impactful digital products. Our team includes designers, engineers, and strategists. Visit the About Us page to meet everyone!";

        /* Contact / location */
        if (/(contact|email|phone|call|reach|location|office|nairobi|kenya)/.test(msg))
            return "📍 We're based in Nairobi, Kenya.\n📧 dcodedevs@gmail.com\n📞 +254-768-372532\n\nOr fill in the Contact form and we'll reply within 24 hours!";

        /* Technologies */
        if (/(tech|stack|language|framework|tool|technology)/.test(msg))
            return "Our tech stack spans: React, Angular, Vue.js, Node.js, Django, Laravel, Flutter, React Native, AWS, GCP, Azure, Docker, Kubernetes, MySQL, PostgreSQL, MongoDB, and more. We choose the right tool for each job.";

        /* Thank you */
        if (/(thank|thanks|appreciate|cheers)/.test(msg))
            return "You're very welcome! 😊 Is there anything else I can help you with?";

        /* Fallback with helpful hints */
        const hints = [
            "I'm not sure I understood that fully — could you rephrase? You can ask about our services, pricing, team, or how to contact us.",
            "Hmm, let me connect you with our team for that one. Email us at dcodedevs@gmail.com or call +254-768-372532.",
            "Great question! For detailed answers feel free to reach out directly — dcodedevs@gmail.com. We reply within 24 hours.",
            "I can answer questions about DCODE services, tech, pricing, and more. What would you like to know?",
        ];
        return hints[Math.floor(Math.random() * hints.length)];
    }

}); // end DOMContentLoaded
