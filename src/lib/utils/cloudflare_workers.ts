import * as _ from 'lodash';
import type { ServerlessCalculator } from '../models/serverless_fee_calculator';

export class CloudflareWorkers implements ServerlessCalculator {
	private subscription_fee = 5;

	constructor() {}

	/**
	 * 요청 횟수에 따른 가격
	 *
	 * - 요청 횟수 1_000_000(백만)회 당 0.3 USD
	 * - 무료 제공량: 10_000_000(천만)회 (구독 요금제 기준)
	 *
	 * @param amount_of_reqest
	 * @returns
	 */
	requestFee(amount_of_reqest: number): number {
		return (
			_.chain(amount_of_reqest)
				// 무료 제공량 제외
				.subtract(10_000_000)
				// 1_000_000회 당 0.3 USD
				.divide(1_000_000)
				.multiply(0.3)
				.value()
		);
	}

	/**
	 * 요청 시간에 따른 가격
	 *
	 * - 소요 시간당 가격: 1_000_000(백만) 밀리 초 당 0.02 USD
	 * - 무료 제공량: 30_000_000(삽천만) 밀리 초
	 *
	 * @param amount_of_time 요청당 소요 시간 (단위: ms)
	 */
	requestTimeFee(amount_of_time: number): number {
		return (
			_.chain(amount_of_time)
				// 기본 제공량 제외
				.subtract(30_000_000)
				// 1_000_000회 당 0.02 USD
				.divide(1_000_000)
				.multiply(0.02)
				.value()
		);
	}

	totalFee(amount_of_requeset: number, amount_of_time: number): number {
		return (
			this.requestFee(amount_of_requeset) +
			this.requestTimeFee(amount_of_time) +
			this.subscription_fee
		);
	}

	all(amount_of_request: number, amount_of_time: number) {
		const request_fee = this.requestFee(amount_of_request);
		const request_time_fee = this.requestTimeFee(amount_of_time);

		return {
			subscription_fee: this.subscription_fee,
			request_fee,
			request_time_fee
		};
	}
}
