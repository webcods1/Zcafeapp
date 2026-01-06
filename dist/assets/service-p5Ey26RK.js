import"./modulepreload-polyfill-B5Qt9EMX.js";import{initializeApp as m}from"https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";import{getDatabase as l,push as p,ref as u,set as g}from"https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";const f={apiKey:"AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",authDomain:"zcafe-65f97.firebaseapp.com",databaseURL:"https://zcafe-65f97-default-rtdb.firebaseio.com",projectId:"zcafe-65f97",storageBucket:"zcafe-65f97.firebasestorage.app",messagingSenderId:"480288327990",appId:"1:480288327990:web:9c79040289023919034b97"},b=m(f),y=l(b);function h(){const e=(JSON.parse(localStorage.getItem("cartItems"))||[]).reduce((n,s)=>n+s.quantity,0);let a=document.getElementById("cart-badge");if(!a){const n=document.querySelector('a[href="bag.html"]');n&&(n.style.position="relative",a=document.createElement("div"),a.id="cart-badge",a.className="cart-badge",n.appendChild(a))}a&&(a.textContent=e,a.style.display=e>0?"flex":"none")}h();function i(t){const e=document.createElement("div");e.textContent=t,e.style.cssText=`
        position: fixed;
        bottom: 55px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        animation: slideUpFade 3s ease-out forwards;
        margin-bottom: 0;
        text-align: center;
        width: max-content;
        max-width: 90%;
      `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}const o=document.getElementById("service-gear"),v=document.getElementById("send-complaint-btn"),w=document.getElementById("complaint-form");window.addEventListener("load",()=>{o.classList.add("animate-enter")});v.addEventListener("click",()=>{const t=document.getElementById("complaint-type").value,e=document.getElementById("complaint-message").value.trim();if(!t||!e){i("Please fill in all fields (Type & Message).");return}o.classList.remove("animate-enter"),o.classList.add("animate-exit"),o.addEventListener("animationend",()=>{x(t,e)},{once:!0})});function x(t,e){const a=localStorage.getItem("phoneNumber")||"Unknown",n=localStorage.getItem("companyName")||"Unknown Company",s=localStorage.getItem("deliveryAddress")||"Unknown Location",r=p(u(y,"service_requests"));g(r,{type:t,message:e,customerPhone:a,customerCompany:n,customerLocation:s,status:"Pending",timestamp:new Date().toLocaleString()}).then(()=>{i("The servicer will call you immediately! 📞"),w.reset(),setTimeout(()=>{o.classList.remove("animate-exit"),o.classList.add("animate-enter")},1e3)}).catch(d=>{console.error(d),i("Error submitting request. Please try again.")})}let c=0;window.addEventListener("scroll",()=>{const t=window.pageYOffset||document.documentElement.scrollTop,e=document.querySelector(".bottom-nav");t>c?e&&e.classList.add("hidden"):e&&e.classList.remove("hidden"),c=t<=0?0:t});
