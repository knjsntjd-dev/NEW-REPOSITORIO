<?php
/**
 * ═══════════════════════════════════════════════════════════════
 *  API DE CONVERSÕES (Meta) — endpoint de servidor
 * ═══════════════════════════════════════════════════════════════
 *
 *  A página envia aqui os eventos PageView e ViewContent; este
 *  ficheiro reencaminha-os para o Meta pelo lado do servidor.
 *
 *  Porque isto existe:
 *  - Bloqueadores de anúncios e o iOS travam o pixel do navegador.
 *    O evento do servidor passa na mesma.
 *  - Cada evento leva um event_id igual ao do navegador, por isso
 *    o Meta junta os dois e conta apenas uma vez (deduplicação).
 *
 *  Compra e checkout NÃO passam por aqui: são rastreados pelo
 *  pixel da própria Shopify, no domínio da loja.
 *
 *  Teste rápido depois de enviar para o servidor:
 *      https://oseudominio.com/promo/capi.php?diagnostico=1
 *  Deve devolver JSON. Se aparecer o código PHP em texto, o
 *  servidor não está a executar PHP — pare e resolva isso antes
 *  de seguir, senão o token fica exposto.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$cfg = require __DIR__ . '/capi-config.php';

/* ─────────────────────────────────────────────────────────────
   Diagnóstico: confirma que o PHP corre e que a configuração
   está no sítio, sem nunca revelar o token.
   ───────────────────────────────────────────────────────────── */
if (isset($_GET['diagnostico'])) {
    $token = (string)($cfg['access_token'] ?? '');
    echo json_encode([
        'php'            => PHP_VERSION,
        'curl'           => function_exists('curl_init'),
        'pixel_id'       => $cfg['pixel_id'] ?? null,
        'token_definido' => $token !== '' && strpos($token, 'COLE_') !== 0,
        'token_tamanho'  => strlen($token),
        'api_version'    => $cfg['api_version'] ?? null,
        'modo_teste'     => ($cfg['test_event_code'] ?? '') !== '',
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Só aceita POST
   ───────────────────────────────────────────────────────────── */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'metodo_nao_permitido']);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Só aceita chamadas do próprio site.
   O host que serve este ficheiro é sempre autorizado, para a
   página funcionar em qualquer domínio sem reconfigurar nada.
   ───────────────────────────────────────────────────────────── */
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem !== '') {
    $esquema    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $proprio    = $esquema . '://' . ($_SERVER['HTTP_HOST'] ?? '');
    $permitidas = array_merge((array)($cfg['origens_permitidas'] ?? []), [$proprio]);

    if (!in_array($origem, $permitidas, true)) {
        http_response_code(403);
        echo json_encode(['erro' => 'origem_nao_permitida']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $origem);
    header('Vary: Origin');
}

/* ─────────────────────────────────────────────────────────────
   Lê e valida o corpo do pedido
   ───────────────────────────────────────────────────────────── */
$bruto = file_get_contents('php://input');
if ($bruto === false || strlen($bruto) > 20000) {
    http_response_code(400);
    echo json_encode(['erro' => 'corpo_invalido']);
    exit;
}

$dados = json_decode($bruto, true);
if (!is_array($dados)) {
    http_response_code(400);
    echo json_encode(['erro' => 'json_invalido']);
    exit;
}

/* Lista fechada de eventos. Sem isto, qualquer pessoa que
   descobrisse o endereço poderia poluir o pixel com eventos
   inventados (Purchase falso, por exemplo). */
$EVENTOS_PERMITIDOS = ['PageView', 'ViewContent'];

$evento = (string)($dados['event_name'] ?? '');
if (!in_array($evento, $EVENTOS_PERMITIDOS, true)) {
    http_response_code(422);
    echo json_encode(['erro' => 'evento_nao_permitido', 'recebido' => $evento]);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   Dados do utilizador
   Estes quatro campos NÃO são encriptados — é o que o Meta
   especifica. Só dados pessoais (email, telefone, nome) é que
   levam SHA-256, e aqui não recolhemos nenhum.
   ───────────────────────────────────────────────────────────── */
function ip_do_cliente(): string
{
    $cabecalhos = [
        'HTTP_CF_CONNECTING_IP',   // Cloudflare
        'HTTP_TRUE_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR',
    ];
    foreach ($cabecalhos as $c) {
        if (empty($_SERVER[$c])) {
            continue;
        }
        foreach (explode(',', (string)$_SERVER[$c]) as $parte) {
            $ip = trim($parte);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '';
}

function texto(array $origem, string $chave, int $max = 500): string
{
    $v = $origem[$chave] ?? '';
    if (!is_string($v)) {
        return '';
    }
    return substr(trim($v), 0, $max);
}

$user_data = [];

$ip = ip_do_cliente();
if ($ip !== '') {
    $user_data['client_ip_address'] = $ip;
}

$ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500);
if ($ua !== '') {
    $user_data['client_user_agent'] = $ua;
}

/* _fbp e _fbc: vêm do navegador; se faltarem, tenta os cookies
   que o próprio pedido carrega. */
$fbp = texto($dados, 'fbp', 200) ?: (string)($_COOKIE['_fbp'] ?? '');
$fbc = texto($dados, 'fbc', 500) ?: (string)($_COOKIE['_fbc'] ?? '');
if ($fbp !== '') {
    $user_data['fbp'] = $fbp;
}
if ($fbc !== '') {
    $user_data['fbc'] = $fbc;
}

/* ─────────────────────────────────────────────────────────────
   Monta o evento
   ───────────────────────────────────────────────────────────── */
$url = texto($dados, 'event_source_url', 1000);
if ($url !== '' && !filter_var($url, FILTER_VALIDATE_URL)) {
    $url = '';
}

$event_id = texto($dados, 'event_id', 100);
if ($event_id === '') {
    $event_id = bin2hex(random_bytes(16));
}

$hora = (int)($dados['event_time'] ?? 0);
$agora = time();
/* Aceita até 7 dias no passado (limite do Meta) e nunca no futuro */
if ($hora <= 0 || $hora > $agora + 60 || $hora < $agora - 604800) {
    $hora = $agora;
}

$item = [
    'event_name'       => $evento,
    'event_time'       => $hora,
    'event_id'         => $event_id,
    'action_source'    => 'website',
    'user_data'        => $user_data,
];
if ($url !== '') {
    $item['event_source_url'] = $url;
}

/* Dados do produto, só para o ViewContent */
if ($evento === 'ViewContent' && isset($dados['custom_data']) && is_array($dados['custom_data'])) {
    $cd  = $dados['custom_data'];
    $out = [];

    $nome = texto($cd, 'content_name', 200);
    if ($nome !== '') {
        $out['content_name'] = $nome;
    }

    $cat = texto($cd, 'content_category', 200);
    if ($cat !== '') {
        $out['content_category'] = $cat;
    }

    if (!empty($cd['content_ids']) && is_array($cd['content_ids'])) {
        $ids = [];
        foreach (array_slice($cd['content_ids'], 0, 10) as $id) {
            if (is_string($id) || is_int($id)) {
                $ids[] = substr((string)$id, 0, 100);
            }
        }
        if ($ids) {
            $out['content_ids']  = $ids;
            $out['content_type'] = 'product';
        }
    }

    if (isset($cd['value']) && is_numeric($cd['value'])) {
        $out['value']    = round((float)$cd['value'], 2);
        $out['currency'] = preg_match('/^[A-Z]{3}$/', (string)($cd['currency'] ?? ''))
            ? $cd['currency']
            : 'EUR';
    }

    if ($out) {
        $item['custom_data'] = $out;
    }
}

$corpo = ['data' => [$item]];
if (!empty($cfg['test_event_code'])) {
    $corpo['test_event_code'] = $cfg['test_event_code'];
}

/* ─────────────────────────────────────────────────────────────
   Envia ao Meta
   ───────────────────────────────────────────────────────────── */
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
    CURLOPT_POSTFIELDS     => json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
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

/* Devolve só o essencial — o token nunca aparece na resposta */
http_response_code($estado >= 200 && $estado < 300 ? 200 : $estado);
echo json_encode([
    'ok'              => $estado >= 200 && $estado < 300,
    'event_id'        => $event_id,
    'events_received' => $meta['events_received'] ?? null,
    'fbtrace_id'      => $meta['fbtrace_id'] ?? null,
    'erro_meta'       => $meta['error']['message'] ?? null,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
