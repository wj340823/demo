import Observable, {unByKey} from "ol/Observable";
import {
    Fill,
    Stroke,
    Style
} from 'ol/style.js';
import {
    Vector as VectorLayer
} from 'ol/layer.js';
import {
    Vector as VectorSource
} from 'ol/source.js';
import Feature from "ol/Feature";
import DoubleClickZoom from "ol/interaction/DoubleClickZoom";

import PlotFactory from "../PlotFactory";
import PlotUtils from "../PlotUtils";
import Constants from "../Constants";
import * as Event from "../event/index";

export default class PlotDraw extends Observable {
    constructor(map, style){
        super();
        this.points = null;
        this.plot = null;
        this.feature = null;
        this.plotType = null;
        this.plotParams = null;
        this.mapViewport = null;
        this.dblClickZoomInteraction = null;

        this.clickListener = null;
        this.dblclickListener = null;
        this.moveCallback = this.mapMouseMoveHandler.bind(this);

        if(!style){
            let stroke = new Stroke({color: '#000000', width: 1.25});
            let fill = new Fill({color: 'rgba(0,0,0,0.4)'});
            this.style = new Style({fill:fill, stroke:stroke});
        }else{
            this.style = style;
        }

        this.featureSource = new VectorSource();
        this.drawOverlay = new VectorLayer({
            source: this.featureSource
        });
        this.drawOverlay.setStyle(this.style);
        this.setMap(map);
    }

    activate(type, params) {
        this.deactivate();
        this.deactivateMapTools();
        this.clickListener = this.map.on("click", this.mapFirstClickHandler.bind(this));
        this.plotType = type;
        this.plotParams = params;
        if(params.style){
            this.drawOverlay.setStyle(params.style);
        }
        this.drawOverlay.setMap(this.map);
    }

    deactivate() {
        this.disconnectEventHandlers();
        this.drawOverlay.setMap(null);
        this.featureSource.clear();
        this.points = [];
        this.plot = null;
        this.feature = null;
        this.plotType = null;
        this.plotParams = null;
        this.activateMapTools();
    }

    isDrawing(){
        return this.plotType != null;
    }

    setMap(value) {
        this.map = value;
        this.mapViewport = this.map.getViewport();
    }

    mapFirstClickHandler(e) {
        this.points.push(e.coordinate);
        this.plot = PlotFactory.createPlot(this.plotType, this.points, this.plotParams);
        this.feature = new Feature(this.plot);

        //二维转三维 贴地
        this.feature.getGeometry().set("altitudeMode", "clampToGround");

        this.featureSource.addFeature(this.feature);
        unByKey(this.clickListener);
        //
        if (this.plot.fixPointCount == this.plot.getPointCount()) {
            this.mapDoubleClickHandler(e);
            return;
        }
        //
        this.clickListener = this.map.on("click", this.mapNextClickHandler.bind(this));
        if(!this.plot.freehand){
            this.dblclickListener = this.map.on("dblclick", this.mapDoubleClickHandler.bind(this));
        }

        this.mapViewport.addEventListener(Event.EventType.MOUSEMOVE, this.moveCallback, false);
        // goog.events.listen(this.mapViewport, Event.EventType.MOUSEMOVE,
        //     this.mapMouseMoveHandler, false, this);
    }

    mapMouseMoveHandler(e){
        const coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
        if (PlotUtils.distance(coordinate, this.points[this.points.length - 1]) < Constants.ZERO_TOLERANCE)
            return;
        if(!this.plot.freehand){
            const pnts = this.points.concat([coordinate]);
            this.plot.setPoints(pnts);
        }else{
            this.points.push(coordinate);
            this.plot.setPoints(this.points);
        }
    }

    mapNextClickHandler(e) {
        if(!this.plot.freehand){
            if (PlotUtils.distance(e.coordinate, this.points[this.points.length - 1]) < Constants.ZERO_TOLERANCE)
                return;
        }
        this.points.push(e.coordinate);
        this.plot.setPoints(this.points);
        if (this.plot.fixPointCount == this.plot.getPointCount()) {
            this.mapDoubleClickHandler(e);
            return;
        }
        if(this.plot && this.plot.freehand){
            this.mapDoubleClickHandler(e);
        }
    }

    mapDoubleClickHandler(e) {
        this.disconnectEventHandlers();
        this.plot.finishDrawing();
        e.preventDefault();
        this.drawEnd();
    }

    disconnectEventHandlers() {
        unByKey(this.clickListener);
        this.mapViewport.removeEventListener(Event.EventType.MOUSEMOVE, this.moveCallback, false);
        /*goog.events.unlisten(this.mapViewport, Event.EventType.MOUSEMOVE,
            this.mapMouseMoveHandler, false, this);*/
        unByKey(this.dblclickListener);
    }

    drawEnd(feature) {
        this.featureSource.removeFeature(this.feature);
        this.activateMapTools();
        this.disconnectEventHandlers();
        this.map.removeOverlay(this.drawOverlay);
        this.points = [];
        this.plot = null;
        this.plotType = null;
        this.plotParams = null;

        this.dispatchEvent(new Event.PlotDrawEvent(Event.PlotDrawEvent.DRAW_END, this.feature));
        this.feature = null;
    }

    deactivateMapTools() {
        let interactions = this.map.getInteractions();
        let length = interactions.getLength();
        for (let i = 0; i < length; i++) {
            let item = interactions.item(i);
            if (item instanceof DoubleClickZoom) {
                this.dblClickZoomInteraction = item;
                interactions.remove(item);
                break;
            }
        }
    }

    activateMapTools() {
        if (this.dblClickZoomInteraction != null) {
            this.map.getInteractions().push(this.dblClickZoomInteraction);
            this.dblClickZoomInteraction = null;
        }
    }

}