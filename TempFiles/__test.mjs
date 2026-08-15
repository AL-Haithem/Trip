import Symbol from "@arcgis/core/symbols/Symbol.js";
// legacy stored format
const legacy = {type:"esriSMS",color:[12,255,37,255],style:"esriSMSPath",path:"M16 3.5c",size:26,outline:{type:"esriSLS",color:[6,33,11,255],width:1.5}};
const a = Symbol.fromJSON(legacy);
console.log("LEGACY esriSMS -> declaredClass=", a.declaredClass, "path=", JSON.stringify(a.path));
// modern format
const modern = {type:"simple-marker",color:[12,255,37,255],style:"path",path:"M16 3.5c",size:26,outline:{color:[6,33,11,255],width:1.5}};
const b = Symbol.fromJSON(modern);
console.log("MODERN simple-marker -> declaredClass=", b.declaredClass, "path=", JSON.stringify(b.path));
