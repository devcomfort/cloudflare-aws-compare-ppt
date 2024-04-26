import type { StorageFeeCalculator } from '../models/storage_fee_calculator';

/**
 * Cloudflare R2 요금 계산
 *
 * @see https://developers.cloudflare.com/r2/pricing/ Cloudflare R2 요금 정책
 * @see https://developers.cloudflare.com/r2/pricing/#class-a-operations Class A 연산 종류 (파일 복사, 쓰기, 리스트, 업로드, 버킷 암호화 설정 업로드 등 비교적 무거운 작업)
 * @see https://developers.cloudflare.com/r2/pricing/#class-b-operations Class B 연산 종류 (파일 가져오기/읽기, 파일 메타 데이터 가져오기, 버킷 암호화 설정 가져오기 등 비교적 가벼운 작업)
 * @see https://developers.cloudflare.com/r2/pricing/#free-operations 무료 연산 종류 (파일 삭제, multipart-upload 취소 등 매우 가벼운 작업)
 * @see https://r2-calculator.cloudflare.com/ Cloudflare R2 vs AWS S3 비용 비교 계산기
 */
export class CloudflareR2 implements StorageFeeCalculator {
	/**
	 * 스토리지 사용료
	 *
	 * - 1GB 당 0.015 USD
	 *
	 * @param storage 스토리지 사용량 (단위: GB, 월(30일) 단위 계산)
	 * @returns
	 */
	storageFee(storage: number): number {
		return storage * 0.015;
	}

	/**
	 * Class A 연산 요금
	 *
	 * - 1_000_000(백만)회 당 4.5 USD
	 *
	 * @param amount_of_operation 클래스 A 연산 횟수
	 * @returns
	 */
	classAOperationFee(amount_of_operation: number): number {
		return (amount_of_operation / 1_000_000) * 4.5;
	}

	/**
	 * Class B 연산 요금
	 *
	 * - 1_000_000(백만)회 당 0.36 USD
	 *
	 * @param amount_of_operation 클래스 B 연산 횟수
	 */
	classBOperationFee(amount_of_operation: number): number {
		return (amount_of_operation / 1_000_000) * 0.36;
	}

	totalFee(
		storage: number,
		amount_of_class_a_operation: number,
		amount_of_class_b_operation: number
	): number {
		const storage_fee = this.storageFee(storage);
		const class_a_operation_fee = this.classAOperationFee(amount_of_class_a_operation);
		const class_b_operation_fee = this.classBOperationFee(amount_of_class_b_operation);

		return storage_fee + class_a_operation_fee + class_b_operation_fee;
	}

	all(
		storage: number,
		amount_of_class_a_operation: number,
		amount_of_class_b_operation: number
	): { storage_fee: number; class_a_operation_fee: number; class_b_operation_fee: number } & Record<
		string,
		number
	> {
		const storage_fee = this.storageFee(storage);
		const class_a_operation_fee = this.classAOperationFee(amount_of_class_a_operation);
		const class_b_operation_fee = this.classBOperationFee(amount_of_class_b_operation);

		return {
			storage_fee,
			class_a_operation_fee,
			class_b_operation_fee
		};
	}
}
