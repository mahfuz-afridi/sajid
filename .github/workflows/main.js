"use strict";
(function () {
 var grid=document.getElementById("doctorGrid");
 var search=document.getElementById("searchDoctor");
 var department=document.getElementById("departmentFilter");
 var backdrop=document.getElementById("ticketBackdrop");
 var toastTimer=null;
 var bookings=[];
 var storageKey="carepoint_demo_bookings_v2";
 try { var data=localStorage.getItem(storageKey); if(data){bookings=JSON.parse(data);} if(!Array.isArray(bookings)){bookings=[];} } catch(e){bookings=[];}
 function safe(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
 function render(){
  if(!grid){return;}
  var q=search.value.toLowerCase().trim(), dep=department.value;
  var filtered=doctors.filter(function(d){return (d.name+" "+d.spec+" "+d.degree).toLowerCase().indexOf(q)!==-1&&(dep==="all"||dep===d.spec);});
  if(!filtered.length){grid.innerHTML='<div class="empty">No doctors match your search.</div>';return;}
  var html="";
  filtered.forEach(function(d){
   html+='<article class="doctor-card"><div class="doc-top"><div class="avatar">'+d.emoji+'</div><div><a class="doctor-name" href="'+d.file+'">'+safe(d.name)+'</a><div class="specialty">'+safe(d.spec)+'</div><div class="experience">'+safe(d.exp)+'</div></div></div>';
   html+='<div class="meta"><div class="meta-row"><span>Qualifications</span><strong>'+safe(d.degree)+'</strong></div><div class="meta-row"><span>Consultation sessions</span><strong>'+d.slots.length+' per day</strong></div><div class="meta-row"><span>Room</span><strong>'+d.room+'</strong></div></div>';
   html+='<div class="card-bottom"><div class="fee">৳'+d.fee+'<small>per consultation</small></div><a class="book-link" href="'+d.file+'">View profile →</a></div></article>';
  });
  grid.innerHTML=html;
 }
 function showToast(message){var t=document.getElementById("toast");if(!t){return;}t.textContent=message;t.classList.add("show");if(toastTimer){clearTimeout(toastTimer);}toastTimer=setTimeout(function(){t.classList.remove("show");},2800);}
 function prettyDate(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
 function showTicket(t){
  document.getElementById("ticketLookup").style.display="none";
  var out=document.getElementById("ticketResult");out.className="ticket";
  out.innerHTML='<div class="ticket-number"><span>YOUR PATIENT NUMBER</span><strong>'+safe(t.patientNumber)+'</strong>'+safe(t.doctorName)+'</div>'+
   '<div class="ticket-grid"><div class="ticket-cell"><small>Room</small><strong>'+safe(t.room)+'</strong></div><div class="ticket-cell"><small>Estimated visit</small><strong>'+safe(t.time)+'</strong></div><div class="ticket-cell"><small>Date</small><strong>'+safe(prettyDate(t.date))+'</strong></div><div class="ticket-cell"><small>Patient</small><strong>'+safe(t.patient)+'</strong></div></div>'+
   '<p class="hint">Demo ticket only. Your booking is stored on this device.</p>'+
   '<div class="ticket-actions"><button type="button" class="secondary" id="ticketCloseResult">Close</button><button type="button" id="downloadFoundTicket">Save ticket</button></div>';
  document.getElementById("ticketCloseResult").addEventListener("click",function(){backdrop.classList.remove("show");});
  document.getElementById("downloadFoundTicket").addEventListener("click",function(){downloadTicket(t);});
 }
 function downloadTicket(t){
  var text="CAREPOINT HOSPITAL — DEMO TICKET\nPatient: "+t.patient+"\nPatient number: "+t.patientNumber+"\nDoctor: "+t.doctorName+"\nRoom: "+t.room+"\nDate: "+prettyDate(t.date)+"\nEstimated visit: "+t.time+"\nFee: ৳"+t.fee+"\n\nDemo only — not a real hospital booking.";
  var url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
  var a=document.createElement("a");a.href=url;a.download="CarePoint-"+t.patientNumber+".txt";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 }
 function findTicket(){
  var phone=document.getElementById("lookupPhone").value.trim();
  if(!phone){showToast("Enter the booking phone number.");return;}
  var found=null;
  for(var i=bookings.length-1;i>=0;i--){if(String(bookings[i].phone).trim()===phone){found=bookings[i];break;}}
  if(!found){showToast("No local appointment found for that number.");return;}
  showTicket(found);
 }
 if(search){search.addEventListener("input",render);}
 if(department){department.addEventListener("change",render);}
 if(grid){render();}
 var myTicket=document.getElementById("myTicket");
 if(myTicket){myTicket.addEventListener("click",function(){document.getElementById("ticketLookup").style.display="block";document.getElementById("ticketResult").className="ticket hidden";document.getElementById("lookupPhone").value="";backdrop.classList.add("show");});}
 var close=document.getElementById("closeTicket");if(close){close.addEventListener("click",function(){backdrop.classList.remove("show");});}
 if(backdrop){backdrop.addEventListener("click",function(e){if(e.target===backdrop){backdrop.classList.remove("show");}});}
 var lookup=document.getElementById("lookupBtn");if(lookup){lookup.addEventListener("click",findTicket);}
 var year=document.getElementById("year");if(year){year.textContent=new Date().getFullYear();}
}());