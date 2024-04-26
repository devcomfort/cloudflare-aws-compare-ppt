import type { StorageFeeCalculator } from '../models/storage_fee_calculator';

/**
 * AWS S3 가격 계산
 *
 * 2024.04.25, 도쿄 리전을 기준으로 작성하였습니다.
 *
 * 시간상 AWS Price List API를 사용하기 어려워, 특정 시점의 데이터를 사용하였습니다.
 *
 * @param storage 사용한 저장 용량 (단위: GB)
 * @param class_a_operation_count Class A 연산 횟수
 * @param class_b_operation_count Class B 연산 횟수
 *
 * @see https://aws.amazon.com/ko/s3/pricing/ AWS S3 가격 페이지
 * @see https://docs.aws.amazon.com/ko_kr/awsaccountbilling/latest/aboutv2/price-changes.html AWS Price List API 문서
 */
export class AWSS3 implements StorageFeeCalculator {
	/**
	 * 스토리지 사용료
	 *
	 * 2024.04.26, 도쿄 리전 기준 가격을 적용하였습니다.
	 *
	 * @param storage 스토리지 사용량 (단위: GB)
	 * @returns
	 */
	storageFee(storage: number): number {
		/** GB -> TB 환산치 */
		const as_terabytes = storage / 1_000;

		if (as_terabytes <= 50) return storage * 0.025;
		if (as_terabytes <= 500) return storage * 0.024;
		return storage * 0.023;
	}

	/**
	 * 클래스 A 연산 요금
	 *
	 * 2024.04.26, 도쿄 리전 기준
	 *
	 * PUT, COPY, POST, LIST 등 클래스 A 연산은 1,000회 당 0.047 USD
	 *
	 * @param amount_of_operation 클래스 A 연산 횟수
	 * @returns
	 */
	classAOperationFee(amount_of_operation: number): number {
		return (amount_of_operation / 1_000) * 0.047;
	}

	/**
	 * 클래스 B 연산 요금
	 *
	 * 2024.04.26, 도쿄 리전 기준
	 *
	 * GET, SELECT 및 기타 클래스 B 연산 작업은 1,000회 당 0.00037 USD
	 *
	 * @param amount_of_operation
	 */
	classBOperationFee(amount_of_operation: number): number {
		return (amount_of_operation / 1_000) * 0.00037;
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
