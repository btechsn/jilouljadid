<?php

declare(strict_types=1);

namespace Modules\Core\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Core\Contracts\PaymentGateway;
use Modules\Core\Data\PaymentData;
use Modules\Core\Enums\PaymentStatus;
use Modules\Core\Models\Payment;

class StripePaymentGateway implements PaymentGateway
{
    public function initiate(PaymentData $payment): array
    {
        $paymentLink = (string) config('services.stripe.payment_link');
        if ($paymentLink !== '') {
            return [
                'ok' => true,
                'transaction_id' => $payment->id,
                'checkout_url' => $paymentLink,
                'raw' => ['source' => 'payment_link'],
            ];
        }

        $secret = (string) config('services.stripe.secret');
        if ($secret === '' || !$payment->id) {
            return ['ok' => false, 'error' => 'stripe_not_configured'];
        }

        $currency = strtolower((string) ($payment->currency ?: 'xof'));
        $response = Http::withToken($secret)
            ->asForm()
            ->acceptJson()
            ->timeout(20)
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => config('services.stripe.success_url'),
                'cancel_url' => config('services.stripe.cancel_url'),
                'client_reference_id' => $payment->id,
                'line_items[0][quantity]' => 1,
                'line_items[0][price_data][currency]' => $currency,
                'line_items[0][price_data][unit_amount]' => $payment->amount_minor,
                'line_items[0][price_data][product_data][name]' => 'Don Jiloul Jadid',
            ]);

        if (!$response->successful()) {
            Log::warning('Stripe a refusé la session', ['status' => $response->status()]);

            return ['ok' => false, 'error' => 'stripe_http_' . $response->status(), 'raw' => $response->json()];
        }

        $body = $response->json() ?? [];

        return [
            'ok' => true,
            'transaction_id' => $body['id'] ?? null,
            'checkout_url' => $body['url'] ?? null,
            'raw' => $body,
        ];
    }

    public function verify(string $transactionId): array
    {
        $secret = (string) config('services.stripe.secret');
        if ($secret === '' || $transactionId === '') {
            return ['status' => 'unknown'];
        }

        $response = Http::withToken($secret)
            ->acceptJson()
            ->timeout(20)
            ->get('https://api.stripe.com/v1/checkout/sessions/' . $transactionId);

        if (!$response->successful()) {
            return ['status' => 'unknown', 'raw' => $response->json()];
        }

        $body = $response->json() ?? [];
        $paid = ($body['payment_status'] ?? '') === 'paid';

        return [
            'status' => $paid ? 'completed' : 'pending',
            'transaction_id' => $body['id'] ?? $transactionId,
            'raw' => $body,
        ];
    }

    public function cancel(string $transactionId): bool
    {
        return false;
    }

    public function refund(string $transactionId, ?int $amount = null): bool
    {
        $secret = (string) config('services.stripe.secret');
        $payment = Payment::query()->where('gateway_transaction_id', $transactionId)->first();
        if ($secret === '' || $transactionId === '') {
            return false;
        }

        $session = Http::withToken($secret)
            ->acceptJson()
            ->timeout(20)
            ->get('https://api.stripe.com/v1/checkout/sessions/' . $transactionId);

        $paymentIntent = data_get($session->json(), 'payment_intent');
        if (!$paymentIntent) {
            return false;
        }

        $payload = ['payment_intent' => $paymentIntent];
        if ($amount) {
            $payload['amount'] = $amount;
        }

        $response = Http::withToken($secret)
            ->asForm()
            ->acceptJson()
            ->timeout(20)
            ->post('https://api.stripe.com/v1/refunds', $payload);

        if (!$response->successful()) {
            Log::warning('Remboursement Stripe refusé', ['status' => $response->status()]);

            return false;
        }

        $payment?->update([
            'status' => PaymentStatus::REFUNDED,
            'refunded_at' => now(),
            'gateway_response' => $response->json(),
        ]);

        return true;
    }

    public function getName(): string
    {
        return 'stripe';
    }
}
