(function(){"use strict";var e={387:function(e,t,n){var a=n(751),o=n(641);const r={id:"app"};function i(e,t,n,a,i,c){const s=(0,o.g2)("MainNavbar"),l=(0,o.g2)("HomeSection"),u=(0,o.g2)("ProjectList"),d=(0,o.g2)("AboutMe"),m=(0,o.g2)("ContactMe");return(0,o.uX)(),(0,o.CE)("div",r,[(0,o.bF)(s),(0,o.bF)(l),(0,o.bF)(u),(0,o.bF)(d),(0,o.bF)(m)])}function c(e,t,n,a,r,i){return(0,o.uX)(),(0,o.CE)("nav",null,t[0]||(t[0]=[(0,o.Lk)("ul",null,[(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#home"},"Home")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#projects"},"Projects")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#about"},"About")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"#contact"},"Contact")])],-1)]))}var s={name:"MainNavbar"},l=n(262);const u=(0,l.A)(s,[["render",c],["__scopeId","data-v-db217ca8"]]);var d=u;const m={id:"home",class:"home"};function p(e,t,n,a,r,i){return(0,o.uX)(),(0,o.CE)("section",m,t[0]||(t[0]=[(0,o.Lk)("h1",{class:"fade-in"},"Hello, I'm Gabriele",-1),(0,o.Lk)("p",{class:"slide-in"},"Full-Stack Developer | Designer | Coder",-1),(0,o.Lk)("a",{href:"#projects",class:"btn fade-in"},"View My Work",-1)]))}var f={name:"HomeSection"};const b=(0,l.A)(f,[["render",p],["__scopeId","data-v-daf8d426"]]);var v=b,h=n(33);const k={id:"projects",class:"projects"},g={class:"project-list"},L=["src","alt"],j=["href"];function w(e,t,n,a,r,i){return(0,o.uX)(),(0,o.CE)("section",k,[t[0]||(t[0]=(0,o.Lk)("h2",null,"My Projects",-1)),(0,o.Lk)("div",g,[((0,o.uX)(!0),(0,o.CE)(o.FK,null,(0,o.pI)(r.projects,(e=>((0,o.uX)(),(0,o.CE)("div",{class:"project",key:e.id},[(0,o.Lk)("img",{src:e.image,alt:e.name},null,8,L),(0,o.Lk)("h3",null,(0,h.v_)(e.name),1),(0,o.Lk)("p",null,(0,h.v_)(e.description),1),(0,o.Lk)("a",{href:e.link,target:"_blank"},"View Project",8,j)])))),128))])])}var y={name:"ProjectList",data(){return{projects:[{id:1,name:"Portfolio Website",description:"A beautiful portfolio website built with Vue.js.",image:"https://via.placeholder.com/300",link:"#"},{id:2,name:"E-commerce Platform",description:"An online store built with modern web technologies.",image:"https://via.placeholder.com/300",link:"#"}]}}};const C=(0,l.A)(y,[["render",w],["__scopeId","data-v-4d813b27"]]);var M=C;const _={id:"about",class:"about"};function A(e,t,n,a,r,i){return(0,o.uX)(),(0,o.CE)("section",_,t[0]||(t[0]=[(0,o.Fv)('<div class="about-container" data-v-6c348799><div class="about-content" data-v-6c348799><h2 class="fade-in" data-v-6c348799>About Me</h2><p class="slide-up" data-v-6c348799> I&#39;m a passionate full-stack developer with experience in creating beautiful and functional web applications. I specialize in building scalable web solutions, combining a strong design sense with cutting-edge technologies. </p><a href="#contact" class="btn fade-in" data-v-6c348799>Get In Touch</a></div><div class="about-image fade-in" data-v-6c348799><img src="https://via.placeholder.com/300" alt="Your Name" data-v-6c348799></div></div>',1)]))}var E={name:"AboutMe"};const F=(0,l.A)(E,[["render",A],["__scopeId","data-v-6c348799"]]);var I=F;const O={id:"contact",class:"contact"},P={class:"contact-container"},x={class:"form-group"},X={class:"form-group"},H={class:"form-group"};function S(e,t,n,r,i,c){return(0,o.uX)(),(0,o.CE)("section",O,[t[6]||(t[6]=(0,o.Lk)("h2",{class:"fade-in"},"Contact Me",-1)),(0,o.Lk)("div",P,[(0,o.Lk)("form",{onSubmit:t[3]||(t[3]=(0,a.D$)(((...e)=>c.submitForm&&c.submitForm(...e)),["prevent"])),class:"fade-in"},[(0,o.Lk)("div",x,[(0,o.bo)((0,o.Lk)("input",{type:"text","onUpdate:modelValue":t[0]||(t[0]=e=>i.name=e),placeholder:"Your Name",required:""},null,512),[[a.Jo,i.name]])]),(0,o.Lk)("div",X,[(0,o.bo)((0,o.Lk)("input",{type:"email","onUpdate:modelValue":t[1]||(t[1]=e=>i.email=e),placeholder:"Your Email",required:""},null,512),[[a.Jo,i.email]])]),(0,o.Lk)("div",H,[(0,o.bo)((0,o.Lk)("textarea",{"onUpdate:modelValue":t[2]||(t[2]=e=>i.message=e),placeholder:"Your Message",rows:"5",required:""},null,512),[[a.Jo,i.message]])]),t[4]||(t[4]=(0,o.Lk)("button",{type:"submit",class:"btn fade-in"},"Send Message",-1))],32),t[5]||(t[5]=(0,o.Lk)("ul",{class:"fade-in"},[(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"mailto:your.email@example.com"},"Email")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"https://github.com/yourusername",target:"_blank"},"GitHub")]),(0,o.Lk)("li",null,[(0,o.Lk)("a",{href:"https://linkedin.com/in/yourusername",target:"_blank"},"LinkedIn")])],-1))])])}var V={name:"ContactMe",data(){return{name:"",email:"",message:""}},methods:{submitForm(){alert(`Thank you, ${this.name}! Your message has been sent.`),this.name="",this.email="",this.message=""}}};const N=(0,l.A)(V,[["render",S],["__scopeId","data-v-d37cbfc4"]]);var Y=N,T={name:"App",components:{MainNavbar:d,HomeSection:v,ProjectList:M,AboutMe:I,ContactMe:Y}};const q=(0,l.A)(T,[["render",i]]);var D=q;(0,a.Ef)(D).mount("#app")}},t={};function n(a){var o=t[a];if(void 0!==o)return o.exports;var r=t[a]={exports:{}};return e[a](r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,a,o,r){if(!a){var i=1/0;for(u=0;u<e.length;u++){a=e[u][0],o=e[u][1],r=e[u][2];for(var c=!0,s=0;s<a.length;s++)(!1&r||i>=r)&&Object.keys(n.O).every((function(e){return n.O[e](a[s])}))?a.splice(s--,1):(c=!1,r<i&&(i=r));if(c){e.splice(u--,1);var l=o();void 0!==l&&(t=l)}}return t}r=r||0;for(var u=e.length;u>0&&e[u-1][2]>r;u--)e[u]=e[u-1];e[u]=[a,o,r]}}(),function(){n.d=function(e,t){for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={524:0};n.O.j=function(t){return 0===e[t]};var t=function(t,a){var o,r,i=a[0],c=a[1],s=a[2],l=0;if(i.some((function(t){return 0!==e[t]}))){for(o in c)n.o(c,o)&&(n.m[o]=c[o]);if(s)var u=s(n)}for(t&&t(a);l<i.length;l++)r=i[l],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(u)},a=self["webpackChunkblog"]=self["webpackChunkblog"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=n.O(void 0,[504],(function(){return n(387)}));a=n.O(a)})();
//# sourceMappingURL=app.88092f03.js.map