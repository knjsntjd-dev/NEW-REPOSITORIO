<?php
/**
 * ═══════════════════════════════════════════════════════════════
 *  COMPRA REAL — webhook "pedido pago" da Shopify
 * ═══════════════════════════════════════════════════════════════
 *
 *  Porque isto existe:
 *  O pixel nativo da Shopify manda "Compra" pro Meta assim que o
 *  cliente vê a página de agradecimento — mesmo em pagamentos
 *  diferidos (Multibanco, transferência), onde nessa altura o
 *  dinheiro ainda não entrou e uma parte dessas referências nunca
 *  chega a ser paga. Isso ensina o algoritmo de anúncios a otimizar
 *  para "gerou referência", não para "pagou de verdade".
 *
 *  Este ficheiro resolve isso: a Shopify avisa aqui só quando o
 *  pedido muda para "pago" (webhook orders/paid), e só nesse
 *  momento mandamos a Compra pro Meta.
 *
 *  Como ligar:
 *  1. Shopify Admin → Configurações → Notificações → Webhooks
 *     → Criar webhook → evento "Pagamento do pedido" (orders/paid)
 *     → formato JSON → URL: https://oseudominio.com/promo/webhook-compra.php
 *  2. Nessa mesma página, copie o "Segredo de assinatura do webhook"
 *     e cole em capi-config.php, no campo shopify_webhook_secret.
 *
 *  Teste rápido depois de configurar:
 *      https://oseudominio.com/promo/webhook-compra.php?diagnostico=1
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$cfg = require __DIR__ . '/capi-config.php';

if (isset($_GET['diagnostico'])) {
    $segredo = (string)($cfg['shopify_webhook_secret'] ?? '');
    echo json_encode([
        'php'               => PHP_VERSION,
        'curl'              => function_exists('curl_init'),
        'segredo_definido'  => $segredo !== '' && strpos($segredo, 'COLE_') !== 0,
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'metodo_nao_permitido']);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Confirma que o pedido veio mesmo da Shopify, comparando a
   assinatura HMAC do corpo com o segredo do webhook.
   ───────────────────────────────────────────────────────────── */
$segredo = (string)($cfg['shopify_webhook_secret'] ?? '');
$corpo_bruto = file_get_contents('php://input');
$assinatura_recebida = $_SERVER['HTTP_X_SHOPIFY_HMAC_SHA256'] ?? '';

if ($segredo === '' || strpos($segredo, 'COLE_') === 0) {
    http_response_code(500);
    echo json_encode(['erro' => 'segredo_nao_configurado']);
    exit;
}
if ($corpo_bruto === false || $corpo_bruto === '' || $assinatura_recebida === '') {
    http_response_code(400);
    echo json_encode(['erro' => 'pedido_invalido']);
    exit;
}

$assinatura_calculada = base64_encode(hash_hmac('sha256', $corpo_bruto, $segredo, true));
if (!hash_equals($assinatura_calculada, $assinatura_recebida)) {
    http_response_code(401);
    echo json_encode(['erro' => 'assinatura_invalida']);
    exit;
}

$pedido = json_decode($corpo_bruto, true);
if (!is_array($pedido)) {
    http_response_code(400);
    echo json_encode(['erro' => 'json_invalido']);
    exit;
}

/* Só interessa quando está mesmo pago. O webhook "orders/paid" já
   só dispara nesse momento, mas confirma-se aqui também. */
if (($pedido['financial_status'] ?? '') !== 'paid') {
    http_response_code(200);
    echo json_encode(['ignorado' => 'nao_pago']);
    exit;
}

$order_id = (string)($pedido['id'] ?? '');
if ($order_id === '') {
    http_response_code(400);
    echo json_encode(['erro' => 'sem_id_pedido']);
    exit;
}

/* event_id fixo por pedido: se a Shopify reenviar o mesmo webhook
   (ela faz isso quando não recebe 200 a tempo), o Meta deduplica
   em vez de contar a mesma compra duas vezes. */
$event_id = 'shopify_paid_' . $order_id;

$valor = (float)($pedido['current_total_price'] ?? $pedido['total_price'] ?? 0);
$moeda = (string)($pedido['currency'] ?? 'EUR');

$content_ids = [];
foreach (($pedido['line_items'] ?? []) as $linha) {
    if (!empty($linha['variant_id'])) {
        $content_ids[] = (string)$linha['variant_id'];
    }
}

/* Dados do cliente — hash SHA-256 no e-mail/telefone, como o Meta
   exige. Melhora a correspondência sem guardar nada em claro. */
$user_data = [];

$email = strtolower(trim((string)($pedido['email'] ?? $pedido['contact_email'] ?? '')));
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $user_data['em'] = [hash('sha256', $email)];
}

$telefone = preg_replace('/[^0-9]/', '', (string)($pedido['phone'] ?? $pedido['customer']['phone'] ?? ''));
if ($telefone !== '') {
    $user_data['ph'] = [hash('sha256', $telefone)];
}

$detalhes_cliente = $pedido['client_details'] ?? [];
if (!empty($detalhes_cliente['browser_ip'])) {
    $user_data['client_ip_address'] = $detalhes_cliente['browser_ip'];
}
if (!empty($detalhes_cliente['user_agent'])) {
    $user_data['client_user_agent'] = substr((string)$detalhes_cliente['user_agent'], 0, 500);
}

$item = [
    'event_name'    => 'Purchase',
    'event_time'    => strtotime((string)($pedido['processed_at'] ?? $pedido['created_at'] ?? 'now')) ?: time(),
    'event_id'      => $event_id,
    'action_source' => 'website',
    'user_data'     => $user_data,
];

$custom_data = ['value' => round($valor, 2), 'currency' => $moeda, 'order_id' => $order_id];
if ($content_ids) {
    $custom_data['content_ids']  = $content_ids;
    $custom_data['content_type'] = 'product';
}
$item['custom_data'] = $custom_data;

$corpo_envio = ['data' => [$item]];
if (!empty($cfg['test_event_code'])) {
    $corpo_envio['test_event_code'] = $cfg['test_event_code'];
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['erro' => 'curl_indisponivel']);
    exit;
}

$endereco = sprintf(
    'https://graph.facebook.com/%s/%s/events?access_token=%s',
    rawurlencode((string)$cfg['api_version']),
    rawurlencode((string)$cfg['pixel_id']),
    rawurlencode((string)$cfg['access_token'])
);

$ch = curl_init($endereco);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($corpo_envio, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 6,
    CURLOPT_CONNECTTIMEOUT => 3,
]);
$resposta = curl_exec($ch);
$estado   = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$falha    = curl_error($ch);
curl_close($ch);

if ($resposta === false) {
    http_response_code(502);
    echo json_encode(['erro' => 'falha_de_rede', 'detalhe' => $falha]);
    exit;
}

$meta = json_decode((string)$resposta, true);

http_response_code($estado >= 200 && $estado < 300 ? 200 : $estado);
echo json_encode([
    'ok'              => $estado >= 200 && $estado < 300,
    'event_id'        => $event_id,
    'events_received' => $meta['events_received'] ?? null,
    'erro_meta'       => $meta['error']['message'] ?? null,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
