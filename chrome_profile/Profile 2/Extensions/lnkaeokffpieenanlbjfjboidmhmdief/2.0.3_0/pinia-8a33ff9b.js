import { Y, w as we, d as de } from './reactivity.esm-bundler-3cf16f7a.js';

/*!
  * pinia v2.0.22
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
const n=Symbol();var s;function e(){const s=Y(!0),e=s.run((()=>we({})));let r=[],i=[];const o=de({install(t){o._a=t,t.provide(n,o),t.config.globalProperties.$pinia=o,i.forEach((t=>r.push(t))),i=[];},use(t){return this._a?r.push(t):i.push(t),this},_p:r,_a:null,_e:s,_s:new Map,state:e});return o}!function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function";}(s||(s={}));

export { e };
