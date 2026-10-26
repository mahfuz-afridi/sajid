"use strict";
(function () {
 var params=new URLSearchParams(window.location.search);
 var doctorId=params.get("doctor");
 var doctor=null;
 for(var i=0;i<doctors.length;i++){if(doctors[i].id===doctorId){doctor=doctors[i];break;}}
 /* The individual HTML file also has a default doctor ID in its data attribute. */
 if(!doctor){var root=document.getElementById("doctorProfile");var id=root?root.getAttribute("data-doctor-id"):"D01";for(var j=0;j<doctors.length;j++){if(doctors[j].id===id){doctor=doctors[j];break;}}}
 if(!doctor){document.getElementById("profileContent").innerHTML="<p>Doctor profile not found.</p>";return;}
 var content=document.getElementById("profileContent");
 function safe(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
 var schedule="";
 doctor.slots.forEach(function(s){schedule+='<div class="schedule-row"><strong>'+safe(s.label.split(" · ")[0])+'</strong><span>'+safe(s.label.split(" · ")[1])+'</span></div>';});
 content.innerHTML='<section class="profile-hero"><div class="breadcrumb"><a href="index.html">Home</a> / <a href="index.html#doctors">Doctors</a> / '+safe(doctor.name)+'</div><div class="profile-layout"><article class="profile-card"><div class="profile-top"><div class="profile-avatar">'+doctor.emoji+'</div><div><h1>'+safe(doctor.name)+'</h1><div class="specialty">'+safe(doctor.spec)+'</div><p class="sub">'+safe(doctor.exp)+'</p></div></div><p class="bio">'+safe(doctor.bio)+'</p><div class="profile-facts"><div class="fact"><small>Qualifications</small><strong>'+safe(doctor.degree)+'</strong></div><div class="fact"><small>Consultation fee</small><strong>৳'+doctor.fee+'</strong></div><div class="fact"><small>Consultation room</small><strong>'+safe(doctor.room)+'</strong></div><div class="fact"><small>Hospital</small><strong>CarePoint Hospital</strong></div></div></article><aside class="booking-card"><div class="eyebrow">CONSULTATION HOURS</div><h2>Doctor schedule</h2>'+schedule+'<p class="hint">Sample schedule only. Friday is marked closed in this demo.</p><button class="primary" id="bookDoctor" type="button">Book appointment →</button></aside></div><div class="profile-extra"><article class="info-card"><h2>Before your visit</h2><p class="sub">Bring any relevant previous prescriptions, reports and your appointment ticket. Please arrive 15 minutes before your estimated time.</p></article><article class="info-card"><h2>Queue information</h2><p class="sub">After booking, your ticket will show your patient number, room and estimated visit time. In this prototype, bookings are stored on this device only.</p></article></div></section>';
 function localDate(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
 function timeString(hour){var h=Math.floor(hour),m=Math.round((hour-h)*60);if(m>=60){h++;m=0;}var suffix=h>=12?"PM":"AM";h=h%12||12;return h+":"+String(m).padStart(2,"0")+" "+suffix;}
 function formatDate(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
 function toast(message){var t=document.getElementById("toast");t.textContent=message;t.classList.add("show");setTimeout(function(){t.classList.remove("show");},2600);}
 function saveTicket(t){
  var text="CAREPOINT HOSPITAL — DEMO APPOINTMENT TICKET\nPatient: "+t.patient+"\nPatient number: "+t.patientNumber+"\nDoctor: "+t.doctorName+" ("+t.spec+")\nRoom: "+t.room+"\nDate: "+formatDate(t.date)+"\nSession: "+t.slotLabel+"\nEstimated visit: "+t.time+"\nFee: ৳"+t.fee+"\n\nDemo only — not a real hospital booking.";
  var url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));var a=document.createElement("a");a.href=url;a.download="CarePoint-"+t.patientNumber+".txt";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 }
 document.getElementById("bookDoctor").addEventListener("click",function(){openBooking();});
 function openBooking(){
  var old=document.getElementById("bookingBackdrop");if(old){old.remove();}
  var backdrop=document.createElement("div");backdrop.className="modal-backdrop show";backdrop.id="bookingBackdrop";
  backdrop.innerHTML='<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><h2>Book your visit</h2><p class="sub">'+safe(doctor.name)+' · '+safe(doctor.room)+' · Fee ৳'+doctor.fee+'</p></div><button type="button" class="close" id="closeBooking">×</button></div><form id="bookForm"><div class="fields"><div class="field full"><label for="patient">Patient full name</label><input id="patient" required maxlength="80" autocomplete="name" placeholder="Your full name"></div><div class="field full"><label for="phone">Phone number</label><input id="phone" type="tel" required maxlength="20" placeholder="Your phone number"></div><div class="field"><label for="visitDate">Appointment date</label><input id="visitDate" type="date" required></div><div class="field"><label for="visitSlot">Session</label><select id="visitSlot" required>'+doctor.slots.map(function(s,i){return '<option value="'+i+'">'+safe(s.label)+'</option>';}).join("")+'</select></div></div><p class="hint">Demo queue only. Estimated times are not live hospital wait times.</p><button class="primary full-button" type="submit">Confirm appointment</button></form><div id="bookingResult" class="ticket hidden"></div></div>';
  document.body.appendChild(backdrop);
  var dateInput=backdrop.querySelector("#visitDate");dateInput.min=localDate(new Date());dateInput.value=localDate(new Date());
  backdrop.querySelector("#closeBooking").addEventListener("click",function(){backdrop.remove();});
  backdrop.addEventListener("click",function(e){if(e.target===backdrop){backdrop.remove();}});
  backdrop.querySelector("#bookForm").addEventListener("submit",function(e){
   e.preventDefault();
   var patient=backdrop.querySelector("#patient").value.trim(),phone=backdrop.querySelector("#phone").value.trim(),date=dateInput.value,slotIndex=Number(backdrop.querySelector("#visitSlot").value);
   if(patient.length<2||!phone||!date){toast("Please complete all fields.");return;}
   var p=date.split("-"),chosen=new Date(+p[0],+p[1]-1,+p[2]),now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
   if(chosen<today){toast("Choose today or a future date.");return;}
   if(chosen.getDay()===5||doctor.days.indexOf(chosen.getDay())===-1){toast("This doctor is not scheduled on that day.");return;}
   var key="carepoint_demo_bookings_v2",bookings=[];
   try{bookings=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(bookings)){bookings=[];}}catch(err){bookings=[];}
   var slot=doctor.slots[slotIndex],position=1;
   bookings.forEach(function(b){if(b.doctorId===doctor.id&&b.date===date&&Number(b.slotIndex)===slotIndex){position++;}});
   var start=slot.start;if(date===localDate(now)){var current=now.getHours()+now.getMinutes()/60;if(current>start){start=Math.min(slot.end,Math.ceil(current*4)/4);}}
   var t={doctorId:doctor.id,doctorName:doctor.name,spec:doctor.spec,room:doctor.room,fee:doctor.fee,patient:patient,phone:phone,date:date,slotIndex:slotIndex,slotLabel:slot.label,patientNumber:doctor.id+"-"+String(position).padStart(3,"0"),time:timeString(Math.min(slot.end,start+(position-1)*0.25))};
   bookings.push(t);
   try{localStorage.setItem(key,JSON.stringify(bookings));}catch(err){}
   backdrop.querySelector("#bookForm").style.display="none";
   var result=backdrop.querySelector("#bookingResult");result.className="ticket";
   result.innerHTML='<div class="ticket-number"><span>YOUR PATIENT NUMBER</span><strong>'+safe(t.patientNumber)+'</strong>'+safe(t.doctorName)+'</div><div class="ticket-grid"><div class="ticket-cell"><small>Room</small><strong>'+safe(t.room)+'</strong></div><div class="ticket-cell"><small>Estimated visit</small><strong>'+safe(t.time)+'</strong></div><div class="ticket-cell"><small>Date</small><strong>'+safe(formatDate(t.date))+'</strong></div><div class="ticket-cell"><small>Session</small><strong>'+safe(t.slotLabel.split(" · ")[0])+'</strong></div><div class="ticket-cell"><small>Patient</small><strong>'+safe(t.patient)+'</strong></div><div class="ticket-cell"><small>Fee</small><strong>৳'+t.fee+'</strong></div></div><p class="hint">Demo ticket only; not a real hospital appointment.</p><div class="ticket-actions"><button class="secondary" id="done" type="button">Close</button><button id="saveTicket" type="button">Save ticket</button></div>';
   result.querySelector("#done").addEventListener("click",function(){backdrop.remove();});
   result.querySelector("#saveTicket").addEventListener("click",function(){saveTicket(t);});
  });
 }
 var myTicket=document.getElementById("myTicket");
 if(myTicket){myTicket.addEventListener("click",function(){var phone=prompt("Enter the phone number used for your booking:");if(phone===null||!phone.trim()){return;}var b=[];try{b=JSON.parse(localStorage.getItem("carepoint_demo_bookings_v2")||"[]");}catch(e){}var t=null;for(var i=b.length-1;i>=0;i--){if(String(b[i].phone).trim()===phone.trim()){t=b[i];break;}}if(!t){toast("No appointment found on this device.");return;}saveTicket(t);toast("Your saved ticket has been downloaded.");});}
 var year=document.getElementById("year");if(year){year.textContent=new Date().getFullYear();}
}());