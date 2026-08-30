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
