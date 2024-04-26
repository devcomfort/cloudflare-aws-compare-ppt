export interface ServerlessCalculator {
	/** 요청 횟수에 따른 요금 계산 */
	requestFee(amount_of_reqest: number): number;
	/**
	 * 요청 소요 시간에 따른 요금 계산
	 *
	 * - CloudFlare는 요청당 메모리 사용량을 고려하지 않음, 단순히 사용 시간만 고려
	 * - AWS Lambda는 요청당 메모리 사용량을 통해 GB-s라는 단위로 점유 및 사용 시간과 메모리 사용량을 함께 고려함
	 *
	 * @param amount_of_time 요청당 소요 시간 (단위: ms)
	 * @param memory_size_per_request 요청당 메모리 사용량 (단위: MB)
	 */
	requestTimeFee(amount_of_time: number, memory_size_per_request?: number): number;

	/** 총 사용 요금 */
	totalFee(
		amount_of_requeset: number,
		amount_of_time: number,
		memory_size_per_request?: number
	): number;

	/**
	 * 모든 요금을 계산하여 객체로 반환합니다.
	 *
	 * - 총 요금을 제외하고 각종 요금 정보를 포함하여 반환합니다
	 *
	 * @param amount_of_request 요청 횟수
	 * @param amount_of_time 요청당 소요 시간 (단위: ms)
	 * @param memory_size_per_request 요청당 메모리 사용량 (단위: MB)
	 */
	all(
		amount_of_request: number,
		amount_of_time: number,
		memory_size_per_request?: number
	): {
		request_fee: number;
		request_time_fee: number;
	} & Record<string, number>;
}
