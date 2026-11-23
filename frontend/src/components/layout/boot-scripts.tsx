"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

const FONT_BRIDGE_SCRIPT = `(function(){try{var names=[];function walk(rules){if(!rules)return;for(var i=0;i<rules.length;i++){var rule=rules[i];if(rule.cssRules){walk(rule.cssRules);continue;}var text=rule.cssText||"";if(text.indexOf("@font-face")!==0)continue;var at=text.indexOf("font-family:");if(at<0)continue;var rest=text.slice(at+12);var end=rest.indexOf(";");var name=(end<0?rest:rest.slice(0,end)).trim();if(name.charAt(0)==="'"||name.charAt(0)==='"')name=name.slice(1,-1);if(names.indexOf(name)===-1)names.push(name);}}for(var s=0;s<document.styleSheets.length;s++){try{walk(document.styleSheets[s].cssRules);}catch(e){}}function value(test){var main="";var fallback="";for(var i=0;i<names.length;i++){var name=names[i];if(!test(name))continue;if(name.indexOf("Fallback")!==-1)fallback=name;else main=name;}if(!main)return "";return "'"+main+"'"+(fallback?", '"+fallback+"'":"");}var root=document.documentElement;var sans=value(function(name){return name.indexOf("__Poppins_")===0;});var arabic=value(function(name){return name.indexOf("__Noto_Naskh_Arabic_")===0;});var uthmani=value(function(name){return name.indexOf("__Amiri_Quran_")===0;});var quran=value(function(name){return name.indexOf("__Amiri_")===0&&name.indexOf("__Amiri_Quran_")!==0;});if(sans)root.style.setProperty("--nh-font-sans",sans);if(arabic)root.style.setProperty("--nh-font-arabic",arabic);if(quran)root.style.setProperty("--nh-font-quran",quran);if(uthmani)root.style.setProperty("--nh-font-uthmani",uthmani);}catch(e){}})();`;

const APP_OPEN_SCRIPT = `(function(){try{var path=(location.pathname||"/").replace(/\\/$/,"")||"/";if(!/^\\/(fr|en|ar)$/.test(path))return;if(sessionStorage.getItem("nh-app-open"))return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("nh-app-open","1");document.documentElement.setAttribute("data-app-open","play");}catch(e){}})();`;

const INSTALL_SCRIPT = `(function(){window.addEventListener("beforeinstallprompt",function(e){window.__nhInstallPrompt=e;});if(!("serviceWorker" in navigator))return;var host=location.hostname;var isLocal=host==="localhost"||host==="127.0.0.1"||host==="0.0.0.0";if(isLocal||location.port==="3000"||location.port==="3001"){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(r){r.unregister();});}).catch(function(){});if(window.caches){caches.keys().then(function(keys){keys.forEach(function(k){caches.delete(k);});}).catch(function(){});}try{sessionStorage.removeItem("nh-app-open");}catch(e){}return;}navigator.serviceWorker.register("/sw.js").catch(function(){});})();`;

const COMFORT_SCRIPT = `(function(){try{var raw=localStorage.getItem("nh-comfort");var p=raw?JSON.parse(raw):{};var root=document.documentElement;var theme=p.theme==="dark"||p.theme==="system"?p.theme:"light";var dark=theme==="dark"||(theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);root.classList.toggle("dark",dark);if(p.text==="125")root.setAttribute("data-text","125");if(p.arabic==="uthmani")root.setAttribute("data-arabic","uthmani");var save=navigator.connection&&navigator.connection.saveData;if(p.bandwidth==="low"||(p.bandwidth!=="full"&&save))root.setAttribute("data-bandwidth","low");}catch(e){}})();`;

const ORGANIZATION_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "Mosque"],
  name: "Jiloul Jadid",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dakar",
    addressLocality: "Dakar",
    addressCountry: "SN",
  },
});

/**
 * Injecte les scripts boot hors de l’arbre React hydraté
 * (React 19 / Next 16 refuse les <script> rendus dans un composant).
 */
export function BootScripts() {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <>
        <script id="nh-boot-comfort" dangerouslySetInnerHTML={{ __html: COMFORT_SCRIPT }} />
        <script id="nh-boot-font" dangerouslySetInnerHTML={{ __html: FONT_BRIDGE_SCRIPT }} />
        <script id="nh-boot-app-open" dangerouslySetInnerHTML={{ __html: APP_OPEN_SCRIPT }} />
        <script id="nh-boot-install" dangerouslySetInnerHTML={{ __html: INSTALL_SCRIPT }} />
        <script
          id="nh-organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSON_LD }}
        />
      </>
    );
  });

  return null;
}
