/**
 * landing.js - Static landing-page interactions for Alex.
 * No build step. Plain ES5-compatible, file:// safe.
 */
(function () {
  'use strict';

  /* --------------------------------------------------------
     1. STICKY NAV SHRINK + BACK-TO-TOP
     -------------------------------------------------------- */
  var nav = document.querySelector('.lp-nav');
  var backTop = document.getElementById('backTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) {
      if (y > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    if (backTop) {
      if (y > 500) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------
     2. SMOOTH SCROLL for in-page anchor links
     -------------------------------------------------------- */
  var anchors = document.querySelectorAll('a[href^="#"]');
  var i, len;
  for (i = 0, len = anchors.length; i < len; i++) {
    (function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#' || hash === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, '', '#top');
          }
          return;
        }
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (history.pushState) {
          history.pushState(null, '', hash);
        }
        if (a.classList.contains('js-waitlist')) {
          setTimeout(function () {
            var phone = document.getElementById('wlPhone');
            if (phone) phone.focus();
          }, 600);
        }
      });
    })(anchors[i]);
  }

  /* --------------------------------------------------------
     3. FAQ ACCORDION
     -------------------------------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');
  var j, jLen;
  for (j = 0, jLen = faqItems.length; j < jLen; j++) {
    (function (item) {
      var btn = item.querySelector('.faq-q');
      if (!btn) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        for (var k = 0, kLen = faqItems.length; k < kLen; k++) {
          faqItems[k].classList.remove('open');
          var kBtn = faqItems[k].querySelector('.faq-q');
          if (kBtn) kBtn.setAttribute('aria-expanded', 'false');
        }
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    })(faqItems[j]);
  }

  /* --------------------------------------------------------
     4. WAITLIST FORM
     -------------------------------------------------------- */
  var form = document.getElementById('waitlistForm');

  function validatePhone(raw) {
    var stripped = raw.replace(/[\s\-()]/g, '');
    var digits;
    if (stripped.charAt(0) === '+') {
      digits = stripped.substring(1);
    } else {
      digits = stripped;
    }
    if (!/^\d+$/.test(digits)) return false;
    if (digits.length < 10 || digits.length > 15) return false;
    /* Strip international prefix 254 */
    if (digits.indexOf('254') === 0 && digits.length >= 12) {
      digits = digits.substring(3);
      /* +2547xx... -> 07xx... local form */
      if (digits.length === 9 && (digits.charAt(0) === '7' || digits.charAt(0) === '1')) {
        digits = '0' + digits;
      }
    }
    /* Local form: 07xx (10 digits) or 01xx (10 digits) */
    if (digits.length === 10 && digits.charAt(0) === '0') {
      return digits;
    }
    /* Already 10 digits not starting with 0 - accept if >= 10 total */
    if (digits.length >= 10) {
      return digits;
    }
    return false;
  }

  function showError(msg) {
    var err = document.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color:#c0392b;font-size:14px;margin-top:10px';
      form.parentNode.insertBefore(err, form.nextSibling);
    }
    err.textContent = msg;
  }

  function clearError() {
    var err = document.querySelector('.form-error');
    if (err) err.parentNode.removeChild(err);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('wlName');
      var email = document.getElementById('wlEmail');
      var phone = document.getElementById('wlPhone');
      var nameVal = name ? name.value.trim() : '';
      var emailVal = email ? email.value.trim() : '';
      var phoneVal = phone ? phone.value.trim() : '';
      var digits = validatePhone(phoneVal);

      if (!nameVal || !digits) {
        showError('Please enter a valid name and phone number, e.g. 0757 460 573 or +254 757 460 573.');
        return;
      }

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!emailOk) {
        showError('Please enter a valid email address.');
        return;
      }

      clearError();
      var successBox = document.getElementById('successBox');

      var formData = new FormData();
      formData.append('access_key', 'd4eaf735-8a8e-40a6-8c89-3a3f140a51b0');
      formData.append('name', nameVal);
      formData.append('email', emailVal);
      formData.append('phone', phoneVal);
      formData.append('from_name', 'Alex waitlist');
      formData.append('subject', 'New Alex waitlist signup');
      formData.append('botcheck', '');

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.style.display = 'none';
            if (successBox) successBox.removeAttribute('hidden');
          } else {
            showError('Something went wrong. Please try again.');
          }
        })
        .catch(function () {
          showError('Could not reach the server. Please try again.');
        });
    });
  }

  /* --------------------------------------------------------
     5. HERO CHAT PREVIEW ANIMATION
     -------------------------------------------------------- */
  var chatRan = false;
  var previewChat = document.getElementById('previewChat');

  function makeMsg(text, isUser) {
    var el = document.createElement('div');
    el.className = 'preview-msg ' + (isUser ? 'preview-msg-user' : 'preview-msg-bot');
    if (isUser) {
      el.style.background = '#0f7a5f';
      el.style.color = '#fff';
      el.style.alignSelf = 'flex-end';
    }
    var inner = document.createElement('div');
    inner.className = 'preview-text';
    inner.textContent = text;
    el.appendChild(inner);
    el.style.opacity = '0';
    previewChat.appendChild(el);
    /* jshint -W030 */
    requestAnimationFrame(function () {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '1';
    });
    /* jshint +W030 */
    previewChat.scrollTop = previewChat.scrollHeight;
    return el;
  }

  function scrollChat() {
    previewChat.scrollTop = previewChat.scrollHeight;
  }

  function runChatAnimation() {
    if (chatRan || !previewChat) return;
    chatRan = true;

    setTimeout(function () {
      makeMsg('Restock 40 kg', true);

      setTimeout(function () {
        makeMsg('Restock order sent to Mabati Rolling Mills. Delivery in 3 days.', false);

        setTimeout(function () {
          makeMsg('Receipt ETI-2026-01460 filed to KRA eTIMS.', false);
          scrollChat();
        }, 400);
      }, 1400);
    }, 1200);
  }

  /* --------------------------------------------------------
     5b. PREVIEW CHIP CLICKS
     -------------------------------------------------------- */
  function initChips() {
    var chips = document.querySelectorAll('.preview-chip');
    for (var c = 0, cLen = chips.length; c < cLen; c++) {
      (function (chip) {
        chip.addEventListener('click', function () {
          var text = chip.textContent.trim();
          makeMsg(text, true);
          setTimeout(function () {
            makeMsg('Done. 6 more days of stock secured.', false);
          }, 1000);
          chip.disabled = true;
          chip.style.opacity = '0.5';
          chip.style.pointerEvents = 'none';
        });
      })(chips[c]);
    }
  }

  if (previewChat) {
    initChips();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runChatAnimation);
    } else {
      runChatAnimation();
    }
  }

  /* --------------------------------------------------------
     6. BACK-TO-TOP FOCUS ON CLICK
     -------------------------------------------------------- */
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      backTop.blur();
    });
  }

})();
