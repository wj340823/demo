import olData from "@suc/monch/util/olData";
import {coordinateTransform,createStyle} from "@suc/monch/util/helpers";
const locationByExtent = (mapName:string,extent:number[],padding:number[]=[10, 10, 10, 10],callback:Function=function(){}) => {
    olData.getMap(mapName).then(function(map:any) {
        map.getView().fit(extent, {
            size: map.getSize(),
            padding: padding,
            duration: 100,
            callback:callback
        });
    });
}
const locationBySource = (mapName:string,source:any,padding:number[]=[10, 10, 10, 10],callback:Function=function(){}) => {
    if(!source) return;
    const extent = source.getExtent();
    locationByExtent(mapName,extent,padding,callback);
}
export default {
    locationBySource,
    locationByExtent,
    coordinateTransform,
    createStyle
}