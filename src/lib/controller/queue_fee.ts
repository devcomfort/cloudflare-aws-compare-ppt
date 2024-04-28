import * as _ from 'lodash';
import { ChartController, type SampleFactor } from './chart';
import { CloudflareQueuesCalculator } from '../utils/cloudflare_queues';
import { AWSSQSCalculator } from '../utils/aws_sqs';

export interface QueueFeeFactors {
	sampleFactor: SampleFactor;
	message_per_batch: number;
	size_of_message: number;
}

export class QueueFeeController extends ChartController<QueueFeeFactors> {
	constructor(canvas: HTMLCanvasElement, factor: QueueFeeFactors) {
		super(canvas, factor, {
			title: 'Cloudflare Queues vs AWS SQS 요금 비교',
			xtitle: '요청 수',
			ytitle: '청구 요금 (단위: USD)'
		});
	}

	createDataset(factor: QueueFeeFactors): { label: string; data: number[] }[] {
		const { message_per_batch, size_of_message, sampleFactor } = factor;
		const amount_of_messages = this.createLabels(sampleFactor);

		return [
			{
				label: 'Cloudflare Queues 요금',
				data: _.map(amount_of_messages, (amount_of_message) =>
					new CloudflareQueuesCalculator().totalFee(
						amount_of_message,
						message_per_batch,
						size_of_message
					)
				)
			},
			{
				label: 'AWS SQS 요금 (데이터 송신 요금 포함)',
				data: _.map(amount_of_messages, (amount_of_message) =>
					new AWSSQSCalculator().totalFee(amount_of_message, message_per_batch, size_of_message)
				)
			}
		];
	}
}
