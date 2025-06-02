const a=(a,e)=>{t({type:"capture",data:a},e);},e=(a,e)=>{t({type:"scroll_capture",data:a},e);},t=(a,e)=>{chrome.runtime.sendMessage(a,e);},s=(a,e)=>{t({type:"edit",data:a},e);};

export { a, e, s };
