<script lang="ts">
	function throwTestError() {
		throw new Error('Test error from BanchoBox - Sentry integration test');
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-4 text-2xl font-bold">Sentry Error Tracking Test</h1>
	<p class="mb-4">
		This page is for testing Sentry error tracking. Click the button below to trigger a test error.
	</p>
	<button onclick={throwTestError} class="variant-filled-primary btn"> Trigger Test Error </button>
	<p class="mt-4 text-sm text-surface-600">
		Note: This page should be removed before production deployment.
	</p>
</div>
