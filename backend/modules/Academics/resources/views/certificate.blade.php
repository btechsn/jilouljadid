<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Attestation de niveau — Jiloul Jadid</title>
</head>
<body>
    <h1>Attestation de niveau</h1>
    <p>L'institut Jiloul Jadid atteste que <strong>{{ $student }}</strong> a atteint le palier : {{ $level }}.</p>
    <p>Ce document est une attestation de niveau. Ce n'est pas une ijaza.</p>
    <p>Délivrée le {{ $issued_at }}. Code de vérification : {{ $code }}.</p>
</body>
</html>
