<script lang="ts">
	import {
		ServerlessFeeChartController,
		type ServerlessFeeFactors
	} from '$lib/controller/serverless_fee';
	import { onMount } from 'svelte';
	import * as _ from 'lodash';
	import { StorageFeeController, type StorageFeeFactors } from '../lib/controller/storage_fee';

	/** 서버리스 가격표 차트 시각화용 */
	let serverless_fee_canvas: HTMLCanvasElement;

	let serverless_fee_controller: ServerlessFeeChartController;
	let serverless_fee_factor: ServerlessFeeFactors = {
		sampleFactor: {
			/**
			 * 요청 수 계산 단위
			 *
			 * 10이라면 10, 20, 30, ... 번 요청했을 때의 요금을 계산합니다.
			 */
			step: 10_000_000,
			/**
			 * 생성할 샘플 수
			 *
			 * `req_rate`가 100이고, `cnt`가 3이라면 `[100, 200, 300]`에 대한 계산이 수행됩니다.
			 */
			count: 7
		},
		/**
		 * 요청당 소요 시간 (단위: ms)
		 */
		elapsed_time_per_request: 10,
		/**
		 * 요청 결과 크기 (단위: MB)
		 */
		response_body_size: 0.05 // 5kB
	};

	let storage_fee_controller: StorageFeeController;
	let storage_fee_canvas: HTMLCanvasElement;

	let storage_fee_factor: StorageFeeFactors = {
		sampleFactor: {
			step: 10,
			count: 10
		},
		amount_of_class_a_operation: 2000,
		amount_of_class_b_operation: 50000,
		egress_usage: 20
	};

	$: if (serverless_fee_controller) serverless_fee_controller.update(serverless_fee_factor);
	$: if (storage_fee_controller) {
		storage_fee_controller.update(storage_fee_factor);
	}

	onMount(function () {
		serverless_fee_controller = new ServerlessFeeChartController(
			serverless_fee_canvas,
			serverless_fee_factor
		);

		storage_fee_controller = new StorageFeeController(storage_fee_canvas, storage_fee_factor);
	});
</script>

<section>
	<section>
		<h2 class="r-fit-text">Cloudflare vs AWS 제품군 비교</h2>
	</section>
</section>

<section>
	<section>
		<h2>Round 1: Serverless</h2>

		<h3 class="r-fit-text">Cloudflare Workers vs AWS Lambda</h3>

		<table class="text-2xl">
			<thead>
				<th>TL;DR</th>
				<th>Cloudflare Workers</th>
				<th>AWS S3</th>
			</thead>
			<tbody>
				<tr>
					<td>최대 메모리</td>
					<td>128MB</td>
					<td>
						<b>10,240MB</b>
					</td>
				</tr>
				<tr>
					<td>데이터 송수신 요금</td>
					<td>
						<b>없음</b>
					</td>
					<td>있음</td>
				</tr>
				<tr>
					<td>지연 시간 <br /> (Cold Start)</td>
					<td>
						<b>219ms</b>
					</td>
					<td>333ms</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="r-fit-text">Cloduflare Workers vs AWS Lambda 요금 비교</h2>

		<canvas class=" bg-white" bind:this={serverless_fee_canvas}></canvas>

		<div class="g-4 grid w-full grid-cols-4 text-base">
			<label for="serverless-elapsed-time">요청당 소요 시간 (단위: 밀리 초)</label>
			<input
				name="serverless-elapsed-time"
				class="px-2 text-black"
				type="number"
				bind:value={serverless_fee_factor.elapsed_time_per_request}
			/>

			<label for="serverless-response-data-size">요청 결과 크기 (단위: MB)</label>
			<input
				name="serverless-response-data-size"
				class="px-2 text-black"
				step="0.1"
				type="number"
				bind:value={serverless_fee_factor.response_body_size}
			/>
		</div>
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

		<table class="text-2xl">
			<thead>
				<th>TL;DR</th>
				<th>Cloudflare R2</th>
				<th>AWS S3</th>
			</thead>
			<tbody>
				<tr>
					<td>GB당 가격</td>
					<td>
						<b>$0.015/GB</b>
					</td>
					<td>$0.02/GB</td>
				</tr>
				<tr>
					<td>데이터 송수신 요금</td>
					<td>
						<b>없음</b>
					</td>
					<td>있음</td>
				</tr>
				<tr>
					<td>AWS S3 API</td>
					<td>사용 가능</td>
					<td>사용 가능</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2 class="r-fit-text">Cloduflare R2 vs AWS S3 요금 비교</h2>

		<canvas class="bg-white" bind:this={storage_fee_canvas}></canvas>

		<div class="g-4 grid w-full grid-cols-6 text-base">
			<label for="class-a-operation">클래스 A 연산 수</label>
			<input
				type="number"
				name="class-a-operation"
				class="px-2 text-black"
				bind:value={storage_fee_factor.amount_of_class_a_operation}
			/>

			<label for="class-b-operation">클래스 B 연산 수</label>
			<input
				name="class-b-operation"
				class="px-2 text-black"
				type="number"
				bind:value={storage_fee_factor.amount_of_class_b_operation}
			/>

			<label for="egress_usage" class="text-sm">데이터 송신량 (단위: GB)</label>
			<input
				type="number"
				step="0.1"
				class="px-2 text-black"
				name="egress-usage"
				bind:value={storage_fee_factor.egress_usage}
			/>
		</div>
	</section>
</section>

<section>
	<section>
		<h2 class="r-fit-text">Round 3: Cloudflare Queues vs AWS SQS</h2>
	</section>
</section>

<section>
	<section>
		<h2>Cloudflare D1 소개</h2>
	</section>
</section>
