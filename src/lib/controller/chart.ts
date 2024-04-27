import * as _ from 'lodash';
import Chart from 'chart.js/auto';

interface TitleData {
	title: string;
	ytitle: string;
	xtitle: string;
}

export interface SampleFactor {
	/** 샘플 간 간격 */
	step: number;
	/** 샘플용 임계값 */
	count: number;
}

export abstract class ChartController<
	F extends {
		sampleFactor: SampleFactor;
	}
> {
	canvas: HTMLCanvasElement;
	chart: Chart;

	constructor(canvas: HTMLCanvasElement, factor: F, titleData: Partial<TitleData>) {
		this.canvas = canvas;

		const { title, xtitle, ytitle } = titleData;

		const labels = this.createLabels(factor.sampleFactor);
		const datasets = this.createDataset(factor);

		this.chart = new Chart(this.canvas, {
			type: 'line',
			data: {
				labels,
				datasets
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: ytitle
						}
					},
					x: {
						beginAtZero: true,
						title: {
							display: true,
							text: xtitle
						}
					}
				},
				plugins: {
					title: {
						display: true,
						text: title
					}
				}
			}
		});
	}

	createLabels(sampleFactor: SampleFactor) {
		const { count, step } = sampleFactor;
		return _.times(count, (idx) => (idx + 1) * step);
	}

	abstract createDataset(factor: F): { label: string; data: number[] }[];

	update(factor: F) {
		if (!(this.chart instanceof Chart)) return;

		this.chart.data.labels = this.createLabels(factor.sampleFactor);
		this.chart.data.datasets = this.createDataset(factor);
		this.chart.update();
	}
}
