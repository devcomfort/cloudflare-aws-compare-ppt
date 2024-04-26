/**
 * 스토리지 사용료 연산 인터페이스
 *
 * - 클래스 A 연산: 파일 복사, 쓰기, 업로드, 목록 가져오기, 버킷 암호화 설정 업로드하기 등 상대적으로 무거운 작업
 * - 클래스 B 연산: 파일 가져오기, 읽기, 메타데이터 가져오기, 버킷 암호화 설정 가져오기 등 상대적으로 가벼운 작업
 *
 * @see https://developers.cloudflare.com/r2/pricing/ Cloudflare R2 요금 정책
 * @see https://developers.cloudflare.com/r2/pricing/#class-a-operations Class A 연산 종류
 * @see https://developers.cloudflare.com/r2/pricing/#class-b-operations Class B 연산 종류
 * @see https://developers.cloudflare.com/r2/pricing/#free-operations 무료 연산 종류 (파일 삭제, multipart-upload 취소 요청 등 매우 가벼운 작업)
 * @see https://r2-calculator.cloudflare.com/ Cloudflare R2 vs AWS S3 비용 비교 계산기
 */
export interface StorageFeeCalculator {
	/**
	 * 데이터 스토리지 요금 (저장 공간에 대한 비용)
	 * @param storage 스토리지 사용량 (단위: GB)
	 */
	storageFee(storage: number): number;

	/**
	 * 클래스 A 연산 비용
	 *
	 * - 파일 복사, 쓰기, 업로드, 목록 가져오기, 암호화 설정 등 상대적으로 무거운 작업
	 *
	 * @param amount_of_operation 클래스 A 연산 횟수
	 */
	classAOperationFee(amount_of_operation: number): number;

	/**
	 * 클래스 B 연산 비용
	 *
	 * - 파일 가져오기, 읽기, 메타데이터 가져오기 등 상대적으로 가벼운 작업
	 *
	 * @param amount_of_operation 클래스 B 연산 횟수
	 */
	classBOperationFee(amount_of_operation: number): number;

	/**
	 * 총 요금 계산 함수
	 *
	 * @param storage 스토리지 사용량 (단위: GB)
	 * @param amount_of_class_a_operation 클래스 A 연산 횟수
	 * @param amount_of_class_b_operation 클래스 B 연산 횟수
	 */
	totalFee(
		storage: number,
		amount_of_class_a_operation: number,
		amount_of_class_b_operation: number
	): number;

	/**
	 * 요금 정보 가져오기 함수
	 * @param storage
	 * @param amount_of_class_a_operation
	 * @param amount_of_class_b_operation
	 */
	all(
		storage: number,
		amount_of_class_a_operation: number,
		amount_of_class_b_operation: number
	): {
		storage_fee: number;
		class_a_operation_fee: number;
		class_b_operation_fee: number;
	} & Record<string, number>;
}
