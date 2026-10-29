/* Runs the cut-out models off the main thread. Model files are kept in the Cache API so they work offline. */
const MODEL_CACHE = "closet-models-v1";
let base = "";
const sessions = {};
async function getBuffer(url){
  let cache = null;
  try{ cache = await caches.open(MODEL_CACHE); const hit = await cache.match(url); if(hit) return hit.arrayBuffer(); }catch(e){}
  const r = await fetch(url);
  if(!r.ok) throw new Error(url + ": " + r.status);
  if(cache){ try{ await cache.put(url, r.clone()); }catch(e){} }
  return r.arrayBuffer();
}
function session(name, spec){
  if(!sessions[name]) sessions[name] = (async()=>{
    const parts = await Promise.all(Array.from({length:spec.parts}, (_,i)=>getBuffer(base + spec.file + i + ".wasm")));
    let n = 0; for(const p of parts) n += p.byteLength;
    const buf = new Uint8Array(n); let o = 0; for(const p of parts){ buf.set(new Uint8Array(p), o); o += p.byteLength; }
    return ort.InferenceSession.create(buf, {executionProviders:["wasm"], logSeverityLevel:3});
  })().catch(err=>{ delete sessions[name]; throw err; });
  return sessions[name];
}
self.onmessage = async e=>{
  const d = e.data;
  if(d.type==="init"){
    try{
      base = d.base;
      importScripts(base + "ort/ort.wasm.min.js");
      ort.env.wasm.numThreads = 1; ort.env.logLevel = "error"; ort.env.wasm.wasmPaths = base + "ort/";
      self.postMessage({type:"ready"});
    }catch(err){ self.postMessage({type:"init-error", error:String(err && err.message || err)}); }
    return;
  }
  if(d.type==="run"){
    try{
      const s = await session(d.model, d.spec);
      const S = d.spec.size, N = S*S;
      const out = await s.run({[s.inputNames[0]]: new ort.Tensor("float32", d.input, [1,3,S,S])});
      const raw = out[s.outputNames[0]].data;
      let res;
      if(d.model==="person"){            // softmax over background / upper / lower / full-body
        res = new Float32Array(4*N);
        for(let p=0;p<N;p++){ let mx=-Infinity; for(let k=0;k<4;k++) mx=Math.max(mx, raw[k*N+p]);
          let sum=0; for(let k=0;k<4;k++){ const v=Math.exp(raw[k*N+p]-mx); res[k*N+p]=v; sum+=v; }
          for(let k=0;k<4;k++) res[k*N+p]/=sum; }
      } else res = new Float32Array(raw);
      self.postMessage({id:d.id, out:res}, [res.buffer]);
    }catch(err){ self.postMessage({id:d.id, error:String(err && err.message || err)}); }
  }
};
