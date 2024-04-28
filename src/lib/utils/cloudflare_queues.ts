import type { QueueFeeCalculator } from '../models/queue_fee_calculator';
import { getEgressFee } from './aws_egress_fee';
import * as _ from 'lodash';

/**
 * Cloudflare Queues 요금 계산
 *
 * - 메시지 당 크기가 1278kB를 초과할 수 없음 (계산은 되더라도 요청 불가)
 *
 * @see https://developers.cloudflare.com/queues/platform/pricing/ Cloudflare Queues 요금 정책
 */
export class CloudflareQueuesCalculator implements QueueFeeCalculator {
	messageFee(
		amount_of_message: number,
		message_per_batch: number,
		size_of_message: number
	): number {
		/**
		 * 메시지 당 크기가 64kB를 넘어가면 메시지를 쪼개어 계산함
		 */
		const amount_of_splitted_message = Math.ceil(size_of_message / 64);

		return (
			_.chain(amount_of_message)
				// 실제로 취급되는 요청 수로 환산
				// 64kB를 초과하면 64kB 단위로 쪼겐 수로 계산함.
				.multiply(amount_of_splitted_message)
				// 기본 제공량: 1_000_000(백만)
				.subtract(1_000_000)
				// 범위 조정
				.clamp(0, Infinity)
				// 1_000_000회 당 0.4 USD
				.divide(1_000_000)
				.multiply(0.4)
				.value()
		);
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
