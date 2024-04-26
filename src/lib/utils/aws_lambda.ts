import type { ServerlessCalculator } from '../models/serverless_fee_calculator';
import * as _ from 'lodash';

export class AWSLambda implements ServerlessCalculator {
	/**
	 * AWS Lambda 요청당 요금 계산
	 *
	 * - 2024.04.26, 도쿄 리전, x86 아키텍처를 기준으로 한 함수입니다.
	 * - ARM 아키텍처 및 다른 리전은 고려되지 않았습니다.
	 * - 요청 당 요금: 모든 구간에서 1_000_000(백만) 회 당 0.2 USD
	 *
	 * @see https://aws.amazon.com/ko/lambda/pricing/ AWS Lambda 요금 페이지
	 *
	 * @param amount_of_reqest 요청 횟수
	 */
	requestFee(amount_of_reqest: number): number {
		return _.chain(amount_of_reqest).divide(1_000_000).multiply(0.2).value();
	}

	/**
	 * AWS Lambda 요청당 요금 계산
	 *
	 * - 2024.04.26, 도쿄 리전, x86 아키텍처를 기준으로 한 함수입니다.
	 * - ARM 아키텍처 및 다른 리전은 고려되지 않았습니다.
	 *
	 * @see https://aws.amazon.com/ko/lambda/pricing/ AWS Lambda 요금 페이지
	 *
	 * @param amount_of_time 요청당 소요 시간 (단위: ms)
	 * @param memory_size_per_request 요청당 사용 메모리 (단위: MB)
	 */
	requestTimeFee(amount_of_time: number, memory_size_per_request: number = 0): number {
		/**
		 * 요청 당 메모리 사용량 환산
		 *
		 * - 요청 당 메모리는 최소 128MB부터 10,240MB까지 1MB 단위로 조정됩니다.
		 *
		 * @see https://aws.amazon.com/ko/lambda/pricing/ AWS Lambda 요금 페이지
		 */
		const $memory_size_per_request = _.clamp(memory_size_per_request, 128, 10_240);

		/** GB-s 환산치 */
		const GB_s = _.chain($memory_size_per_request)
			// GB 단위로 환산
			.divide(1_000)
			// GB-ms 단위로 환산
			.multiply(amount_of_time)
			// GB-s 단위로 환산
			.multiply(1_000)
			.value();

		if (GB_s <= 6_000_000_000) return GB_s * 0.0000166667;
		if (GB_s <= 9_000_000_000) return GB_s * 0.000015;
		return GB_s * 0.0000133334;
	}

	totalFee(
		amount_of_requeset: number,
		amount_of_time: number,
		memory_size_per_request: number
	): number {
		const request_fee = this.requestFee(amount_of_requeset);
		const request_time_fee = this.requestTimeFee(amount_of_time, memory_size_per_request);

		return request_fee + request_time_fee;
	}

	all(
		amount_of_request: number,
		amount_of_time: number,
		memory_size_per_request?: number | undefined
	) {
		const request_fee = this.requestFee(amount_of_request);
		const request_time_fee = this.requestTimeFee(amount_of_time, memory_size_per_request);

		return {
			request_fee,
			request_time_fee
		};
	}
}
