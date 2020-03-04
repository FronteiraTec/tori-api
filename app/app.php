<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

$app = AppFactory::create();


$app->addErrorMiddleware(true, true, true);

$app->get('/', function (Request $request, Response $response) {
  $response->getBody()->write('<h1>Hello Word</h1>');
  return $response;
});

$app->run();
