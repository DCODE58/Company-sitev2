
/* ============================================================
   DCODE – Shared JavaScript
   ============================================================ */

(function () {
    'use strict';

    /* ---------- Year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Hamburger / Mobile Nav ---------- */
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function () {
            var isOpen = hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open', isOpen);
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('.mobile-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                mobileNav.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        /* Close nav when clicking outside */
        document.addEventListener('click', function (e) {
            if (mobileNav.classList.contains('open') &&
                !mobileNav.contains(e.target) &&
                !hamburger.contains(e.target)) {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                mobileNav.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    /* ---------- Scroll-to-top ---------- */
    var scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) {
        window.addEventListener('scroll', function () {
            scrollBtn.classList.toggle('show', window.scrollY > 400);
        }, { passive: true });
        scrollBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Scroll Reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealObs.observe(el); });
    } else {
        /* Fallback: show everything */
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Service Card Modal ---------- */
    var serviceCards = document.querySelectorAll('.service-card');
    var overlay = document.querySelector('.overlay');

    if (serviceCards.length && overlay) {
        serviceCards.forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (card.classList.contains('active')) return;

                /* Close any open card */
                document.querySelectorAll('.service-card.active').forEach(function (c) {
                    c.classList.remove('active');
                    var cb = c.querySelector('.close-btn');
                    if (cb) cb.remove();
                });

                card.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';

                var closeBtn = document.createElement('button');
                closeBtn.className = 'close-btn';
                closeBtn.innerHTML = '&times;';
                closeBtn.setAttribute('aria-label', 'Close');
                closeBtn.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    closeCard(card, closeBtn);
                });
                card.appendChild(closeBtn);

                /* Trap focus inside modal */
                setTimeout(function () { closeBtn.focus(); }, 50);
            });
        });

        overlay.addEventListener('click', function () {
            document.querySelectorAll('.service-card.active').forEach(function (c) {
                var cb = c.querySelector('.close-btn');
                closeCard(c, cb);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.service-card.active').forEach(function (c) {
                    var cb = c.querySelector('.close-btn');
                    closeCard(c, cb);
                });
            }
        });
    }

    function closeCard(card, closeBtn) {
        card.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (closeBtn) closeBtn.remove();
    }

    /* ---------- Chatbot ---------- */
    var chatbotBtn       = document.querySelector('.chatbot-btn');
    var chatbotContainer = document.querySelector('.chatbot-container');
    var chatbotClose     = document.querySelector('.chatbot-close');
    var chatInput        = document.getElementById('chatbot-input-field');
    var chatSend         = document.querySelector('.chatbot-send');
    var chatMessages     = document.querySelector('.chatbot-messages');
    var chatBadge        = document.querySelector('.chatbot-badge');
    var quickRepliesEl   = document.querySelector('.quick-replies');

    var QUICK_REPLIES = [
        'Our services',
        'Get a quote',
        'Contact us',
        'View projects'
    ];

    function renderQuickReplies(replies) {
        if (!quickRepliesEl) return;
        quickRepliesEl.innerHTML = '';
        (replies || QUICK_REPLIES).forEach(function (text) {
            var chip = document.createElement('button');
            chip.className = 'quick-reply-chip';
            chip.textContent = text;
            chip.addEventListener('click', function () {
                sendMessage(text);
                quickRepliesEl.innerHTML = '';
            });
            quickRepliesEl.appendChild(chip);
        });
    }

    if (chatbotBtn && chatbotContainer) {
        chatbotBtn.addEventListener('click', function () {
            var isOpen = chatbotContainer.classList.toggle('open');
            if (isOpen && chatBadge) chatBadge.remove();
            if (isOpen) renderQuickReplies();
        });
    }

    if (chatbotClose) {
        chatbotClose.addEventListener('click', function () {
            chatbotContainer.classList.remove('open');
        });
    }

    if (chatSend) {
        chatSend.addEventListener('click', function () { sendMessage(); });
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function sendMessage(text) {
        var message = text || (chatInput ? chatInput.value.trim() : '');
        if (!message || !chatMessages) return;
        if (chatInput && !text) chatInput.value = '';

        addMessage(message, 'user');
        if (quickRepliesEl) quickRepliesEl.innerHTML = '';
        showTypingIndicator();

        var delay = 900 + Math.random() * 1200;
        setTimeout(function () {
            removeTypingIndicator();
            var response = getBotResponse(message);
            addMessage(response.text, 'bot');
            if (response.chips && quickRepliesEl) {
                renderQuickReplies(response.chips);
            }
        }, delay);
    }

    function addMessage(text, sender) {
        if (!chatMessages) return;
        var div = document.createElement('div');
        div.className = 'message message-' + sender;
        var content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        var time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = getTime();
        div.appendChild(content);
        div.appendChild(time);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        if (!chatMessages) return;
        var div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        for (var i = 0; i < 3; i++) {
            var dot = document.createElement('div');
            dot.className = 'typing-dot';
            div.appendChild(dot);
        }
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        var el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function getTime() {
        var d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function getBotResponse(msg) {
        var m = msg.toLowerCase();

        if (m.includes('hello') || m.includes('hi') || m.includes('hey')) {
            return {
                text: "Hello! Great to have you here. What can I help you with today?",
                chips: ['Our services', 'Get a quote', 'Contact us']
            };
        }
        if (m.includes('service') || m.includes('offer') || m.includes('our services')) {
            return {
                text: "We offer Web Development, UI/UX Design, Mobile Apps, Cloud Solutions, Cybersecurity, Network & Data Administration, and IT Consulting. Which interests you?",
                chips: ['Web Development', 'Mobile Apps', 'Cloud Solutions', 'Cybersecurity']
            };
        }
        if (m.includes('web') || m.includes('website')) {
            return {
                text: "Our web team builds responsive sites, SPAs, e-commerce platforms, and CMS solutions using React, Vue, Angular, Node.js, and more.",
                chips: ['Get a quote', 'View projects', 'Contact us']
            };
        }
        if (m.includes('mobile') || m.includes('app')) {
            return {
                text: "We develop cross-platform mobile apps for iOS and Android using Flutter and React Native, plus native builds.",
                chips: ['Get a quote', 'View projects']
            };
        }
        if (m.includes('cloud')) {
            return {
                text: "Our cloud team handles migrations, serverless architecture, and managed services on AWS, Azure, and Google Cloud.",
                chips: ['Get a quote', 'Contact us']
            };
        }
        if (m.includes('cyber') || m.includes('security')) {
            return {
                text: "We provide penetration testing, security audits, policy development, and employee training to protect your digital assets.",
                chips: ['Get a quote', 'Contact us']
            };
        }
        if (m.includes('quote') || m.includes('price') || m.includes('cost') || m.includes('get a quote')) {
            return {
                text: "We'd love to give you a tailored quote! Please share your project details via our Contact page or email dcodedevs@gmail.com.",
                chips: ['Contact us', 'View projects']
            };
        }
        if (m.includes('contact') || m.includes('email') || m.includes('phone') || m.includes('contact us')) {
            return {
                text: "Reach us at dcodedevs@gmail.com or call +254-768-372532. We're based in Nairobi, Kenya, and available Mon–Fri 9am–5pm.",
                chips: ['Get a quote', 'Our services']
            };
        }
        if (m.includes('project') || m.includes('portfolio') || m.includes('view projects')) {
            return {
                text: "Check out our portfolio on the Projects page — we've built e-commerce platforms, AI chatbots, cloud migrations, and more!",
                chips: ['Our services', 'Get a quote']
            };
        }
        if (m.includes('about') || m.includes('team') || m.includes('who')) {
            return {
                text: "DCODE is a Nairobi-based tech startup founded with a vision to bridge cutting-edge technology and business. Our team spans developers, designers, and consultants.",
                chips: ['Our services', 'Contact us']
            };
        }
        if (m.includes('thank')) {
            return {
                text: "You're welcome! Is there anything else I can help with?",
                chips: ['Our services', 'Get a quote', 'Contact us']
            };
        }

        return {
            text: "I'd be happy to help! Could you tell me more about what you're looking for?",
            chips: ['Our services', 'Get a quote', 'Contact us', 'View projects']
        };
    }

    /* ---------- Smooth anchor scroll ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var id = anchor.getAttribute('href');
            if (id === '#') return;
            var target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
            }
        });
    });

    /* ---------- Stats counter animation ---------- */
    var statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length && 'IntersectionObserver' in window) {
        var statsObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.getAttribute('data-target'), 10);
                var suffix = el.getAttribute('data-suffix') || '';
                var start = 0;
                var duration = 1800;
                var step = Math.ceil(target / (duration / 16));
                var timer = setInterval(function () {
                    start += step;
                    if (start >= target) {
                        el.textContent = target + suffix;
                        clearInterval(timer);
                    } else {
                        el.textContent = start + suffix;
                    }
                }, 16);
                statsObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(function (el) { statsObs.observe(el); });
    }

})();
