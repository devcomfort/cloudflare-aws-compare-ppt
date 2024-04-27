import * as _ from 'lodash';
import { getEgressFee } from '../utils/aws_egress_fee';
import { AWSLambda } from '../utils/aws_lambda';
import { CloudflareWorkers } from '../utils/cloudflare_workers';
import { ChartController, type SampleFactor } from './chart';

/**
 * 서버리스 사용 요금 계산에 필요한 변수들
 */
export interface ServerlessFeeFactors {
	sampleFactor: SampleFactor;

	/** 요청 당 소요 시간 (단위: ms) */
	elapsed_time_per_request: number;
	/**
	 * 요청 응답 크기 (단위: mb)
	 *
	 * - egress fee 계산에 사용
	 */
	response_body_size: number;
}

export class ServerlessFeeChartController extends ChartController<ServerlessFeeFactors> {
	constructor(canvas: HTMLCanvasElement, factor: ServerlessFeeFactors) {
		super(canvas, factor, {
			title: 'Cloudflare Workers vs AWS Lambda 요금 비교',
			xtitle: '요청 수',
			ytitle: '청구 요금 (단위: USD)'
		});
	}

	createDataset(factor: ServerlessFeeFactors) {
		const { elapsed_time_per_request, response_body_size, sampleFactor } = factor;
		const request_samples = this.createLabels(sampleFactor);

		return [
			{
				label: 'Cloudflare Workers 요금',
				data: _.map(request_samples, (amount_of_request) =>
					new CloudflareWorkers().totalFee(amount_of_request, elapsed_time_per_request)
				)
			},
			{
				label: 'AWS Lambda 요금',
				data: _.map(
					request_samples,
					(amount_of_request) =>
						new AWSLambda().totalFee(amount_of_request, elapsed_time_per_request, 128) +
						getEgressFee((response_body_size / 1_000) * amount_of_request)
				)
			},
			{
				label: 'AWS 데이터 송신 요금',
				data: _.map(request_samples, (amount_of_request) =>
					getEgressFee((response_body_size / 1_000) * amount_of_request)
				)
			}
		];
	}
}
