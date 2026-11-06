'use strict';
(() => {
  const C = Catalog;
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value).replace(/[&<>"']/g,ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const t = value => I18n.t(value);
  const translate = root => I18n.apply(root || document.body);
  const pages = $$('[data-page]');
  const menu = $('#mobile-menu');
  const zoom = $('#placement-dialog');
  const menuButton = $('.menu-toggle');
  const bottom = $('.bottom-bar');
  const mobile = matchMedia('(max-width:760px)');
  let current = 'home';
  let productId = 'switchgear';
  let chosen = C.byId('C06');
  let resultRows = [chosen];
  let observer;
  let formVisible = false;
  const labels = ['Standard','Voltage class','Bus rating','Short-circuit rating'];
  const units = ['',' V',' A',' kA'];
  const selects = [0,1,2,3].map(i => $('#finder-'+i));
  function selection() { return selects.map(select => select.value); }
  function refill(start=0, preferred=selection()) {
    for(let i=start;i<4;i++) {
      const values=C.options(i,selection());
      selects[i].replaceChildren(...values.map(value => {
        const option=document.createElement('option'); option.value=value; option.textContent=value+units[i]; return option;
      }));
      selects[i].value=values.includes(String(preferred[i])) ? String(preferred[i]) : values[0];
    }
  }
  function summary(row) { return `${row.standard} · ${row.voltage} V · ${row.bus} A · ${row.short} kA`; }
  function family(row) { return C.products.find(p => p.id === row.product); }
  function code(row) { return C.partCode(row); }
  function actions(row) {
    return `<div class="result-actions"><a class="link" href="#spec-${row.id}">Specs ›</a><a class="btn primary" href="#quote-${row.id}">Request a quote</a></div>`;
  }
  function renderResults(focus=false) {
    const result=$('#finder-result');
    if(!resultRows.length) {
      result.innerHTML='<div class="no-results"><h3>No matching example equipment</h3><p>Change your criteria or send an example one-line diagram to an engineer.</p><div class="hero-actions"><button class="btn secondary" type="button" data-adjust>Change criteria</button><a class="btn primary" href="#home-talk">Send a one-line diagram ›</a></div></div>';
    } else {
      const row=resultRows[0];
      result.innerHTML=`<div class="result-title"><p class="small">Example result</p><h3>${esc(family(row).name)}</h3><b class="part-code">${code(row)}</b></div><span class="tag">${row.standard}</span><div class="result-properties"><p>${summary(row)}</p><p>${row.poles} <span>Poles</span> · <span>${row.mounting==='D'?'Drawout':'Fixed'}</span></p></div><p class="result-time">Lead time [N] weeks</p>${actions(row)}`;
    }
    translate(result);
    if(focus) result.focus({preventScroll:true});
  }
  refill(0,['UL 1558','480','3000','65']);
  selects.forEach((select,i) => select.addEventListener('change',() => {
    const values=selection(); refill(i+1,values);
    $('#finder-result').innerHTML='<p class="no-results">Criteria changed. Select Find equipment to update the results.</p>';
    translate($('#finder-result'));
  }));
  $('#equipment-finder').addEventListener('submit',event => {event.preventDefault(); resultRows=C.match(selection()); renderResults(true);});
  // Real anchor targets also carry the context used by the single product template.
  for(const product of C.products) {
    const alias=document.createElement('span'); alias.id='product-'+product.id; alias.dataset.product=product.id; alias.hidden=true;
    $('#product-header .wrap').prepend(alias);
  }
  for(const row of C.rows) {
    for(const [prefix,parent] of [['spec','#product-header .wrap'],['quote','#product-quote .wrap']]) {
      const alias=document.createElement('span'); alias.id=prefix+'-'+row.id; alias.dataset.equipment=row.id; alias.hidden=true;
      $(parent).prepend(alias);
    }
  }
  for(const kind of ['specs','drawings','labels','certificates','manuals']) {
    const alias=document.createElement('span'); alias.id='print-'+kind; alias.hidden=true; $('#print').prepend(alias);
  }
  function item(row) {
    return `<article class="catalog-item"><h3>${code(row)}</h3><p>${summary(row)}</p><p><span>${({MB:'Main breaker section',TB:'Tie breaker section',FB:'Feeder section'})[row.function]}</span> · ${row.poles} <span>Poles</span> · <span>${row.mounting==='D'?'Drawout':'Fixed'}</span></p><p>Lead time [N] weeks</p>${actions(row)}</article>`;
  }
  function setQuote(row) {
    chosen=row;
    $('#quote-part').value=code(row);
    $('#quote-voltage').value=row.voltage+' V';
    $('#quote-bus').value=row.bus+' A';
    $('#quote-short').value=row.short+' kA';
    const context=$('#quote-context');
    context.innerHTML=`<span>Example result</span>: <span>${esc(family(row).name)}</span> · ${code(row)} · ${summary(row)} · <span>Lead time [N] weeks</span>`;
    translate(context);
  }
  function renderProduct() {
    const product=C.products.find(p=>p.id===productId);
    const row=chosen && chosen.product===productId ? chosen : C.rows.find(r=>r.product===productId);
    chosen=row;
    $('#factory-details').hidden=productId!=='switchgear';
    $$('[data-product-title]').forEach(node => {node.replaceChildren(document.createTextNode(product.name));});
    $('[data-product-description]').replaceChildren(document.createTextNode(product.description));
    $('[data-product-standard]').replaceChildren(document.createTextNode('PRODUCTS · '+product.standard));
    const rows=[['Standard',row.standard],['Voltage class',row.voltage+' V'],['Bus rating',row.bus+' A'],['Short-circuit rating',row.short+' kA'],['Part code',code(row)],['Poles',String(row.poles)],['Mounting',row.mounting==='D'?'Drawout':'Fixed'],['Enclosure','[Enclosure]'],['Lead time','[N] weeks'],['Revision','[date]']];
    $('#rating-rows').innerHTML=rows.map(([label,value])=>`<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`).join('');
    $('#configuration-list').innerHTML=C.rows.filter(row=>row.product===productId).map(item).join('');
    $$('#product [href="#print-specs"]').forEach(a=>a.dataset.documentEquipment=row.id);
    setQuote(row);
    translate($('#product'));
  }
  $('#all-product-list').innerHTML=C.products.map(p=>`<article class="product-card"><div class="product-body"><h2><a class="product-name" href="#product-${p.id}">${esc(p.name)}</a></h2><p class="tag">${p.standard}</p><p>${esc(p.description)}</p><a class="link" href="#product-${p.id}">View specs ›</a></div></article>`).join('');
  const documentTitles={specs:'Specification sheet',drawings:'Drawings and dimensions',labels:'Label specifications',certificates:'Certificate notes',manuals:'Installation manual notes'};
  let documentKind='specs';
  function renderDocument(kind=documentKind) {
    documentKind=kind;
    const row=chosen;
    let content=`<h2>${documentTitles[kind]}</h2><p>Example catalog. All ratings are illustrative placeholders, not verified product ratings.</p><p>Rev. [date] · [Company]</p>`;
    if(kind==='specs') {
      content+=`<h3>${family(row).name}</h3><p>${code(row)} · ${summary(row)}</p><p>${esc(family(row).description)}</p><table><tbody>${[['Standard',row.standard],['Voltage class',row.voltage+' V'],['Bus rating',row.bus+' A'],['Short-circuit rating',row.short+' kA'],['Poles',row.poles],['Mounting',row.mounting==='D'?'Drawout':'Fixed'],['Lead time','[N] weeks'],['Certification','[Certification status]'],['Enclosure','[Enclosure]']].map(([key,value])=>`<tr><th scope="row">${key}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table><a class="btn primary print-actions" href="#quote-${row.id}">Request a quote</a>`;
    } else if(kind==='drawings') {
      content+='<p>[Approved drawings] · [Dimensions] · [Drawing revision]</p><p>This location map is an example, not an equipment construction drawing.</p><img src="assets/placement.svg" alt="Example label location map"><a class="link print-actions" href="#labels-placement">Where each label goes ›</a>';
    } else if(kind==='labels') {
      content+='<p>Every safety label follows ANSI Z535.4. US units carry English labels. Units for Canada carry English and French.</p><p>Sizes, PANTONE colors, materials, mounting holes and the location map for every label. Labels are printed on a UL 969 label system rated for powder-coated steel.</p><p>[Label materials] · [Mounting details] · [Approved label revision]</p><img class="label-image" src="assets/labels/lab-warning-ca.png" alt="Canada WARNING label, English and French"><a class="link print-actions" href="#labels">See the label guide ›</a>';
    } else if(kind==='certificates') {
      content+='<p>Example catalog. Certification details require confirmation.</p><p>[Certification status] · [Certificate reference] · [Approved certificate]</p><p>UL 891 · UL 1558 · IEEE C37.20.2</p><p>This page is a placeholder document, not a certificate.</p>';
    } else {
      content+='<p>Installation and service information depends on the equipment and its approved drawings.</p><p>[Equipment reference] · [Approved installation procedure] · [Service procedure] · [Manual revision]</p><p>Use the approved documentation for the equipment before installation, start-up or service.</p><a class="link print-actions" href="#services">Service and support ›</a>';
    }
    $('#print-content').innerHTML=content; translate($('#print'));
  }
  function sales() {
    const region=$('#sales-region').value;
    $('#sales-result').innerHTML=`<h2>${{us:'[US region]',ca:'[Canada region]',other:'[Other region]'}[region]}</h2><p>[Sales representative] · [Sales email] · [Sales phone] · [Office hours]</p><a class="link" href="#home-talk">Speak with an engineer</a>`;
    translate($('#sales-result'));
  }
  $('#sales-region').addEventListener('change',sales);
  function syncBottom() { bottom.classList.toggle('is-hidden',formVisible||menu.open||zoom.open); }
  function watchForm() {
    observer?.disconnect(); formVisible=false;
    const form=$('#'+({home:'home-form-region',product:'product-form-region',services:'service-form-region'}[current]||'no-form'));
    if(form && 'IntersectionObserver' in window) {
      observer=new IntersectionObserver(entries=>{formVisible=entries.some(e=>e.isIntersecting);syncBottom();},{rootMargin:'-80px 0px 0px 0px'});
      observer.observe(form);
    }
    syncBottom();
  }
  function closeMenu() { if(menu.open) menu.close(); }
  function closeDetails() { $$('.product-menu[open],#mobile-menu details[open]').forEach(d=>d.open=false); }
  function route() {
    let hash;
    try {hash=decodeURIComponent(location.hash.slice(1))||'home';} catch {hash='home';}
    let target=document.getElementById(hash);
    if(!target || !target.closest('[data-page]')) {target=$('#home');hash='home';}
    const page=target.closest('[data-page]');
    const previous=current; current=page.dataset.page;
    if(current==='product') {
      if(target.dataset.equipment) {chosen=C.byId(target.dataset.equipment);productId=chosen.product;}
      else if(target.dataset.product) {productId=target.dataset.product;chosen=C.rows.find(r=>r.product===productId);}
      else if(hash==='product') {productId='switchgear';chosen=C.byId('C06');}
      renderProduct();
      if(hash.startsWith('quote-')||hash==='product-quote') {restartForm($('#product-form'),false,false);setQuote(chosen);}
    }
    if(current==='print') renderDocument(hash.startsWith('print-') ? hash.slice(6) : documentKind);
    if(hash.startsWith('services-')) $('#service-type').value=hash.slice(9);
    document.body.dataset.view=current;
    pages.forEach(p=>p.hidden=p!==page);
    closeMenu(); if(zoom.open) zoom.close(); closeDetails();
    $$('[data-quote]').forEach(a=>a.href=current==='product'?'#quote-'+chosen.id:'#home-talk');
    const bottomLink=$('a',bottom);
    bottomLink.href=current==='labels'?'#print-labels':current==='product'?'#quote-'+chosen.id:'#home-talk';
    bottomLink.replaceChildren(document.createTextNode(current==='labels'?'Open label specifications':'Request a quote')); translate(bottom);
    const title=current==='product'?C.products.find(p=>p.id===productId).name:($('h1',page)?.textContent||'Home');
    document.title=t(title)+' | [Company]';
    window.scrollTo({top:0,left:0,behavior:'instant'});
    requestAnimationFrame(()=>{
      if(hash.startsWith('quote-')) target=$('#product-quote');
      else if(target.hidden) target=target.closest('section')||page;
      const productLanding=C.products.some(product=>hash==='product-'+product.id);
      if(target!==page && !productLanding && !hash.startsWith('spec-') && !hash.startsWith('print-')) target.scrollIntoView({block:'start',behavior:'instant'});
      const focusTarget=$('h1',page);
      if(previous!==current && focusTarget) {focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true});}
      watchForm();
    });
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');
    if(link?.getAttribute('href')?.startsWith('#')) {
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
      event.preventDefault();
      if(link.dataset.documentEquipment) chosen=C.byId(link.dataset.documentEquipment);
      if(link.dataset.service) $('#service-type').value=link.dataset.service;
      const hash=link.getAttribute('href'); if(location.hash===hash) route(); else location.hash=hash;
    }
    if(event.target.closest('[data-adjust]')) {selects[0].focus();$('#equipment-finder').scrollIntoView({block:'start'});}
    if(event.target.closest('[data-print]')) window.print();
    if(!event.target.closest('.product-menu')) $$('.product-menu[open]').forEach(d=>d.open=false);
  });
  menuButton.addEventListener('click',()=>{menu.showModal();menuButton.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';syncBottom();});
  $('[data-close-menu]').addEventListener('click',closeMenu);
  menu.addEventListener('close',()=>{document.body.style.overflow='';menuButton.setAttribute('aria-expanded','false');syncBottom();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') {
      const open=$('.product-menu[open]'); if(open){open.open=false;$('summary',open).focus();}
      const mobileDetails=$('#mobile-menu details[open]'); if(mobileDetails && !menu.open) mobileDetails.open=false;
    }
  });
  function validate(field) {
    const errorId=field.id+'-error'; document.getElementById(errorId)?.remove();
    field.setCustomValidity('');
    if(field.required && !field.value.trim()) field.setCustomValidity(t('Please complete this required field.'));
    const valid=field.checkValidity(); field.setAttribute('aria-invalid',String(!valid));
    const ids=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==errorId);
    if(!valid) {
      const error=document.createElement('p'); error.id=errorId;error.className='small field-error';error.setAttribute('role','alert');
      error.textContent=t(field.validity.typeMismatch?'Please enter a valid email address.':field.validity.rangeUnderflow||field.validity.stepMismatch||field.validity.badInput?'Please enter a valid value.':'Please complete this required field.');
      field.insertAdjacentElement('afterend',error);ids.push(errorId);
    }
    if(ids.length) field.setAttribute('aria-describedby',ids.join(' '));else field.removeAttribute('aria-describedby');
    return valid;
  }
  function restartForm(form,focus=true,reset=true) {
    const status=form.parentElement.querySelector('.form-success');status?.remove();
    form.hidden=false;if(reset) form.reset();
    $$('input,select,textarea',form).forEach(field=>{
      field.setCustomValidity('');field.removeAttribute('aria-invalid');
      const ids=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==field.id+'-error');
      if(ids.length) field.setAttribute('aria-describedby',ids.join(' ')); else field.removeAttribute('aria-describedby');
    });
    $$('.field-error',form).forEach(error=>error.remove());
    if(form.id==='product-form') setQuote(chosen);
    if(focus) $('input,select,textarea',form).focus();watchForm();
  }
  $$('.request-form').forEach(form=>{
    form.noValidate=true;
    const fields=$$('input,select,textarea',form);
    fields.forEach(field=>field.addEventListener('input',()=>{if(field.hasAttribute('aria-invalid')) validate(field);}));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!fields.map(validate).every(Boolean)) {fields.find(field=>field.getAttribute('aria-invalid')==='true').focus();return;}
      form.reset();fields.forEach(field=>{field.setCustomValidity('');field.removeAttribute('aria-invalid');});
      form.hidden=true;
      const status=document.createElement('div');status.className='form-success';status.tabIndex=-1;status.setAttribute('role','status');
      status.innerHTML='<p>Request complete. Prototype only. Nothing was sent, uploaded or saved.</p><button class="btn secondary" type="button">Start again</button>';
      $('button',status).addEventListener('click',()=>restartForm(form));form.parentElement.append(status);translate(status);status.focus({preventScroll:true});watchForm();
    });
  });
  const tabs=$$('[data-edition]');
  function edition(tab,focus=false) {
    tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;$('#edition-'+t.dataset.edition).classList.toggle('selected',t===tab);});
    if(focus) tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>edition(tab));
    tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();edition(tabs[event.key==='Home'?0:event.key==='End'?1:1-i],true);}});
  });
  $$('img[data-placeholder]').forEach(img=>{
    img.addEventListener('load',()=>img.classList.add('loaded'));img.addEventListener('error',()=>img.classList.remove('loaded'));
    if(img.complete&&img.naturalWidth) img.classList.add('loaded');
  });
  $('.placement-trigger').addEventListener('click',()=>{
    $('.placement-zoom',zoom).replaceChildren($('.placement-photo').cloneNode(true));zoom.showModal();document.body.style.overflow='hidden';syncBottom();
  });
  $('[data-close-zoom]').addEventListener('click',()=>zoom.close());
  zoom.addEventListener('close',()=>{document.body.style.overflow='';syncBottom();});
  function width() {$$('.footer-column').forEach(d=>d.open=!mobile.matches);if(!mobile.matches) closeMenu();}
  mobile.addEventListener('change',width);width();
  function language(lang,persist=true) {
    I18n.setLanguage(lang,persist);renderProduct();renderResults();sales();if(current==='print') renderDocument();translate();
    $$('.request-form [aria-invalid="true"]').forEach(validate);
    const page=pages.find(p=>p.dataset.page===current);document.title=($('h1',page)?.textContent||t('Home'))+' | [Company]';
  }
  $$('[data-lang]').forEach(button=>button.addEventListener('click',()=>language(button.dataset.lang)));
  $('[data-clear-language]').addEventListener('click',()=>{
    I18n.clear();$('#privacy-status').replaceChildren(document.createTextNode('Saved language choice cleared.'));translate($('#privacy-status'));
  });
  window.addEventListener('hashchange',route);
  window.addEventListener('pageshow',()=>{
    // A restored page must not retain form input or attachments.
    $$('.request-form').forEach(form=>{form.reset();if(form.id==='product-form')setQuote(chosen);});watchForm();
  });
  sales();renderProduct();renderResults();translate();route();
})();
