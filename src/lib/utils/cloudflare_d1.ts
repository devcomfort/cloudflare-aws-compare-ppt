import * as _ from 'lodash';

/**
 * Cloudflare D1 가격 계산 함수
 *
 *
 * @param rows_read 읽은 행 수
 * @param rows_written 읽은 열 수
 * @param storage 사용 용량 (단위: GB, 기본 5GB 무료)
 *
 * @see https://developers.cloudflare.com/d1/platform/pricing/
 */
export function getCloudflareD1Pricing(rows_read: number, rows_written: number, storage: number) {
	const free_storage = 5;

	/**
	 * 데이터베이스 용량 가격 계산
	 *
	 * - 용량 당 가격: 1GB 당 0.75 USD
	 * - 무료 제공량: 5GB
	 */
	const storage_fee = _.chain(storage)
		.subtract(free_storage)
		.tap((value) => Math.max(0, value))
		// 1GB 당 0.75 USD
		.multiply(0.75)
		.value();

	/**
	 * 읽은(read) 열 수에 따른 가격 계산
	 *
	 * - 읽기 당 가격: 1_000_000 (백만 회) 당 0.001 USD
	 * - 무료 제공량: 25_000_000 (이천오백만 회)
	 */
	const rows_read_fee = _.chain(rows_read)
		.subtract(25_000_000)
		.tap((value) => Math.max(0, value))
		// 1,000,000회 당 0.001 USD
		.divide(1_000_000)
		.multiply(0.001)
		.value();

	/**
	 * 쓴(written) 열 수에 따른 가격 계산
	 *
	 * - 쓰기 당 가격: 1_000_000 (백만 회) 당 1 USD
	 * - 무료 제공량: 50_000_000 (오천만 회)
	 */
	const rows_write_fee = _.chain(rows_written)
		.subtract(50_000_000)
		.tap((value) => Math.max(0, value))
		// 1,000,000회 당 1 USD
		.divide(1_000_000)
		.value();

	return {
		total: storage_fee + rows_read_fee + rows_write_fee,
		storage_fee,
		rows_read_fee,
		rows_write_fee
	};
}
