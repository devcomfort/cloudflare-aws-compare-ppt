/**
 * egress fee 계산 함수
 *
 * @param traffic_amount 데이터 전송량 (단위: GB)
 *
 * @see https://aws.amazon.com/ko/s3/pricing/ AWS S3 가격 페이지 (`데이터 전송` 탭 참고)
 */
export function getEgressFee(traffic_amount: number) {
	if (traffic_amount <= 0) return 0;

	/** GB -> TB 환산치 */
	const as_terrabytes = traffic_amount / 1_000;

	if (as_terrabytes <= 10) return traffic_amount * 0.114;
	if (as_terrabytes <= 40) return traffic_amount * 0.089;
	if (as_terrabytes <= 150) return traffic_amount * 0.086;
	return traffic_amount * 0.084;
}
