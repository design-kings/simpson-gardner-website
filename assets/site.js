(function(){
  // Portfolio filters
  var btns=document.querySelectorAll('.filter-btn[data-filter]');
  var cards=document.querySelectorAll('.portfolio-card[data-style],.interior-card[data-style]');
  btns.forEach(function(b){b.addEventListener('click',function(){
    btns.forEach(function(x){x.classList.remove('active');}); b.classList.add('active');
    var f=b.getAttribute('data-filter');
    cards.forEach(function(c){c.classList.toggle('is-hidden', f!=='all' && c.getAttribute('data-style')!==f);});
  });});
  // Lightbox
  var lb=document.getElementById('lb'),img=document.getElementById('lb-img'),cap=document.getElementById('lb-cap');
  var set=[],idx=0;
  function show(i){idx=(i+set.length)%set.length;var g=set[idx];img.src=g.querySelector('img').src;img.alt=g.querySelector('img').alt;cap.textContent=(idx+1)+' / '+set.length+'  \u00b7  '+g.querySelector('.g-cap').textContent;}
  document.querySelectorAll('.project-gallery .g').forEach(function(g){g.addEventListener('click',function(){
    set=Array.prototype.slice.call(document.querySelectorAll('.project-gallery .g[data-lb="'+g.getAttribute('data-lb')+'"]'));
    show(set.indexOf(g)); lb.classList.add('open'); document.body.style.overflow='hidden';
  });});
  function close(){lb.classList.remove('open');document.body.style.overflow='';}
  document.getElementById('lb-close').onclick=close;
  document.getElementById('lb-prev').onclick=function(e){e.stopPropagation();show(idx-1);};
  document.getElementById('lb-next').onclick=function(e){e.stopPropagation();show(idx+1);};
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1);});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(d>50)show(idx-1);if(d<-50)show(idx+1);});
})();

/* Instagram feed: render the live posts pulled by the daily Action.
   Falls back to Instagram's own embed if the feed file is missing, which is
   also what happens on local file:// previews where fetch is blocked. */
(function(){
  var host = document.getElementById('ig-feed');
  if (!host) return;
  function fallback(){
    var url = host.getAttribute('data-fallback');
    if (!url) return;
    var f = document.createElement('iframe');
    f.src = url; f.title = 'Simpson & Gardner on Instagram';
    f.loading = 'lazy'; f.setAttribute('scrolling','yes');
    host.innerHTML = ''; host.appendChild(f);
  }
  fetch('assets/feed/instagram.json', {cache:'no-cache'})
    .then(function(r){ if(!r.ok) throw new Error('no feed'); return r.json(); })
    .then(function(d){
      var posts = (d && d.posts) || [];
      if (!posts.length) throw new Error('empty feed');
      var wrap = document.createElement('div');
      wrap.className = 'ig-scroll';
      posts.forEach(function(p){
        var a = document.createElement('a');
        a.className = 'ig-tile';
        a.href = p.permalink; a.target = '_blank'; a.rel = 'noopener';
        var img = document.createElement('img');
        img.src = p.img; img.loading = 'lazy';
        img.alt = p.caption || 'Instagram post from Simpson & Gardner';
        a.appendChild(img);
        if (p.caption){
          var c = document.createElement('div');
          c.className = 'ig-cap'; c.textContent = p.caption;
          a.appendChild(c);
        }
        wrap.appendChild(a);
      });
      host.innerHTML = ''; host.appendChild(wrap);
    })
    .catch(fallback);
})();

/* Contact form: posts to Web3Forms, which emails the inquiry on.
   The access key lives in the form's data-access-key attribute in contact.html. */
(function(){
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('cf-status');
  var submit = document.getElementById('cf-submit');
  var PHONE  = '817-723-9146';

  function fieldOf(el){ return el.closest('.form-field'); }

  function clearError(el){
    var f = fieldOf(el);
    if (!f) return;
    f.classList.remove('invalid');
    var e = f.querySelector('.form-error');
    if (e) e.remove();
  }

  function setError(el, msg){
    var f = fieldOf(el);
    if (!f) return;
    f.classList.add('invalid');
    if (!f.querySelector('.form-error')){
      var e = document.createElement('div');
      e.className = 'form-error';
      e.textContent = msg;
      f.appendChild(e);
    }
  }

  form.addEventListener('input', function(e){
    if (e.target.classList.contains('form-input') || e.target.classList.contains('form-textarea')) clearError(e.target);
  });

  function validate(){
    var ok = true, first = null;
    [['cf-name','Please tell us your name.'],
     ['cf-message','Please tell us a little about your project.']].forEach(function(pair){
      var el = document.getElementById(pair[0]);
      clearError(el);
      if (!el.value.trim()){ setError(el, pair[1]); ok = false; first = first || el; }
    });
    var em = document.getElementById('cf-email');
    clearError(em);
    if (!em.value.trim()){
      setError(em, 'Please enter your email address.'); ok = false; first = first || em;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())){
      setError(em, 'That email address does not look right.'); ok = false; first = first || em;
    }
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    if (!validate()) return;

    var key = form.getAttribute('data-access-key');
    if (!key || key === 'WEB3FORMS_ACCESS_KEY'){
      status.className = 'form-status error';
      status.textContent = 'This form is not connected yet. Please call ' + PHONE + '.';
      return;
    }

    var data = { access_key: key };
    new FormData(form).forEach(function(v,k){ data[k] = v; });

    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = 'Sending...';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(r){ return r.json().then(function(j){ return { ok: r.ok && j.success, body: j }; }); })
    .then(function(res){
      if (!res.ok) throw new Error((res.body && res.body.message) || 'send failed');
      var done = document.createElement('div');
      done.className = 'form-sent';
      done.setAttribute('role','status');
      var h = document.createElement('h3');
      h.textContent = 'Thank you. Your message is on its way.';
      var p = document.createElement('p');
      p.textContent = 'We read every inquiry and will be in touch within one business day. '
                    + 'If it is urgent, call us at ' + PHONE + '.';
      done.appendChild(h); done.appendChild(p);
      form.parentNode.replaceChild(done, form);
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch(function(){
      submit.disabled = false;
      submit.textContent = label;
      status.className = 'form-status error';
      status.textContent = 'Something went wrong sending your message. Please try again, '
                         + 'or call us at ' + PHONE + '.';
    });
  });
})();

/* Mobile menu toggle. The nav links are hidden under 768px, so without this
   there is no way to move between pages except the footer. */
(function(){
  var btn  = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;
  function set(open){
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  }
  btn.addEventListener('click', function(){
    set(btn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function(e){
    if (e.target.tagName === 'A') set(false);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') set(false);
  });
  window.addEventListener('resize', function(){
    if (window.innerWidth > 768) set(false);
  });
})();
