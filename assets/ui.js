// Shared by the site, the app and the docs pages: quick exit, the theme button,
// and the next-meeting strip.
(function(){
  // Quick exit: replace this page with a neutral one. location.replace keeps
  // this site out of the Back button's history.
  var EXIT_URL = 'https://weather.com/';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'quick-exit';
  btn.setAttribute('aria-label', 'Quick exit: leave this site now');
  btn.textContent = '✕ Quick exit';
  btn.addEventListener('click', function(){
    try{ document.body.style.display = 'none'; }catch(e){}
    window.location.replace(EXIT_URL);
  });
  document.body.appendChild(btn);

  // Theme button: cycles Auto (follow the phone) -> Light -> Dark.
  // It goes wherever the page puts an element with data-theme-slot.
  var slot = document.querySelector('[data-theme-slot]');
  if(window.swcasTheme && slot){
    var ICON = {
      auto:'<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/>',
      light:'<circle cx="8" cy="8" r="3.2" fill="currentColor"/><path d="M8 .8v2M8 13.2v2M.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M2.9 13.1l1.4-1.4M11.7 4.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      dark:'<path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor"/>'
    };
    var NAMES = {auto:'Auto', light:'Light', dark:'Dark'};
    var NEXT = {auto:'light', light:'dark', dark:'auto'};
    var tb = document.createElement('button');
    tb.type = 'button';
    tb.className = 'theme-btn';
    var sync = function(){
      var t = window.swcasTheme.get();
      if(!NAMES[t]) t = 'auto';
      tb.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">' + ICON[t] + '</svg><span>' + NAMES[t] + '</span>';
      tb.setAttribute('aria-label', 'Color theme: ' + NAMES[t] + '. Tap to change.');
    };
    tb.addEventListener('click', function(){ window.swcasTheme.set(NEXT[window.swcasTheme.get()] || 'auto'); sync(); });
    sync();
    slot.appendChild(tb);
  }

  // Next meeting: Saturdays 10:15 to 11:45 AM Arizona time (UTC-7 all year) = 17:15 UTC, 90 minutes.
  var strips = document.querySelectorAll('[data-next-meeting]');
  if(!strips.length) return;
  var DIRECTIONS = 'https://www.google.com/maps/search/?api=1&query=Church+of+the+Resurrection+3201+S+Evergreen+Rd+Tempe+AZ+85282';
  var LENGTH = 90 * 60000, EARLY = 30 * 60000;
  function nextStart(now){
    var t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 17, 15, 0));
    t.setUTCDate(t.getUTCDate() + (6 - t.getUTCDay() + 7) % 7);
    if(t.getTime() + LENGTH <= now.getTime()) t.setUTCDate(t.getUTCDate() + 7);
    return t;
  }
  function localTime(t){
    try{
      var az = t.toLocaleTimeString('en-US', {timeZone:'America/Phoenix', hour:'numeric', minute:'2-digit'});
      var mine = t.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
      return az === mine ? '' : ' (' + mine + ' your time)';
    }catch(e){ return ''; }
  }
  strips.forEach(function(el){
    el.classList.add('next-meeting');
    el.innerHTML =
      '<div class="nm-when"><span class="nm-label"></span><span class="nm-count"></span><span class="nm-date"></span></div>' +
      '<a class="btn nm-go" target="_blank" rel="noopener">Get directions</a>';
    el.querySelector('.nm-go').href = DIRECTIONS;
  });
  function update(){
    var now = new Date(), start = nextStart(now), diff = start - now;
    var soon = diff <= EARLY, on = diff <= 0;
    var label = on ? 'Meeting is happening now' : soon ? 'Starting soon' : 'Next meeting';
    var count;
    if(on) count = 'Room #3, come on in';
    else{
      var d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000), m = Math.ceil(diff % 3600000 / 60000);
      if(m === 60){ h++; m = 0; }
      count = 'in ' + (d ? d + (d === 1 ? ' day ' : ' days ') : '') + (d || h ? h + 'h ' : '') + m + 'm';
    }
    var date = start.toLocaleDateString('en-US', {timeZone:'UTC', weekday:'long', month:'short', day:'numeric'}) +
      ', 10:15 to 11:45 AM Arizona' + localTime(start);
    strips.forEach(function(el){
      el.classList.toggle('is-live', soon);
      el.querySelector('.nm-label').textContent = label;
      el.querySelector('.nm-count').textContent = count;
      el.querySelector('.nm-date').textContent = date;
    });
  }
  update();
  setInterval(update, 15000);
})();
