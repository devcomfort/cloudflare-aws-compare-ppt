export interface QueueFeeCalculator {
	/**
	 * 메시지 수에 따른 가격 계산 함수
	 * @param amount_of_message 메시지 수
	 * @param message_per_batch 배치 하나당 메시지 수 (1~10개, AWS 기준)
	 * @param size_of_message 메시지 용량 (단위: kB)
	 */
	messageFee(amount_of_message: number, message_per_batch: number, size_of_message: number): number;

	/**
	 * 데이터 송신 비용 계산 함수
	 * @param amount_of_message 메시지 수
	 * @param size_of_message 메시지당 용량 (단위: kB)
	 */
	egressFee(amount_of_message: number, size_of_message: number): number;

	/**
	 * 총 비용
	 * @param amount_of_message 메시지 수
	 * @param message_per_batch 배치 하나당 메시지 수 (1~10개, AWS 기준, 다른 서비스에서는 배치 개념을 사용하지 않는 경우도 있음)
	 * @param size_of_message 메시지당 용량 (단위: kB)
	 */
	totalFee(amount_of_message: number, message_per_batch: number, size_of_message: number): number;

	/**
	 * 세부 비용 내역
	 * @param amount_of_message 메시지 수
	 * @param message_per_batch 배치 하나당 메시지 수 (1~10개, AWS 기준, 다른 서비스에서는 배치 개념을 사용하지 않는 경우도 있음)
	 * @param size_of_message 메시지당 용량 (단위: kB)
	 */
	all(
		amount_of_message: number,
		message_per_batch: number,
		size_of_message: number
	): {
		message_fee: number;
		egress_fee: number;
	} & Record<string, number>;
}
