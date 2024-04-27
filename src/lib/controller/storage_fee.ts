import { getEgressFee } from '../utils/aws_egress_fee';
import { AWSS3 } from '../utils/aws_s3';
import { CloudflareR2 } from '../utils/cloudflare_r2';
import { ChartController, type SampleFactor } from './chart';
import * as _ from 'lodash';

export interface StorageFeeFactors {
	sampleFactor: SampleFactor;
	amount_of_class_a_operation: number;
	amount_of_class_b_operation: number;
	/** 데이터 발신량 (단위: GB) */
	egress_usage: number;
}

export class StorageFeeController extends ChartController<StorageFeeFactors> {
	constructor(canvas: HTMLCanvasElement, factor: StorageFeeFactors) {
		super(canvas, factor, {
			title: 'Cloudflare R2 vs AWS S3 요금 비교',
			xtitle: '스토리지 사용량',
			ytitle: '청구 요금 (단위: USD)'
		});
	}

	createDataset(factor: StorageFeeFactors): { label: string; data: number[] }[] {
		const { egress_usage, amount_of_class_a_operation, amount_of_class_b_operation, sampleFactor } =
			factor;
		const samples = this.createLabels(sampleFactor);
		return [
			{
				label: 'Cloudflare R2 요금',
				data: _.map(samples, (storage_usage) =>
					new CloudflareR2().totalFee(
						storage_usage,
						amount_of_class_a_operation,
						amount_of_class_b_operation
					)
				)
			},
			{
				label: 'AWS S3 요금',
				data: _.map(samples, (storage_usage) =>
					new AWSS3().totalFee(
						storage_usage,
						amount_of_class_a_operation,
						amount_of_class_b_operation
					)
				)
			},
			{
				label: 'AWS S3 요금 (데이터 송신 요금 포함)',
				data: _.map(
					samples,
					(storage_usage) =>
						new AWSS3().totalFee(
							storage_usage,
							amount_of_class_a_operation,
							amount_of_class_b_operation
						) + getEgressFee(egress_usage)
				)
			}
		];
	}
}
