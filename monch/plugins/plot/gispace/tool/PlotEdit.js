import Observable, {unByKey} from "ol/Observable";
import Overlay from "ol/Overlay";
import DragPan from "ol/interaction/DragPan";
import Feature from "ol/Feature";

import DomUtils from "../util/DomUtils";
import * as Event from "../event/index";

export default class PlotEdit extends Observable {
    constructor(map) {
        super();
        this.activePlot = null;
        this.startPoint = null;
        this.ghostControlPoints = null;
        this.controlPoints = null;
        this.map = map;
        this.mapViewport = this.map.getViewport();
        this.mouseOver = false;
        this.elementTable = {};
        this.activeControlPointId = null;
        this.mapDragPan = null;

        this.Constants = {
            HELPER_HIDDEN_DIV: 'p-helper-hidden-div',
            HELPER_CONTROL_POINT_DIV: 'p-helper-control-point-div'
        }

        this.pointermoveListener = null;
        this.pointerdownListener = null;
        this.pointerupListener = null;
        this.pointerdragListener = null;

        this.mousemoveCallback = this.controlPointMouseMoveHandler.bind(this);
        this.mouseupCallback = this.controlPointMouseUpHandler.bind(this);
    }

    initHelperDom(){
        if(!this.map || !this.activePlot){
            return;
        }
        let parent = this.getMapParentElement();
        if(!parent){
           return;
        }
        let hiddenDiv = DomUtils.createHidden('div', parent, this.Constants.HELPER_HIDDEN_DIV);

        let cPnts = this.getControlPoints();
        for(let i=0; i<cPnts.length; i++){
            let id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
            DomUtils.create('div', this.Constants.HELPER_CONTROL_POINT_DIV, hiddenDiv, id);
            this.elementTable[id] = i;
        }
    }

    getMapParentElement() {
        let mapElement = this.map.getTargetElement();
        if(!mapElement){
            return;
        }
        return mapElement.parentNode;
    }

    destroyHelperDom(){
        //
        if(this.controlPoints){
            for(let i=0; i<this.controlPoints.length; i++){
                this.map.removeOverlay(this.controlPoints[i]);
                let element = DomUtils.get(this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i);
                if(element){
                    DomUtils.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
                    DomUtils.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
                }
            }
            this.controlPoints = null;
        }
        //
        let parent = this.getMapParentElement();
        let hiddenDiv = DomUtils.get(this.Constants.HELPER_HIDDEN_DIV);
        if(hiddenDiv && parent){
            DomUtils.remove(hiddenDiv, parent);
        }
    }

    initControlPoints(){
        if(!this.map){
            return;
        }
        this.controlPoints = [];
        let cPnts = this.getControlPoints();
        for(let i=0; i<cPnts.length; i++){
            let id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
            let element = DomUtils.get(id);
            let pnt = new Overlay({
                id: id,
                position: cPnts[i],
                positioning: 'center-center',
                element: element
            });
            this.controlPoints.push(pnt);
            this.map.addOverlay(pnt);
            this.map.render();

            DomUtils.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
            DomUtils.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
        }
    }

    controlPointMouseMoveHandler2(e){
        e.stopImmediatePropagation();
    }

    controlPointMouseDownHandler(e){
        let id = e.target.id;
        this.activeControlPointId = id;
        this.mapViewport.addEventListener(Event.EventType.MOUSEMOVE, this.mousemoveCallback, false);
        this.mapViewport.addEventListener(Event.EventType.MOUSEUP, this.mouseupCallback, false);
        // goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, false, this);
        // goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, false, this);
    }

    controlPointMouseMoveHandler(e){
        let coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
        if(this.activeControlPointId){
            let plot = this.activePlot.getGeometry();
            let index = this.elementTable[this.activeControlPointId];
            plot.updatePoint(coordinate, index);
            let overlay = this.map.getOverlayById(this.activeControlPointId);
            overlay.setPosition(coordinate);

            this.dispatchEvent(new Event.PlotEditEvent(Event.PlotEditEvent.EDIT_MOVE, this.activePlot));
        }
    }

    controlPointMouseUpHandler(e){
        this.mapViewport.removeEventListener(Event.EventType.MOUSEMOVE, this.mousemoveCallback, false);
        this.mapViewport.removeEventListener(Event.EventType.MOUSEUP, this.mouseupCallback, false);

        this.dispatchEvent(new Event.PlotEditEvent(Event.PlotEditEvent.EDIT_END, this.activePlot));
        /*goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
            this.controlPointMouseMoveHandler, false, this);
        goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
            this.controlPointMouseUpHandler, false, this);*/
    }

    activate(plot){
        if(!plot || !(plot instanceof Feature) || plot == this.activePlot) {
            return;
        }

        let geom = plot.getGeometry();
        if(!geom.isPlot()){
            return;
        }

        this.deactivate();

        this.activePlot = plot;
        //
        this.pointermoveListener = this.map.on("pointermove", this.plotMouseOverOutHandler.bind(this));

        this.initHelperDom();
        //
        this.initControlPoints();
        //
    }

    getControlPoints(){
        if(!this.activePlot){
            return [];
        }
        let geom = this.activePlot.getGeometry();
        return geom.getPoints();
    }

    plotMouseOverOutHandler(e){
        let feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            return feature;
        });
        if(feature && feature == this.activePlot){
            if(!this.mouseOver){
                this.mouseOver = true;
                this.map.getViewport().style.cursor = 'move';
                this.pointerdownListener = this.map.on('pointerdown', this.plotMouseDownHandler.bind(this));
            }
        }else{
            if(this.mouseOver){
                this.mouseOver = false;
                this.map.getViewport().style.cursor = 'default';
                unByKey(this.pointerdownListener);
            }
        }
    }

    plotMouseDownHandler(e){
        this.ghostControlPoints = this.getControlPoints();
        this.startPoint = e.coordinate;
        this.disableMapDragPan();
        this.pointerupListener = this.map.on('pointerup', this.plotMouseUpHandler.bind(this));
        this.pointerdragListener = this.map.on('pointerdrag', this.plotMouseMoveHandler.bind(this));
    }

    plotMouseMoveHandler(e){
        let point = e.coordinate;
        let dx = point[0] - this.startPoint[0];
        let dy = point[1] - this.startPoint[1];
        let newPoints = [];
        for(let i=0; i<this.ghostControlPoints.length; i++){
            let p = this.ghostControlPoints[i];
            let coordinate = [p[0] + dx, p[1] + dy];
            newPoints.push(coordinate);
            let id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
            let overlay = this.map.getOverlayById(id);
            overlay.setPosition(coordinate);
            overlay.setPositioning('center-center');
        }
        let plot = this.activePlot.getGeometry();
        plot.setPoints(newPoints);

        this.dispatchEvent(new Event.PlotEditEvent(Event.PlotEditEvent.EDIT_MOVE, this.activePlot));
    }

    plotMouseUpHandler(e){
        this.enableMapDragPan();
        unByKey(this.pointerupListener);
        unByKey(this.pointerdragListener);

        this.dispatchEvent(new Event.PlotEditEvent(Event.PlotEditEvent.EDIT_END, this.activePlot));
    }

    disconnectEventHandlers() {
        unByKey(this.pointermoveListener);
        this.mapViewport.removeEventListener(Event.EventType.MOUSEMOVE, this.mousemoveCallback, false);
        this.mapViewport.removeEventListener(Event.EventType.MOUSEUP, this.mouseupCallback, false);
        // goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        //     this.controlPointMouseMoveHandler, false, this);
        // goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
        //     this.controlPointMouseUpHandler, false, this);
        unByKey(this.pointerdownListener);
        unByKey(this.pointerupListener);
        unByKey(this.pointerdragListener);
    }

    deactivate(){
        this.activePlot = null;
        this.mouseOver = false;
        this.destroyHelperDom();
        this.disconnectEventHandlers();
        this.elementTable = {};
        this.activeControlPointId = null;
        this.startPoint = null;
    }

    disableMapDragPan() {
        let interactions = this.map.getInteractions();
        let length = interactions.getLength();
        for (let i = 0; i < length; i++) {
            let item = interactions.item(i);
            if (item instanceof DragPan) {
                this.mapDragPan = item;
                item.setActive(false);
                break;
            }
        }
    }

    enableMapDragPan() {
        if (this.mapDragPan != null) {
            this.mapDragPan.setActive(true);
            this.mapDragPan = null;
        }
    }
}