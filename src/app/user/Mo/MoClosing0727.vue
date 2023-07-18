<!--7/27((木))〜8/10(木) 終了告知期間-->
<template>
	<div class="mx-6 rounded-lg bg-white sm:max-w-7xl lg:mx-auto mb-1">
		<div class="rounded-lg text-center bg-red-700 bg-opacity-10 text-red-600 font-bold py-1">
			{{ $t("mobileOrder.closing.notice") }}
		</div>
		<div class="py-4 px-5">
			<div class="font-bold text-2xl text-red-600 text-center">
				{{ $t("mobileOrder.closing.heading") }}
			</div>
			<div class="font-bold mt-2">
				{{ $t("mobileOrder.closing.paragraph1") }}
			</div>
			<div class="font-bold mt-2">
				{{ $t("mobileOrder.closing.paragraph2") }}
			</div>
			<div class="font-bold text-red-600 mt-2">
				{{ $t("mobileOrder.closing.ordering") }}
			</div>
			<div class="font-bold text-red-600">
				{{ $t("mobileOrder.closing.orderingDate") }}
			</div>
			<div class="font-bold text-red-600 mt-2">
				{{ $t("mobileOrder.closing.acceptance") }}
			</div>
			<div class="font-bold text-red-600">
				{{ $t("mobileOrder.closing.acceptanceDate") }}
			</div>
		</div>
	</div>
</template>
