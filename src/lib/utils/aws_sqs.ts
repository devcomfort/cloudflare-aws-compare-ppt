import type { QueueFeeCalculator } from '../models/queue_fee_calculator';
import { getEgressFee } from './aws_egress_fee';
import * as _ from 'lodash';

/**
 * AWS SQS 요금 계산
 *
 * - 메시지 당 크기가 256kB를 초과할 수 없은, 계싼은 되더라도 요청 자체가 불가
 *
 * @see https://aws.amazon.com/ko/sqs/pricing/ AWS SQS 요금 정보
 */
export class AWSSQSCalculator implements QueueFeeCalculator {
	messageFee(
		amount_of_message: number,
		message_per_batch: number,
		size_of_message: number
	): number {
		/**
		 * 메시지 수에 대해 요금을 청구할 때 메시지 크기가 64kB를 넘어가는 경우, 64kB 단위로 분리하여 요금을 청구함.
		 *
		 * - 127kB -> 메시지 2개
		 * - 63kB -> 메시지 1개
		 * */
		const amount_of_splitted_message = Math.ceil(size_of_message / 64);

		/** 하나의 배치에 포함된 메시지 수에 따라 배치 수 계산. */
		const amount_of_batch = Math.ceil(
			(amount_of_message * amount_of_splitted_message) / message_per_batch
		);

		return _.flow(
			() => amount_of_batch,
			// 무료 제공량 제외 + 범위 제한
			(amount_of_batch) => _.chain(amount_of_batch).subtract(1_000_000).clamp(0, Infinity).value(),
			// 구간별 요금 적용
			_.cond([
				[
					// 1,000억 회 이하
					// 1_000_000 요청 분 제외, 이후 요청분에 대해 1_000_000회 당 0.4 USD
					(amount_of_batch: number) => amount_of_batch <= 1_000 * 100_000_000,
					(amount_of_batch: number) => (amount_of_batch / 1_000_000) * 0.4
				],
				[
					// 2,000억 회 이하
					// 1_000_000 요청 분 제외, 이후 요청분에 대해 1_000_000회 당 0.35 USD
					(amount_of_batch: number) => amount_of_batch <= 1_000 * 200_000_000,
					(amount_of_batch: number) => (amount_of_batch / 1_000_000) * 0.35
				],
				// 그 이후
				// 1_000_000 요청 분 제외, 이후 요청분에 대해 1_000_000회 당 0.32 USD
				[() => true, (amount_of_batch: number) => (amount_of_batch / 1_000_000) * 0.32]
			])
		)();
	}

	egressFee(amount_of_message: number, size_of_message: number) {
		/** kB -> GB 단위 환산 */
		const egress_usage = (amount_of_message * size_of_message) / 1000 / 1000;
		return getEgressFee(egress_usage);
	}

	totalFee(amount_of_message: number, message_per_batch: number, size_of_message: number): number {
		const message_fee = this.messageFee(amount_of_message, message_per_batch, size_of_message);
		const egress_fee = this.egressFee(amount_of_message, size_of_message);

		return message_fee + egress_fee;
	}

	all(
		amount_of_message: number,
		message_per_batch: number,
		size_of_message: number
	): { message_fee: number; egress_fee: number } & Record<string, number> {
		const message_fee = this.messageFee(amount_of_message, message_per_batch, size_of_message);
		const egress_fee = this.egressFee(amount_of_message, size_of_message);

		return {
			message_fee,
			egress_fee
		};
	}
}
