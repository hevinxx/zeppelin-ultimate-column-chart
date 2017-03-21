import Visualization from 'zeppelin-vis'
import AdvancedTransformation from 'zeppelin-tabledata/advanced-transformation'

import Highcharts from 'highcharts/highcharts'
require('highcharts/modules/exporting')(Highcharts);

import { CommonParameter, createColumnChartDataStructure, createColumnChartOption, } from './chart/column'
import { StackedParameter, createStackedColumnOption, } from './chart/stacked'
import { PercentParameter, createPercentColumnOption, } from './chart/percent'

/** https://github.com/highcharts/highcharts/issues/6456#issuecomment-286757030 */
Highcharts.wrap(Highcharts.Pointer.prototype, 'getHoverData', function (proceed, a, b, c, isDirectTouch, shared, f) {
  var directTouch = shared ? false : directTouch;
  return proceed.apply(this, [a, b, c, directTouch, shared, f]);
});

export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    const spec = {
      charts: {
        'column': {
          transform: { method: 'array', },
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator'},
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        },

        'stacked': {
          transform: { method: 'array', },
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator'},
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: StackedParameter,
        },

        'percent': {
          transform: { method: 'array', },
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator'},
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: PercentParameter,
        },

        'drill-down': {
          transform: { method: 'array', drillDown: true, },
          axis: {
            'xAxis': { dimension: 'multiple', axisType: 'key', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator'},
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        }
      },
    }

    this.transformation = new AdvancedTransformation(config, spec)
  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.destroy() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  drawColumnChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const {
      rows, keyColumnName, keyNames,
      selectors, selectorNameWithIndex, keyNameWithIndex,
    } = transformer()

    const data = createColumnChartDataStructure(rows)
    const chartOption = createColumnChartOption(data, parameter, keyNames, selectors)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  drawStackedChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const {
      rows, keyColumnName, keyNames,
      selectors, selectorNameWithIndex, keyNameWithIndex,
    } = transformer()

    const data = createColumnChartDataStructure(rows)
    const chartOption = createStackedColumnOption(data, parameter, keyNames, selectors)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  drawPercentChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const {
      rows, keyColumnName, keyNames,
      selectors, selectorNameWithIndex, keyNameWithIndex,
    } = transformer()

    const data = createColumnChartDataStructure(rows)
    const chartOption = createPercentColumnOption(data, parameter, keyNames, selectors)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  render(data) {
    const { chart, parameter, column, transformer, } = data

    if (chart === 'column') {
      this.drawColumnChart(parameter, column, transformer)
    } else if (chart === 'stacked') {
      this.drawStackedChart(parameter, column, transformer)
    } else if (chart === 'percent') {
      this.drawPercentChart(parameter, column, transformer)
    } else if (chart === 'drill-down') {
      const returned = transformer
      console.log(transformer)
    }
  }

  getTransformation() {
    return this.transformation
  }
}


