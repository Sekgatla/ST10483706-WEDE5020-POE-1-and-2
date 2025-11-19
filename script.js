/* PART 3 - Enhanced interactivity, forms, SEO helpers
   - Accordion, Tabs, Modal, Lightbox gallery
   - Leaflet interactive map
   - Dynamic content loader + search
   - Enhanced form validation and AJAX-style submit
   - Small animations trigger (fade-in)
*/

/* --------------------- Utility --------------------- */
function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
function $(sel, ctx){ return (ctx||document).querySelector(sel); }
function $$(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

/* --------------------- MOBILE MENU (keeps your logic) --------------------- */
(function(){
  function initMenu(btnId){
    const btn = document.getElementById(btnId);
    if(!btn) return;
    btn.addEventListener('click', () => {
      const nav = document.querySelector('.main-nav');
      if(!nav) return;
      if(nav.style.display === 'flex') {
        nav.style.display = '';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.gap = '10px';
        nav.style.alignItems = 'center';
      }
    });
  }
  ['menuBtn','menuBtn2','menuBtn3','menuBtn4','menuBtn5','menuBtn6'].forEach(initMenu);
})();

/* --------------------- ACCORDION (for services) --------------------- */
ready(function(){
  // convert .service-card elements into an accordion if present
  const servicesContainer = document.querySelector('.frame-services .content-frame');
  if(servicesContainer){
    const serviceCards = Array.from(servicesContainer.querySelectorAll('.service-card'));
    if(serviceCards.length){
      const wrapper = document.createElement('div');
      wrapper.className = 'accordion';
      serviceCards.forEach((card, idx) => {
        const headerText = card.querySelector('h2') ? card.querySelector('h2').innerText : ('Service '+(idx+1));
        const bodyContent = document.createElement('div');
        bodyContent.className = 'accordion-body';
        // move card content into body (preserve text exactly)
        bodyContent.innerHTML = card.innerHTML;
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
          <div class="accordion-header" role="button" aria-expanded="false" tabindex="0">
            <span>${headerText}</span><span class="chev">▾</span>
          </div>
        `;
        item.appendChild(bodyContent);
        wrapper.appendChild(item);
        card.remove();
      });
      // insert accordion where content-frame was
      servicesContainer.prepend(wrapper);

      // add event handlers
      wrapper.addEventListener('click', function(e){
        const header = e.target.closest('.accordion-header');
        if(!header) return;
        const item = header.parentElement;
        const body = item.querySelector('.accordion-body');
        const expanded = header.getAttribute('aria-expanded') === 'true';
        // close all
        wrapper.querySelectorAll('.accordion-header').forEach(h=>{
          h.setAttribute('aria-expanded','false');
          h.querySelector('.chev').style.transform = '';
          h.parentElement.querySelector('.accordion-body').style.display = 'none';
        });
        if(!expanded){
          header.setAttribute('aria-expanded','true');
          header.querySelector('.chev').style.transform = 'rotate(180deg)';
          body.style.display = 'block';
        }
      });
      // keyboard support
      wrapper.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          const header = e.target.closest('.accordion-header');
          if(header) header.click();
        }
      });
    }
  }
});

/* --------------------- TABS (optional usage) --------------------- */
/* Example usage: add .tabs container with buttons having data-target="#id" */
ready(function(){
  const tabs = document.querySelectorAll('.tabs');
  tabs.forEach(tabWrap=>{
    tabWrap.addEventListener('click', e=>{
      const btn = e.target.closest('.tab-btn');
      if(!btn) return;
      const tgt = document.querySelector(btn.getAttribute('data-target'));
      if(!tgt) return;
      // hide all sibling targets
      document.querySelectorAll('[data-tab-content]').forEach(c=>c.style.display='none');
      // remove active from siblings
      tabWrap.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      tgt.style.display = 'block';
    });
    // set first active automatically
    const first = tabWrap.querySelector('.tab-btn');
    if(first) first.click();
  });
});

/* --------------------- LIGHTBOX GALLERY --------------------- */
ready(function(){
  // Create lightbox element (single global)
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<span class="close-light" aria-label="Close">✕</span><img src="" alt="Gallery image">`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img');
  const lbClose = lb.querySelector('.close-light');
  lb.addEventListener('click', (e)=>{
    if(e.target === lb || e.target === lbClose) lb.style.display = 'none';
  });
  // open on gallery image click
  document.addEventListener('click', function(e){
    const img = e.target.closest('.gallery-grid img');
    if(!img) return;
    lbImg.src = img.dataset.large || img.src;
    lbImg.alt = img.alt || 'Tharollo image';
    lb.style.display = 'flex';
  });
});

/* --------------------- MODAL (announcement) --------------------- */
ready(function(){
  // Create a modal and a trigger button in header (non-intrusive)
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'siteModal';
  modal.innerHTML = `<button class="modal-close" aria-label="Close modal">✕</button>
    <h3>Latest Announcement</h3>
    <p>Tharollo NPO Foundation runs regular community drives and workshops — contact us to join or donate.</p>
    <div style="text-align:right;margin-top:10px"><button id="modalOkBtn" class="btn-submit">OK</button></div>`;
  document.body.appendChild(modal);

  // small trigger button in header (non disruptive)
  const headerInner = document.querySelector('.nav-inner');
  if(headerInner){
    const btn = document.createElement('button');
    btn.className = 'btn-submit';
    btn.style.marginLeft = '12px';
    btn.style.fontWeight = '700';
    btn.textContent = 'Announcement';
    btn.addEventListener('click', ()=> modal.classList.add('open'));
    headerInner.appendChild(btn);
  }
  // close handlers
  modal.addEventListener('click', e=>{
    if(e.target.classList.contains('modal-close')) modal.classList.remove('open');
  });
  const ok = document.getElementById('modalOkBtn');
  if(ok) ok.addEventListener('click', ()=> modal.classList.remove('open'));
});

/* --------------------- LEAFLET MAP (Contact page) --------------------- */
ready(function(){
  // initialize leaflet if map container exists
  if(typeof L !== 'undefined'){
    const mapEl = document.getElementById('leafletMap');
    if(mapEl){
      // center using approximate coordinates from your iframe in contact.html
      const lat = -23.903495, lon = 29.446283;
      const map = L.map('leafletMap').setView([lat, lon], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lon]).addTo(map).bindPopup('Tharollo NPO Foundation').openPopup();
    }
  }
});

/* --------------------- DYNAMIC CONTENT + SEARCH --------------------- */
/* This will populate a small dynamic list (events/services) and filter it */
ready(function(){
  // example dynamic dataset (you can replace with JSON endpoint later)
  const dataset = [
    { id:1, type:'Workshop', title:'Youth Mentorship - September', desc:'Free workshop for 12-18 year olds.'},
    { id:2, type:'Distribution', title:'Food Parcels Drive', desc:'Weekly support for vulnerable families.'},
    { id:3, type:'Health', title:'Wellness Check-up', desc:'Counselling and health screenings.'}
  ];
  // Create a dynamic section if a placeholder exists
  const holder = document.getElementById('dynamicList');
  if(holder){
    // create search input
    const searchWrap = document.createElement('div');
    searchWrap.style.display='flex'; searchWrap.style.gap='8px'; searchWrap.style.marginBottom='12px';
    const search = document.createElement('input');
    search.type='search'; search.placeholder='Search events or services...'; search.style.flex='1'; search.className='search-input';
    const sort = document.createElement('select');
    sort.innerHTML = '<option value="new">Sort: Newest</option><option value="alpha">Sort: A–Z</option>';
    searchWrap.appendChild(search); searchWrap.appendChild(sort);
    holder.appendChild(searchWrap);
    const list = document.createElement('div'); list.id='dynListItems'; holder.appendChild(list);

    function render(listData){
      list.innerHTML = '';
      if(!listData.length) list.innerHTML = '<p>No results.</p>';
      listData.forEach(item=>{
        const el = document.createElement('div'); el.className='frame'; el.style.marginBottom='10px';
        el.innerHTML = `<h4 style="margin:0 0 8px 0">${item.title}</h4><p style="margin:0">${item.desc}</p>`;
        list.appendChild(el);
      });
    }
    render(dataset);

    search.addEventListener('input', function(){
      const q = this.value.trim().toLowerCase();
      const filtered = dataset.filter(d => (d.title + ' ' + d.desc + ' ' + d.type).toLowerCase().includes(q));
      render(filtered);
    });
    sort.addEventListener('change', function(){
      const val = this.value;
      const sorted = [...dataset];
      if(val === 'alpha') sorted.sort((a,b)=> a.title.localeCompare(b.title));
      render(sorted);
    });
  }
});

/* --------------------- FORM ENHANCEMENTS (Contact + Enquiry) --------------------- */
ready(function(){
  const contactForm = document.getElementById('contactForm');
  const contactResult = document.getElementById('contactResult');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const message = document.getElementById('cMessage').value.trim();
      // new validations
      function bad(msg){
        if(contactResult){
          contactResult.style.display='block';
          contactResult.style.background='#ffe3e3';
          contactResult.style.borderLeft='5px solid red';
          contactResult.textContent = '⚠️ ' + msg;
        }
      }
      if(!name || !email || !message){
        bad('Please fill in all fields.');
        return;
      }
      // email format
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRe.test(email)){ bad('Please enter a valid email address.'); return; }
      if(message.length < 10){ bad('Message should be at least 10 characters.'); return; }

      // AJAX-style simulation (no backend) — prepare payload
      const payload = { name, email, message, page: location.pathname };
      // Try to POST to an endpoint if provided (graceful fallback to mailto)
      const fakeEndpoint = contactForm.getAttribute('data-endpoint');
      if(fakeEndpoint){
        // real AJAX
        fetch(fakeEndpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
          .then(res=> {
            if(res.ok) {
              contactForm.reset();
              if(contactResult){ contactResult.style.display='block'; contactResult.style.background='#e9ffe9'; contactResult.style.borderLeft='5px solid #32a852'; contactResult.textContent='Thank you — message sent.'; }
            } else throw new Error('Server error');
          })
          .catch(err=>{
            if(contactResult){ contactResult.style.display='block'; contactResult.style.background='#ffe3e3'; contactResult.style.borderLeft='5px solid red'; contactResult.textContent='Could not send. Please try using your email client.'; }
            // fallback to mailto
            const recipient = 'TharolloNPOFoundation@gmail.com.org';
            const subject = encodeURIComponent('Website Contact: ' + name);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
            // keep original behavior but only initiate if user confirms
            if(confirm('We could not send automatically. Open your email client to send this message?')){
              window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
            }
          });
      } else {
        // No endpoint: show result and offer mailto fallback
        contactForm.reset();
        if(contactResult){
          contactResult.style.display='block';
          contactResult.style.background='#e9ffe9';
          contactResult.style.borderLeft='5px solid #32a852';
          contactResult.textContent = 'Message prepared. Click to open your email client to send.';
          contactResult.style.cursor='pointer';
          contactResult.onclick = () => {
            const recipient = 'TharolloNPOFoundation@gmail.com.org';
            const subject = encodeURIComponent('Website Contact: ' + name);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
            window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
          };
        }
      }
    });
  }
  // Enquiry form (dynamic responses):
  const enquiryForm = document.getElementById('enquiryForm');
  const enquiryResult = document.getElementById('enquiryResult');
  if(enquiryForm){
    enquiryForm.addEventListener('submit', function(e){
      e.preventDefault();
      const selected = document.querySelector("input[name='enquiryType']:checked");
      if(!selected){
        if(enquiryResult){
          enquiryResult.style.display = 'block';
          enquiryResult.style.background = '#ffe3e3';
          enquiryResult.style.borderLeft = '5px solid red';
          enquiryResult.textContent = '⚠️ Please select an enquiry option.';
        }
        return;
      }
      // dynamic responses (crafted to meet assignment — you can edit later)
      const replies = {
        "Food Parcels": "Food parcels are available weekly. Suggested donation: R50 per parcel. Please call ahead to confirm availability.",
        "Clothing Donations": "Clothing donations accepted on weekdays 9:00–16:00 at 96 Bok Street. Large items by appointment.",
        "Educational Workshops": "Workshops run monthly. Please provide number of attendees and preferred dates to check availability.",
        "Health & Wellness Support": "Health & wellness sessions are by appointment. We offer group workshops and individual counselling.",
        "Volunteer Opportunities": "Volunteer sessions are every Saturday from 09:00–13:00. Please indicate your skills when signing up.",
        "Sponsorship": "Sponsorship packages start at R500/month. We can provide an information pack on request."
      };
      const response = replies[selected.value] || ("Thanks — you selected: " + selected.value);
      if(enquiryResult){
        enquiryResult.style.display='block';
        enquiryResult.style.background='#e9ffe9';
        enquiryResult.style.borderLeft='5px solid #32a852';
        enquiryResult.innerHTML = `<strong>Thank you!</strong> ${response}`;
      }
      enquiryForm.reset();
    });
  }
});

/* --------------------- FADE-IN ON SCROLL --------------------- */
ready(function(){
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
});

/* --------------------- Helpful console message --------------------- */
console.log('Part 3 script loaded: accordion, tabs, modal, gallery, map init (if leaflet present), dynamic content and enhanced forms.');
