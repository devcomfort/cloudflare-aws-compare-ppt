<script lang="ts">
	import { AWSLambda } from '$lib/utils/aws_lambda';
	import { CloudflareWorkers } from '$lib/utils/cloudflare_workers';
	import { getEgressFee } from '../lib/utils/aws_egress_fee';
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import * as _ from 'lodash';

	/** 서버리스 가격표 차트 시각화용 */
	let serverless_fee_canvas: HTMLCanvasElement;
	let serverless_fee_chart: Chart;

	let serverless = {
		/**
		 * 요청 수 계산 단위
		 *
		 * 10이라면 10, 20, 30, ... 번 요청했을 때의 요금을 계산합니다.
		 */
		req_rate: 10_000_000,
		/**
		 * 생성할 샘플 수
		 *
		 * `req_rate`가 100이고, `cnt`가 3이라면 `[100, 200, 300]`에 대한 계산이 수행됩니다.
		 */
		cnt: 7,
		/**
		 * 요청당 소요 시간 (단위: ms)
		 */
		amount_of_time: 10,
		/**
		 * 요청 결과 크기 (단위: MB)
		 */
		response_data_size: 1.5
	};

	$: {
		const { req_rate, cnt, amount_of_time, response_data_size } = serverless;

		const request_rates = _.times(cnt, (index) => (index + 1) * req_rate);

		if (serverless_fee_chart) {
			try {
				serverless_fee_chart.data.labels = request_rates;
				serverless_fee_chart.data.datasets = [
					{
						label: 'Cloudflare 요금',
						data: _.map(request_rates, (amount_of_request) =>
							new CloudflareWorkers().totalFee(amount_of_request, amount_of_time)
						)
					},
					{
						label: 'AWS Lambda 요금',
						data: _.map(
							request_rates,
							(amount_of_request) =>
								new AWSLambda().totalFee(amount_of_request, amount_of_time, 128) +
								getEgressFee((response_data_size / 1_000) * amount_of_request)
						)
					},
					{
						label: 'AWS 데이터 송신 요금',
						data: _.map(request_rates, (amount_of_request) =>
							getEgressFee((response_data_size / 1_000) * amount_of_request)
						)
					}
				];
				serverless_fee_chart.update();
			} catch (err) {
				console.error(err);
			}
		}
	}

	onMount(function () {
		const { req_rate, cnt, amount_of_time, response_data_size } = serverless;
		const request_rates = _.times(cnt, (index) => (index + 1) * req_rate);

		serverless_fee_chart = new Chart(serverless_fee_canvas, {
			type: 'line',
			data: {
				datasets: [
					{
						label: 'Cloudflare 요금',
						data: _.map(request_rates, (amount_of_request) =>
							new CloudflareWorkers().totalFee(amount_of_request, amount_of_time)
						)
					},
					{
						label: 'AWS Lambda 요금',
						data: _.map(
							request_rates,
							(amount_of_request) =>
								new AWSLambda().totalFee(amount_of_request, amount_of_time, 128) +
								getEgressFee((response_data_size / 1_000) * amount_of_request)
						)
					},
					{
						label: 'AWS 데이터 송신 요금',
						data: _.map(request_rates, (amount_of_request) =>
							getEgressFee((response_data_size / 1_000) * amount_of_request)
						)
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: '청구 요금'
						}
					},
					x: {
						beginAtZero: true,
						title: {
							display: true,
							text: '요청 수'
						}
					}
				},
				plugins: {
					title: {
						display: true,
						text: 'Cloudflare Workers vs AWS Lambda 요금 비교'
					}
				}
			}
		});
	});
</script>

<section>
	<section>
		<h2>
			Cloudflare vs AWS <br />
			Comparison
		</h2>
	</section>

	<section>
		<h2>References</h2>
	</section>
</section>

<section>
	<section>
		<h2>Round 1: Serverless</h2>

		<h3 class="r-fit-text">Cloudflare Workers vs AWS Lambda</h3>

		<table class="text-2xl">
			<thead>
				<th>TL;DR</th>
				<th>Cloudflare</th>
				<th>AWS</th>
			</thead>
			<tbody>
				<tr>
					<td>최대 메모리</td>
					<td>128MB</td>
					<td>10,240MB</td>
				</tr>
				<tr>
					<td>데이터 송수신 요금</td>
					<td>없음</td>
					<td>있음</td>
				</tr>
				<tr>
					<td>지연 시간 <br /> (Cold Start)</td>
					<td>219ms</td>
					<td>333ms</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="r-fit-text">Cloduflare Workers vs AWS Lambda 요금 비교</h2>

		<main class="g-8 !flex flex-col">
			<canvas class="bg-white" bind:this={serverless_fee_canvas}></canvas>

			<div class="g-4 grid w-full grid-cols-4 text-base">
				<label for="serverless-elapsed-time">요청당 소요 시간 (단위: 밀리 초)</label>
				<input
					name="serverless-elapsed-time"
					class="px-2 text-black"
					type="number"
					bind:value={serverless.amount_of_time}
				/>

				<label for="serverless-response-data-size">요청 결과 크기 (단위: MB)</label>
				<input
					name="serverless-response-data-size"
					class="px-2 text-black"
					step="0.1"
					type="number"
					bind:value={serverless.response_data_size}
				/>
			</div>
		</main>
	</section>

	<section>
		<h2>References</h2>

		<ul class="r-fit-text">
			<li>
				AWS Lambda 요금 페이지: <a href="https://aws.amazon.com/ko/lambda/pricing/"
					>https://aws.amazon.com/ko/lambda/pricing/</a
				>
			</li>
			<li>
				Cloudflare Workers 요금 페이지: <a
					href="https://developers.cloudflare.com/workers/platform/pricing/"
					>https://developers.cloudflare.com/workers/platform/pricing/</a
				>
			</li>
			<li>
				서버리스 컴퓨팅으로는 성능이 어떻게 개선될 수 있을까요? | Lambda 성능 &mdash; Cloudflare: <a
					href="https://www.cloudflare.com/ko-kr/learning/serverless/serverless-performance/"
					>https://www.cloudflare.com/ko-kr/learning/serverless/serverless-performance/</a
				>
			</li>
			<li>
				Cold Start Comparison of AWS Lambda, Cloudflare Workers and AWS Cloudfront Function &mdash;
				Medium <a
					href="https://medium.com/ddosify/cold-start-comparison-of-aws-lambda-and-cloudflare-workers-a3f9021ee60a"
					>https://medium.com/ddosify/cold-start-comparison-of-aws-lambda-and-cloudflare-workers-a3f9021ee60a</a
				>
			</li>
		</ul>
	</section>
</section>

<section>
	<section>
		<h2>Round 2: Storage</h2>

		<h3 class="r-fit-text">Cloudflare R2 vs AWS S3</h3>
	</section>
</section>

<section>
	<section>
		<h2>Round 3: Database</h2>

		<h3 class="r-fit-text">Cloudflare D1 vs AWS RDS</h3>

		<ul class="r-fit-text">
			<li>AWS RDS와의 1:1 비교가 불가능하여, 예시를 추가하였습니다</li>
		</ul>
	</section>
</section>
