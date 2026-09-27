<?php
/**
 * ═══════════════════════════════════════════════════════════════
 *  CREDENCIAIS DA API DE CONVERSÕES (Meta)
 * ═══════════════════════════════════════════════════════════════
 *
 *  NUNCA copie o access_token para dentro do HTML ou de qualquer
 *  ficheiro .js — ele fica visível a qualquer visitante e permite
 *  enviar eventos falsos para o seu pixel.
 *
 *  Este ficheiro só é lido pelo PHP no servidor. O .htaccess ao
 *  lado bloqueia o acesso direto pelo navegador.
 *
 *  Se precisar de gerar um token novo:
 *  Gestor de Eventos → o seu pixel → Definições →
 *  API de Conversões → Gerar token de acesso.
 */

return [

    /* ID do pixel (Gestor de Eventos → Origens de dados) */
    'pixel_id' => '832300998337568',

    /* Token de acesso da API de Conversões */
    'access_token' => 'COLE_AQUI_O_TOKEN',

    /* Versão da Graph API. Se um dia o Meta desativar esta versão,
       basta subir o número aqui (ex.: v22.0). */
    'api_version' => 'v21.0',

    /* Código de teste — Gestor de Eventos → Testar eventos.
       Preencha SÓ enquanto estiver a testar e apague depois:
       eventos com este código não contam para otimização de anúncios. */
    'test_event_code' => '',

    /* Domínios autorizados a chamar este endpoint.
       Impede que outro site use o seu token através do navegador. */
    'origens_permitidas' => [
        'https://userodrigues.com',
        'https://www.userodrigues.com',
    ],

    /* Segredo de assinatura do webhook da Shopify — usado só pelo
       webhook-compra.php para confirmar que o pedido "pago" veio
       mesmo da Shopify, e não de alguém a fingir.
       Onde encontrar: Shopify Admin → Configurações → Notificações
       → desce até "Webhooks" → "Segredo de assinatura do webhook". */
    'shopify_webhook_secret' => 'COLE_AQUI_O_SEGREDO_DA_SHOPIFY',
];
