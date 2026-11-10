// HeliumX modal palettes. Add future theme palette objects here.
// Detection is by enabled Chromium theme extension name, never site contents.
export const palettes={
 'catppuccin-mocha':{
  bg:'#1e1e2e',surface:'#313244',text:'#cdd6f4',muted:'#bac2de',border:'#585b70',accent:'#cba6f7',accentText:'#1e1e2e',overlay:'rgba(6,5,12,.55)',error:'#f38ba8'
 },
 'light':{
  bg:'#eff1f5',surface:'#e6e9ef',text:'#4c4f69',muted:'#6c6f85',border:'#bcc0cc',accent:'#8839ef',accentText:'#ffffff',overlay:'rgba(76,79,105,.35)',error:'#d20f39'
 },
 'dark':{
  bg:'#24273a',surface:'#363a4f',text:'#cad3f5',muted:'#b8c0e0',border:'#5b6078',accent:'#c6a0f6',accentText:'#24273a',overlay:'rgba(24,25,38,.6)',error:'#ed8796'
 }
};
export function detectPalette(extensions,mode='auto'){
 if(mode!=='auto'&&Object.hasOwn(palettes,mode))return {id:mode,colors:palettes[mode]};
 const active=extensions.find(x=>x.type==='theme'&&x.enabled);
 const name=String(active?.name||'').toLowerCase();
 if(name.includes('catppuccin')&&name.includes('mocha'))return {id:'catppuccin-mocha',colors:palettes['catppuccin-mocha']};
 // Unknown browser themes: no public API to retrieve their actual colors.
 return {id:'auto',colors:null};
}
