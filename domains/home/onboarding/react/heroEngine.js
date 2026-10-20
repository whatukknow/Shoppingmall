  /* ===== 장보기 캐릭터: 성별별 2D 픽셀 + 장바구니 ===== */
    var W=20,H=26,OUT='#5B3B33';
    var PAL={f:{hair:'#8B4A2B',top:'#F28C96',bot:'#8E1B2C',acc:'#FFD45E'},m:{hair:'#4A3A36',top:'#6FA8DC',bot:'#4F5E8C',acc:null},n:{hair:'#6B4430',top:'#9AA84A',bot:'#8B5A3C',acc:'#650f20'}};
    export function heroRects(g,frame){var p=PAL[g]||PAL.n,gr=[],i,x,y;for(i=0;i<H;i++)gr.push(new Array(W).fill(null));
      function put(x,y,c){x=Math.round(x);y=Math.round(y);if(y>=0&&y<H&&x>=0&&x<W)gr[y][x]=c}
      function R(x0,y0,w,h,c){for(var y=y0;y<y0+h;y++)for(var x=x0;x<x0+w;x++)put(x,y,c)}
      function E(cx,cy,rx,ry,c){for(var y=0;y<H;y++)for(var x=0;x<W;x++){var dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)gr[y][x]=c}}
      var SK='#FFD9B8',SH='#4A3A36',BK='#C98A58',BD='#8B5A3C';
      /* 다리: 프레임마다 앞뒤 교차 */
      if(frame===0){R(6,19,2,4,p.bot==='#8E1B2C'?SK:p.bot);R(10,19,2,4,p.bot==='#8E1B2C'?SK:p.bot);R(5,23,3,1,SH);R(10,23,3,1,SH)}
      else{R(7,19,2,3,p.bot==='#8E1B2C'?SK:p.bot);R(9,19,2,4,p.bot==='#8E1B2C'?SK:p.bot);R(6,22,3,1,SH);R(9,23,3,1,SH)}
      /* 몸통 + 하의 */
      R(5,13,8,6,p.top);
      if(g==='f'){for(y=17;y<21;y++)R(5-(y-17)*.5|0,y,8+(y-17),1,p.bot)}else R(5,17,8,2,p.bot);
      if(g==='n'){R(5,13,8,1,p.acc)}
      /* 뒤쪽 팔 */
      R(4,14,1,4,p.top);put(4,18,SK);
      /* 앞으로 내민 팔 + 장바구니 */
      R(13,14,2,2,p.top);put(15,15,SK);
      for(x=13;x<=19;x++)put(x,18-Math.round(3*Math.sin((x-13)/6*Math.PI)),BD);
      R(13,17,7,5,BK);R(13,17,7,1,BD);R(14,19,5,1,BD);
      /* 머리 */
      E(9,8,5.3,5.2,SK);
      if(g==='f'){E(9,5.2,5.8,3.4,p.hair);R(3,5,2,8,p.hair);R(14,5,2,8,p.hair);R(5,6,9,1,p.hair);R(12,1,3,2,p.acc);put(13,3,p.acc)}
      else if(g==='m'){E(9,4.8,5.6,3.1,p.hair);R(4,5,11,2,p.hair);R(4,7,1,2,p.hair);R(14,7,1,1,p.hair)}
      else{E(9,4.4,5.8,2.8,p.acc);R(9,5,7,1,p.acc);R(4,6,1,3,p.hair);R(14,6,1,2,p.hair)}
      put(7,9,'#3A2A26');put(11,9,'#3A2A26');put(6,10,'#F7A9B8');put(12,10,'#F7A9B8');put(9,11,'#E07A6A');
      /* 외곽선 */
      var o=gr.map(function(r){return r.slice()});
      for(y=0;y<H;y++)for(x=0;x<W;x++){if(gr[y][x])continue;for(var d=0;d<4;d++){var yy=y+[1,-1,0,0][d],xx=x+[0,0,1,-1][d];if(yy>=0&&yy<H&&xx>=0&&xx<W&&gr[yy][xx]){o[y][x]=OUT;break}}}
      var rects=[];
      for(y=0;y<H;y++){x=0;while(x<W){var c=o[y][x];if(!c){x++;continue}var x0=x;while(x<W&&o[y][x]===c)x++;rects.push({x:x0,y:y,width:x-x0,height:1,fill:c})}}
      return rects;
    }
