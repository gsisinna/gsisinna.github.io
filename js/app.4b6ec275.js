(function(){"use strict";var e=[,function(e,t,n){var a=n(751),o=n(641);const i={id:"app"};function r(e,t,n,a,r,s){const c=(0,o.g2)("MainNavbar"),l=(0,o.g2)("HomeSection"),u=(0,o.g2)("ProjectList"),d=(0,o.g2)("AboutMe"),f=(0,o.g2)("ContactMe");return(0,o.uX)(),(0,o.CE)("div",i,[(0,o.bF)(c),(0,o.bF)(l),(0,o.bF)(u),(0,o.bF)(d),(0,o.bF)(f)])}const s={class:"navbar"};function c(e,t,n,a,i,r){return(0,o.uX)(),(0,o.CE)("nav",s,t[0]||(t[0]=[(0,o.Lk)("ul",null,[(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#home"},"Home")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#projects"},"Projects")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#about"},"About")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#contact"},"Contact")])],-1)]))}var l={name:"MainNavbar"},u=n(262);const d=(0,u.A)(l,[["render",c],["__scopeId","data-v-175c2ea0"]]);var f=d;const m={id:"home",class:"home"},b={class:"tetris-blocks"};function p(e,t,n,a,i,r){return(0,o.uX)(),(0,o.CE)("section",m,[t[0]||(t[0]=(0,o.Lk)("h1",{class:"fade-in"},"Hello, I'm Gabriele",-1)),t[1]||(t[1]=(0,o.Lk)("p",{class:"slide-in"},"Robotics Software Engineer | Designer | Coder",-1)),t[2]||(t[2]=(0,o.Lk)("a",{href:"#projects",class:"btn"},"View My Work",-1)),(0,o.Lk)("div",b,[((0,o.uX)(),(0,o.CE)(o.FK,null,(0,o.pI)(20,(e=>(0,o.Lk)("div",{key:e,class:"block"}))),64))])])}var v={name:"HomeSection",mounted(){const e=document.querySelector(".btn");e.addEventListener("click",(t=>{t.preventDefault();const n=e.getAttribute("href").substring(1),a=document.getElementById(n);a&&a.scrollIntoView({behavior:"smooth"})}))}};const h=(0,u.A)(v,[["render",p],["__scopeId","data-v-604f001c"]]);var k=h,g=n(33);const L={id:"projects",class:"projects"},j={class:"project-list"},w={class:"project-image-container"},y=["src","alt"],E=["href"];function A(e,t,n,a,i,r){return(0,o.uX)(),(0,o.CE)("section",L,[t[0]||(t[0]=(0,o.Lk)("h2",{class:"section-title"},"My Projects",-1)),(0,o.Lk)("div",j,[((0,o.uX)(!0),(0,o.CE)(o.FK,null,(0,o.pI)(i.projects,(e=>((0,o.uX)(),(0,o.CE)("div",{class:"project",key:e.id},[(0,o.Lk)("div",w,[(0,o.Lk)("img",{src:e.image,alt:e.name},null,8,y)]),(0,o.Lk)("h3",null,(0,g.v_)(e.name),1),(0,o.Lk)("p",null,(0,g.v_)(e.description),1),(0,o.Lk)("a",{href:e.link,target:"_blank",class:"btn"},"View Project",8,E)])))),128))])])}var C={name:"ProjectList",data(){return{projects:[{id:1,name:"Portfolio Website",description:"A beautiful portfolio website built with Vue.js.",image:"https://via.placeholder.com/300",link:"#"},{id:2,name:"E-commerce Platform",description:"An online store built with modern web technologies.",image:"https://via.placeholder.com/300",link:"#"}]}}};const I=(0,u.A)(C,[["render",A],["__scopeId","data-v-7c3a8e74"]]);var M=I;const _={id:"about",class:"about"};function F(e,t,n,a,i,r){return(0,o.uX)(),(0,o.CE)("section",_,t[0]||(t[0]=[(0,o.Fv)('<div class="about-container" data-v-ff7cb422><div class="about-content" data-v-ff7cb422><h2 class="fade-in" data-v-ff7cb422>About Me</h2><p class="slide-up" data-v-ff7cb422> I&#39;m a passionate full-stack developer with experience in creating beautiful and functional web applications. I specialize in building scalable web solutions, combining a strong design sense with cutting-edge technologies. </p><a href="#contact" class="btn fade-in" data-v-ff7cb422>Get In Touch</a></div><div class="about-image fade-in" data-v-ff7cb422><img src="https://via.placeholder.com/300" alt="Your Name" data-v-ff7cb422></div></div>',1)]))}var O={name:"AboutMe",mounted(){const e=document.querySelectorAll(".fade-in"),t=document.querySelectorAll(".slide-up"),n={threshold:.5},a=new IntersectionObserver(((e,t)=>{e.forEach((e=>{e.isIntersecting&&(e.target.classList.add("appear"),t.unobserve(e.target))}))}),n);e.forEach((e=>a.observe(e))),t.forEach((e=>a.observe(e)))}};const P=(0,u.A)(O,[["render",F],["__scopeId","data-v-ff7cb422"]]);var S=P;const X={id:"contact",class:"contact"},x={class:"contact-container"},V={class:"form-group"},q={class:"form-group"},H={class:"form-group"};function N(e,t,n,i,r,s){return(0,o.uX)(),(0,o.CE)("section",X,[t[6]||(t[6]=(0,o.Lk)("h2",{class:"fade-in"},"Contact Me",-1)),(0,o.Lk)("div",x,[(0,o.Lk)("form",{onSubmit:t[3]||(t[3]=(0,a.D$)(((...e)=>s.submitForm&&s.submitForm(...e)),["prevent"])),class:"fade-in form"},[(0,o.Lk)("div",V,[(0,o.bo)((0,o.Lk)("input",{type:"text","onUpdate:modelValue":t[0]||(t[0]=e=>r.name=e),placeholder:"Your Name",required:"",class:"animated-placeholder"},null,512),[[a.Jo,r.name]])]),(0,o.Lk)("div",q,[(0,o.bo)((0,o.Lk)("input",{type:"email","onUpdate:modelValue":t[1]||(t[1]=e=>r.email=e),placeholder:"Your Email",required:"",class:"animated-placeholder"},null,512),[[a.Jo,r.email]])]),(0,o.Lk)("div",H,[(0,o.bo)((0,o.Lk)("textarea",{"onUpdate:modelValue":t[2]||(t[2]=e=>r.message=e),placeholder:"Your Message",rows:"5",required:"",class:"animated-placeholder"},null,512),[[a.Jo,r.message]])]),t[4]||(t[4]=(0,o.Lk)("button",{type:"submit",class:"btn fade-in"},"Send Message",-1))],32),t[5]||(t[5]=(0,o.Lk)("ul",{class:"fade-in contact-links"},[(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"mailto:gabriele.sisinna@gmail.com",class:"contact-link"},"Email")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"https://github.com/gsisinna",target:"_blank",class:"contact-link"},"GitHub")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"https://linkedin.com/in/gabriele-sisinna-4a6081109",target:"_blank",class:"contact-link"},"LinkedIn")])],-1))])])}var Y={name:"ContactMe",data(){return{name:"",email:"",message:""}},methods:{submitForm(){alert(`Thank you, ${this.name}! Your message has been sent.`),this.name="",this.email="",this.message=""}}};const T=(0,u.A)(Y,[["render",N],["__scopeId","data-v-4987cc02"]]);var D=T,G={name:"App",components:{MainNavbar:f,HomeSection:k,ProjectList:M,AboutMe:S,ContactMe:D}};const J=(0,u.A)(G,[["render",r]]);var U=J;(0,a.Ef)(U).mount("#app")}],t={};function n(a){var o=t[a];if(void 0!==o)return o.exports;var i=t[a]={exports:{}};return e[a](i,i.exports,n),i.exports}n.m=e,function(){var e=[];n.O=function(t,a,o,i){if(!a){var r=1/0;for(u=0;u<e.length;u++){a=e[u][0],o=e[u][1],i=e[u][2];for(var s=!0,c=0;c<a.length;c++)(!1&i||r>=i)&&Object.keys(n.O).every((function(e){return n.O[e](a[c])}))?a.splice(c--,1):(s=!1,i<r&&(r=i));if(s){e.splice(u--,1);var l=o();void 0!==l&&(t=l)}}return t}i=i||0;for(var u=e.length;u>0&&e[u-1][2]>i;u--)e[u]=e[u-1];e[u]=[a,o,i]}}(),function(){n.d=function(e,t){for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={524:0};n.O.j=function(t){return 0===e[t]};var t=function(t,a){var o,i,r=a[0],s=a[1],c=a[2],l=0;if(r.some((function(t){return 0!==e[t]}))){for(o in s)n.o(s,o)&&(n.m[o]=s[o]);if(c)var u=c(n)}for(t&&t(a);l<r.length;l++)i=r[l],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(u)},a=self["webpackChunkblog"]=self["webpackChunkblog"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=n.O(void 0,[504],(function(){return n(1)}));a=n.O(a)})();
//# sourceMappingURL=app.4b6ec275.js.map