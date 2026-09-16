/* Alex - chat mockup engine */
(function () {
  'use strict';

  var THEME_KEY = 'alex-theme';
  var t0 = Date.now();

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hm(offsetMin) {
    var d = new Date(t0 + (offsetMin || 0) * 60000);
    var h = d.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + pad(d.getMinutes()) + ' ' + ap;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }
  function mk(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function es() { return document.createElement('span'); }

  /* ---------------- theme ---------------- */
  function currentTheme() {
    try { return localStorage.getItem(THEME_KEY) || 'fintech'; }
    catch (e) { return 'fintech'; }
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll('#themeToggle').forEach(function (b) {
      b.textContent = t === 'fintech' ? 'Switch: Casual theme' : 'Switch: Fintech theme';
    });
    document.dispatchEvent(new CustomEvent('alex-theme', { detail: t }));
  }
  function toggleTheme() {
    setTheme(currentTheme() === 'fintech' ? 'casual' : 'fintech');
  }

  /* ---------------- cards ---------------- */
  function badge(cls, text) { return '<span class="badge ' + cls + '">' + esc(text) + '</span>'; }
  function kv(k, v, extra) {
    return '<div class="kv' + (extra || '') + '"><span class="k">' + esc(k) + '</span><span class="v">' + v + '</span></div>';
  }
  function row(name, qty, amt) {
    return '<div class="row"><span class="r-name">' + esc(name) + '</span>' +
      (qty ? '<span class="r-qty">' + esc(qty) + '</span>' : '') +
      '<span class="r-amt">' + esc(amt) + '</span></div>';
  }

  var _activeEls = [];
  function cardHTML(kind, d) {
    d = d || {};
    var h = '';
    switch (kind) {
      case 'invoice':
        h = '<div class="card-head"><div><div class="card-title">Invoice ' + esc(d.id) + '</div>' +
          '<div class="card-sub">' + esc(d.customer || '') + '</div></div>' +
          badge(d.status === 'fulfilled' ? 'fulfilled' : 'pending', d.status === 'fulfilled' ? 'Fulfilled' : 'Pending') + '</div>'
          + (d.items || []).map(function (it) {
            return row(it.name + ' x ' + it.qty, null, DEMO.fmtKES(it.line));
          }).join('')
          + '<div class="divider"></div>'
          + kv('VAT (16%)', DEMO.fmtKES(d.vat || 0))
          + kv('Total', DEMO.fmtKES(d.total), ' total')
          + (d.etims ? '<div class="card-sub">eTIMS ' + esc(d.etims) + '</div>' : '');
        break;
      case 'receipt':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Payment received') + '</div>' +
          '<div class="card-sub">' + esc(d.sub || '') + '</div></div>' + badge('fulfilled', 'Paid') + '</div>'
          + kv('MPESA code', esc(d.mpesa || ''))
          + kv('Amount', DEMO.fmtKES(d.amount), ' total')
          + kv('eTIMS receipt', esc(d.etims || ''));
        break;
      case 'status':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Status') + '</div>' +
          '<div class="card-sub">' + esc(d.sub || '') + '</div></div>' + badge(d.cls || 'pending', d.tag || 'Pending') + '</div>'
          + (d.rows || []).map(function (r) { return kv(r.k, esc(r.v)); }).join('')
          + (d.note ? '<div class="card-sub">' + esc(d.note) + '</div>' : '');
        break;
      case 'report':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Report') + '</div></div></div>'
          + (d.rows || []).map(function (r) { return row(r.name, null, DEMO.fmtKES(r.amount)); }).join('')
          + '<div class="divider"></div>' + kv('Total', DEMO.fmtKES(d.total || 0), ' total')
          + (d.note ? '<div class="card-sub">' + esc(d.note) + '</div>' : '');
        break;
      case 'profit':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Profit & Loss') + '</div>' +
          '<div class="card-sub">' + esc(d.period || '') + '</div></div></div>'
          + kv('Revenue', DEMO.fmtKES(d.revenue))
          + kv('Cost of goods', '(' + DEMO.fmtKES(d.cogs) + ')')
          + kv('Operating costs', '(' + DEMO.fmtKES(d.expenses) + ')')
          + kv('Gross profit', DEMO.fmtKES(d.revenue - d.cogs))
          + '<div class="divider"></div>'
          + kv('Net profit', DEMO.fmtKES(d.net), ' total')
          + kv('Margin', (d.margin * 100).toFixed(1) + '%')
          + (d.proj ? '<div class="card-sub">Projection for next month: <b>' + esc(d.proj) + '</b></div>' : '');
        break;
      case 'stock':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Stock') + '</div></div></div>'
          + (d.rows || []).map(function (it) {
            var low = it.stock < (it.min || 50);
            return row(it.name + ' (' + pad2(it.stock) + ' ' + esc(it.unit || '') + ')', null, low ? badge('low', 'Low') : esc('OK'));
          }).join('')
          + (d.note ? '<div class="card-sub">' + esc(d.note) + '</div>' : '');
        break;
      case 'customer':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.name || '') + '</div>' +
          '<div class="card-sub">' + (d.active === false ? badge('muted', 'Inactive') : badge('fulfilled', 'Active')) + '</div></div></div>'
          + kv('PIN / TIN', esc(d.tin || ''))
          + kv('Phone', esc(d.phone || ''))
          + kv('Email', esc(d.email || ''))
          + kv('Total purchases', DEMO.fmtKES(d.purchases || 0))
          + (d.last ? kv('Last order', esc(d.last)) : '');
        break;
      case 'tax':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Tax filing') + '</div></div>' +
          badge('pending', 'Due ' + esc(d.dueLabel || '')) + '</div>'
          + kv('Return period', esc(d.period || ''))
          + kv('VAT payable', DEMO.fmtKES(d.amount), ' total')
          + (d.note ? '<div class="card-sub">' + esc(d.note) + '</div>' : '');
        break;
      case 'store':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Store front') + '</div>' +
          '<div class="card-sub">' + esc(d.url || '') + '</div></div></div>'
          + (d.orders ? d.orders.map(function (o) {
            return row(o.customer + ' · ' + o.item, null, DEMO.fmtKES(o.amount)) + '<div class="card-sub" style="margin-top:-6px">' +
              (o.status === 'new' ? badge('pending', 'New order') : badge('muted', 'Pending')) + '</div>';
          }).join('') : '')
          + (d.link ? '<div class="link-chip" data-url="' + esc(d.link) + '">Open ' + esc(d.link) + '</div>' : '');
        break;
      case 'notice':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Notice') + '</div>' +
          '<div class="card-sub">' + esc(d.from || '') + ' · ' + esc(d.date || '') + '</div></div></div>'
          + '<div>' + esc(d.body || '') + '</div>'
          + (d.link ? '<div class="link-chip" data-url="' + esc(d.link) + '">' + esc(d.link) + '</div>' : '');
        break;
      case 'onboarding':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Set up your business') + '</div></div></div>'
          + '<div class="steps">' + (d.steps || []).map(function (s, i) {
            return '<div class="step' + (s.done ? ' done' : '') + '"><span class="dot"></span><span>' + esc(s.label) + '</span></div>';
          }).join('') + '</div>';
        break;
      case 'menu':
        h = '<div class="card-head"><div><div class="card-title">' + esc(d.title || 'Main menu') + '</div></div></div>'
          + '<div class="card-sub">Tap an option below:</div>'
          + '<div class="steps">' + (d.items || []).map(function (it, i) {
            return '<div class="step"><span class="dot"></span><span><b>' + (i + 1) + '.</b> ' + esc(it.label) + '</span></div>';
          }).join('') + '</div>';
        break;
      default:
        h = '<div class="card-title">' + esc(d.title || kind) + '</div>';
    }
    return h;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function buildCardItem(item) {
    var el = mk('div', 'vcard', cardHTML(item.kind, item.data));
    (item.actions || []).forEach(function (a) {
      var b = mk('button', 'btn ' + (a.cls || ''), esc(a.label));
      b.addEventListener('click', function () { if (a.action) a.action(); });
      el.appendChild(b);
    });
    return el;
  }

  /* ---------------- UI singleton ---------------- */
  var UI = {
    body: null,
    input: null,
    sender: 'Alex',
    ticks: false,
    repliesEl: null,
    cardsEl: null,
    onText: null,
    pending: [],

    init: function (opts) {
      opts = opts || {};
      this.body = document.querySelector('.chat-body');
      this.input = document.querySelector('.chat-input input');
      var sendBtn = document.querySelector('.chat-input .send');
      this.sender = opts.sender || 'Alex';
      this.ticks = !!opts.ticks;
      this.onText = opts.onText || function () {};

      var ui = this;
      document.querySelectorAll('#themeToggle').forEach(function (b) {
        b.addEventListener('click', toggleTheme);
      });
      setTheme(currentTheme());

      if (this.input && sendBtn) {
        sendBtn.addEventListener('click', function () { ui.handleTyped(); });
        this.input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); ui.handleTyped(); }
        });
        setTimeout(function () { ui.input && ui.input.focus(); }, 300);
      }
      return this;
    },

    handleTyped: function () {
      var v = this.input.value.trim();
      if (!v) return;
      this.typed(v);
      this.input.value = '';
      this.onText(v);
    },

    typed: function (text) { this.user(text); },

    scroll: function () {
      var b = this.body;
      if (b) b.scrollTop = b.scrollHeight;
    },

    pill: function (label) {
      this.body.appendChild(mk('div', 'day-pill', esc(label)));
      this.scroll();
    },

    user: function (text) {
      var m = mk('div', 'msg msg-user');
      m.appendChild(mk('div', '', fmt(text)));
      var meta = mk('div', 'meta', hm());
      if (this.ticks) meta.innerHTML = hm(0) + ' <span class="ticks">✓✓</span>';
      m.appendChild(meta);
      this.body.appendChild(m);
      this.clearControls();
      this.scroll();
    },

    bot: function (text, sender) {
      var m = mk('div', 'msg msg-bot');
      m.appendChild(mk('div', 'sender', esc(sender || this.sender)));
      m.appendChild(mk('div', '', fmt(text)));
      var meta = mk('div', 'meta', hm());
      m.appendChild(meta);
      this.body.appendChild(m);
      this.scroll();
    },

    say: function (text, opts) {
      opts = opts || {};
      var ui = this;
      var t = mk('div', 'msg msg-bot msg-typing');
      t.appendChild(es()); t.appendChild(es()); t.appendChild(es());
      this.body.appendChild(t);
      this.scroll();
      var delay = opts.delay != null ? opts.delay : 500 + Math.random() * 450;
      setTimeout(function () {
        t.parentNode && t.parentNode.removeChild(t);
        ui.bot(text, opts.sender);
        if (opts.cards) ui.cards(opts.cards);
        if (opts.replies) ui.replies(opts.replies, opts);
        if (opts.sms) ui.sms(opts.sms);
        if (opts.tg) ui.tg(opts.tg);
        ui.scroll();
      }, delay);
    },

    cards: function (list) {
      var wrap = mk('div', 'cards-wrap');
      (list || []).forEach(function (item) { wrap.appendChild(buildCardItem(item)); });
      this.body.appendChild(wrap);
      this.scroll();
    },

    clearControls: function () {
      if (this.repliesEl && this.repliesEl.parentNode) this.repliesEl.parentNode.removeChild(this.repliesEl);
      this.repliesEl = null;
      var c = document.querySelector('.cards-wrap:last-child');
      // keep cards visible; only strip quick-reply rows attached after the last user msg
    },

    /* quick reply chips (web / mobile / whatsapp list) */
    replies: function (list, opts) {
      var wrap = mk('div', 'quick-replies' + ((opts || {}).wa ? ' wa' : ''));
      (list || []).forEach(function (r) {
        var b = mk('button', 'qr' + (r.cls ? ' ' + r.cls : ''), esc(r.label));
        b.addEventListener('click', function () {
          UI.user(r.label);
          UI.clearControls();
          r.action && r.action();
        });
        wrap.appendChild(b);
      });
      this.body.appendChild(wrap);
      this.repliesEl = wrap;
      this.scroll();
    },

    /* SMS numbered choices */
    sms: function (list) {
      var wrap = mk('div', 'sms-choices');
      (list || []).forEach(function (r, i) {
        var b = mk('button', 'sms-choice', '<span class="num">' + (r.num || (i + 1)) + '</span><span>' + esc(r.label) + '</span>');
        b.addEventListener('click', function () {
          UI.user(r.num || (i + 1));
          UI.clearControls();
          r.action && r.action();
        });
        wrap.appendChild(b);
      });
      this.body.appendChild(wrap);
      this.repliesEl = wrap;
      this.scroll();
    },

    /* Telegram inline keyboard */
    tg: function (rows) {
      var wrap = mk('div', 'tg-keys');
      (rows || []).forEach(function (rowArr) {
        var rdiv = mk('div', 'tg-row');
        rowArr.forEach(function (r) {
          var b = mk('button', 'tg-btn', esc(r.label));
          b.addEventListener('click', function () {
            UI.user(r.label);
            UI.clearControls();
            r.action && r.action();
          });
          rdiv.appendChild(b);
        });
        wrap.appendChild(rdiv);
      });
      this.body.appendChild(wrap);
      this.repliesEl = wrap;
      this.scroll();
    },

    linkChips: function () {
      document.querySelectorAll('.link-chip[data-url]').forEach(function (el) {
        el.addEventListener('click', function () { UI.user('Opening ' + el.getAttribute('data-url')); });
      });
    },
  };

  window.AlexChat = {
    UI: UI,
    fmt: fmt,
    esc: esc,
    hm: hm,
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    currentTheme: currentTheme,
    card: buildCardItem,
  };

  document.addEventListener('click', function (e) {
    var chip = e.target.closest && e.target.closest('.link-chip[data-url]');
    if (chip) { UI.user('Opening ' + chip.getAttribute('data-url')); }
  });
})();