<div>
    <img class="nh-login-logo" src="{{ asset('brand/logo-jj.jpg') }}" alt="Jiloul Jadid">
    <p class="nh-login-eyebrow">Jiloul Jadid</p>
    <h1 class="nh-login-title">Connexion</h1>
    <span class="nh-login-rule" aria-hidden="true"></span>
    <p class="nh-login-lede">Espace réservé à l'équipe du mouvement.</p>

    {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::AUTH_LOGIN_FORM_BEFORE, scopes: $this->getRenderHookScopes()) }}

    <x-filament-panels::form id="form" wire:submit="authenticate">
        {{ $this->form }}

        <x-filament-panels::form.actions
            :actions="$this->getCachedFormActions()"
            :full-width="$this->hasFullWidthFormActions()"
        />
    </x-filament-panels::form>

    {{ \Filament\Support\Facades\FilamentView::renderHook(\Filament\View\PanelsRenderHook::AUTH_LOGIN_FORM_AFTER, scopes: $this->getRenderHookScopes()) }}

    <x-filament-actions::modals />
</div>
