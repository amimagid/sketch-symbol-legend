const isSketchStringsEqual = require('../utils/isSketchStringsEqual');
const createLegendItemIndexGenerator = require('./createLegendItemIndexGenerator');
const createLegendItemIndex = require('./createLegendIndex');
const getLegendItemDescription = require('./getLegendItemDescription');
const createLegendArtboard = require('./createLegendArtboard');
const isWixStyleReactLayer = require('../utils/isWixStyleReactLayer');
const { Group } = require('sketch/dom');
const { SYMBOL_INSTANCE_CLASS_NAME, LEGEND_GROUP_NAME } = require('../constants');

function legendify({
  layer,
  layerOffsetTop = 0,
  layerOffsetLeft = 0,
  symbolsDictionary,
  artboard,
  document,
  getLegendItemIndex,
  legendItems,
  onDone = () => {},
}) {
  if (!layer.layers) {
    return;
  }

  let doneLayersCount = 0;
  let legendIndexItems = [];

  const layersCache = Array
    .from(layer.layers())
    .map(layer => {
      const frame = layer.frame();
      return {
        x: frame.x(),
        y: frame.y(),
        cls: layer.class(),
        isWixStyleReactLayer: isWixStyleReactLayer(layer),
        layer,
      };
    });

  layersCache
    .sort((a, b) => (
      (a.y - b.y) < 0 ||
      (a.x - b.x) < 0 ?
        -1 :
        1
    ))
    .forEach(({ layer, x, y, cls, isWixStyleReactLayer }) => {
      coscript.scheduleWithInterval_jsFunction(0, () => {
        document.showMessage(
          `Processing Artboard: ${artboard.name()} !!! PLEASE DO NOT REMOVE ANY ELEMENTS !!!`
        );

        if (!isSketchStringsEqual(cls, SYMBOL_INSTANCE_CLASS_NAME)) {
          legendify({
            layer,
            artboard,
            layerOffsetTop: layerOffsetTop + y,
            layerOffsetLeft: layerOffsetTop + x,
            symbolsDictionary,
            getLegendItemIndex,
            legendItems
          });
        }

        if (isWixStyleReactLayer) {
          const legendItemIndex = getLegendItemIndex();

          legendIndexItems = [...legendIndexItems, ...createLegendItemIndex({
            layer,
            artboard: artboard,
            layerIndex: legendItemIndex,
            layerOffsetTop,
            layerOffsetLeft,
          })];

          legendItems.push(
            getLegendItemDescription({
              layer,
              layerIndex: legendItemIndex,
              symbolsDictionary,
            })
          );
        }

        if (++doneLayersCount === layersCache.length) {
          onDone({ legendIndexItems });
        }
      });
    });
}

function legendifyArtboard({ artboard, document, page, symbolsDictionary }) {
  const getLegendItemIndex = createLegendItemIndexGenerator();
  const legendItems = [];

  coscript.shouldKeepAround = true;

  const legendItemsGroup = new Group({
    name: LEGEND_GROUP_NAME,
    parent: artboard,
  });

  legendify({
    layer: artboard,
    artboard,
    document,
    symbolsDictionary,
    getLegendItemIndex,
    legendItems,
    onDone({ legendIndexItems }) {
      if (!legendItems.length) {
        return;
      }

      legendItemsGroup.layers = legendIndexItems;
      legendItemsGroup._object.setIsLocked(true);

      document.showMessage('All Artboards processed.');
      coscript.shouldKeepAround = false;

      createLegendArtboard({
        page,
        artboard,
        legendItems,
      });
    }
  });
}

module.exports = legendifyArtboard;
