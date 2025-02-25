import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Map } from 'leaflet';
import { MapService } from '../map.service';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { GeoJSON } from 'togeojson';

/**
 *         Affiche sur la carte les geojson passé en *input*
 */
@Component({
  selector: 'pnx-geojson',
  templateUrl: 'geojson.component.html'
})
export class GeojsonComponent implements OnInit, OnChanges {
  public map: Map;
  public currentGeojson: L.Layer;
  public layerGroup: any;
  /** Objet geojson à afficher sur la carte */
  @Input() geojson: GeoJSON;
  /**
   * Fonction permettant d'effectuer un traitement sur chaque layer du geojson (afficher une popup, définir un style etc...)
   * fonction définit par la librairie leaflet: ``onEachFeature(feature, layer)``. `Voir doc leaflet <http://leafletjs.com/examples/geojson/>`_
   */
  @Input() onEachFeature: any;
  @Input() style: any;
  /** Zoom sur la bounding box des données envoyées */
  @Input() zoomOnLayer = true;
  /** Affiche les données sous forme de cluster */
  @Input() asCluste: boolean = false;
  public geojsonCharged = new Subject<any>();
  /** Observable pour retourner les données geojson passées au composant */
  public currentGeoJson$: Observable<L.Layer> = this.geojsonCharged.asObservable();

  constructor(public mapservice: MapService) {}

  ngOnInit() {
    this.map = this.mapservice.map;
  }

  loadGeojson(geojson) {
    this.currentGeojson = this.mapservice.createGeojson(
      geojson,
      this.asCluster,
      this.onEachFeature
    );
    this.geojsonCharged.next(this.currentGeojson);
    this.mapservice.layerGroup = new L.FeatureGroup();
    this.mapservice.map.addLayer(this.mapservice.layerGroup);
    this.mapservice.layerGroup.addLayer(this.currentGeojson);
  }

  ngOnChanges(changes) {
    if (changes.geojson && changes.geojson.currentValue !== undefined) {
      if (this.currentGeojson !== undefined) {
        this.mapservice.map.removeLayer(this.currentGeojson);
      }
      this.loadGeojson(changes.geojson.currentValue);
      // zoom on layer extend after fisrt search
      if (changes.geojson.previousValue !== undefined && this.zoomOnLayer) {
        // try to fit bound on layer. catch error if no layer in feature group

        try {
          this.map.fitBounds(this.mapservice.layerGroup.getBounds());
        } catch (error) {
          console.log('no layer in featuregroup');
        }
        //
      }
    }
  }
}
