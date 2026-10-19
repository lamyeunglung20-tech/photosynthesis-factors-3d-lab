export const missions = [
  {
    id:'chlorophyll', number:'01', title:'葉綠素', en:'CHLOROPHYLL', icon:'◒', color:'#a8d176',
    question:'葉綠素是否進行光合作用的必要因素？',
    premise:'先把植物去澱粉，再使用同一塊斑葉的綠色與非綠色部分作比較。兩部分都接受光照，亦接觸空氣。',
    materials:['斑葉','鈉石灰','黑紙與萬字夾'], materialAnswer:0,
    materialWhy:'斑葉同時有含葉綠素的綠色部分和缺乏葉綠素的非綠色部分，可直接比較。',
    conditions:[
      {id:'other_leaf',name:'另一塊全綠色的葉片',short:'另一塊葉片'},
      {id:'normal',name:'同一塊斑葉的綠色部分',short:'綠色部分',result:'blue'},
      {id:'shade',name:'同一塊斑葉被黑紙遮蓋的部分',short:'遮光部分'},
      {id:'removed',name:'同一塊斑葉的非綠色部分',short:'非綠色部分',result:'brown'},
      {id:'iodine',name:'同一塊斑葉預先滴了碘液的部分',short:'預先滴碘液'}
    ],
    setupWrong:'這個配對不能只比較葉綠素的有無。想想哪些選項也改變了葉片、光照或測試處理。',
    setupHint:'同一塊斑葉上的兩個部分，差異在於有沒有葉綠素。',
    roleWhy:'非綠色部分缺乏受測因素「葉綠素」，是實驗組；綠色部分作正常比較，是對照組。',
    iv:'葉綠素的有無', cv:'光照、二氧化碳供應與處理時間',
    ivOptions:['葉綠素的有無','碘液的顏色','葉片產生澱粉的情況'],
    cvOptions:['光照、二氧化碳供應與處理時間','葉綠素的有無','碘液的顏色'],
    conclusion:'綠色部分變藍黑色，非綠色部分維持黃褐色。這支持葉綠素是葉片在這些條件下製造澱粉的必要因素。'
  },
  {
    id:'carbon', number:'02', title:'二氧化碳', en:'CARBON DIOXIDE', icon:'◎', color:'#b4d2c5',
    question:'二氧化碳是否進行光合作用的必要因素？',
    premise:'先把植物去澱粉，再將可比較的葉片分別放入兩個密封透明膠袋；兩組都接受相同光照。',
    materials:['斑葉','鈉石灰','黑紙與萬字夾'], materialAnswer:1,
    materialWhy:'鈉石灰吸收密封膠袋內的二氧化碳，造成缺乏二氧化碳的條件。兩組都用透明膠袋才公平。',
    conditions:[
      {id:'open_bag',name:'敞開的透明膠袋內放有鈉石灰',short:'敞開膠袋'},
      {id:'removed',name:'密封透明膠袋內放有鈉石灰',short:'放有鈉石灰',result:'brown'},
      {id:'no_bag',name:'沒有套上透明膠袋的葉片',short:'沒有膠袋'},
      {id:'black_bag',name:'密封黑色膠袋內沒有鈉石灰',short:'黑色膠袋'},
      {id:'normal',name:'密封透明膠袋內沒有鈉石灰',short:'沒有鈉石灰',result:'blue'}
    ],
    setupWrong:'這個配對也改變了密封情況、膠袋或光照。要只比較二氧化碳供應，其他條件需相同。',
    setupHint:'兩組都放入密封透明膠袋，只讓一組加入鈉石灰。',
    roleWhy:'加入鈉石灰的一組缺乏受測因素「二氧化碳」，是實驗組；沒有鈉石灰的一組是對照組。',
    iv:'二氧化碳的有無', cv:'植物種類、光照、溫度與處理時間',
    ivOptions:['二氧化碳的有無','碘液的顏色','有沒有透明膠袋'],
    cvOptions:['植物種類、光照、溫度與處理時間','二氧化碳的有無','有沒有透明膠袋'],
    conclusion:'沒有鈉石灰的一組變藍黑色；有鈉石灰的一組維持黃褐色。這支持二氧化碳是製造澱粉的必要因素。'
  },
  {
    id:'light', number:'03', title:'光照', en:'LIGHT', icon:'☀', color:'#f2cf83',
    question:'光照是否進行光合作用的必要因素？',
    premise:'先把植物去澱粉，用不透光黑紙夾住葉片的一部分，前後兩面都要遮蓋；其餘部分照光。',
    materials:['斑葉','鈉石灰','黑紙與萬字夾'], materialAnswer:2,
    materialWhy:'黑紙阻隔光線，萬字夾固定黑紙；同一葉片未遮蓋的部分可作對照。',
    conditions:[
      {id:'transparent',name:'同一葉片被透明膠片遮蓋的部分',short:'透明膠片'},
      {id:'one_side',name:'同一葉片只在一面蓋上黑紙的部分',short:'只遮一面'},
      {id:'normal',name:'同一葉片沒有被黑紙遮蓋的部分',short:'接受光照',result:'blue'},
      {id:'removed',name:'同一葉片前後兩面被黑紙遮蓋的部分',short:'黑紙遮蓋',result:'brown'},
      {id:'other_leaf',name:'另一塊放在陰影中的葉片',short:'另一塊葉片'}
    ],
    setupWrong:'這個配對未能在同一葉片上清楚比較有光與無光。透明膠片或只遮一面，仍可能讓光到達葉片。',
    setupHint:'比較同一葉片接受光照與被黑紙遮蓋的部分。',
    roleWhy:'被黑紙遮蓋的部分缺乏受測因素「光照」，是實驗組；未遮蓋的部分是對照組。',
    iv:'光照的有無', cv:'葉片、二氧化碳供應與處理時間',
    ivOptions:['光照的有無','澱粉的有無','葉片的顏色'],
    cvOptions:['葉片、二氧化碳供應與處理時間','光照的有無','黑紙是否遮蓋'],
    conclusion:'受光部分變藍黑色；遮光部分維持黃褐色。這支持光照是葉片製造澱粉的必要因素。'
  }
];

export const dependent = '葉片有沒有產生澱粉（以碘液顏色判斷）';
export const dependentOptions = [dependent,'葉片接受多少光照','有沒有加入鈉石灰'];
export const tests = ['碘液測試','石灰水測試','本立德試劑測試'];
export const stages = ['選擇材料','安排條件','辨認組別','判斷變因','選擇測試','預測結果'];
